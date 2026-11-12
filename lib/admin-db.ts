import type { Database } from "@/lib/db";
import { HOLD_STATUSES } from "@/lib/availability";
import { rand } from "@/lib/breakdown";
import {
  ADMIN_MODULES,
  type AdminModule,
  type LineItemInput,
  type StockLineInput,
} from "@/lib/admin-schema";
import { hashPassword, type PortalSession } from "@/lib/portal-auth";
import { makeReference } from "@/lib/server";

/**
 * Server-side wiring for `/api/admin/[module]`: model delegates, password hashing
 * and unique-reference generation live here so both route files stay thin.
 */

interface Delegate {
  findMany: (args?: Record<string, unknown>) => Promise<unknown[]>;
  findUnique: (args: Record<string, unknown>) => Promise<unknown | null>;
  create: (args: Record<string, unknown>) => Promise<unknown>;
  createMany?: (args: Record<string, unknown>) => Promise<unknown>;
  update: (args: Record<string, unknown>) => Promise<unknown>;
  delete: (args: Record<string, unknown>) => Promise<unknown>;
  deleteMany?: (args: Record<string, unknown>) => Promise<unknown>;
}

const DELEGATES: Record<string, string> = {
  products: "product",
  bookings: "booking",
  quotes: "quote",
  invoices: "invoice",
  payments: "payment",
  crew: "crewMember",
  vehicles: "vehicle",
  assets: "asset",
  deliveries: "delivery",
  clients: "client",
  messages: "contactMessage",
};

/** Modules whose rows carry child rows (breakdown lines or held stock). */
const CHILD_MODULES: Record<string, { model: string; foreignKey: string }> = {
  quotes: { model: "quoteItem", foreignKey: "quoteId" },
  invoices: { model: "invoiceItem", foreignKey: "invoiceId" },
  bookings: { model: "bookingItem", foreignKey: "bookingId" },
};

export class ModuleError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string>
  ) {
    super(message);
  }
}

export function delegateFor(db: Database, module: AdminModule): Delegate {
  const name = DELEGATES[module.key];
  const target = (db as unknown as Record<string, Delegate>)[name];
  if (!target) throw new ModuleError(500, `Model for "${module.key}" is missing.`);
  return target;
}

/** Child rows in order — plus the payment history for invoices. */
export async function listRows(db: Database, module: AdminModule): Promise<unknown[]> {
  const delegate = delegateFor(db, module);
  if (CHILD_MODULES[module.key]) {
    return delegate.findMany({ include: includeFor(module) });
  }
  return delegate.findMany();
}

function includeFor(module: AdminModule): Record<string, unknown> {
  const include: Record<string, unknown> = { items: { orderBy: { sortOrder: "asc" } } };
  if (module.key === "invoices") include.payments = { orderBy: [{ paidOn: "asc" }, { created: "asc" }] };
  return include;
}

function childDelegate(db: Database, module: AdminModule): Delegate {
  const config = CHILD_MODULES[module.key];
  const target = config ? (db as unknown as Record<string, Delegate>)[config.model] : undefined;
  if (!target) throw new ModuleError(500, `Child item model for "${module.key}" is missing.`);
  return target;
}

/** Replaces the whole child set of one row (the payload carries the complete list). */
async function writeChildren(
  db: Database,
  module: AdminModule,
  id: string,
  rows: (LineItemInput | StockLineInput)[]
): Promise<void> {
  const config = CHILD_MODULES[module.key];
  if (!config) return;
  const delegate = childDelegate(db, module);
  if (delegate.deleteMany) await delegate.deleteMany({ where: { [config.foreignKey]: id } });
  if (rows.length === 0 || !delegate.createMany) return;
  await delegate.createMany({
    data: rows.map((row, index) => ({ ...row, sortOrder: index, [config.foreignKey]: id })),
  });
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}

function isRecordNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2025";
}

function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2003";
}

function violatedField(error: unknown): string | null {
  const target = (error as { meta?: { target?: unknown } }).meta?.target;
  if (Array.isArray(target) && typeof target[0] === "string") return target[0];
  if (typeof target === "string") return target;
  return null;
}

// ---- stock holds ---------------------------------------------------------

/**
 * Refuses a booking that would take more stock than is free on its event date.
 * Only confirmed/in-progress bookings hold, and only while they carry an event
 * date — which is what the availability calendar counts.
 */
async function assertBookingHolds(
  db: Database,
  context: { bookingId?: string | null; items: StockLineInput[]; status: string; eventDate: string | null }
): Promise<void> {
  const { bookingId, items, status, eventDate } = context;
  if (!HOLD_STATUSES.includes(status) || items.length === 0) return;

  if (!eventDate) {
    throw new ModuleError(400, "Validation failed.", {
      eventDate: "An event date is required — equipment is held per date on the availability calendar.",
    });
  }

  const skus = [...new Set(items.map((item) => item.sku))];
  const products = await db.product.findMany({
    where: { sku: { in: skus } },
    select: { sku: true, name: true, quantityAvailable: true, available: true },
  });
  const bySku = new Map(products.map((product) => [product.sku, product]));
  const dayLabel = new Date(eventDate).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" });

  const holding = await db.booking.findMany({
    where: {
      status: { in: HOLD_STATUSES },
      eventDate: { equals: eventDate },
      ...(bookingId ? { NOT: { id: bookingId } } : {}),
    },
    select: { items: { select: { sku: true, qty: true } } },
  });
  const heldBySku = new Map<string, number>();
  for (const booking of holding) {
    for (const line of booking.items) {
      heldBySku.set(line.sku, (heldBySku.get(line.sku) ?? 0) + line.qty);
    }
  }

  for (const item of items) {
    const product = bySku.get(item.sku);
    if (!product) {
      throw new ModuleError(400, "Validation failed.", {
        items: `${item.sku} is not in the equipment catalogue.`,
      });
    }
    if (!product.available) {
      throw new ModuleError(400, "Validation failed.", {
        items: `${product.name} (${item.sku}) is flagged as unavailable.`,
      });
    }
    const held = heldBySku.get(item.sku) ?? 0;
    const free = product.quantityAvailable - held;
    if (item.qty > free) {
      throw new ModuleError(400, "Validation failed.", {
        items:
          free <= 0
            ? `${product.name} is fully booked on ${dayLabel} — all ${product.quantityAvailable} held.`
            : `Only ${free} × ${product.name} free on ${dayLabel} — ${held} of ${product.quantityAvailable} already held.`,
      });
    }
  }
}

/** Resolves the state a booking is about to have (payload wins, row fills gaps). */
async function assertBookingState(
  db: Database,
  module: AdminModule,
  id: string | null,
  input: Record<string, unknown>,
  data: Record<string, unknown>
): Promise<void> {
  if (module.key !== "bookings") return;

  let items: StockLineInput[] = Array.isArray(input.items) ? (input.items as StockLineInput[]) : [];
  let status = typeof data.status === "string" ? data.status : "confirmed";
  let eventDate = (data.eventDate as string | null | undefined) ?? null;

  if (id) {
    const existing = await db.booking.findUnique({
      where: { id },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    if (!existing) throw new ModuleError(404, "That row no longer exists.");
    if (!Array.isArray(input.items)) items = existing.items.map((line) => ({ sku: line.sku, qty: line.qty }));
    if (typeof data.status !== "string") status = existing.status;
    if (data.eventDate === undefined) eventDate = existing.eventDate ? existing.eventDate.toISOString() : null;
  }

  await assertBookingHolds(db, { bookingId: id, items, status, eventDate });
}

// ---- payments ------------------------------------------------------------

async function assertPaymentBounds(
  db: Database,
  invoiceId: string,
  amount: number,
  excludePaymentId?: string
): Promise<void> {
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
  if (!invoice) {
    throw new ModuleError(400, "Validation failed.", { invoiceId: "That invoice no longer exists." });
  }
  const others = invoice.payments
    .filter((payment) => payment.id !== excludePaymentId)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = invoice.amount - others;
  if (amount > remaining) {
    throw new ModuleError(400, "Validation failed.", {
      amount:
        remaining <= 0
          ? `${invoice.reference} is already settled in full.`
          : `Only ${rand(remaining)} is still outstanding on ${invoice.reference}.`,
    });
  }
}

/** Flips the invoice to paid when it is covered, and back to sent when it is not. */
async function settleInvoice(db: Database, invoiceId: string): Promise<void> {
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
  if (!invoice) return;
  const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const settled = invoice.amount > 0 && paid >= invoice.amount;
  const status = settled ? "paid" : invoice.status === "paid" ? "sent" : invoice.status;
  if (status !== invoice.status) {
    await db.invoice.update({ where: { id: invoiceId }, data: { status } });
  }
}

/** Turns validated input into Prisma `data`: passwords hash, references auto-generate. */
export function toWriteData(
  module: AdminModule,
  input: Record<string, unknown>,
  session: PortalSession,
  includeReference: boolean
): Record<string, unknown> {
  const data: Record<string, unknown> = { ...input };

  if (module.key === "clients" && typeof data.password === "string" && data.password) {
    data.passwordHash = hashPassword(data.password);
  }
  delete data.password;
  delete data.items; // child rows are written separately by writeChildren()

  if (module.key === "payments" && !data.paidOn) {
    data.paidOn = new Date().toISOString(); // default to today, never null
  }

  if (module.reference && includeReference && !data[module.reference.field]) {
    data[module.reference.field] = makeReference(module.reference.prefix);
  }
  if (module.key === "bookings" && data.eventDate === undefined && !includeReference) {
    delete data.eventDate;
  }
  void session;
  return data;
}

async function uniqueCreate(
  db: Database,
  module: AdminModule,
  data: Record<string, unknown>
): Promise<unknown> {
  const delegate = delegateFor(db, module);
  const generated = module.reference ? String(data[module.reference.field]) : null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await delegate.create({ data });
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        const field = violatedField(error);
        const label = module.fields.find((candidate) => candidate.name === field)?.label ?? field ?? "reference";
        throw new ModuleError(400, "Validation failed.", {
          [field ?? "form"]: `${label} does not point at an existing row.`,
        });
      }
      if (!isUniqueViolation(error)) throw error;
      const field = violatedField(error);
      const wasAutoGenerated =
        module.reference !== undefined &&
        field === module.reference.field &&
        generated !== null &&
        data[module.reference.field] === generated;

      if (!wasAutoGenerated) {
        const label = module.fields.find((candidate) => candidate.name === field)?.label ?? field ?? "value";
        throw new ModuleError(409, `That ${label.toLowerCase()} is already in use.`, {
          [field ?? "form"]: `${label} is already in use.`,
        });
      }
      data = { ...data, [module.reference!.field]: makeReference(module.reference!.prefix) };
    }
  }
  throw new ModuleError(500, "Could not generate a free reference. Please try again.");
}

export async function createRow(
  db: Database,
  module: AdminModule,
  input: Record<string, unknown>,
  session: PortalSession
): Promise<unknown> {
  const data = toWriteData(module, input, session, true);
  if (module.key === "clients" && !input.password) {
    throw new ModuleError(400, "Validation failed.", { password: "A password is required." });
  }

  await assertBookingState(db, module, null, input, data);
  if (module.key === "payments") {
    await assertPaymentBounds(db, String(data.invoiceId), Number(data.amount));
  }

  const row = (await uniqueCreate(db, module, data)) as { id?: string } | null;
  let result: unknown = row;
  if (row && typeof row.id === "string" && CHILD_MODULES[module.key]) {
    await writeChildren(
      db,
      module,
      row.id,
      Array.isArray(input.items) ? (input.items as (LineItemInput | StockLineInput)[]) : []
    );
    result = await withChildren(db, module, row.id, row);
  }
  if (module.key === "payments" && row) await settleInvoice(db, String(data.invoiceId));
  return result;
}

/** Re-reads a row with its child rows attached (create/update responses). */
async function withChildren(
  db: Database,
  module: AdminModule,
  id: string,
  fallback: unknown
): Promise<unknown> {
  if (!CHILD_MODULES[module.key]) return fallback;
  const row = await delegateFor(db, module).findUnique({ where: { id }, include: includeFor(module) });
  return row ?? fallback;
}

export async function updateRow(
  db: Database,
  module: AdminModule,
  id: string,
  input: Record<string, unknown>,
  session: PortalSession
): Promise<unknown> {
  const delegate = delegateFor(db, module);
  const items = Array.isArray(input.items) ? (input.items as (LineItemInput | StockLineInput)[]) : null;
  const data = toWriteData(module, input, session, false);

  if (module.key === "clients" && session.clientId === id) {
    const nextRole = typeof input.role === "string" ? input.role : undefined;
    const nextStatus = typeof input.status === "string" ? input.status : undefined;
    if (nextRole && nextRole !== "admin") {
      throw new ModuleError(400, "You cannot change your own role.", { role: "You cannot change your own role." });
    }
    if (nextStatus && nextStatus !== "active") {
      throw new ModuleError(400, "You cannot suspend your own account.", {
        status: "You cannot suspend your own account.",
      });
    }
  }

  await assertBookingState(db, module, id, input, data);

  let paymentInvoiceId: string | null = null;
  let previousInvoiceId: string | null = null;
  if (module.key === "payments") {
    const existing = (await delegate.findUnique({ where: { id } })) as { invoiceId?: string; amount?: number } | null;
    if (!existing) throw new ModuleError(404, "That row no longer exists.");
    previousInvoiceId = existing.invoiceId ?? null;
    paymentInvoiceId =
      typeof data.invoiceId === "string" && data.invoiceId ? data.invoiceId : previousInvoiceId ?? "";
    const amount = typeof data.amount === "number" ? data.amount : existing.amount ?? 0;
    await assertPaymentBounds(db, paymentInvoiceId, amount, id);
  }

  try {
    const row = await delegate.update({ where: { id }, data });
    let result: unknown = row;
    if (items && CHILD_MODULES[module.key]) {
      await writeChildren(db, module, id, items);
      result = await withChildren(db, module, id, row);
    }
    if (module.key === "payments" && paymentInvoiceId) {
      await settleInvoice(db, paymentInvoiceId);
      if (previousInvoiceId && previousInvoiceId !== paymentInvoiceId) await settleInvoice(db, previousInvoiceId);
    }
    return result;
  } catch (error) {
    if (isRecordNotFound(error)) throw new ModuleError(404, "That row no longer exists.");
    if (isForeignKeyViolation(error)) {
      const field = violatedField(error);
      const label = module.fields.find((candidate) => candidate.name === field)?.label ?? field ?? "reference";
      throw new ModuleError(400, "Validation failed.", {
        [field ?? "form"]: `${label} does not point at an existing row.`,
      });
    }
    if (isUniqueViolation(error)) {
      const field = violatedField(error);
      const label = module.fields.find((candidate) => candidate.name === field)?.label ?? field ?? "value";
      throw new ModuleError(409, `That ${label.toLowerCase()} is already in use.`, {
        [field ?? "form"]: `${label} is already in use.`,
      });
    }
    throw error;
  }
}

export async function deleteRow(db: Database, module: AdminModule, id: string, session: PortalSession): Promise<void> {
  const delegate = delegateFor(db, module);

  if (module.key === "clients" && session.clientId === id) {
    throw new ModuleError(400, "You cannot delete your own account.");
  }
  if (module.key === "clients") {
    const target = (await delegate.findUnique({ where: { id } })) as { role?: string } | null;
    if (target?.role === "admin") {
      const admins = (await delegate.findMany({ where: { role: "admin", status: "active" } })) as { id: string }[];
      if (admins.length <= 1) {
        throw new ModuleError(400, "That is the last active admin — create another admin first.");
      }
    }
  }

  let invoiceToSettle: string | null = null;
  if (module.key === "payments") {
    const existing = (await delegate.findUnique({ where: { id } })) as { invoiceId?: string } | null;
    if (!existing) throw new ModuleError(404, "That row no longer exists.");
    invoiceToSettle = existing.invoiceId ?? null;
  }

  try {
    await delegate.delete({ where: { id } });
  } catch (error) {
    if (isRecordNotFound(error)) throw new ModuleError(404, "That row no longer exists.");
    if (isUniqueViolation(error)) throw new ModuleError(409, "That row is still in use.");
    throw error;
  }

  // Removing a settlement can un-pay an invoice — recompute its status.
  if (invoiceToSettle) await settleInvoice(db, invoiceToSettle);
}

export function moduleOr404(key: string): AdminModule {
  const moduleDef = ADMIN_MODULES[key];
  if (!moduleDef) throw new ModuleError(404, "Unknown module.");
  return moduleDef;
}

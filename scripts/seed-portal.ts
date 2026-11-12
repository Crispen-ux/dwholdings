/**
 * Seeds the portal modules (products, bookings, quotes, invoices, crew, fleet,
 * assets, live delivery) from the mock arrays the dashboard used before Phase 12.
 *
 *   npm run db:seed-portal
 *
 * Insert-only: rows that already exist are left alone, so re-running never
 * overwrites edits made through the portal's admin CRUD.
 */
import "dotenv/config";
import * as path from "node:path";
import { config } from "dotenv";

config({ path: path.join(__dirname, "..", ".env.local") });

import { getDb } from "@/lib/db";
import { equipment } from "@/data/equipment";
import { bookings, crew, invoices, quotes, sampleAssets, activeDelivery, vehicles } from "@/data/portal";
import type { RecommendedPackage } from "@/types";

async function main() {
  const db = getDb();
  if (!db) {
    console.error("No DATABASE_URL found — run `npx vercel env pull` first.");
    process.exit(1);
  }

  const clients = await db.client.findMany({ select: { id: true, email: true } });
  const clientIdFor = (email?: string) =>
    email ? clients.find((client) => client.email === email)?.id ?? null : null;

  let created = 0;
  let skipped = 0;
  const note = (made: boolean) => (made ? (created += 1) : (skipped += 1));

  for (const item of equipment) {
    const existing = await db.product.findUnique({ where: { sku: item.id } });
    if (existing) {
      note(false);
      continue;
    }
    await db.product.create({
      data: {
        sku: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        specs: item.specs as unknown as Record<string, string>,
        dailyRate: item.dailyRate,
        available: item.available,
        quantityAvailable: item.quantityAvailable,
        compatiblePackages: item.compatiblePackages,
      },
    });
    note(true);
  }

  const crewIdByName = new Map<string, string>();
  const clientIdByBookingRef = new Map<string, string | null>();
  for (const booking of bookings) {
    clientIdByBookingRef.set(booking.id, clientIdFor(booking.clientEmail));
  }
  for (const member of crew) {
    const existing = await db.crewMember.findFirst({ where: { name: member.name } });
    if (existing) {
      crewIdByName.set(member.name, existing.id);
      note(false);
      continue;
    }
    const row = await db.crewMember.create({
      data: { name: member.name, role: member.role, active: true },
    });
    crewIdByName.set(member.name, row.id);
    note(true);
  }

  for (const vehicle of vehicles) {
    const existing = await db.vehicle.findUnique({ where: { label: vehicle.label } });
    if (existing) {
      note(false);
      continue;
    }
    await db.vehicle.create({
      data: { label: vehicle.label, status: vehicle.status, driver: null },
    });
    note(true);
  }

  for (const asset of sampleAssets) {
    const existing = await db.asset.findUnique({ where: { serial: asset.serial } });
    if (existing) {
      note(false);
      continue;
    }
    await db.asset.create({
      data: { serial: asset.serial, equipmentId: asset.equipmentId, status: asset.status },
    });
    note(true);
  }

  for (const booking of bookings) {
    const existing = await db.booking.findUnique({ where: { reference: booking.id } });
    if (existing) {
      note(false);
      continue;
    }
    await db.booking.create({
      data: {
        reference: booking.id,
        eventName: booking.eventName,
        status: booking.status,
        deliveryWindow: booking.deliveryWindow,
        crewIds: booking.crew.map((member) => crewIdByName.get(member.name) ?? member.id),
        clientId: clientIdFor(booking.clientEmail),
      },
    });
    note(true);
  }

  for (const quote of quotes) {
    const existing = await db.quote.findUnique({ where: { reference: quote.id } });
    if (existing) {
      note(false);
      continue;
    }
    await db.quote.create({
      data: {
        reference: quote.id,
        status: quote.status,
        estimateTotal: quote.recommendedPackage.estimatedTotal,
        created: new Date(`${quote.createdAt}T09:00:00.000Z`),
        clientId: clientIdFor(quote.clientEmail),
      },
    });
    note(true);
  }

  for (const invoice of invoices) {
    const existing = await db.invoice.findUnique({ where: { reference: invoice.id } });
    if (existing) {
      note(false);
      continue;
    }
    await db.invoice.create({
      data: {
        reference: invoice.id,
        eventName: invoice.eventName,
        amount: invoice.amount,
        status: invoice.status,
        dueDate: invoice.dueDate ? new Date(`${invoice.dueDate}T00:00:00.000Z`) : null,
        bookingRef: invoice.bookingId,
        clientId: clientIdByBookingRef.get(invoice.bookingId) ?? null,
      },
    });
    note(true);
  }

  if (activeDelivery) {
    const existing = await db.delivery.findFirst({ where: { eventName: activeDelivery.eventName, active: true } });
    if (existing) {
      note(false);
    } else {
      await db.delivery.create({
        data: {
          eventName: activeDelivery.eventName,
          truck: activeDelivery.truck,
          driver: activeDelivery.driver,
          leadTechnician: activeDelivery.leadTechnician,
          currentLocation: activeDelivery.currentLocation,
          eta: activeDelivery.eta,
          currentStage: activeDelivery.currentStage,
          active: true,
          clientId: clientIdFor(activeDelivery.clientEmail),
        },
      });
      note(true);
    }
  }

  // ---- Line items: every seeded quote/invoice gets an itemised breakdown ----
  const money = (total: number) => Math.round(total / 1.15); // stored totals are VAT-inclusive

  const quoteLines = (total: number, pkg: RecommendedPackage) => {
    const subtotal = money(total);
    const shape: { description: string; weight: number; qty: number }[] = [
      { description: `PA system — ${pkg.pa}`, weight: 0.24, qty: 1 },
      { description: `Truss & rigging — ${pkg.truss}`, weight: 0.13, qty: 1 },
      { description: `Stage — ${pkg.stage}`, weight: 0.15, qty: 1 },
      { description: `Lighting — ${pkg.lighting}`, weight: 0.15, qty: 1 },
      { description: `AV & screens — ${pkg.av}`, weight: 0.11, qty: 1 },
      { description: `Crew — ${pkg.crewCount} technicians`, weight: 0.14, qty: Math.max(1, pkg.crewCount) },
      { description: `Setup labour — ${pkg.setupHours} hours`, weight: 0.04, qty: Math.max(1, pkg.setupHours) },
    ];
    const rows = shape.map((line) => {
      const unitPrice = Math.max(1, Math.round((subtotal * line.weight) / line.qty));
      return { ...line, unitPrice, amount: unitPrice * line.qty };
    });
    const used = rows.reduce((sum, row) => sum + row.amount, 0);
    const logistics = Math.max(0, subtotal - used);
    rows.push({
      description: `Logistics, transport & power (${pkg.powerRequirementKva} kVA generator)`,
      weight: 0,
      qty: 1,
      unitPrice: logistics,
      amount: logistics,
    });
    // keep the breakdown exactly equal to the stored total
    const drift = subtotal - rows.reduce((sum, row) => sum + row.amount, 0);
    if (drift !== 0 && rows.length > 0) {
      rows[0].unitPrice = Math.max(0, rows[0].unitPrice + drift);
      rows[0].amount = rows[0].unitPrice * rows[0].qty;
    }
    return rows.map(({ description, qty, unitPrice, amount }) => ({ description, qty, unitPrice, amount }));
  };

  const invoiceLines = (total: number, eventName: string) => {
    const subtotal = money(total);
    const shape: { description: string; weight: number; qty: number }[] = [
      { description: "Equipment hire — 3 days", weight: 0.55, qty: 3 },
      { description: "Crew & technicians on site", weight: 0.25, qty: 4 },
      { description: `Transport & logistics — ${eventName}`, weight: 0.12, qty: 1 },
    ];
    const rows = shape.map((line) => {
      const unitPrice = Math.max(1, Math.round((subtotal * line.weight) / line.qty));
      return { ...line, unitPrice, amount: unitPrice * line.qty };
    });
    const used = rows.reduce((sum, row) => sum + row.amount, 0);
    const management = Math.max(0, subtotal - used);
    rows.push({
      description: "Project management & technical design",
      weight: 0,
      qty: 1,
      unitPrice: management,
      amount: management,
    });
    const drift = subtotal - rows.reduce((sum, row) => sum + row.amount, 0);
    if (drift !== 0 && rows.length > 0) {
      rows[rows.length - 1].unitPrice = Math.max(0, rows[rows.length - 1].unitPrice + drift);
      rows[rows.length - 1].amount = rows[rows.length - 1].unitPrice * rows[rows.length - 1].qty;
    }
    return rows.map(({ description, qty, unitPrice, amount }) => ({ description, qty, unitPrice, amount }));
  };

  let quoteItems = 0;
  let invoiceItems = 0;
  const quoteRows = await db.quote.findMany({ include: { items: { orderBy: { sortOrder: "asc" } } } });
  for (const row of quoteRows) {
    if (row.items.length > 0) continue;
    const mock = quotes.find((quote) => quote.id === row.reference);
    if (!mock) continue;
    const lines = quoteLines(row.estimateTotal, mock.recommendedPackage);
    await db.quoteItem.createMany({
      data: lines.map((line, index) => ({ ...line, quoteId: row.id, sortOrder: index })),
    });
    quoteItems += lines.length;
  }

  const invoiceRows = await db.invoice.findMany({ include: { items: { orderBy: { sortOrder: "asc" } } } });
  for (const row of invoiceRows) {
    if (row.items.length > 0) continue;
    const mock = invoices.find((invoice) => invoice.id === row.reference);
    if (!mock) continue;
    const lines = invoiceLines(row.amount, row.eventName);
    await db.invoiceItem.createMany({
      data: lines.map((line, index) => ({ ...line, invoiceId: row.id, sortOrder: index })),
    });
    invoiceItems += lines.length;
  }

  // ---- Equipment holds: active bookings reserve stock on their event date ----
  /** Midnight UTC on the given day — Prisma stores `@db.Date` as a DateTime at 00:00. */
  const dayFromNow = (offset: number) => `${new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10)}T00:00:00.000Z`;

  const HOLD_PLAN: Record<string, { dayOffset: number; items: { sku: string; qty: number }[] }> = {
    "bk-1001": {
      dayOffset: 2,
      items: [
        { sku: "eq-001", qty: 8 },
        { sku: "eq-005", qty: 4 },
        { sku: "eq-009", qty: 40 },
        { sku: "eq-013", qty: 12 },
      ],
    },
    "bk-1002": {
      dayOffset: 5,
      items: [
        { sku: "eq-001", qty: 6 },
        { sku: "eq-003", qty: 10 },
      ],
    },
    "bk-1003": { dayOffset: 2, items: [{ sku: "eq-001", qty: 10 }] },
  };

  let holdRows = 0;
  let holdItems = 0;
  for (const booking of await db.booking.findMany({ include: { items: true } })) {
    const plan = HOLD_PLAN[booking.reference];
    if (!plan) continue;
    const data: Record<string, unknown> = {};
    if (!booking.eventDate) data.eventDate = dayFromNow(plan.dayOffset);
    if (booking.items.length === 0) {
      data.items = { create: plan.items.map((item, index) => ({ ...item, sortOrder: index })) };
      holdItems += plan.items.length;
    }
    if (Object.keys(data).length === 0) continue;
    await db.booking.update({ where: { id: booking.id }, data });
    holdRows += 1;
  }

  // ---- Settlement: one invoice partly paid, one settled in full ------------
  const PAYMENT_PLAN: Record<
    string,
    { amount: number; method: string; reference: string; daysAgo: number; note: string | null }
  > = {
    "inv-9001": {
      amount: 50000,
      method: "transfer",
      reference: "FNB-771204",
      daysAgo: 4,
      note: "First instalment",
    },
    "inv-9002": { amount: 156200, method: "transfer", reference: "FNB-769981", daysAgo: 7, note: null },
  };

  let paymentRows = 0;
  for (const invoice of await db.invoice.findMany({ include: { payments: true } })) {
    const plan = PAYMENT_PLAN[invoice.reference];
    if (!plan || invoice.payments.length > 0) continue;
    await db.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: Math.min(plan.amount, invoice.amount),
        method: plan.method,
        reference: plan.reference,
        paidOn: dayFromNow(-plan.daysAgo),
        note: plan.note,
      },
    });
    paymentRows += 1;
  }

  const [products, rows, crewCount, fleet, assets, deliveries, quotesTotal, invoicesTotal, payments] =
    await Promise.all([
      db.product.count(),
      db.booking.count(),
      db.crewMember.count(),
      db.vehicle.count(),
      db.asset.count(),
      db.delivery.count(),
      db.quoteItem.count(),
      db.invoiceItem.count(),
      db.payment.count(),
    ]);
  console.log(
    `Portal data seeded — ${created} created, ${skipped} already present.\n` +
      `  products=${products} bookings=${rows} crew=${crewCount} vehicles=${fleet} assets=${assets} deliveries=${deliveries}\n` +
      `  line items: +${quoteItems} quote / +${invoiceItems} invoice (totals quoteItems=${quotesTotal} invoiceItems=${invoicesTotal})\n` +
      `  holds: +${holdRows} booking(s) dated, +${holdItems} equipment line(s)\n` +
      `  payments: +${paymentRows} recorded (total ${payments})`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

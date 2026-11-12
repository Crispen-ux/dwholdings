import type { Database } from "@/lib/db";
import type { PortalAvailability } from "@/types";

/**
 * Availability calendar: which stock is still free on which day.
 *
 * A booking holds its equipment lines on its event date while it is in one of
 * `HOLD_STATUSES` — completing or cancelling a booking releases the stock.
 * Everything is computed from the rows, never stored, so a status change or a
 * deleted booking updates the calendar immediately.
 */

/** Bookings in these statuses keep their hold on stock. */
export const HOLD_STATUSES = ["confirmed", "in-progress"];

/** Days covered by the calendar, starting today. */
export const AVAILABILITY_WINDOW_DAYS = 14;

export function isoDay(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** The window as ISO dates: today, tomorrow, … (14 entries). */
export function availabilityDays(from = new Date()): string[] {
  const start = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  return Array.from({ length: AVAILABILITY_WINDOW_DAYS }, (_, index) =>
    isoDay(new Date(start + index * 24 * 60 * 60 * 1000))
  );
}

interface StockRow {
  sku: string;
  name: string;
  quantityAvailable: number;
  available: boolean;
}

interface HoldRow {
  eventDate: Date | null;
  status: string;
  items: { sku: string; qty: number }[];
}

/** Builds the calendar rows for the next `AVAILABILITY_WINDOW_DAYS` days. */
export async function loadAvailability(db: Database, from = new Date()): Promise<PortalAvailability> {
  const days = availabilityDays(from);
  const [products, bookings] = await Promise.all([
    db.product.findMany({
      select: { sku: true, name: true, quantityAvailable: true, available: true },
      orderBy: { name: "asc" },
    }),
    db.booking.findMany({
      where: { status: { in: HOLD_STATUSES }, eventDate: { not: null } },
      select: { eventDate: true, status: true, items: { select: { sku: true, qty: true } } },
    }),
  ]);

  const indexByDay = new Map(days.map((day, index) => [day, index]));
  const held = new Map<string, number[]>(products.map((product) => [product.sku, days.map(() => 0)]));

  for (const booking of bookings as HoldRow[]) {
    if (!booking.eventDate) continue;
    const index = indexByDay.get(isoDay(booking.eventDate));
    if (index === undefined) continue;
    for (const item of booking.items) {
      const bucket = held.get(item.sku);
      if (bucket) bucket[index] += item.qty;
    }
  }

  const rows = (products as StockRow[])
    .map((product) => ({
      sku: product.sku,
      name: product.name,
      stock: product.quantityAvailable,
      held: held.get(product.sku) ?? days.map(() => 0),
    }))
    .filter((row) => row.stock > 0 || row.held.some((value) => value > 0));

  return { days, rows };
}

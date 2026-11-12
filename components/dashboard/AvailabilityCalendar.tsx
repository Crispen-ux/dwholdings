import type { PortalAvailability } from "@/types";

/**
 * Free stock per day for the availability window. Confirmed and in-progress
 * bookings hold their equipment on the event date; completing or cancelling one
 * releases the stock immediately.
 */
export function AvailabilityCalendar({ availability }: { availability: PortalAvailability }) {
  const { days, rows } = availability;
  if (days.length === 0 || rows.length === 0) return null;

  const heldProducts = rows.filter((row) => row.held.some((value) => value > 0));

  const dayHeading = (iso: string) => {
    const date = new Date(`${iso}T00:00:00Z`);
    return {
      weekday: date.toLocaleDateString("en-ZA", { weekday: "short" }),
      rest: date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short" }),
    };
  };

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-bold">Availability calendar</h3>
        <p className="text-[12.5px] text-text-faint">
          Free units per day — active bookings hold equipment on their event date.
        </p>
      </div>

      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full min-w-[900px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-[11px] uppercase tracking-wide text-text-faint">
              <th className="sticky left-0 z-10 bg-surface px-4 py-3 font-medium">Equipment</th>
              <th className="px-3 py-3 text-right font-medium">Stock</th>
              {days.map((day) => {
                const label = dayHeading(day);
                return (
                  <th key={day} className="px-2 py-3 text-center font-medium leading-tight">
                    <span className="block text-[10px] text-text-faint">{label.weekday}</span>
                    <span className="block text-[11.5px] normal-case text-text-dim">{label.rest}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sku} className="border-b border-border last:border-b-0">
                <td className="sticky left-0 z-10 bg-bg px-4 py-2.5">
                  <span className="font-medium">{row.sku}</span>
                  <span className="ml-2 text-[12.5px] text-text-faint">{row.name}</span>
                </td>
                <td className="px-3 py-2.5 text-right text-text-dim">{row.stock}</td>
                {days.map((day, index) => {
                  const held = row.held[index] ?? 0;
                  const free = Math.max(0, row.stock - held);
                  const tone =
                    free === 0
                      ? "bg-warn/15 font-semibold text-warn"
                      : held > 0
                        ? "bg-accent/10 text-accent"
                        : "text-text-dim";
                  return (
                    <td
                      key={day}
                      className={`px-2 py-2.5 text-center ${tone}`}
                      title={`${row.sku} on ${day}: ${free} free of ${row.stock}${held > 0 ? ` (${held} held)` : ""}`}
                    >
                      {free}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px] text-text-faint">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 bg-warn/15" /> Fully held
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 bg-accent/10" /> Partly held
        </span>
        <span>{heldProducts.length} of {rows.length} products held in this window</span>
      </div>
    </section>
  );
}

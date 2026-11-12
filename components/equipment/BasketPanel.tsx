"use client";

import Link from "next/link";
import { useBasket } from "@/lib/basket-context";

export function BasketPanel() {
  const { lines, setQuantity, remove, clear } = useBasket();

  return (
    <div id="basket" className="sticky top-[84px] rounded border border-border bg-surface2 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">Quote Basket</h3>
        {lines.length > 0 && (
          <button onClick={clear} className="text-[11px] text-text-faint hover:text-warn">
            Clear
          </button>
        )}
      </div>

      {lines.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-text-dim">
          Nothing added yet. Browse the catalogue and use &ldquo;Add to Basket&rdquo; to start building your
          component schedule.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {lines.map((line) => (
            <div key={line.equipmentId} className="border-b border-border pb-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-medium leading-snug">{line.equipment.name}</span>
                <button
                  onClick={() => remove(line.equipmentId)}
                  className="shrink-0 text-[11px] text-text-faint hover:text-warn"
                  aria-label={`Remove ${line.equipment.name}`}
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1 rounded border border-border w-fit">
                <button
                  className="px-2 py-1 text-text-dim hover:text-text"
                  onClick={() => setQuantity(line.equipmentId, line.quantity - 1)}
                >
                  −
                </button>
                <span className="w-5 text-center text-xs">{line.quantity}</span>
                <button
                  className="px-2 py-1 text-text-dim hover:text-text"
                  onClick={() => setQuantity(line.equipmentId, line.quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <Link href="/event-builder" className="btn btn-primary mt-2 w-full py-3 text-[13px]">
            Continue in Project Builder
          </Link>
          <div className="text-[11px] leading-relaxed text-text-faint">
            Pricing is provided with your tailored quote. Delivery, handling and installation support are
            calculated in the Project Builder.
          </div>
        </div>
      )}
    </div>
  );
}

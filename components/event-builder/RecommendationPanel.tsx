import type { RecommendedPackage } from "@/types";

export function RecommendationPanel({ pkg, compact = false }: { pkg: RecommendedPackage; compact?: boolean }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 text-[13px]">
        <RecItem label="Power Distribution" value={pkg.pa} />
        <RecItem label="Containment" value={pkg.truss} />
        <RecItem label="Enclosures" value={pkg.stage} />
        {!compact && <RecItem label="Lighting" value={pkg.lighting} />}
        {!compact && <RecItem label="Components" value={pkg.av} />}
        <RecItem label="Crew / Delivery" value={`${pkg.crewCount} crew · ${pkg.setupHours} hrs`} />
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-[12.5px]">
        {pkg.checks.map((c) => (
          <div key={c.label} className={c.status === "ok" ? "text-ok" : "text-warn"}>
            {c.status === "ok" ? "✓" : "⚠"} {c.detail}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-text-faint">Indicative Estimate</div>
          <div className="font-display text-2xl font-bold">R{pkg.estimatedTotal.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-3.5 border-t border-border pt-3.5 text-[11px] leading-relaxed text-text-faint">
        Indicative estimate only. Final product selection, circuit design and compliance sign-off require qualified
        DWH technical review.
      </div>
    </div>
  );
}

function RecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-bg p-3">
      <div className="text-[11px] uppercase tracking-wide text-text-faint">{label}</div>
      <div className="mt-1 text-[13.5px] font-semibold">{value}</div>
    </div>
  );
}

import type { EventConfiguration } from "@/types";

function circuitCountFor(scale: number) {
  if (scale < 200) return 4;
  if (scale < 600) return 6;
  if (scale < 1500) return 8;
  return 12;
}

export function Schematic({ config }: { config: EventConfiguration }) {
  const circuits = circuitCountFor(config.guestCount);
  const spacing = 360 / circuits;

  return (
    <svg viewBox="0 0 400 190" className="h-[190px] w-full rounded border border-border bg-bg">
      <rect x="20" y="110" width="360" height="65" fill="none" stroke="#3A4659" strokeDasharray="3,3" />
      <text x="30" y="105" fill="#7b8494" fontSize="9">
        PROJECT FOOTPRINT
      </text>

      {config.stageRequired && (
        <>
          <rect x="140" y="28" width="120" height="38" fill="#16345F" stroke="#C9A24B" strokeWidth={1.5} />
          <text x="200" y="51" fill="#C9A24B" fontSize="9" textAnchor="middle">
            DIST. BOARD
          </text>
        </>
      )}

      {config.trussTier !== "none" && (
        <>
          <line x1="120" y1="18" x2="280" y2="18" stroke="#C9A24B" strokeWidth={2} />
          <line x1="120" y1="18" x2="120" y2="28" stroke="#C9A24B" strokeWidth={2} />
          <line x1="280" y1="18" x2="280" y2="28" stroke="#C9A24B" strokeWidth={2} />
          <text x="284" y="16" fill="#7b8494" fontSize="8">
            CONTAINMENT
          </text>
        </>
      )}

      {Array.from({ length: circuits }).map((_, i) => {
        const x = 20 + spacing * i + spacing / 2;
        return <rect key={i} x={x - 5} y="80" width="10" height="16" fill="#C9A24B" opacity={0.85} />;
      })}
      <text x="30" y="75" fill="#7b8494" fontSize="9">
        CIRCUITS / LOADS
      </text>

      {config.environment === "outdoor" && (
        <text x="370" y="16" fill="#C9A24B" fontSize="9" textAnchor="end">
          OUTDOOR SITE
        </text>
      )}
    </svg>
  );
}

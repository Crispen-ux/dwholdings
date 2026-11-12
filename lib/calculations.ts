// Deterministic, rules-based recommendation engine.
// This is intentionally a pure-function frontend layer using mock rules —
// every function here is designed to be swapped for a real API call later
// without changing any calling component.
//
// Field names on `EventConfiguration` / `RecommendedPackage` are retained for
// database compatibility. In the DWH catalogue they mean:
//   guestCount → project scale (devices / points / units)
//   soundTier  → power & distribution tier
//   trussTier  → containment tier
//   stageTier  → enclosure & protection tier
//   avTier     → components & accessories tier

import type { EventConfiguration, RecommendedPackage, TechnicalRequirement } from "@/types";

export function calculatePowerDistribution(config: EventConfiguration): string {
  const { guestCount, soundTier } = config;
  if (soundTier === "basic") return "12-Way Board + 20A MCBs";
  if (soundTier === "premium") return "24-Way Board + Surge + Changeover";
  if (guestCount < 600) return "18-Way Board + Earth Leakage";
  return "24-Way Board + Earth Leakage + SPD";
}

export function calculateContainment(config: EventConfiguration): string {
  if (config.trussTier === "none") return "Not required";
  if (config.trussTier === "heavy") return "Galvanised Cable Tray + Heavy Containment";
  return config.guestCount < 600 ? "20mm Conduit Pack" : "100mm Cable Tray Run";
}

export function calculateEnclosure(config: EventConfiguration): string {
  if (!config.stageRequired) return "Not required";
  const map = {
    platform: "IP40 Surface Enclosures",
    standard: "IP44 Industrial Sockets & Isolators",
    main: "IP65 Weatherproof Range",
  } as const;
  return map[config.stageTier];
}

export function calculateLighting(config: EventConfiguration): string {
  const map = {
    basic: "LED Panel & Downlight Pack",
    standard: "High Bay / Floodlight Mix",
    premium: "Full Lighting Schedule + Emergency",
  } as const;
  return map[config.lightingTier];
}

export function calculateComponents(config: EventConfiguration): string {
  const map = {
    basic: "Consumables Pack",
    standard: "Component & Accessory Kit",
    premium: "Full Component Schedule",
  } as const;
  return map[config.avTier];
}

export function calculateCrewRequirement(config: EventConfiguration): number {
  const { guestCount, trussTier } = config;
  let base = guestCount < 200 ? 2 : guestCount < 600 ? 4 : guestCount < 1500 ? 6 : 8;
  if (trussTier === "heavy") base += 2;
  if (config.logistics === "full") base += 2;
  return base;
}

export function calculateSetupTime(config: EventConfiguration): number {
  const { guestCount } = config;
  return guestCount < 200 ? 2 : guestCount < 600 ? 4 : guestCount < 1500 ? 6 : 8;
}

export function calculatePowerRequirement(config: EventConfiguration): number {
  // Rough indicative kVA estimate — NOT an electrical engineering calculation.
  let kva = 6 + config.guestCount * 0.02;
  if (config.soundTier === "premium") kva += 15;
  if (config.lightingTier === "premium") kva += 10;
  if (config.trussTier === "heavy") kva += 8;
  return Math.round(kva);
}

export function calculateEstimatedPrice(config: EventConfiguration): number {
  const powerMultiplier = { basic: 0.6, standard: 1, premium: 1.7 }[config.soundTier];
  let base = (2500 + config.guestCount * 18) * powerMultiplier;
  if (config.stageRequired) base += 6000 + config.guestCount * 4;
  if (config.trussTier === "heavy") base += 9000;
  if (config.lightingTier === "premium") base += 12000;
  if (config.avTier === "premium") base += 15000;
  if (config.environment === "outdoor") base *= 1.15;
  if (config.logistics === "full") base += 4500;
  return Math.round(base / 500) * 500;
}

export function validateConfiguration(config: EventConfiguration): TechnicalRequirement[] {
  const checks: TechnicalRequirement[] = [
    { label: "Load coverage", status: "ok", detail: "Estimated component quantities match the project scale." },
    { label: "Product availability", status: "ok", detail: "Selected components are held in stock for the planning window." },
  ];

  if (config.environment === "outdoor") {
    checks.push({
      label: "Outdoor installation",
      status: "warning",
      detail: "Weatherproof (IP-rated) enclosures and accessories are recommended for outdoor sites.",
    });
  }

  const power = calculatePowerRequirement(config);
  if (power > 60) {
    checks.push({
      label: "Connected load",
      status: "warning",
      detail: `Estimated ${power} kVA may require a dedicated supply — confirm with the installing contractor.`,
    });
  }

  if (config.trussTier === "heavy") {
    checks.push({
      label: "Containment & support",
      status: "warning",
      detail: "Heavy containment runs need additional supports and installation time.",
    });
  }

  return checks;
}

export function calculateRecommendedPackage(config: EventConfiguration): RecommendedPackage {
  return {
    pa: calculatePowerDistribution(config),
    truss: calculateContainment(config),
    stage: calculateEnclosure(config),
    lighting: calculateLighting(config),
    av: calculateComponents(config),
    crewCount: calculateCrewRequirement(config),
    setupHours: calculateSetupTime(config),
    powerRequirementKva: calculatePowerRequirement(config),
    estimatedTotal: calculateEstimatedPrice(config),
    checks: validateConfiguration(config),
  };
}

export const defaultConfiguration: EventConfiguration = {
  eventType: "commercial",
  guestCount: 300,
  environment: "indoor",
  stageRequired: true,
  soundTier: "standard",
  trussTier: "standard",
  stageTier: "standard",
  lightingTier: "standard",
  avTier: "basic",
  logistics: "full",
};

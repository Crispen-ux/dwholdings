import type { StageEvent } from "@/types";

export const projects: StageEvent[] = [
  {
    id: "proj-001",
    name: "Commercial Office Fit-Out",
    type: "commercial",
    guestCount: 240,
    region: "Johannesburg",
    infrastructure: ["24-Way Distribution Boards", "LED Panel Lighting", "Circuit Protection", "Containment & Accessories"],
    outcome:
      "Supplied the full electrical and lighting component schedule for a three-floor office fit-out, staged across four deliveries to match the contractor's programme.",
  },
  {
    id: "proj-002",
    name: "Industrial Warehouse Upgrade",
    type: "industrial",
    guestCount: 1800,
    region: "Gauteng",
    infrastructure: ["150W LED High Bays", "Three-Phase Changeover", "Galvanised Cable Tray", "Surge Protection"],
    outcome:
      "Replaced legacy warehouse lighting with high-output LED high bays and supported the standby supply upgrade with changeover and surge protection components.",
  },
  {
    id: "proj-003",
    name: "Retail Chain Maintenance Rollout",
    type: "retail",
    guestCount: 46,
    region: "Western Cape",
    infrastructure: ["LED Downlights", "Emergency Battens", "Lamp Assortments", "Consumable Packs"],
    outcome:
      "Coordinated a multi-store maintenance rollout with consolidated consumable packs and scheduled deliveries, reducing site-level ordering for the facilities team.",
  },
  {
    id: "proj-004",
    name: "Infrastructure Perimeter Lighting",
    type: "infrastructure",
    guestCount: 9,
    region: "KwaZulu-Natal",
    infrastructure: ["200W LED Floodlights", "Weatherproof Isolators", "Cable & Glands", "Installation Accessories"],
    outcome:
      "Supplied weatherproof floodlighting, isolators and cable accessories for a perimeter security upgrade, with all components delivered ahead of the electrical contractor's installation window.",
  },
];

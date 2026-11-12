import type { EquipmentCategory } from "@/types";

export interface ProcessStep {
  title: string;
  description: string;
}

export interface Solution {
  slug: string;
  num: string;
  name: string;
  summary: string;
  tagline: string;
  equipmentCategories: EquipmentCategory[];
  useCases: string[];
  capabilities: string[];
  process: ProcessStep[];
  considerations: string[];
}

export const solutions: Solution[] = [
  {
    slug: "electrical",
    num: "01",
    name: "Electrical Systems",
    summary:
      "Distribution boards, protective devices and power infrastructure specified for commercial, industrial and retail installations.",
    tagline: "Power infrastructure specified for the load, not a generic template.",
    equipmentCategories: ["electrical"],
    useCases: [
      "Distribution boards and final circuit protection for commercial fit-outs",
      "Earth leakage and surge protection for sensitive equipment and plant rooms",
      "Mains-to-standby changeover for sites with generator backup",
      "Electrical maintenance packs for retail chains and multi-site portfolios",
    ],
    capabilities: [
      "Consumer and surface distribution boards from 12-way to 24-way",
      "MCB, earth leakage and surge protection device selection",
      "Three-phase changeover and isolator solutions for standby supplies",
      "Circuit schedules and load allocation planning with your electrical contractor",
      "Delivery to site or collection from our Johannesburg warehouse",
    ],
    process: [
      { title: "Load review", description: "We review the connected load, supply type and circuit requirements for the installation." },
      { title: "Component specification", description: "Boards, breakers, earth leakage and surge devices are matched to the load and environment." },
      { title: "Availability check", description: "Stock is confirmed against your programme and reserved for the delivery window." },
      { title: "Delivery or collection", description: "Components are picked, checked and dispatched, or prepared for collection." },
      { title: "Technical support", description: "Our team remains available for specification and substitution queries during installation." },
    ],
    considerations: [
      "Final circuit design and compliance sign-off remain the responsibility of the appointed electrical engineer or contractor.",
      "Load estimates shown by our planning tools are indicative and not an electrical engineering calculation.",
      "Industrial and outdoor installations may require IP-rated enclosures and accessories — confirm at specification stage.",
    ],
  },
  {
    slug: "lighting",
    num: "02",
    name: "Lighting",
    summary:
      "LED panels, high bays, floodlights and emergency lighting for commercial interiors, warehouses and exterior spaces.",
    tagline: "Efficient lighting specified around the space and the use case.",
    equipmentCategories: ["lighting"],
    useCases: [
      "Office, retail and commercial ceiling lighting with LED panels and downlights",
      "Warehouse, workshop and industrial hall illumination with LED high bays",
      "Perimeter, yard and façade lighting with weatherproof floodlights",
      "Escape-route and emergency lighting for compliance-driven installations",
    ],
    capabilities: [
      "Recessed LED panels and downlights for interior ceilings",
      "High-output LED high bays for industrial and warehouse environments",
      "Weatherproof LED floodlights for exterior and perimeter illumination",
      "Maintained emergency battens for escape routes and compliance lighting",
      "Quantity take-offs and lumen guidance for the space",
    ],
    process: [
      { title: "Space review", description: "Ceiling height, area and intended use determine the fixture types and quantities." },
      { title: "Fixture selection", description: "Panels, high bays or floodlights are selected for output, beam and IP rating." },
      { title: "Take-off", description: "Quantities are calculated from the layout and confirmed against stock." },
      { title: "Supply & delivery", description: "Fixtures are checked, packed and delivered or made ready for collection." },
      { title: "After-sales support", description: "We help with replacements, additions and snag-list consumables." },
    ],
    considerations: [
      "Lux-level and compliance calculations require a lighting designer or engineer; our guidance is indicative.",
      "Emergency lighting must be installed and tested to the applicable standard by a competent person.",
      "Beam angle and mounting height materially affect coverage in high-bay installations.",
    ],
  },
  {
    slug: "components",
    num: "03",
    name: "Components",
    summary:
      "Conduit, cable tray, industrial sockets, isolators and terminal accessories that complete an installation.",
    tagline: "The component layer that turns a specification into a working installation.",
    equipmentCategories: ["components"],
    useCases: [
      "Surface wiring and cable protection for commercial and industrial projects",
      "Cable routing and support for plant rooms, workshops and production areas",
      "Site power outlets and lockable isolators for outdoor equipment",
      "Panel wiring and termination consumables for contractors",
    ],
    capabilities: [
      "uPVC conduit and galvanised cable tray in standard lengths",
      "Industrial socket outlets and weatherproof isolators",
      "DIN terminal blocks, end stops and markers",
      "Load-rated component selection for the environment",
      "Bulk quantities for contractor and multi-site programmes",
    ],
    process: [
      { title: "Requirement review", description: "We confirm the installation method, environment and quantities required." },
      { title: "Component matching", description: "Conduit, tray, sockets and terminals are matched to the cable and load." },
      { title: "Stock confirmation", description: "Bulk quantities are checked and reserved against your programme." },
      { title: "Picking & dispatch", description: "Orders are picked, checked and dispatched or prepared for collection." },
      { title: "Replenishment", description: "Repeat orders can be scheduled for ongoing site requirements." },
    ],
    considerations: [
      "Cable derating, containment fill and support spacing must be confirmed by the installing contractor.",
      "Outdoor components require appropriate IP ratings — confirm before ordering.",
      "Bulk pricing and lead times depend on quantity and current stock levels.",
    ],
  },
  {
    slug: "accessories",
    num: "04",
    name: "Accessories",
    summary:
      "Cable ties, insulation tape, tool kits and installation accessories for electrical teams.",
    tagline: "The practical accessories that keep an installation moving.",
    equipmentCategories: ["accessories"],
    useCases: [
      "Cable bundling and management on commercial and industrial sites",
      "Phase identification and termination with insulation tape",
      "Insulated hand-tool kits for electrical teams and maintenance crews",
      "Site replenishment and snag-list accessories",
    ],
    capabilities: [
      "UV-stabilised cable ties in contractor pack sizes",
      "Flame-retardant insulation tape in phase colours",
      "Insulated installation tool kits rated for electrical work",
      "Fast-moving accessory packs for site teams",
      "Delivery or collection for scheduled site requirements",
    ],
    process: [
      { title: "Consumable review", description: "We identify the accessories your team uses across a typical installation." },
      { title: "Pack selection", description: "Pack sizes are matched to your consumption and storage capacity." },
      { title: "Stock check", description: "Availability is confirmed before the order is accepted." },
      { title: "Dispatch", description: "Orders are picked and delivered or prepared for collection." },
      { title: "Repeat supply", description: "Standing orders can be arranged for recurring site needs." },
    ],
    considerations: [
      "Tool kits and insulated tools must be inspected and maintained by the user before every use.",
      "Consumable quantities are estimates — site conditions affect actual usage.",
      "Specialised accessories may need to be ordered in if not held in stock.",
    ],
  },
  {
    slug: "supplies",
    num: "05",
    name: "Supplies & Consumables",
    summary:
      "Cable, glands and lamps — the everyday supplies that keep installations complete and maintained.",
    tagline: "Everyday supplies, available when the programme needs them.",
    equipmentCategories: ["supplies"],
    useCases: [
      "Lighting and socket circuit cable for commercial fit-outs",
      "Enclosure entries with correctly sized cable glands",
      "Maintenance lamp replacements across retail and commercial sites",
      "Snag-list and handover consumables for contractors",
    ],
    capabilities: [
      "PVC-insulated cable in standard drum lengths",
      "Assorted cable gland kits with locknuts and seals",
      "Mixed-wattage LED lamp assortments for maintenance",
      "Quantity guidance against the circuit schedule",
      "Scheduled delivery for ongoing projects",
    ],
    process: [
      { title: "Schedule review", description: "We review the cable, gland and lamp requirements against your programme." },
      { title: "Product selection", description: "Sizes, ratings and pack quantities are confirmed with your team." },
      { title: "Stock confirmation", description: "Drum lengths and pack quantities are checked for availability." },
      { title: "Delivery or collection", description: "Supplies are picked, checked and dispatched or prepared for collection." },
      { title: "Top-up support", description: "Additional supplies can be ordered as the installation progresses." },
    ],
    considerations: [
      "Cable sizing and voltage drop must be confirmed by the installing contractor or engineer.",
      "Lamp compatibility depends on the existing fittings — check base type and wattage before ordering.",
      "Drum and pack quantities are supplied as standard; custom lengths may affect lead time.",
    ],
  },
];

export function getSolution(slug: string) {
  return solutions.find((s) => s.slug === slug);
}

export function getRelatedSolutions(slug: string, count = 3) {
  return solutions.filter((s) => s.slug !== slug).slice(0, count);
}

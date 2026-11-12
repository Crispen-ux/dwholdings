export interface PricingFactor {
  label: string;
  description: string;
}

export const pricingFactors: PricingFactor[] = [
  { label: "Order volume", description: "Bulk quantities across a single order attract different pricing to small ad-hoc requirements." },
  { label: "Product mix", description: "Distribution boards, lighting and consumables carry different margins and handling costs." },
  { label: "Delivery window", description: "Standard scheduled delivery is priced differently to urgent or after-hours site requirements." },
  { label: "Stock availability", description: "Real-time stock levels for the specific components on your schedule." },
  { label: "Project duration", description: "Phased supply across a longer programme is planned and priced differently to a once-off order." },
  { label: "Order frequency", description: "Recurring maintenance and consumable orders can be consolidated into scheduled supply." },
  { label: "Delivery distance", description: "Route length and access complexity from our warehouse to your site." },
  { label: "Technical support", description: "Specification assistance, take-offs and site coordination are scoped separately where required." },
];

export const sampleBreakdown = [
  { label: "Electrical & lighting components", amount: 62000 },
  { label: "Containment & accessories", amount: 8500 },
  { label: "Consumables & supplies", amount: 14000 },
  { label: "Delivery & handling", amount: 4200 },
];

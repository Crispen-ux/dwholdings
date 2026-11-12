import type { Metadata } from "next";
import { CatalogClient } from "@/components/equipment/CatalogClient";

export const metadata: Metadata = {
  title: "Catalogue — DWH",
  description: "Browse Diverse Works Holdings' electrical, lighting, component, accessory and consumable catalogue.",
};

export default function EquipmentPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-16">
      <div className="mb-10 max-w-[600px]">
        <div className="mb-3.5 text-xs font-semibold uppercase tracking-[2px] text-accent">Catalogue</div>
        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-bold leading-[1.1] tracking-tight">
          Discover and specify your products.
        </h1>
        <p className="mt-3.5 text-base leading-relaxed text-text-dim">
          Search and filter the electrical and lighting catalogue. Add items directly to your basket — it carries
          through to the Project Builder.
        </p>
      </div>
      <CatalogClient />
    </main>
  );
}

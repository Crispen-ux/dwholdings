import type { Metadata } from "next";
import Link from "next/link";
import { solutions } from "@/data/solutions";
import { RevealOnScroll } from "@/components/marketing/RevealOnScroll";

export const metadata: Metadata = {
  title: "Solutions — DWH",
  description: "Five supply categories — electrical systems, lighting, components, accessories and consumables.",
};

export default function SolutionsIndexPage() {
  return (
    <main>
      <header className="border-b border-border py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-3.5 text-xs font-semibold uppercase tracking-[2px] text-accent">Solutions</div>
          <h1 className="max-w-[720px] font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-tight">
            Five supply categories. One accountable partner.
          </h1>
          <p className="mt-5 max-w-[560px] text-base leading-relaxed text-text-dim">
            Procurement is often fragmented across suppliers. Diverse Works Holdings brings electrical systems,
            lighting, components, accessories and consumables together under one supply model.
          </p>
        </div>
      </header>

      <section className="py-4">
        <div className="mx-auto max-w-[1200px] px-6">
          <RevealOnScroll className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
            {solutions.map((s) => (
              <Link
                key={s.slug}
                href={`/solutions/${s.slug}`}
                className="group bg-bg p-9 transition-colors hover:bg-surface"
              >
                <div className="font-display text-xs text-text-faint">{s.num}</div>
                <h2 className="mt-3.5 text-[22px] font-semibold">{s.name}</h2>
                <p className="mt-2.5 text-[14px] leading-relaxed text-text-dim">{s.summary}</p>
                <div className="mt-5 text-xs font-semibold text-accent group-hover:underline">
                  Explore {s.name} →
                </div>
              </Link>
            ))}
          </RevealOnScroll>
        </div>
      </section>
    </main>
  );
}

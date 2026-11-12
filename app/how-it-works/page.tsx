import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works — DWH",
  description: "From first schedule to site delivery — how Diverse Works Holdings supplies your electrical and lighting components.",
};

const steps = [
  { n: "01", title: "Tell us about your project", description: "Sector, project scale, site and environment — the starting inputs for every schedule." },
  { n: "02", title: "Configure your supply", description: "Power distribution, containment, enclosures, lighting, components and logistics are configured step by step in the Project Builder." },
  { n: "03", title: "Receive a recommendation", description: "An indicative product schedule, crew requirement, delivery window and estimate are generated in real time." },
  { n: "04", title: "Approve your quote", description: "Review the full schedule, adjust as needed, and approve a formal supply quote." },
  { n: "05", title: "We prepare and deliver", description: "Products are picked, checked and scheduled, then delivered to site or prepared for collection." },
  { n: "06", title: "We support hand-over", description: "Our team stays available for substitutions, additions and snag-list consumables after delivery." },
];

export default function HowItWorksPage() {
  return (
    <main>
      <header className="border-b border-border py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-3.5 text-xs font-semibold uppercase tracking-[2px] text-accent">How It Works</div>
          <h1 className="max-w-[720px] font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-tight">
            From specification to site.
          </h1>
        </div>
      </header>

      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="relative">
            <div className="absolute left-[27px] top-2 hidden h-[calc(100%-16px)] w-px bg-border md:block" />
            <div className="flex flex-col gap-6">
              {steps.map((s) => (
                <div key={s.n} className="relative flex items-start gap-6 rounded border border-border bg-surface p-6">
                  <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded border border-accent/40 bg-accent-dim font-display text-lg font-bold text-accent">
                    {s.n}
                  </div>
                  <div>
                    <h2 className="text-[17px] font-semibold">{s.title}</h2>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-dim">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3.5">
            <Link href="/event-builder" className="btn btn-primary px-6 py-3.5 text-sm">
              Plan Your Project
            </Link>
            <Link href="/contact" className="btn btn-ghost border border-border px-6 py-3.5 text-sm">
              Talk to a Technical Specialist
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

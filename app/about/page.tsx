import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — DWH",
  description: "Why Diverse Works Holdings exists, and how it brings electrical and lighting supply together under one operating model.",
};

const principles = [
  { title: "One partner, not five suppliers", description: "Electrical systems, lighting, components, accessories and consumables are sourced and supplied as one coordinated schedule, not five separate orders." },
  { title: "Indicative, then reviewed", description: "Planning tools give fast, honest estimates. Final product selection and compliance sign-off always go through qualified review — we never claim automated certification." },
  { title: "Technology in service of supply", description: "Every tool we build — the Project Builder, stock visibility, delivery tracking — exists to make physical supply more reliable, not to replace the people who specify and deliver it." },
  { title: "Transparent by default", description: "Clients can see what's recommended, why, and what it costs — from first schedule through to delivery status." },
];

export default function AboutPage() {
  return (
    <main>
      <header className="border-b border-border py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-3.5 text-xs font-semibold uppercase tracking-[2px] text-accent">About</div>
          <h1 className="max-w-[760px] font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-tight">
            Growing value across sectors.
          </h1>
        </div>
      </header>

      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-[800px] px-6">
          <h2 className="mb-5 font-display text-2xl font-bold">The problem</h2>
          <p className="text-base leading-relaxed text-text-dim">
            Electrical and lighting procurement is often fragmented. Teams are left to coordinate boards,
            protection devices, fixtures, containment, tools and consumables across separate suppliers — each with
            their own quote, lead time and point of failure. Nobody owns the whole schedule, and the project team
            absorbs the risk of anything falling between the cracks.
          </p>
          <p className="mt-4 text-base leading-relaxed text-text-dim">
            Diverse Works Holdings brings that supply together under one operating model, and progressively adds
            technology — planning tools, stock visibility, delivery tracking — to make specification, ordering and
            site delivery more transparent for everyone involved.
          </p>
        </div>
      </section>

      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <div className="mb-2.5 text-xs font-semibold uppercase tracking-[2px] text-accent">Mission</div>
              <p className="text-lg leading-relaxed">
                Supply the electrical and lighting components that keep projects moving, so contractors and
                facilities teams can focus on delivery instead of chasing suppliers.
              </p>
            </div>
            <div>
              <div className="mb-2.5 text-xs font-semibold uppercase tracking-[2px] text-accent">Vision</div>
              <p className="text-lg leading-relaxed">
                DWH OS — a single operating platform connecting quoting, specification, inventory, delivery and
                account management for electrical supply across South Africa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="mb-8 font-display text-2xl font-bold">Operating principles</h2>
          <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="bg-bg p-7">
                <h3 className="text-[16px] font-semibold">{p.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-dim">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

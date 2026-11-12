import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Quoting — DWH",
  description: "How Diverse Works Holdings quotes electrical, lighting and component supply — project-based, transparent, on request.",
};

export default function PricingPage() {
  return (
    <main>
      <header className="border-b border-border py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <Badge variant="accent" className="mb-3.5">
            Quoting
          </Badge>
          <h1 className="max-w-[720px] font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-tight">
            Pricing shaped around your project.
          </h1>
          <p className="mt-5 max-w-[600px] text-base leading-relaxed text-text-dim">
            DWH does not publish a price list. Every supply schedule is quoted against your actual scope,
            quantities and delivery requirements — so you get a number that reflects your project, not a
            generic rate card.
          </p>
        </div>
      </header>

      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="mb-2 font-display text-2xl font-bold">How quoting works</h2>
          <p className="mb-8 max-w-[560px] text-[14px] text-text-dim">
            A short, transparent process from first enquiry to delivery.
          </p>
          <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "1. Share your scope", body: "Tell us what you're installing — products, quantities, site and timeline." },
              { title: "2. Receive a quote", body: "We return an itemised, project-specific quote, usually within one business day." },
              { title: "3. Confirm & schedule", body: "Approve the quote and we align stock, crew and delivery to your programme." },
              { title: "4. Delivered & supported", body: "Supply, delivery and on-site support handled by one accountable partner." },
            ].map((step) => (
              <div key={step.title} className="bg-bg p-6">
                <h3 className="text-[14px] font-semibold">{step.title}</h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-text-dim">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded border border-border bg-surface p-9 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold">Get your own indicative estimate today</h2>
              <p className="mt-2 max-w-[480px] text-[14px] text-text-dim">
                The Project Builder gives you a rules-based indicative schedule in seconds — no prices published,
                just a clear view of what you need.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/event-builder">Open Project Builder</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/request-quote">Request a Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

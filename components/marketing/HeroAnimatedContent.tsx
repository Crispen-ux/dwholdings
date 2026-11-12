"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const tags = ["Commercial", "Industrial", "Retail", "Infrastructure", "Electrical Systems", "Lighting", "Consumables"];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function HeroAnimatedContent() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="relative mx-auto max-w-[1200px] px-6">
      <motion.div variants={item} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[2px] text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Electrical · Lighting · Components · South Africa
      </motion.div>
      <motion.h1 variants={item} className="max-w-[860px] font-display text-[clamp(40px,7vw,76px)] font-bold leading-[1.02] tracking-[-1.5px]">
        Infrastructure-grade supply across every sector.
      </motion.h1>
      <motion.p variants={item} className="mt-5 max-w-[560px] text-lg leading-relaxed text-text-dim">
        Electrical systems, lighting, components, accessories and consumables — specified, stocked and delivered by
        one accountable partner.
      </motion.p>
      <motion.div variants={item} className="mt-9 flex flex-wrap gap-3.5">
        <Button asChild size="lg">
          <Link href="/event-builder">Plan Your Project</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/solutions">Explore Solutions</Link>
        </Button>
      </motion.div>
      <motion.div variants={item} className="mt-14 flex flex-wrap gap-2.5 text-xs text-text-faint">
        {tags.map((t) => (
          <span key={t} className="rounded border border-border px-3 py-1.5">
            {t}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

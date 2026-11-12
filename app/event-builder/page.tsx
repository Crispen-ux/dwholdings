import type { Metadata } from "next";
import { BuilderShell } from "@/components/event-builder/BuilderShell";

export const metadata: Metadata = {
  title: "Project Builder — DWH",
  description: "Configure your project's electrical systems, lighting, components, accessories and logistics.",
};

export default function EventBuilderPage() {
  return (
    <main>
      <BuilderShell />
    </main>
  );
}

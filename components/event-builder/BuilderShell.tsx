"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { defaultConfiguration, calculateRecommendedPackage } from "@/lib/calculations";
import type { EventConfiguration } from "@/types";
import { useBasket } from "@/lib/basket-context";
import { fetchJson, submitJson } from "@/lib/api";
import { Schematic } from "./Schematic";
import { RecommendationPanel } from "./RecommendationPanel";
import { BasketMiniList } from "@/components/equipment/BasketMiniList";

type Notice = { kind: "ok" | "error"; text: string } | null;
type Action = "idle" | "quote" | "save" | "load";

interface ReviewActions {
  action: Action;
  notice: Notice;
  quoteRef: string | null;
  savedRef: string | null;
  loadValue: string;
  onLoadValue: (value: string) => void;
  onRequestQuote: () => void;
  onSave: () => void;
  onLoad: () => void;
}

const steps = [
  { key: "type", title: "Sector" },
  { key: "venue", title: "Scale & Site" },
  { key: "prod", title: "Project Scope" },
  { key: "sound", title: "Power & Distribution" },
  { key: "truss", title: "Containment" },
  { key: "stage", title: "Enclosures & Protection" },
  { key: "light", title: "Lighting" },
  { key: "av", title: "Components" },
  { key: "logi", title: "Logistics" },
  { key: "review", title: "Review" },
] as const;

export function BuilderShell() {
  const [current, setCurrent] = useState(0);
  const [config, setConfig] = useState<EventConfiguration>(defaultConfiguration);
  const pkg = calculateRecommendedPackage(config);
  const step = steps[current];
  const basket = useBasket();
  const combinedTotal = pkg.estimatedTotal + basket.total;
  const [action, setAction] = useState<Action>("idle");
  const [notice, setNotice] = useState<Notice>(null);
  const [quoteRef, setQuoteRef] = useState<string | null>(null);
  const [savedRef, setSavedRef] = useState<string | null>(null);
  const [loadValue, setLoadValue] = useState("");

  function set<K extends keyof EventConfiguration>(key: K, value: EventConfiguration[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  function firstError(errors: Record<string, string> | undefined): string | undefined {
    if (!errors) return undefined;
    const [first] = Object.values(errors);
    return first;
  }

  async function requestQuote() {
    if (action !== "idle") return;
    setAction("quote");
    setNotice(null);
    const result = await submitJson<{ reference?: string }>("/api/builder-quotes", {
      configuration: config,
      basket: basket.lines.map((l) => ({
        equipmentId: l.equipmentId,
        name: l.equipment.name,
        quantity: l.quantity,
        lineTotal: l.lineTotal,
      })),
      basketTotal: basket.total,
    });
    setAction("idle");
    if (result.ok && result.data.reference) {
      setQuoteRef(result.data.reference);
      setNotice({
        kind: "ok",
        text: "Quote request logged — a technical specialist will follow up with an indicative quote.",
      });
      return;
    }
    setQuoteRef(null);
    setNotice({
      kind: "error",
      text: result.ok
        ? "The quote request could not be referenced. Please try again."
        : ((result as { error?: string; errors?: Record<string, string> }).error ?? firstError((result as any).errors) ?? "Something went wrong. Please try again."),
    });
  }

  async function saveConfiguration() {
    if (action !== "idle") return;
    setAction("save");
    setNotice(null);
    const result = await submitJson<{ reference?: string }>("/api/builder-configs", {
      configuration: config,
      label: `${config.eventType} · scale ${config.guestCount}`,
    });
    setAction("idle");
    if (result.ok && result.data.reference) {
      setSavedRef(result.data.reference);
      setNotice({
        kind: "ok",
        text: "Configuration saved — keep the reference below to reload it later.",
      });
      return;
    }
    setSavedRef(null);
    setNotice({
      kind: "error",
      text: result.ok
        ? "The configuration could not be referenced. Please try again."
        : ((result as { error?: string; errors?: Record<string, string> }).error ?? firstError((result as any).errors) ?? "Something went wrong. Please try again."),
    });
  }

  async function loadConfiguration() {
    if (action !== "idle") return;
    const reference = loadValue.trim().toUpperCase();
    if (!reference) {
      setNotice({ kind: "error", text: "Enter a saved configuration reference to load." });
      return;
    }
    setAction("load");
    setNotice(null);
    const result = await fetchJson<{ configuration?: EventConfiguration }>(
      `/api/builder-configs/${encodeURIComponent(reference)}`
    );
    setAction("idle");
    if (!result.ok) {
      setNotice({ kind: "error", text: (result as any).error ?? "Network error — please try again." });
      return;
    }
    if (!result.data.configuration) {
      setNotice({ kind: "error", text: `No configuration found for ${reference}.` });
      return;
    }
    setConfig(result.data.configuration);
    setLoadValue("");
    setNotice({ kind: "ok", text: `Loaded configuration ${reference}.` });
  }

  return (
    <div>
      <div className="overflow-x-auto border-b border-border">
        <div className="mx-auto flex min-w-[900px] max-w-[1200px] px-6">
          {steps.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setCurrent(i)}
              className={`flex-1 border-r border-border px-2.5 py-3.5 text-center text-[11px] last:border-r-0 ${
                i === current ? "bg-surface text-text" : i < current ? "text-ok" : "text-text-faint"
              }`}
            >
              <span className={`block font-display text-[13px] ${i === current ? "text-accent" : ""}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 px-6 md:grid-cols-2">
        <div className="overflow-hidden border-border py-10 md:border-r md:pr-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="mb-2.5 text-xs font-semibold uppercase tracking-[2px] text-accent">
                Step {current + 1} / {steps.length}
              </div>
              <h2 className="mb-7 font-display text-[26px] font-bold">{step.title}</h2>

              <StepFields
                step={step.key}
                config={config}
                set={set}
                basketLines={basket.lines}
                basketTotal={basket.total}
                combinedTotal={combinedTotal}
                review={{
                  action,
                  notice,
                  quoteRef,
                  savedRef,
                  loadValue,
                  onLoadValue: setLoadValue,
                  onRequestQuote: requestQuote,
                  onSave: saveConfiguration,
                  onLoad: loadConfiguration,
                }}
              />
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            <button
              className="btn btn-ghost border border-border"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            >
              ← Back
            </button>
            <button
              className="btn btn-primary"
              disabled={current === steps.length - 1}
              onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}
            >
              Continue →
            </button>
          </div>
        </div>

        <div className="border-t border-border bg-surface2 py-10 md:border-t-0 md:border-l md:pl-10 md:sticky md:top-[106px] md:self-start">
          <div className="md:px-8 md:-mx-8">
            <div className="px-0">
              <Schematic config={config} />
              <div className="mt-4">
                <RecommendationPanel pkg={pkg} />
              </div>
              <div className="mt-4">
                <BasketMiniList />
              </div>
              <div className="mt-4 flex items-center justify-between rounded border border-accent/40 bg-accent-dim/40 p-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-text-faint">
                    Combined Estimated Total
                  </div>
                  <div className="text-[11px] text-text-faint">Recommended package + basket items</div>
                </div>
                <div className="font-display text-2xl font-bold text-accent">
                  R{combinedTotal.toLocaleString()}
                </div>
              </div>
              <Link href="/equipment" className="btn btn-ghost mt-3 w-full border border-border py-2.5 text-[13px]">
                Browse Equipment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepFields({
  step,
  config,
  set,
  basketLines,
  basketTotal,
  combinedTotal,
  review,
}: {
  step: (typeof steps)[number]["key"];
  config: EventConfiguration;
  set: <K extends keyof EventConfiguration>(key: K, value: EventConfiguration[K]) => void;
  basketLines: ReturnType<typeof useBasket>["lines"];
  basketTotal: number;
  combinedTotal: number;
  review: ReviewActions;
}) {
  switch (step) {
    case "type":
      return (
        <Field label="Sector">
          <Chips
            options={[
              { value: "commercial", label: "Commercial" },
              { value: "industrial", label: "Industrial" },
              { value: "retail", label: "Retail" },
              { value: "infrastructure", label: "Infrastructure" },
            ]}
            value={config.eventType}
            onChange={(v) => set("eventType", v as EventConfiguration["eventType"])}
          />
        </Field>
      );
    case "venue":
      return (
        <>
          <Field label={`Project Scale — ${config.guestCount}`}>
            <input
              type="range"
              min={50}
              max={3000}
              step={50}
              value={config.guestCount}
              onChange={(e) => set("guestCount", Number(e.target.value))}
              className="w-full"
            />
          </Field>
          <Field label="Site Environment">
            <Chips
              options={[
                { value: "indoor", label: "Indoor" },
                { value: "outdoor", label: "Outdoor" },
              ]}
              value={config.environment}
              onChange={(v) => set("environment", v as EventConfiguration["environment"])}
            />
          </Field>
          <Field label="Project Date">
            <input
              type="date"
              className="w-full rounded border border-border bg-bg px-3 py-2.5 text-sm"
              value={config.eventDate ?? ""}
              onChange={(e) => set("eventDate", e.target.value)}
            />
          </Field>
        </>
      );
    case "prod":
      return (
        <>
          <Field label="Enclosure & Protection Required">
            <Chips
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={config.stageRequired ? "yes" : "no"}
              onChange={(v) => set("stageRequired", v === "yes")}
            />
          </Field>
          <p className="text-[13.5px] leading-relaxed text-text-dim">
            We&apos;ll translate the choices in the following steps into an indicative component schedule, crew
            requirement and delivery window — visible live on the right.
          </p>
        </>
      );
    case "sound":
      return (
        <Field label="Power & Distribution Tier">
          <Chips
            options={[
              { value: "basic", label: "Essential Board" },
              { value: "standard", label: "Standard Distribution" },
              { value: "premium", label: "Surge + Changeover" },
            ]}
            value={config.soundTier}
            onChange={(v) => set("soundTier", v as EventConfiguration["soundTier"])}
          />
        </Field>
      );
    case "truss":
      return (
        <Field label="Containment Requirement">
          <Chips
            options={[
              { value: "none", label: "None" },
              { value: "standard", label: "Conduit / Standard Tray" },
              { value: "heavy", label: "Heavy Cable Tray" },
            ]}
            value={config.trussTier}
            onChange={(v) => set("trussTier", v as EventConfiguration["trussTier"])}
          />
        </Field>
      );
    case "stage":
      return (
        <Field label="Enclosure & Protection Tier">
          <Chips
            options={[
              { value: "platform", label: "IP40 Surface" },
              { value: "standard", label: "IP44 Industrial" },
              { value: "main", label: "IP65 Weatherproof" },
            ]}
            value={config.stageTier}
            onChange={(v) => set("stageTier", v as EventConfiguration["stageTier"])}
          />
        </Field>
      );
    case "light":
      return (
        <Field label="Lighting Package">
          <Chips
            options={[
              { value: "basic", label: "Panels & Downlights" },
              { value: "standard", label: "High Bay / Floodlight" },
              { value: "premium", label: "Full Schedule + Emergency" },
            ]}
            value={config.lightingTier}
            onChange={(v) => set("lightingTier", v as EventConfiguration["lightingTier"])}
          />
        </Field>
      );
    case "av":
      return (
        <Field label="Components & Accessories">
          <Chips
            options={[
              { value: "basic", label: "Consumables Pack" },
              { value: "standard", label: "Component Kit" },
              { value: "premium", label: "Full Schedule" },
            ]}
            value={config.avTier}
            onChange={(v) => set("avTier", v as EventConfiguration["avTier"])}
          />
        </Field>
      );
    case "logi":
      return (
        <Field label="Delivery & Support">
          <Chips
            options={[
              { value: "selfcollect", label: "Collection" },
              { value: "full", label: "Delivery + Crew" },
            ]}
            value={config.logistics}
            onChange={(v) => set("logistics", v as EventConfiguration["logistics"])}
          />
        </Field>
      );
    case "review": {
      const pkg = calculateRecommendedPackage(config);
      const rows: [string, string][] = [
        ["Sector", config.eventType],
        ["Project Scale", String(config.guestCount)],
        ["Site", config.environment],
        ["Power Distribution", pkg.pa],
        ["Containment", pkg.truss],
        ["Enclosures", pkg.stage],
        ["Lighting", pkg.lighting],
        ["Components", pkg.av],
        ["Crew / Delivery", `${pkg.crewCount} crew · ${pkg.setupHours} hrs`],
        ["Recommended Package Estimate", `R${pkg.estimatedTotal.toLocaleString()}`],
      ];
      return (
        <div>
          <table className="w-full border-collapse text-[13.5px]">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b border-border">
                  <td className="py-2.5 text-text-faint">{k}</td>
                  <td className="py-2.5 text-right font-semibold">{v}</td>
                </tr>
              ))}
              {basketLines.length > 0 && (
                <>
                  <tr>
                    <td colSpan={2} className="pt-4 pb-1.5 text-[11px] uppercase tracking-wide text-text-faint">
                      Named Equipment ({basketLines.length} item{basketLines.length > 1 ? "s" : ""})
                    </td>
                  </tr>
                  {basketLines.map((l) => (
                    <tr key={l.equipmentId} className="border-b border-border">
                      <td className="py-2 text-text-dim">
                        {l.equipment.name} × {l.quantity}
                      </td>
                      <td className="py-2 text-right font-semibold">R{l.lineTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-border">
                    <td className="py-2.5 text-text-faint">Equipment Basket Subtotal</td>
                    <td className="py-2.5 text-right font-semibold">R{basketTotal.toLocaleString()}</td>
                  </tr>
                </>
              )}
              <tr>
                <td className="pt-3 font-semibold">Combined Estimated Total</td>
                <td className="pt-3 text-right font-display text-xl font-bold text-accent">
                  R{combinedTotal.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-primary px-5 py-3.5"
              onClick={review.onRequestQuote}
              disabled={review.action !== "idle"}
            >
              {review.action === "quote" ? "Sending…" : "Request Technical Quote"}
            </button>
            <button
              type="button"
              className="btn btn-ghost border border-border px-5 py-3.5"
              onClick={review.onSave}
              disabled={review.action !== "idle"}
            >
              {review.action === "save" ? "Saving…" : "Save Configuration"}
            </button>
          </div>

          {review.notice && (
            <p
              className={`mt-3 rounded border px-3 py-2.5 text-[13px] leading-relaxed ${
                review.notice.kind === "ok"
                  ? "border-ok/40 bg-ok/10 text-ok"
                  : "border-warn/40 bg-warn/10 text-warn"
              }`}
            >
              {review.notice.text}
            </p>
          )}

          {review.quoteRef && (
            <p className="mt-2 text-[13px] text-text-dim">
              Quote reference <span className="font-semibold text-text">{review.quoteRef}</span>
            </p>
          )}
          {review.savedRef && (
            <p className="mt-1 text-[13px] text-text-dim">
              Saved configuration <span className="font-semibold text-text">{review.savedRef}</span>
            </p>
          )}

          <div className="mt-6 border-t border-border pt-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-faint">
              Load a saved configuration
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                value={review.loadValue}
                onChange={(e) => review.onLoadValue(e.target.value)}
                placeholder={review.savedRef ?? "DWH-C-XXXXXXXX"}
                className="w-full max-w-[260px] rounded border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                className="btn btn-ghost border border-border px-4 py-2.5"
                onClick={review.onLoad}
                disabled={review.action !== "idle"}
              >
                {review.action === "load" ? "Loading…" : "Load"}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5.5">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-faint">{label}</label>
      {children}
    </div>
  );
}

function Chips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`chip ${o.value === value ? "active" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

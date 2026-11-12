import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/LegalLayout";

export const metadata: Metadata = {
  title: "Safety — DWH",
  description: "How Diverse Works Holdings approaches safety across electrical systems, lighting and components.",
};

export default function SafetyPage() {
  return (
    <LegalLayout
      title="Safety"
      updated="12 November 2026"
      intro="Safety underpins everything Diverse Works Holdings supplies. This page explains how product safety fits into our process, and what DWH does and does not certify."
      sections={[
        {
          heading: "1. Indicative recommendations, not certified designs",
          paragraphs: [
            "The Project Builder and Catalogue produce indicative product recommendations based on the information provided. They are planning tools, not a substitute for professional engineering assessment.",
            "Diverse Works Holdings does not automatically certify electrical safety, circuit design or installation compliance through these tools. Any warnings shown (for example around connected load or outdoor IP ratings) are general planning flags, not a safety sign-off.",
          ],
        },
        {
          heading: "2. Qualified technical review",
          paragraphs: [
            "Before supply, schedules involving distribution boards, protective devices, changeover equipment or industrial installations are reviewed by qualified DWH technical staff. Where a requirement falls outside standard parameters, additional engineering input may be required before we can confirm the order.",
          ],
        },
        {
          heading: "3. Installation safety",
          paragraphs: [
            "Electrical installation work must be carried out by a competent, registered electrical contractor. DWH supplies products and technical guidance; we do not perform or certify installation work unless expressly contracted to do so.",
          ],
        },
        {
          heading: "4. Electrical load and compliance",
          paragraphs: [
            "Power distribution is planned against the estimated connected load of the specified products. Clients are responsible for confirming supply capacity and circuit design with their appointed electrical contractor; where supply may be insufficient, this is flagged during configuration and confirmed during technical review.",
          ],
        },
        {
          heading: "5. Outdoor and damp environments",
          paragraphs: [
            "Outdoor and damp installations require appropriate IP-rated enclosures, sockets, isolators and accessories. Weatherproofing is recommended by default for outdoor configurations; final suitability must be confirmed by the installing contractor.",
          ],
        },
        {
          heading: "6. Product standards",
          paragraphs: [
            "Products are sourced to applicable South African and international standards. Certificates and datasheets are available on request for specified items.",
          ],
        },
        {
          heading: "7. Incident reporting",
          paragraphs: [
            "Any safety concern relating to a supplied product should be reported to DWH immediately. Clients are encouraged to isolate the product where safe to do so and to raise the issue with a DWH technical specialist via the Contact page.",
          ],
        },
      ]}
    />
  );
}

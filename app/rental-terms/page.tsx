import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/LegalLayout";

export const metadata: Metadata = {
  title: "Supply Terms — DWH",
  description: "Terms governing the supply of electrical, lighting and component products by Diverse Works Holdings.",
};

export default function RentalTermsPage() {
  return (
    <LegalLayout
      title="Supply Terms"
      updated="12 November 2026"
      intro="These Supply Terms apply once a quote has been confirmed and products, delivery or technical support are ordered through Diverse Works Holdings. They sit alongside our general Terms of Service."
      sections={[
        {
          heading: "1. Product condition",
          paragraphs: [
            "All products are checked and packed before dispatch. Products remain the property of Diverse Works Holdings until paid for in full, where ownership is retained.",
          ],
        },
        {
          heading: "2. Delivery and collection",
          paragraphs: [
            "Delivery windows are confirmed as part of the order and depend on site access, loading conditions and route scheduling. Delays caused by site access restrictions outside Diverse Works Holdings' control are not the responsibility of Diverse Works Holdings.",
            "Clients selecting collection are responsible for safe transport, loading and handling of all products from the point of collection.",
          ],
        },
        {
          heading: "3. Shortages and defects",
          paragraphs: [
            "The client must check all products against the delivery note at hand-over and report shortages, damage or defects promptly. Verified shortages or defects will be corrected, replaced or credited.",
            "Products must be stored and handled in line with the manufacturer's instructions and any applicable installation standards.",
          ],
        },
        {
          heading: "4. Payment terms",
          paragraphs: [
            "A deposit may be required to confirm an order, with the balance due prior to delivery unless otherwise agreed in writing. Invoices not settled by the due date may incur late payment charges.",
          ],
        },
        {
          heading: "5. Cancellation policy",
          paragraphs: [
            "Cancellations made with sufficient notice ahead of the delivery date may be eligible for a partial refund of any deposit paid, less costs already committed (picking, procurement, third-party orders). Cancellations closer to the delivery date may forfeit the full deposit.",
          ],
        },
        {
          heading: "6. Client responsibilities",
          paragraphs: [
            "Clients must ensure site access, safe storage, and any required permits or permissions are confirmed and available ahead of the agreed delivery window.",
          ],
        },
        {
          heading: "7. Indemnity",
          paragraphs: [
            "The client agrees to indemnify Diverse Works Holdings against claims arising from misuse of products by the client, their staff, or their other appointed suppliers, except where such claims arise from Diverse Works Holdings' own negligence.",
          ],
        },
      ]}
    />
  );
}

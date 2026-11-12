import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — DWH",
  description: "How Diverse Works Holdings collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="12 November 2026"
      intro="This Privacy Policy explains how Diverse Works Holdings collects, uses and protects information when you use this website, the Project Builder, the Catalogue, or the Portal, and when you engage us for electrical and lighting supply."
      sections={[
        {
          heading: "1. Information we collect",
          paragraphs: [
            "We collect information you provide directly, such as your name, company, email address, phone number, project details and product selections submitted through the Project Builder, Catalogue, Contact form or Request a Quote form.",
            "We also collect limited technical information automatically, such as browser type and general usage patterns, to help us maintain and improve the site.",
          ],
        },
        {
          heading: "2. How we use information",
          paragraphs: [
            "Information is used to respond to enquiries, prepare supply quotes, coordinate orders and deliveries, and to communicate with you about your project.",
            "We may use aggregated, non-identifying usage information to improve the Project Builder's recommendations and this website generally.",
          ],
        },
        {
          heading: "3. Sharing of information",
          paragraphs: [
            "We do not sell personal information. Information may be shared with DWH staff, contracted delivery partners and technical subcontractors solely as needed to fulfil a confirmed order.",
            "We may disclose information where required by law or to protect the rights, property or safety of Diverse Works Holdings, our clients or the public.",
          ],
        },
        {
          heading: "4. Data security",
          paragraphs: [
            "We take reasonable technical and organisational measures to protect information against unauthorised access, loss or misuse. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
          ],
        },
        {
          heading: "5. Your rights",
          paragraphs: [
            "You may request access to, correction of, or deletion of your personal information by contacting us using the details on the Contact page. We will respond within a reasonable timeframe in accordance with applicable South African law.",
          ],
        },
        {
          heading: "6. Cookies",
          paragraphs: [
            "This prototype does not set tracking or advertising cookies. A production deployment may use functional cookies (for example, to remember your Project Builder configuration, portal session or product basket) — this policy will be updated accordingly.",
          ],
        },
        {
          heading: "7. Contact",
          paragraphs: [
            "Questions about this Privacy Policy can be sent via the Contact page.",
          ],
        },
      ]}
    />
  );
}

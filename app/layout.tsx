import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { Providers } from "@/components/Providers";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: {
    default: "Diverse Works Holdings — Electrical, Lighting & Supply Solutions",
    template: "%s — Diverse Works Holdings",
  },
  description:
    "Diverse Works Holdings supplies and installs electrical systems, lighting, components, accessories, and other consumables for commercial, industrial, retail and infrastructure projects across South Africa.",
  openGraph: {
    title: "Diverse Works Holdings — Growing value across sectors",
    description:
      "Electrical systems, lighting, components, accessories and supplies — sourced, specified and delivered by one trusted partner.",
    type: "website",
    locale: "en_ZA",
    siteName: "Diverse Works Holdings",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('dwh-theme');var d=t?t==='dark':false;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-bg text-text font-sans antialiased">
        <Providers>
          <Nav />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

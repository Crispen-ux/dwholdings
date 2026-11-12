import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const columns = [
  { title: "Company", links: [["Solutions", "/solutions"], ["Projects", "/projects"], ["About", "/about"], ["Contact", "/contact"]] },
  { title: "Platform", links: [["Project Builder", "/event-builder"], ["Catalogue", "/equipment"], ["Portal", "/portal"], ["Quoting", "/pricing"]] },
  { title: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["Supply Terms", "/rental-terms"], ["Safety", "/safety"]] },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-wrap justify-between gap-10">
          <div>
            <Logo />
            <p className="mt-3 max-w-[240px] text-[13px] text-text-dim">
              Electrical, lighting and component supply
              <br />
              South Africa
            </p>
          </div>
          <div className="flex flex-wrap gap-14">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-3.5 text-[12px] uppercase tracking-wide text-text-faint">{col.title}</h4>
                {col.links.map(([label, href]) => (
                  <Link key={href} href={href} className="mb-2.5 block text-[13px] text-text-dim hover:text-text">
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-2.5 border-t border-border pt-5 text-[12px] text-text-faint">
          <span>© {new Date().getFullYear()} Diverse Works Holdings. All rights reserved.</span>
          <span>Growing value across sectors.</span>
        </div>
      </div>
    </footer>
  );
}

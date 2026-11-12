"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BasketIndicator } from "@/components/equipment/BasketIndicator";
import { Logo } from "@/components/brand/Logo";

const links = [
  { href: "/solutions", label: "Solutions" },
  { href: "/event-builder", label: "Project Builder" },
  { href: "/equipment", label: "Catalogue" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("dwh-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Logo priority />

        <div className="hidden gap-7 text-sm text-text-dim md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-text">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="rounded p-2 text-text-dim transition-colors hover:text-text"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="hidden md:block">
            <BasketIndicator />
          </div>
          <Button asChild variant="ghost" className="hidden border border-border md:inline-flex">
            <Link href="/portal">Portal</Link>
          </Button>
          <Button asChild className="hidden md:inline-flex">
            <Link href="/event-builder">Plan Your Project</Link>
          </Button>

          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded p-2 text-text md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 bg-bg md:hidden"
          >
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={{ open: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } }, closed: {} }}
              className="flex flex-col gap-1 px-6 py-8"
            >
              {links.map((l) => (
                <motion.div
                  key={l.href}
                  variants={{
                    open: { opacity: 1, y: 0 },
                    closed: { opacity: 0, y: 12 },
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-border py-4 font-display text-2xl font-semibold"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 12 } }}
                transition={{ duration: 0.25 }}
                className="mt-6 flex flex-col gap-3"
              >
                <Button asChild variant="outline" size="lg">
                  <Link href="/portal" onClick={() => setOpen(false)}>
                    Portal
                  </Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/event-builder" onClick={() => setOpen(false)}>
                    Plan Your Project
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "خانه" },
  { href: "/services", label: "خدمات" },
  { href: "/track", label: "پیگیری سفارش" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-violet-500 text-[var(--bg-0)] shadow-lg">
            <Zap size={18} strokeWidth={2.5} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-wide text-[var(--ink)]">
              کیانت <span className="text-gradient-brand">KIYA NET</span>
            </span>
            <span className="text-[10px] text-[var(--ink-dim)]">کافی‌نت آنلاین اوید کیا</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-white/10 text-[var(--ink)] font-medium"
                    : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/order"
            className="btn-brand hidden rounded-xl px-4 py-2 text-sm font-bold sm:inline-block"
          >
            ثبت سفارش
          </Link>
          <button
            type="button"
            aria-label="باز کردن منو"
            onClick={() => setOpen((o) => !o)}
            className="btn-glass flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="glass mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-2xl p-3 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-xl px-4 py-2.5 text-sm ${
                pathname === link.href ? "bg-white/10 font-medium text-[var(--ink)]" : "text-[var(--ink-dim)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/order"
            onClick={() => setOpen(false)}
            className="btn-brand mt-1 rounded-xl px-4 py-2.5 text-center text-sm font-bold"
          >
            ثبت سفارش
          </Link>
        </div>
      ) : null}
    </header>
  );
}

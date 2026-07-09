"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Menu, X, Zap, User, LogIn, LogOut, Shield, Settings, Search } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DynamicIcon } from "@/components/DynamicIcon";
import { useCMS } from "@/components/cms/CMSContext";
import { Editable } from "@/components/cms/Editable";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useCMS();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const headerLinks = data.menuItems
    .filter((m) => m.location === "HEADER" && m.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const navLinks = headerLinks.length > 0
    ? headerLinks.map((m) => ({ href: m.link, label: m.label, icon: m.iconName }))
    : [
        { href: "/", label: "خانه", icon: "Home" },
        { href: "/services", label: "خدمات", icon: "LayoutGrid" },
        { href: "/waiting-room", label: "اتاق انتظار", icon: "Coffee" },
        { href: "/track", label: "پیگیری سفارش", icon: "Search" },
        { href: "/about", label: "درباره ما", icon: "Info" },
        { href: "/contact", label: "تماس با ما", icon: "Phone" },
      ];

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {});
    fetch("/api/services").then(r => r.json()).then(d => { if (d.services) setServices(d.services); }).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false); setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null); setOpen(false);
    window.location.href = "/";
  };

  const filteredServices = searchQuery.trim()
    ? services.filter(s => s.serviceName.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : [];

  const goToService = (s: any) => {
    setSearchOpen(false); setSearchQuery("");
    router.push(`/order?category=${s.categoryId}&serviceId=${s.id}`);
  };

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-violet-500 text-[var(--bg-0)] shadow-lg">
            <Zap size={18} strokeWidth={2.5} />
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-wide text-[var(--ink)]">
              کیانت <span className="text-gradient-brand">KIYA NET</span>
            </span>
            <span className="text-[10px] text-[var(--ink-dim)]">کافی‌نت آنلاین اوید کیا</span>
          </span>
        </Link>

        {/* Desktop Nav with animated active pill */}
        <nav className="hidden items-center gap-1 lg:flex relative">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative rounded-xl px-4 py-2 text-sm transition-colors duration-300"
                style={{ color: active ? "var(--ink)" : undefined }}
              >
                {active && (
                  <motion.div
                    layoutId="desktopNavPill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "var(--brand)", opacity: 0.13 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  />
                )}
                <span className={`relative z-10 font-medium transition-colors duration-300 ${active ? "" : "text-[var(--ink-dim)] hover:text-[var(--ink)]"}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Search button */}
          <div className="relative" ref={searchRef}>
            <button onClick={() => setSearchOpen(!searchOpen)}
              className="btn-glass hidden sm:flex h-10 w-10 items-center justify-center rounded-full">
              <Search size={17} />
            </button>
            {searchOpen && (
              <div className="absolute left-0 top-12 w-80 glass-strong rounded-2xl p-2 shadow-2xl z-50">
                <div className="flex items-center gap-2 px-3">
                  <Search size={16} className="text-[var(--ink-dim)] shrink-0" />
                  <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="جستجوی خدمت..." className="flex-1 bg-transparent py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)]" />
                  {searchQuery && <button onClick={() => setSearchQuery("")} className="text-[var(--ink-dim)]"><X size={14} /></button>}
                </div>
                {searchQuery && (
                  <div className="mt-1 max-h-64 overflow-y-auto">
                    {filteredServices.length === 0 ? (
                      <p className="px-3 py-4 text-xs text-[var(--ink-dim)] text-center">نتیجه‌ای یافت نشد</p>
                    ) : (
                      filteredServices.slice(0, 8).map(s => (
                        <button key={s.id} onClick={() => goToService(s)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--ink)] hover:bg-white/5 transition-colors text-right">
                          <span className="truncate">{s.serviceName}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User / Login */}
          {user ? (
            <Link href="/profile" className="btn-glass hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[var(--ink)] sm:inline-flex">
              <User size={16} /><span className="hidden md:inline">{user.firstName || "پروفایل"}</span>
            </Link>
          ) : (
            <Link href="/login" className="btn-glass hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[var(--ink)] sm:inline-flex">
              <LogIn size={16} /><span className="hidden md:inline">ورود | عضویت</span>
            </Link>
          )}

          {/* Order CTA */}
          <Link href="/order" className="btn-brand hidden rounded-xl px-4 py-2 text-sm font-bold sm:inline-block">
            ثبت سفارش
          </Link>

          {/* Mobile hamburger */}
          <button type="button" aria-label="منو" onClick={() => setOpen(o => !o)}
            className="btn-glass flex h-10 w-10 items-center justify-center rounded-full lg:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="glass mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-2xl p-3 lg:hidden animate-rise">
          {/* Mobile search */}
          <div className="flex items-center gap-2 px-2 py-2 mb-1 rounded-xl bg-white/5">
            <Search size={16} className="text-[var(--ink-dim)] shrink-0" />
            <input type="text" placeholder="جستجوی سریع خدمات..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent py-1.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)]" />
            {searchQuery && <button onClick={() => setSearchQuery("")}><X size={14} className="text-[var(--ink-dim)]" /></button>}
          </div>
          {searchQuery && (
            <div className="max-h-48 overflow-y-auto mb-1">
              {filteredServices.length === 0 ? (
                <p className="px-3 py-3 text-xs text-[var(--ink-dim)] text-center">نتیجه‌ای یافت نشد</p>
              ) : (
                filteredServices.slice(0, 6).map(s => (
                  <button key={s.id} onClick={() => { setOpen(false); setSearchQuery(""); router.push(`/order?category=${s.categoryId}&serviceId=${s.id}`); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--ink)] hover:bg-white/5 text-right">
                    <span className="truncate">{s.serviceName}</span>
                  </button>
                ))
              )}
              {searchQuery && <div className="border-t border-white/10 mt-1 pt-1" />}
            </div>
          )}

          {/* User section */}
          {user ? (
            <Link href="/profile" onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl bg-emerald-400/10 px-4 py-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-violet-500 text-sm font-bold text-[#052018]">{(user.firstName || "ک")[0]}</div>
              <div className="flex-1"><p className="text-sm font-bold text-[var(--ink)]">{user.firstName || "کاربر"} {user.lastName || ""}</p><p className="text-[11px] text-[var(--ink-dim)]" dir="ltr">{user.phoneNumber}</p></div>
              <Shield size={16} className="text-emerald-300" />
            </Link>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}
              className="btn-brand flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold mb-1">
              <LogIn size={16} /> ورود | عضویت
            </Link>
          )}

          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
              className={`rounded-xl px-4 py-2.5 text-sm ${pathname === link.href ? "bg-white/10 font-medium text-[var(--ink)]" : "text-[var(--ink-dim)]"}`}>
              {link.label}
            </Link>
          ))}

          <Link href="/order" onClick={() => setOpen(false)}
            className="btn-brand mt-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold">ثبت سفارش جدید</Link>

          {user && <div className="mt-2 border-t border-white/10 pt-2">
            <Link href="/wallet" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[var(--ink-dim)]"><User size={16} /> کیف پول</Link>
            <Link href="/vault" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[var(--ink-dim)]"><Shield size={16} /> گاوصندوق مدارک</Link>
            <Link href="/orders" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[var(--ink-dim)]"><User size={16} /> سفارش‌های من</Link>
            {(user.role === "OPERATOR" || user.role === "SUPER_ADMIN") && (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[var(--ink-dim)]"><Settings size={16} /> پنل مدیریت</Link>
            )}
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-red-300"><LogOut size={16} /> خروج از حساب</button>
          </div>}
        </div>
      )}
    </header>
  );
}

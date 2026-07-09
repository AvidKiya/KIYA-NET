"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Clock, X, Search, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { DynamicIcon } from "@/components/DynamicIcon";
import { useCMS } from "@/components/cms/CMSContext";

interface Service { id: number; categoryId: string; serviceName: string; officialPrice: string; kiyanetPrice: string; estimatedTimeMinutes: number; estimatedTimeText: string | null; requiredDocuments: string[] | null; requiresPhysicalShipping: boolean | null; }

const CAT_COLORS: Record<string, string> = { JUDICIAL: "#6366f1", UNIV: "#06b6d4", TAX: "#10b981", LOAN: "#f59e0b", POLICE: "#ef4444", DESIGN: "#8b5cf6", INSURANCE: "#3b82f6" };

export function SearchableCounters() {
  const router = useRouter();
  const { data } = useCMS();
  const categories = useMemo(
    () => data.serviceCategories.filter((c) => c.isActive !== false).sort((a, b) => a.sortOrder - b.sortOrder),
    [data.serviceCategories]
  );
  const [services, setServices] = useState<Service[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/services").then(r => r.json()).then(d => { if (d.services) setServices(d.services); }).catch(() => {});
  }, []);

  const fmt = (p: string) => Number(p).toLocaleString("fa-IR");
  const disc = (s: Service) => Math.round(((Number(s.officialPrice) - Number(s.kiyanetPrice)) / Number(s.officialPrice)) * 100);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return services.filter(s => s.serviceName.toLowerCase().includes(q) || categories.find(c => c.id === s.categoryId)?.name.toLowerCase().includes(q));
  }, [query, services, categories]);

  return (
    <>
      <section className="mt-24">
        <p className="text-xs font-medium text-emerald-300">پیشخوان‌های مجازی</p>
        <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">میز کار خود را انتخاب کنید</h2>
        <p className="mt-2 text-sm leading-7 text-[var(--ink-dim)] max-w-xl">درست مثل یه کافی‌نت واقعی — هر دسته خدمات روی میز تخصصی خودش. یا مستقیماً سرویس مورد نظرت رو جستجو کن.</p>

        {/* Search Bar */}
        <div className="glass relative rounded-2xl p-1 mt-6 mb-8 flex items-center gap-2">
          <Search size={18} className="text-[var(--ink-dim)] shrink-0 mr-3" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder='جستجوی سریع در خدمات... (مثلاً: "ثنا" یا "کنکور" یا "وام")'
            className="flex-1 bg-transparent py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)]" />
          {query && <button onClick={() => setQuery("")} className="btn-glass rounded-xl p-2 ml-1"><X size={16} /></button>}
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {results !== null && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              {results.length === 0 ? (
                <div className="text-center py-10"><Search size={36} className="mx-auto text-white/10" /><p className="mt-3 text-sm text-[var(--ink-dim)]">نتیجه‌ای برای «{query}» یافت نشد</p></div>
              ) : (
                <div>
                  <p className="text-xs text-[var(--ink-dim)] mb-4">{results.length} نتیجه برای «<span className="text-emerald-300 font-medium">{query}</span>»</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.map((s, i) => {
                      const cat = categories.find(c => c.id === s.categoryId);
                      const cc = cat?.color || CAT_COLORS[s.categoryId] || "#6366f1";
                      return (
                        <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                          <GlassCard onClick={() => router.push(`/order?category=${cat?.slug || ""}&serviceId=${s.id}`)}
                            className="card-hover cursor-pointer relative overflow-hidden p-5 h-full">
                            <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full opacity-50 blur-2xl" style={{ background: `radial-gradient(circle, ${cc}40, transparent 70%)` }} />
                            <div className="relative">
                              {cat && (
                                <span className="inline-block rounded-full px-2.5 py-1 text-[10px] font-medium mb-2 border"
                                  style={{ borderColor: cc + "50", color: cc, backgroundColor: cc + "15" }}>{cat.name}</span>
                              )}
                              <h4 className="font-bold text-sm text-[var(--ink)] leading-snug">{s.serviceName}</h4>
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-[var(--ink-dim)] line-through">{fmt(s.officialPrice)}</span>
                                <span className="font-extrabold text-emerald-300 text-sm">{fmt(s.kiyanetPrice)}</span>
                                <span className="text-[11px] text-[var(--ink-dim)]">تومان</span>
                                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">{disc(s)}٪</span>
                              </div>
                              <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
                                مشاهده و سفارش <ArrowLeft size={12} />
                              </div>
                            </div>
                          </GlassCard>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="my-8 border-t border-white/10" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Counter Cards */}
        {!query && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => {
              const cnt = services.filter(s => s.categoryId === cat.id).length;
              return (
                <Link key={cat.id} href={`/order?category=${cat.slug}`}>
                  <GlassCard className="card-hover animate-rise relative overflow-hidden p-6 h-full" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full opacity-50 blur-2xl" style={{ background: `radial-gradient(circle, ${cat.color}40, transparent 70%)` }} />
                    <div className="relative flex flex-col h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20 text-emerald-300"><DynamicIcon name={cat.iconName} size={22} /></div>
                      <h3 className="mt-4 text-base font-bold text-[var(--ink)]">{cat.name}</h3>
                      <p className="mt-2 flex-1 text-xs leading-6 text-[var(--ink-dim)] sm:text-sm">{cat.tagline || cat.description}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-[var(--ink-dim)]">
                        <span>{cnt} خدمت</span>
                        <span className="flex items-center gap-1 font-medium text-emerald-300">مشاهده و سفارش <ArrowLeft size={13} /></span>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

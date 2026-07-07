"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, GraduationCap, TrendingUp, Landmark, Car, Palette, Shield, Clock, X, ShoppingCart, Search, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = { Scale, GraduationCap, TrendingUp, Landmark, Car, Palette, Shield };

const CATS = [
  { id: "JUDICIAL", slug: "judicial", name: "امور قضایی و حقوقی", desc: "ثبت‌نام ثنا، ابلاغیه، نوبت‌دهی، سوءپیشینه", icon: "Scale", color: "from-indigo-400/30 to-blue-500/20" },
  { id: "UNIV", slug: "university", name: "دانشگاه، مدرسه و آزمون‌ها", desc: "کنکور، انتخاب واحد، سیدا، مای مدیو", icon: "GraduationCap", color: "from-cyan-400/30 to-teal-500/20" },
  { id: "TAX", slug: "tax", name: "مالیات، اصناف و کسب‌وکار", desc: "اظهارنامه، کد اقتصادی، ثبت شرکت", icon: "TrendingUp", color: "from-emerald-400/30 to-green-500/20" },
  { id: "LOAN", slug: "loan", name: "وام، امور بانکی و یارانه", desc: "وام ازدواج، مرآت، یارانه، سجام", icon: "Landmark", color: "from-amber-400/30 to-yellow-500/20" },
  { id: "POLICE", slug: "vehicle", name: "خودرو و پلیس +۱۰", desc: "تعویض پلاک، خلافی، طرح فروش خودرو", icon: "Car", color: "from-red-400/30 to-rose-500/20" },
  { id: "DESIGN", slug: "design-print", name: "طراحی، گرافیک و چاپ", desc: "رزومه، پاورپوینت، کارت ویزیت، بنر", icon: "Palette", color: "from-violet-400/30 to-purple-500/20" },
  { id: "INSURANCE", slug: "insurance", name: "تامین اجتماعی و بیمه", desc: "سوابق بیمه، فیش حقوقی، بیمه کارگاهی", icon: "Shield", color: "from-blue-400/30 to-sky-500/20" },
];

const CAT_COLORS: Record<string, string> = { JUDICIAL: "#6366f1", UNIV: "#06b6d4", TAX: "#10b981", LOAN: "#f59e0b", POLICE: "#ef4444", DESIGN: "#8b5cf6", INSURANCE: "#3b82f6" };

interface Service { id: number; categoryId: string; serviceName: string; officialPrice: string; kiyanetPrice: string; estimatedTimeMinutes: number; estimatedTimeText: string | null; requiredDocuments: string[] | null; requiresPhysicalShipping: boolean | null; }

export function SearchableCounters() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedSvc, setSelectedSvc] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/services").then(r => r.json()).then(d => { if (d.services) setServices(d.services); }).catch(() => {});
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {});
  }, []);

  const fmt = (p: string) => Number(p).toLocaleString("fa-IR");
  const disc = (s: Service) => Math.round(((Number(s.officialPrice) - Number(s.kiyanetPrice)) / Number(s.officialPrice)) * 100);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return services.filter(s => s.serviceName.toLowerCase().includes(q) || CATS.find(c => c.id === s.categoryId)?.name.toLowerCase().includes(q));
  }, [query, services]);

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
            placeholder='جستجوی سریع در ۳۹ خدمت... (مثلاً: "ثنا" یا "کنکور" یا "وام")'
            className="flex-1 bg-transparent py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)]" />
          {query && <button onClick={() => setQuery("")} className="btn-glass rounded-xl p-2 ml-1"><X size={16} /></button>}
        </div>

        {/* Search Results — Full AvidKiya style cards */}
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
                      const cat = CATS.find(c => c.id === s.categoryId);
                      const cc = CAT_COLORS[s.categoryId] || "#6366f1";
                      return (
                        <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                          <GlassCard onClick={() => router.push(`/order?category=${cat?.slug || ""}&service=${s.id}`)}
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

        {/* Counter Cards — AvidKiya style */}
        {!query && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATS.map((cat, i) => {
              const Icon = iconMap[cat.icon] || Shield;
              const cnt = services.filter(s => s.categoryId === cat.id).length;
              return (
                <Link key={cat.id} href={`/order?category=${cat.slug}`}>
                  <GlassCard className="card-hover animate-rise relative overflow-hidden p-6 h-full" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className={`pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${cat.color} blur-2xl`} />
                    <div className="relative flex flex-col h-full">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20 text-emerald-300"><Icon size={22} /></div>
                      <h3 className="mt-4 text-base font-bold text-[var(--ink)]">{cat.name}</h3>
                      <p className="mt-2 flex-1 text-xs leading-6 text-[var(--ink-dim)] sm:text-sm">{cat.desc}</p>
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

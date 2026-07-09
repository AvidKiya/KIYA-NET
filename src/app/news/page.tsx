"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, ArrowLeft, Loader2, ExternalLink, Clock } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: string;
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => { if (d.items) setItems(d.items); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleString("fa-IR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return d;
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-8 pb-28">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
            <Newspaper size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--ink)]">اخبار و اتاق انتظار</h1>
            <p className="text-xs text-[var(--ink-dim)]">آخرین اخبار را در حین انتظار سفارش بخوانید</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${filter === c ? "bg-emerald-400/20 text-emerald-300" : "btn-glass text-[var(--ink-dim)]"}`}
            >
              {c === "all" ? "همه" : c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-300" />
            <p className="mt-4 text-sm text-[var(--ink-dim)]">در حال بارگذاری اخبار...</p>
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-8 text-center text-sm text-[var(--ink-dim)]">خبری یافت نشد.</GlassCard>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <GlassCard key={i} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-[var(--ink-dim)]">{item.source}</span>
                    <h3 className="mt-2 text-sm font-bold text-[var(--ink)] leading-relaxed">{item.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-[var(--ink-dim)]">{item.description}</p>
                    <div className="mt-3 flex items-center gap-3 text-[11px] text-[var(--ink-dim)]">
                      <span className="flex items-center gap-1"><Clock size={11} /> {fmtDate(item.pubDate)}</span>
                    </div>
                  </div>
                  <a href={item.link} target="_blank" rel="noreferrer" className="btn-glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <ExternalLink size={15} />
                  </a>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        <Link href="/games" className="btn-brand mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold">
          <ArrowLeft size={16} /> رفتن به بخش بازی و امتیاز
        </Link>
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}

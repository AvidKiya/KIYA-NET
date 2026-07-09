"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gamepad2, Trophy, Gift, ArrowLeft, Brain, Zap, HelpCircle, Puzzle } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";

const GAMES = [
  { id: "memory", title: "حافظه رنگ‌ها", icon: Brain, desc: "کارت‌های هم‌شکل را پیدا کنید", color: "text-violet-400" },
  { id: "reaction", title: "تست واکنش", icon: Zap, desc: "به‌محض سبز شدن، بزنید", color: "text-amber-400" },
  { id: "quiz", title: "آزمون عمومی", icon: HelpCircle, desc: "۱۰ سوال چهارگزینه‌ای", color: "text-blue-400" },
  { id: "puzzle", title: "پازل عددی", icon: Puzzle, desc: "خانه‌ها را مرتب کنید", color: "text-emerald-300" },
];

export default function GamesPage() {
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => { if (d.user) setUser(d.user); }).catch(() => {});
    fetch("/api/games/leaderboard?me=true").then((r) => r.json()).then((d) => { if (d.points) setPoints(d.points); }).catch(() => {});
  }, []);

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-8 pb-28">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
              <Gamepad2 size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[var(--ink)]">بخش بازی و امتیاز</h1>
              <p className="text-xs text-[var(--ink-dim)]">بازی کنید، امتیاز جمع‌آوری کنید، تخفیف بگیرید</p>
            </div>
          </div>
          <GlassCard className="px-4 py-2 text-center">
            <p className="text-[10px] text-[var(--ink-dim)]">امتیاز شما</p>
            <p className="text-lg font-extrabold text-emerald-300">{points.toLocaleString("fa-IR")}</p>
          </GlassCard>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {GAMES.map((g) => (
            <Link key={g.id} href={`/games/${g.id}`} className="group">
              <GlassCard className="card-hover flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ${g.color}`}>
                  <g.icon size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--ink)] group-hover:text-emerald-300 transition-colors">{g.title}</h3>
                  <p className="text-xs text-[var(--ink-dim)]">{g.desc}</p>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/games/leaderboard" className="btn-glass flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium text-[var(--ink)]">
            <Trophy size={16} /> لیدربورد
          </Link>
          <Link href="/games/redeem" className="btn-glass flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium text-[var(--ink)]">
            <Gift size={16} /> تبدیل امتیاز به کد تخفیف
          </Link>
        </div>

        <Link href="/news" className="btn-brand mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold">
          <ArrowLeft size={16} /> بازگشت به اخبار
        </Link>
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}

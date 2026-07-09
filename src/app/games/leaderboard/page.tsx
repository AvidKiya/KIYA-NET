"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";

interface LeaderboardRow {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  totalPoints: number;
  totalScore: number;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [period, setPeriod] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [myPoints, setMyPoints] = useState(0);
  const [myRank, setMyRank] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/games/leaderboard?period=${period}&me=true`)
      .then((r) => r.json())
      .then((d) => {
        if (d.leaderboard) setRows(d.leaderboard);
        setMyPoints(d.points || 0);
        setMyRank(d.rank || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 pb-28">
        <Link href="/games" className="mb-4 flex items-center gap-2 text-sm text-[var(--ink-dim)]">
          <ArrowLeft size={16} /> بازگشت به بازی‌ها
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
            <Trophy size={20} />
          </div>
          <h1 className="text-xl font-extrabold text-[var(--ink)]">لیدربورد</h1>
        </div>

        <div className="mb-4 flex gap-2">
          {["daily", "weekly", "monthly", "all"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${period === p ? "bg-emerald-400/20 text-emerald-300" : "btn-glass text-[var(--ink-dim)]"}`}
            >
              {p === "daily" ? "روزانه" : p === "weekly" ? "هفتگی" : p === "monthly" ? "ماهانه" : "همه"}
            </button>
          ))}
        </div>

        {myRank > 0 && (
          <GlassCard className="mb-4 p-4 text-center">
            <p className="text-sm text-[var(--ink-dim)]">رتبه شما: <span className="font-bold text-emerald-300">{myRank}</span> | امتیاز: <span className="font-bold text-emerald-300">{myPoints.toLocaleString("fa-IR")}</span></p>
          </GlassCard>
        )}

        {loading ? (
          <p className="text-center text-sm text-[var(--ink-dim)]">در حال بارگذاری...</p>
        ) : rows.length === 0 ? (
          <GlassCard className="p-8 text-center text-sm text-[var(--ink-dim)]">هنوز امتیازی ثبت نشده.</GlassCard>
        ) : (
          <div className="space-y-2">
            {rows.map((row, i) => (
              <GlassCard key={row.userId} className="flex items-center gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-[var(--ink)]">
                  {i === 0 ? <Medal size={16} className="text-amber-400" /> : i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[var(--ink)]">{row.firstName || ""} {row.lastName || "کاربر"}</p>
                </div>
                <span className="text-sm font-extrabold text-emerald-300">{row.totalPoints.toLocaleString("fa-IR")}</span>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

interface LoyaltyData {
  points: number;
  level: string;
  totalEarned: number;
}

export function LoyaltyStatus() {
  const [data, setData] = useState<LoyaltyData | null>(null);

  useEffect(() => {
    fetch("/api/loyalty")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const progress = Math.min((data.points / 500) * 100, 100);

  return (
    <div className="glass rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-[var(--ink-dim)]">امتیاز وفاداری</div>
          <div className="text-3xl font-black text-[var(--ink)] mt-0.5">{data.points}</div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-400">
            {data.level}
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-3">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px]">
        <span className="text-[var(--ink-dim)]">{data.totalEarned} امتیاز کل</span>
        <span className="text-emerald-400">سطح بعدی: Silver</span>
      </div>
    </div>
  );
}
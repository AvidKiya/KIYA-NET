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
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-[var(--ink-dim)]">امتیاز وفاداری</div>
          <div className="text-2xl font-bold text-emerald-400">{data.points}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[var(--ink-dim)]">سطح</div>
          <div className="font-bold text-[var(--ink)]">{data.level}</div>
        </div>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 text-[10px] text-[var(--ink-dim)]">
        {data.totalEarned} امتیاز کسب شده • سطح بعدی: Silver
      </div>
    </div>
  );
}
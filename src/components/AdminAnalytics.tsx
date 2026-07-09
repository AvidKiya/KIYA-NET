"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  totalOrders: number;
  recentOrders: number;
  completedOrders: number;
  totalRevenue: number;
  activeUsers: number;
  averageRating: number;
  statusBreakdown: { status: string; count: number }[];
  topOperators: { operatorId: string; count: number }[];
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchAnalytics = async (period: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${period}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  if (loading && !data) {
    return <div className="p-6 text-center text-sm text-[var(--ink-dim)]">در حال بارگذاری آمار...</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-full px-4 py-1 text-xs font-medium transition-all ${
              days === d
                ? "bg-[var(--brand)] text-black"
                : "bg-white/10 text-[var(--ink)] hover:bg-white/20"
            }`}
          >
            {d} روز اخیر
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-[var(--ink-dim)]">کل سفارش‌ها</p>
          <p className="mt-1 text-3xl font-bold text-[var(--ink)]">{data.totalOrders}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-[var(--ink-dim)]">سفارش‌های اخیر</p>
          <p className="mt-1 text-3xl font-bold text-emerald-400">{data.recentOrders}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-[var(--ink-dim)]">تکمیل شده</p>
          <p className="mt-1 text-3xl font-bold text-[var(--ink)]">{data.completedOrders}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-[var(--ink-dim)]">درآمد کل (تومان)</p>
          <p className="mt-1 text-2xl font-bold text-[var(--ink)]">
            {Number(data.totalRevenue).toLocaleString("fa-IR")}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-[var(--ink-dim)]">کاربران فعال</p>
          <p className="mt-1 text-3xl font-bold text-[var(--ink)]">{data.activeUsers}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-[var(--ink-dim)]">امتیاز میانگین</p>
          <p className="mt-1 text-3xl font-bold text-amber-400">
            {Number(data.averageRating).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-sm font-bold text-[var(--ink)]">وضعیت سفارش‌ها</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {data.statusBreakdown.map((item) => (
            <div key={item.status} className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-xs text-[var(--ink-dim)]">{item.status}</p>
              <p className="mt-1 text-xl font-bold text-[var(--ink)]">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Operators */}
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-sm font-bold text-[var(--ink)]">بهترین اپراتورها (بر اساس سفارش تکمیل شده)</h3>
        {data.topOperators.length > 0 ? (
          <div className="space-y-2">
            {data.topOperators.map((op, index) => (
              <div key={index} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5">
                <span className="text-sm text-[var(--ink)]">اپراتور #{index + 1}</span>
                <span className="text-sm font-medium text-emerald-400">{op.count} سفارش</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--ink-dim)]">هنوز داده‌ای موجود نیست</p>
        )}
      </div>
    </div>
  );
}
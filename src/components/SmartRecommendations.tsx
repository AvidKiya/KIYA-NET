"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Recommendation {
  id: number;
  serviceName: string;
  kiyanetPrice: string;
  score: number;
  reason: string;
}

export function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await fetch("/api/recommendations");
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      } catch (e) {
        console.error("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading || recommendations.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-emerald-300">پیشنهاد هوشمند</p>
          <h3 className="text-xl font-bold text-[var(--ink)]">خدماتی که ممکن است نیاز داشته باشید</h3>
        </div>
        <Link href="/services" className="text-sm text-emerald-400">مشاهده همه</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.slice(0, 6).map((rec, index) => (
          <Link
            key={index}
            href={`/order?serviceId=${rec.id}`}
            className="glass rounded-2xl p-5 hover:border-emerald-400/30 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-[var(--ink)]">{rec.serviceName}</div>
                <div className="text-xs text-emerald-400 mt-1">{rec.reason}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[var(--ink)]">
                  {Number(rec.kiyanetPrice).toLocaleString("fa-IR")}
                </div>
                <div className="text-[10px] text-emerald-400">امتیاز: {rec.score}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
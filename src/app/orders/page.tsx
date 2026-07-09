"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle2, AlertCircle, Loader2, XCircle, Star, MessageCircle } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";
import { LiveChat } from "@/components/LiveChat";
import { LoyaltyStatus } from "@/components/LoyaltyStatus";
import { ReferralBox } from "@/components/ReferralBox";
import { SupportTicket } from "@/components/SupportTicket";

const SC: Record<string, { label: string; icon: any; color: string }> = {
  PENDING_ASSIGNMENT: { label: "در انتظار", icon: Clock, color: "text-amber-400" },
  UNDER_REVIEW: { label: "بررسی مدارک", icon: Loader2, color: "text-blue-400" },
  NEEDS_INFO: { label: "نیازمند اطلاعات", icon: AlertCircle, color: "text-orange-400" },
  IN_PROGRESS: { label: "در حال انجام", icon: Loader2, color: "text-purple-400" },
  COMPLETED: { label: "تکمیل شده", icon: CheckCircle2, color: "text-emerald-300" },
  CANCELLED: { label: "لغو شده", icon: XCircle, color: "text-red-400" },
};

function OrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [u, setU] = useState<any>(null);
  const [activeChatOrder, setActiveChatOrder] = useState<string | null>(null);
  const [ratingModal, setRatingModal] = useState<{ orderId: string; operatorId: string } | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setU(d.user);
      })
      .catch(() => {});

    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        if (d.orders) setOrders(d.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = (p: string) => Number(p).toLocaleString("fa-IR");
  const fd = (d: string) =>
    new Date(d).toLocaleDateString("fa-IR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const submitRating = async () => {
    if (!ratingModal) return;

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: ratingModal.orderId,
          rating: ratingValue,
          comment: ratingComment,
        }),
      });

      if (res.ok) {
        alert("امتیاز شما ثبت شد. سپاسگزاریم!");
        setRatingModal(null);
        setRatingValue(5);
        setRatingComment("");
      } else {
        const err = await res.json();
        alert(err.error || "خطا در ثبت امتیاز");
      }
    } catch {
      alert("خطا در ارتباط با سرور");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={28} className="animate-spin text-emerald-400" />
      </div>
    );

  if (!u)
    return (
      <>
        <SiteHeader />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <FileText size={48} className="mx-auto text-[var(--ink-dim)]" />
          <h2 className="mt-4 text-lg font-bold text-[var(--ink)]">لطفاً وارد شوید</h2>
          <Link href="/login" className="btn-brand mt-4 inline-block rounded-xl px-6 py-3 text-sm font-bold">
            ورود
          </Link>
        </div>
        <SiteFooter />
      </>
    );

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 pb-28 space-y-3">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-extrabold text-[var(--ink)]">سفارش‌های من</h1>
          <LoyaltyStatus />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <ReferralBox />
          <SupportTicket />
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto text-white/10" />
            <h2 className="mt-4 text-lg font-bold text-[var(--ink)]">هیچ سفارشی ندارید</h2>
            <Link href="/order" className="btn-brand mt-4 inline-block rounded-xl px-6 py-3 text-sm font-bold">
              ثبت سفارش جدید
            </Link>
          </div>
        ) : (
          orders.map((o) => {
            const info = SC[o.status] || SC.PENDING_ASSIGNMENT;
            const I = info.icon;
            return (
              <GlassCard key={o.id} className="p-5 card-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[11px] font-bold text-emerald-300">{o.id}</span>
                    <h4 className="font-bold text-sm text-[var(--ink)] mt-0.5">{o.serviceName}</h4>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`flex items-center gap-1 text-[11px] font-medium ${info.color}`}>
                        <I size={12} className={o.status === "IN_PROGRESS" ? "animate-spin" : ""} />
                        {info.label}
                      </span>
                      <span className="text-[11px] text-[var(--ink-dim)]">{fmt(o.totalAmount)} تومان</span>
                      <span className="text-[11px] text-[var(--ink-dim)]">{fd(o.createdAt)}</span>
                    </div>

                    {o.status === "COMPLETED" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <p className="text-[11px] text-emerald-300">فایل خروجی آماده دانلود</p>
                        <button
                          onClick={() => setActiveChatOrder(o.id)}
                          className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-0.5 text-[10px] text-[var(--ink)] hover:bg-white/10"
                        >
                          <MessageCircle size={12} /> چت
                        </button>
                        <button
                          onClick={() =>
                            setRatingModal({ orderId: o.id, operatorId: o.operatorId })
                          }
                          className="flex items-center gap-1 rounded-full bg-amber-400/10 px-3 py-0.5 text-[10px] text-amber-400 hover:bg-amber-400/20"
                        >
                          <Star size={12} /> امتیاز دادن
                        </button>
                      </div>
                    )}

                    {o.status === "NEEDS_INFO" && (
                      <p className="mt-2 text-[11px] text-orange-400">
                        اپراتور درخواست اطلاعات تکمیلی دارد
                      </p>
                    )}
                  </div>
                </div>

                {activeChatOrder === o.id && (
                  <div className="mt-4">
                    <LiveChat orderId={o.id} currentUserId={u?.id} />
                    <button
                      onClick={() => setActiveChatOrder(null)}
                      className="mt-2 text-xs text-[var(--ink-dim)]"
                    >
                      بستن چت
                    </button>
                  </div>
                )}
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass w-full max-w-md rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--ink)]">امتیاز به اپراتور</h3>
            <p className="text-xs text-[var(--ink-dim)] mt-1">تجربه‌تان از انجام سفارش چطور بود؟</p>

            <div className="mt-6 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className={`text-3xl transition-all ${star <= ratingValue ? "text-amber-400" : "text-white/30"}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="نظر خود را بنویسید (اختیاری)"
              className="mt-4 w-full rounded-xl bg-white/5 p-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-dim)]"
              rows={3}
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setRatingModal(null);
                  setRatingValue(5);
                  setRatingComment("");
                }}
                className="flex-1 rounded-xl bg-white/10 py-3 text-sm font-medium"
              >
                انصراف
              </button>
              <button onClick={submitRating} className="btn-brand flex-1 rounded-xl py-3 text-sm font-bold">
                ثبت امتیاز
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
      <BottomNav />
    </>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={28} className="animate-spin text-emerald-400" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Lock,
  LogOut,
  PackageCheck,
  Paperclip,
  RefreshCcw,
  Save,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { formatJalaliDateTime, formatToman, statusLabel, toPersianDigits } from "@/lib/format";

type AdminOrder = {
  id: number;
  trackingCode: string;
  categoryTitle: string;
  serviceTitle: string;
  fullName: string;
  phone: string;
  email: string | null;
  description: string;
  quantity: number;
  urgent: boolean;
  estimatedPrice: number;
  status: string;
  adminNote: string | null;
  attachmentData: boolean | null;
  attachmentName: string | null;
  createdAt: string;
  deliveredAt: string | null;
};

const STATUS_TABS = [
  { key: "all", label: "همه" },
  { key: "pending", label: "در انتظار" },
  { key: "accepted", label: "در حال انجام" },
  { key: "completed", label: "آماده تحویل" },
  { key: "delivered", label: "تحویل‌شده" },
  { key: "cancelled", label: "لغوشده" },
];

const STATUS_OPTIONS = ["pending", "accepted", "completed", "delivered", "cancelled"];

export function AdminDashboard() {
  const [key, setKey] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState("pending");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("kiya-admin-key");
    if (stored) setKey(stored);
  }, []);

  useEffect(() => {
    if (key) fetchOrders(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  async function fetchOrders(adminKey: string) {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/orders", { headers: { "x-admin-key": adminKey } });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setAuthError("رمز عبور اشتباه است.");
        setKey(null);
        sessionStorage.removeItem("kiya-admin-key");
        return;
      }
      setOrders(json.orders);
    } catch {
      setAuthError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin() {
    if (!passwordInput.trim()) return;
    sessionStorage.setItem("kiya-admin-key", passwordInput.trim());
    setKey(passwordInput.trim());
  }

  function handleLogout() {
    sessionStorage.removeItem("kiya-admin-key");
    setKey(null);
    setOrders(null);
    setPasswordInput("");
  }

  function openOrder(order: AdminOrder) {
    setSelected(order);
    setNoteDraft(order.adminNote ?? "");
    setStatusDraft(order.status);
  }

  async function saveOrder() {
    if (!selected || !key) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${selected.trackingCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": key },
        body: JSON.stringify({ status: statusDraft, adminNote: noteDraft }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setOrders((prev) =>
          prev ? prev.map((o) => (o.trackingCode === selected.trackingCode ? { ...o, ...json.order } : o)) : prev,
        );
        setSelected(json.order);
      }
    } finally {
      setSaving(false);
    }
  }

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const stats = useMemo(() => {
    if (!orders) return null;
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      accepted: orders.filter((o) => o.status === "accepted").length,
      completed: orders.filter((o) => o.status === "completed" || o.status === "delivered").length,
      revenue: orders.reduce((sum, o) => sum + o.estimatedPrice, 0),
    };
  }, [orders]);

  if (!key) {
    return (
      <GlassCard className="mx-auto max-w-sm p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
          <Lock size={24} />
        </div>
        <h1 className="mt-5 text-lg font-extrabold text-[var(--ink)]">ورود مدیریت کیانت</h1>
        <p className="mt-2 text-xs text-[var(--ink-dim)]">برای مشاهده سفارش‌ها، رمز عبور مدیریت را وارد کنید.</p>
        <input
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          type="password"
          placeholder="رمز عبور"
          className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60"
        />
        {authError ? <p className="mt-2 text-xs text-red-300">{authError}</p> : null}
        <button
          type="button"
          onClick={handleLogin}
          className="btn-brand mt-4 w-full rounded-xl py-3 text-sm font-bold"
        >
          {loading ? <Loader2 size={16} className="mx-auto animate-spin" /> : "ورود"}
        </button>
      </GlassCard>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-extrabold text-[var(--ink)] sm:text-2xl">داشبورد مدیریت کیانت</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchOrders(key)}
            className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-[var(--ink)]"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            بروزرسانی
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-red-300"
          >
            <LogOut size={14} />
            خروج
          </button>
        </div>
      </div>

      {stats ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "کل سفارش‌ها", value: toPersianDigits(stats.total) },
            { label: "در انتظار", value: toPersianDigits(stats.pending) },
            { label: "در حال انجام", value: toPersianDigits(stats.accepted) },
            { label: "درآمد تخمینی", value: formatToman(stats.revenue) },
          ].map((s) => (
            <GlassCard key={s.label} className="p-4 text-center">
              <p className="text-lg font-extrabold text-[var(--ink)]">{s.value}</p>
              <p className="mt-1 text-[11px] text-[var(--ink-dim)]">{s.label}</p>
            </GlassCard>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              filter === tab.key ? "bg-emerald-400 text-[#052018]" : "btn-glass text-[var(--ink-dim)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <GlassCard className="mt-6 overflow-hidden p-0">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[var(--ink-dim)]">
                <th className="px-5 py-3 text-right font-medium">کد رهگیری</th>
                <th className="px-5 py-3 text-right font-medium">مشتری</th>
                <th className="px-5 py-3 text-right font-medium">خدمت</th>
                <th className="px-5 py-3 text-right font-medium">مبلغ</th>
                <th className="px-5 py-3 text-right font-medium">وضعیت</th>
                <th className="px-5 py-3 text-right font-medium">تاریخ</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-5 py-3 font-mono text-xs text-emerald-300">{order.trackingCode}</td>
                  <td className="px-5 py-3 text-[var(--ink)]">{order.fullName}</td>
                  <td className="px-5 py-3 text-[var(--ink-dim)]">{order.serviceTitle}</td>
                  <td className="px-5 py-3 text-[var(--ink)]">{formatToman(order.estimatedPrice)}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-[var(--ink)]">
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[11px] text-[var(--ink-dim)]">
                    {formatJalaliDateTime(new Date(order.createdAt))}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => openOrder(order)}
                      className="btn-glass rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--ink)]"
                    >
                      مدیریت
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-xs text-[var(--ink-dim)]">
                    سفارشی در این وضعیت پیدا نشد.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div
            className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[var(--ink)]">سفارش {selected.trackingCode}</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="btn-glass flex h-9 w-9 items-center justify-center rounded-full"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <p className="text-[var(--ink-dim)]">مشتری: <span className="text-[var(--ink)]">{selected.fullName}</span></p>
              <p className="text-[var(--ink-dim)]">موبایل: <span className="text-[var(--ink)]">{toPersianDigits(selected.phone)}</span></p>
              <p className="text-[var(--ink-dim)]">خدمت: <span className="text-[var(--ink)]">{selected.serviceTitle}</span></p>
              <p className="text-[var(--ink-dim)]">دسته: <span className="text-[var(--ink)]">{selected.categoryTitle}</span></p>
              <p className="text-[var(--ink-dim)]">تعداد: <span className="text-[var(--ink)]">{toPersianDigits(selected.quantity)}</span></p>
              <p className="text-[var(--ink-dim)]">مبلغ: <span className="text-[var(--ink)]">{formatToman(selected.estimatedPrice)}</span></p>
            </div>

            <div className="mt-4 rounded-xl bg-white/5 p-4">
              <p className="mb-1 text-xs font-medium text-[var(--ink-dim)]">توضیحات مشتری</p>
              <p className="text-sm leading-6 text-[var(--ink)]">{selected.description}</p>
            </div>

            {selected.attachmentData ? (
              <a
                href={`/api/orders/${selected.trackingCode}/attachment`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  // append admin key via fetch download since anchor can't set headers; open helper instead
                  e.preventDefault();
                  fetch(`/api/orders/${selected.trackingCode}/attachment`, {
                    headers: { "x-admin-key": key ?? "" },
                  })
                    .then((r) => r.blob())
                    .then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = selected.attachmentName ?? "attachment";
                      a.click();
                      URL.revokeObjectURL(url);
                    });
                }}
                className="btn-glass mt-4 flex w-fit items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-[var(--ink)]"
              >
                <Paperclip size={14} />
                دانلود پیوست مشتری
              </a>
            ) : null}

            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">وضعیت سفارش</label>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-[#0a1120] text-white">
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">
                گزارش تحویل (این متن در فایل PDF نهایی مشتری نمایش داده می‌شود)
              </label>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-[var(--ink)] outline-none focus:border-emerald-400/60"
                placeholder="توضیح نتیجه کار برای مشتری..."
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={saveOrder}
                disabled={saving}
                className="btn-brand flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                ذخیره تغییرات
              </button>
              <a
                href={`/api/orders/${selected.trackingCode}/document?type=receipt`}
                target="_blank"
                rel="noreferrer"
                className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-[var(--ink)]"
              >
                <FileText size={14} />
                مشاهده رسید
              </a>
              {(selected.status === "completed" || selected.status === "delivered") ? (
                <a
                  href={`/api/orders/${selected.trackingCode}/document?type=delivery`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-[var(--ink)]"
                >
                  <PackageCheck size={14} />
                  مشاهده برگه تحویل
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

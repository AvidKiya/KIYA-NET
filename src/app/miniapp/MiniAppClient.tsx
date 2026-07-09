"use client";

import { useEffect, useState, useCallback } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor: (color: string) => void;
        initData: string;
        colorScheme: "light" | "dark";
      };
    };
  }
}

import { GlassCard } from "@/components/GlassCard";
import { Wallet, ShoppingBag, User, Loader2, AlertCircle, ArrowLeft, Phone } from "lucide-react";

interface MiniAppUser {
  id: string;
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  walletBalance: string | null;
}

type View = "dashboard" | "orders" | "profile";

export default function MiniAppClient() {
  const [platform, setPlatform] = useState<"telegram" | "bale" | null>(null);
  const [initData, setInitData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<MiniAppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("platform") as "telegram" | "bale" | null;
    const detectedPlatform = p || "telegram";
    setPlatform(detectedPlatform);

    // Load Telegram WebApp SDK (Bale Mini Apps also support Telegram WebApp protocol)
    if (!window.Telegram?.WebApp) {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-web-app.js";
      script.async = true;
      script.onload = () => initWebApp(detectedPlatform);
      script.onerror = () => setError("خطا در بارگذاری SDK");
      document.body.appendChild(script);
    } else {
      initWebApp(detectedPlatform);
    }
  }, []);

  const initWebApp = (platform: "telegram" | "bale") => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      setError("SDK در دسترس نیست");
      setLoading(false);
      return;
    }

    webApp.ready();
    webApp.expand();
    webApp.setHeaderColor(webApp.colorScheme === "dark" ? "#171717" : "#F0EDE4");

    const data = webApp.initData;
    if (!data) {
      setError("داده احراز هویت Mini App در دسترس نیست. این صفحه باید از داخل ربات باز شود.");
      setLoading(false);
      return;
    }

    setInitData(data);
    authenticate(platform, data);
  };

  const authenticate = async (platform: "telegram" | "bale", data: string) => {
    try {
      const res = await fetch(`/api/auth/${platform}-miniapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: data }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "احراز هویت ناموفق");
      }

      setUser(json.user);
      setToken(json.token);
      localStorage.setItem("kiya_miniapp_token", json.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ورود");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setOrders(json.orders || []);
    } catch (err) {
      console.error("Load orders error:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (view === "orders" && token) loadOrders();
  }, [view, token, loadOrders]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--brand)]" />
          <p className="mt-4 text-sm text-[var(--ink-dim)]">در حال ورود به Mini App...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <GlassCard className="max-w-md p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
          <h2 className="mt-4 text-lg font-bold text-[var(--ink)]">خطا</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-dim)]">{error}</p>
          <p className="mt-4 text-xs text-[var(--ink-dim)]">
            این صفحه باید از طریق دکمه Mini App در ربات {platform === "bale" ? "بله" : "تلگرام"} باز شود.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (!user) return null;

  const balance = Number(user.walletBalance || 0).toLocaleString("fa-IR");
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "کاربر";

  return (
    <div className="mx-auto max-w-md px-3 pt-6 pb-28">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--ink-dim)]">خوش آمدید</p>
          <h1 className="text-lg font-bold text-[var(--ink)]">{displayName}</h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)]/15 text-[var(--brand)]">
          <User size={18} />
        </div>
      </header>

      {view === "dashboard" && (
        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--ink-dim)]">موجودی کیف پول</p>
                <p className="mt-1 text-2xl font-extrabold text-[var(--ink)]">{balance} تومان</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)]/15 text-[var(--brand)]">
                <Wallet size={22} />
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setView("orders")} className="btn-glass flex flex-col items-center gap-2 rounded-2xl p-4 text-[var(--ink)]">
              <ShoppingBag size={22} className="text-[var(--brand)]" />
              <span className="text-sm font-medium">سفارشات من</span>
            </button>
            <button onClick={() => setView("profile")} className="btn-glass flex flex-col items-center gap-2 rounded-2xl p-4 text-[var(--ink)]">
              <Phone size={22} className="text-[var(--brand)]" />
              <span className="text-sm font-medium">اطلاعات من</span>
            </button>
          </div>

          <GlassCard className="p-4">
            <p className="text-xs font-bold text-[var(--ink)]">راهنمای Mini App</p>
            <ul className="mt-3 space-y-2 text-xs leading-6 text-[var(--ink-dim)]">
              <li className="flex items-start gap-2"><span className="text-[var(--brand)]">-</span> سفارش جدید از منوی اصلی سایت ثبت کنید.</li>
              <li className="flex items-start gap-2"><span className="text-[var(--brand)]">-</span> وضعیت و پیگیری سفارشات را همینجا ببینید.</li>
              <li className="flex items-start gap-2"><span className="text-[var(--brand)]">-</span> برای پشتیبانی از ربات پیام بدهید.</li>
            </ul>
          </GlassCard>
        </div>
      )}

      {view === "orders" && (
        <div className="space-y-4">
          <button onClick={() => setView("dashboard")} className="mb-2 flex items-center gap-2 text-sm text-[var(--ink-dim)]">
            <ArrowLeft size={16} /> بازگشت
          </button>
          <h2 className="text-lg font-bold text-[var(--ink)]">سفارشات من</h2>
          {ordersLoading ? (
            <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--brand)]" /></div>
          ) : orders.length === 0 ? (
            <GlassCard className="p-5 text-center text-sm text-[var(--ink-dim)]">سفارشی ثبت نشده است.</GlassCard>
          ) : (
            orders.map((o: any) => (
              <GlassCard key={o.id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--ink)]">{o.serviceName || "سفارش"}</span>
                  <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-medium text-emerald-300">{o.status}</span>
                </div>
                <p className="mt-2 text-xs text-[var(--ink-dim)]">{Number(o.totalAmount).toLocaleString("fa-IR")} تومان</p>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {view === "profile" && (
        <div className="space-y-4">
          <button onClick={() => setView("dashboard")} className="mb-2 flex items-center gap-2 text-sm text-[var(--ink-dim)]">
            <ArrowLeft size={16} /> بازگشت
          </button>
          <h2 className="text-lg font-bold text-[var(--ink)]">اطلاعات من</h2>
          <GlassCard className="space-y-3 p-4 text-sm">
            <div className="flex justify-between"><span className="text-[var(--ink-dim)]">نام</span><span className="text-[var(--ink)]">{displayName}</span></div>
            <div className="flex justify-between"><span className="text-[var(--ink-dim)]">موبایل</span><span className="text-[var(--ink)]">{user.phoneNumber || "-"}</span></div>
            <div className="flex justify-between"><span className="text-[var(--ink-dim)]">نقش</span><span className="text-[var(--ink)]">{user.role}</span></div>
          </GlassCard>
        </div>
      )}

      <nav className="fixed bottom-0 right-0 left-0 border-t border-white/10 bg-[var(--bg-0)]/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md justify-around">
          <button onClick={() => setView("dashboard")} className={`flex flex-col items-center gap-1 text-xs ${view === "dashboard" ? "text-[var(--brand)]" : "text-[var(--ink-dim)]"}`}>
            <Wallet size={18} /> کیف پول
          </button>
          <button onClick={() => setView("orders")} className={`flex flex-col items-center gap-1 text-xs ${view === "orders" ? "text-[var(--brand)]" : "text-[var(--ink-dim)]"}`}>
            <ShoppingBag size={18} /> سفارشات
          </button>
          <button onClick={() => setView("profile")} className={`flex flex-col items-center gap-1 text-xs ${view === "profile" ? "text-[var(--brand)]" : "text-[var(--ink-dim)]"}`}>
            <User size={18} /> پروفایل
          </button>
        </div>
      </nav>
    </div>
  );
}

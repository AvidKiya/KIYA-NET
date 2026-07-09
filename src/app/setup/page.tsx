"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, CheckCircle2, Database, Cloud, MessageCircle, CreditCard, Loader2, ArrowRight, AlertCircle, KeyRound } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sub, setSub] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [adminInfo, setAdminInfo] = useState<{ phone: string; password: string } | null>(null);
  const [values, setValues] = useState<string[]>(["", "", "", "", "", "", "", "", ""]);

  useEffect(() => {
    fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((d) => {
        if (d.isSetupComplete) setDone(true);
      })
      .catch(() => {});
  }, []);

  const steps = [
    { t: "اتصال دیتابیس", d: "رشته اتصال PostgreSQL", i: Database, p: "postgresql://..." },
    { t: "ذخیره‌سازی ابری", d: "Access Key Cloudflare R2", i: Cloud, p: "Access Key" },
    { t: "ذخیره‌سازی ابری (۲)", d: "Secret Key Cloudflare R2", i: Cloud, p: "Secret Key" },
    { t: "ذخیره‌سازی ابری (۳)", d: "Endpoint و Bucket R2", i: Cloud, p: "https://...r2.cloudflarestorage.com / bucket-name" },
    { t: "ربات تلگرام", d: "توکن ربات تلگرام", i: MessageCircle, p: "Bot Token" },
    { t: "ربات بله", d: "توکن ربات بله", i: MessageCircle, p: "Bot Token" },
    { t: "درگاه پرداخت", d: "مرچنت کد زرین‌پال/پی‌پینگ", i: CreditCard, p: "Merchant ID" },
    { t: "سامانه پیامکی", d: "کلید API کاوه‌نگار/ملی‌پیامک", i: KeyRound, p: "API Key" },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSub(true);
    setError("");
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          databaseUrl: values[0],
          r2AccessKey: values[1],
          r2SecretKey: values[2],
          r2Endpoint: values[3].split(" / ")[0] || values[3],
          r2Bucket: values[3].split(" / ")[1] || "",
          telegramBotToken: values[4],
          baleBotToken: values[5],
          zarrinpalMerchant: values[6],
          kavenegarApiKey: values[7],
        }),
      });
      const d = await res.json();
      if (d.success) {
        setDone(true);
        setAdminInfo({ phone: d.adminPhone, password: d.adminDefaultPassword });
      } else {
        setError(d.error || "خطا در ذخیره تنظیمات");
      }
    } catch {
      setError("خطا در اتصال به سرور");
    } finally {
      setSub(false);
    }
  };

  if (done) {
    return (
      <>
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-[var(--ink)]">کیا نت آماده است!</h1>
          <p className="mt-3 text-sm text-[var(--ink-dim)]">تنظیمات ذخیره شد.</p>
          {adminInfo && (
            <div className="mt-6 rounded-2xl bg-white/5 p-4 text-sm text-[var(--ink)]">
              <p className="font-bold mb-2">اطلاعات ورود مدیر کل:</p>
              <p className="text-[var(--ink-dim)]">شماره: <span dir="ltr" className="text-emerald-300">{adminInfo.phone}</span></p>
              <p className="text-[var(--ink-dim)]">رمز پیش‌فرض: <span dir="ltr" className="text-emerald-300">{adminInfo.password}</span></p>
              <p className="text-xs text-amber-400 mt-2">در اولین ورود باید رمز را تغییر دهید.</p>
            </div>
          )}
          <a href="/admin" className="btn-brand mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold">
            ورود به پنل مدیریت <ArrowRight size={16} />
          </a>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-lg px-4 py-12 pb-20">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-violet-500 shadow-2xl">
            <Zap size={30} className="text-[#052018]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--ink)]">راه‌اندازی کیا نت</h1>
          <p className="mt-2 text-sm text-[var(--ink-dim)]">ویزارد نصب و پیکربندی</p>
        </div>
        <GlassCard className="p-6 space-y-5">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? "bg-emerald-400" : "bg-white/10"}`} />
            ))}
          </div>
          <div className="space-y-4">
            {(() => {
              const s = steps[step];
              const I = s.i;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                      <I size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--ink)]">{s.t}</h3>
                      <p className="text-xs text-[var(--ink-dim)]">{s.d}</p>
                    </div>
                  </div>
                  <input
                    value={values[step]}
                    onChange={(e) => {
                      const next = [...values];
                      next[step] = e.target.value;
                      setValues(next);
                    }}
                    placeholder={s.p}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60"
                  />
                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-400/10 px-4 py-3 text-xs text-red-400">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {step > 0 && (
                      <button onClick={() => setStep(step - 1)} className="btn-glass flex-1 rounded-xl py-3 text-sm font-medium">
                        قبلی
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={sub}
                      className="btn-brand flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold disabled:opacity-60"
                    >
                      {sub ? <Loader2 size={16} className="animate-spin" /> : step < steps.length - 1 ? <>بعدی <ArrowRight size={16} /></> : <>تست و راه‌اندازی <CheckCircle2 size={16} /></>}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </GlassCard>
      </div>
      <SiteFooter />
    </>
  );
}

"use client";
import { useState } from "react";
import { Zap, CheckCircle2, Database, Cloud, MessageCircle, CreditCard, Loader2, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function SetupPage() {
  const [step, setStep] = useState(0);
  const [sub, setSub] = useState(false);
  const [done, setDone] = useState(false);
  const steps = [
    {t:"اتصال دیتابیس",d:"رشته اتصال PostgreSQL",i:Database,p:"postgresql://..."},
    {t:"ذخیره‌سازی ابری",d:"توکن Cloudflare R2",i:Cloud,p:"Access Key / Secret"},
    {t:"ربات تلگرام",d:"توکن ربات",i:MessageCircle,p:"Bot Token"},
    {t:"ربات بله",d:"توکن ربات بله",i:MessageCircle,p:"Bot Token"},
    {t:"درگاه پرداخت",d:"مرچنت کد شاپرک",i:CreditCard,p:"Merchant ID"},
  ];

  if(done) return <><SiteHeader/><div className="mx-auto max-w-md px-4 py-20 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><CheckCircle2 size={40}/></div><h1 className="mt-6 text-2xl font-extrabold text-[var(--ink)]">کیا نت آماده است!</h1><p className="mt-3 text-sm text-[var(--ink-dim)]">تنظیمات ذخیره شد.</p><a href="/" className="btn-brand mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold">ورود به کیا نت <ArrowRight size={16}/></a></div><SiteFooter/></>;

  return <><SiteHeader/><div className="mx-auto max-w-lg px-4 py-12 pb-20"><div className="mb-8 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-violet-500 shadow-2xl"><Zap size={30} className="text-[#052018]"/></div><h1 className="text-2xl font-extrabold text-[var(--ink)]">راه‌اندازی کیا نت</h1><p className="mt-2 text-sm text-[var(--ink-dim)]">ویزارد نصب و پیکربندی</p></div>
  <GlassCard className="p-6 space-y-5"><div className="flex gap-1">{steps.map((_,i)=><div key={i} className={`flex-1 h-1 rounded-full ${i<=step?"bg-emerald-400":"bg-white/10"}`}/>)}</div>
  {steps.map((s,i)=>{if(i!==step)return null;const I=s.i;return <div key={i} className="space-y-4"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300"><I size={20}/></div><div><h3 className="font-bold text-[var(--ink)]">{s.t}</h3><p className="text-xs text-[var(--ink-dim)]">{s.d}</p></div></div><input placeholder={s.p} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60"/><div className="flex gap-2">{step>0&&<button onClick={()=>setStep(step-1)} className="btn-glass flex-1 rounded-xl py-3 text-sm font-medium">قبلی</button>}<button onClick={()=>step<steps.length-1?setStep(step+1):(setSub(true),setTimeout(()=>{setDone(true);setSub(false)},1500))} disabled={sub} className="btn-brand flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold disabled:opacity-60">{sub?<Loader2 size={16} className="animate-spin"/>:step<steps.length-1?"بعدی":"تست و راه‌اندازی"}</button></div></div>})}</GlassCard></div><SiteFooter/></>;
}

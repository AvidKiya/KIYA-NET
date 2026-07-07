"use client";
import { useState, useEffect } from "react";
import { FolderLock, FileImage, Upload, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";

export default function VaultPage() {
  const [u, setU] = useState<any>(null);
  useEffect(()=>{fetch("/api/auth/me").then(r=>r.json()).then(d=>{if(d.user)setU(d.user)}).catch(()=>{});},[]);
  const docs = [{l:"کارت ملی (رو)",i:FileImage},{l:"کارت ملی (پشت)",i:FileImage},{l:"شناسنامه",i:FileImage},{l:"عکس پرسنلی",i:FileImage},{l:"کارت پایان خدمت",i:FileImage},{l:"مدرک تحصیلی",i:FileImage}];
  return <><SiteHeader/><div className="mx-auto max-w-3xl px-4 py-8 pb-28 space-y-4">
    <div className="rounded-2xl bg-emerald-400/10 border border-emerald-400/20 p-5 flex items-start gap-3"><ShieldCheck size={20} className="text-emerald-300 shrink-0 mt-0.5"/><div><h3 className="text-sm font-bold text-emerald-300">امنیت گاوصندوق</h3><p className="mt-1 text-xs text-emerald-400/70">مدارک شما رمزنگاری‌شده ذخیره می‌شوند</p></div></div>
    <h3 className="text-sm font-bold text-[var(--ink)] mt-6">مدارک ذخیره شده</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{docs.map((d,i)=>{const I=d.i;return <GlassCard key={i} className="text-center p-5 card-hover"><div className="flex flex-col items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20"><I size={22} className="text-[var(--ink-dim)]"/></div><span className="text-[11px] font-medium text-[var(--ink-dim)]">{d.l}</span><button className="btn-glass flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium text-[var(--ink)]"><Upload size={12}/>بارگذاری</button></div></GlassCard>})}</div>
    <div className="text-center py-8"><FolderLock size={36} className="mx-auto text-white/10"/><p className="mt-3 text-xs text-[var(--ink-dim)]">مدارک خود را یک‌بار آپلود کنید</p></div>
  </div><SiteFooter/><BottomNav/></>;
}

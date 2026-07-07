"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Wallet, LogOut, Copy, Users, Shield, CreditCard } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";

export default function ProfilePage() {
  const r = useRouter();
  const [u, setU] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{fetch("/api/auth/me").then(r=>r.json()).then(d=>{if(d.user)setU(d.user)}).catch(()=>{}).finally(()=>setLoading(false));},[]);
  const logout = async () => { await fetch("/api/auth/logout",{method:"POST"}); r.push("/"); r.refresh(); };
  const fmt = (p:string) => Number(p).toLocaleString("fa-IR");
  if(loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"/></div>;
  if(!u) return <><SiteHeader/><div className="max-w-md mx-auto px-4 py-20 text-center"><User size={48} className="mx-auto text-[var(--ink-dim)]"/><h2 className="mt-4 text-lg font-bold text-[var(--ink)]">لطفاً وارد شوید</h2><Link href="/login" className="btn-brand mt-4 inline-block rounded-xl px-6 py-3 text-sm font-bold">ورود</Link></div><SiteFooter/></>;

  return <><SiteHeader/><div className="mx-auto max-w-3xl px-4 py-8 pb-28 space-y-4">
    <GlassCard className="p-6"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 text-xl font-extrabold text-[#052018]">{(u.firstName||"ک")[0]}</div><div><h2 className="text-xl font-extrabold text-[var(--ink)]">{u.firstName||"کاربر"} {u.lastName||""}</h2><p className="text-sm text-[var(--ink-dim)]" dir="ltr">{u.phoneNumber}</p><span className="mt-1 inline-block rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[11px] text-emerald-300">{u.role==="SUPER_ADMIN"?"مدیر کل":u.role==="OPERATOR"?"اپراتور":"مشتری"}</span></div></div></GlassCard>
    <Link href="/wallet"><GlassCard className="flex items-center justify-between p-5 card-hover"><div className="flex items-center gap-3"><Wallet size={20} className="text-emerald-300"/><span className="text-sm font-medium text-[var(--ink)]">کیف پول</span></div><span className="font-extrabold text-emerald-300">{fmt(u.walletBalance)} تومان</span></GlassCard></Link>
    <Link href="/orders"><GlassCard className="flex items-center justify-between p-5 card-hover"><div className="flex items-center gap-3"><CreditCard size={20} className="text-[var(--ink-dim)]"/><span className="text-sm font-medium text-[var(--ink)]">سفارش‌های من</span></div></GlassCard></Link>
    <Link href="/vault"><GlassCard className="flex items-center justify-between p-5 card-hover"><div className="flex items-center gap-3"><Shield size={20} className="text-[var(--ink-dim)]"/><span className="text-sm font-medium text-[var(--ink)]">گاوصندوق مدارک</span></div></GlassCard></Link>
    {u.referralCode && <GlassCard className="p-5"><div className="flex items-center gap-3 mb-3"><Users size={18} className="text-emerald-300"/><span className="text-sm font-bold text-[var(--ink)]">کد معرف</span></div><div className="flex items-center gap-2"><code className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-center font-mono text-sm text-emerald-300">{u.referralCode}</code><button onClick={()=>navigator.clipboard.writeText(u.referralCode||"")} className="btn-glass rounded-xl p-2.5"><Copy size={15}/></button></div></GlassCard>}
    {(u.role==="OPERATOR"||u.role==="SUPER_ADMIN") && <Link href="/admin"><GlassCard className="flex items-center gap-3 p-5 card-hover"><Shield size={20} className="text-amber-400"/><span className="text-sm font-medium text-[var(--ink)]">پنل مدیریت</span></GlassCard></Link>}
    <button onClick={logout} className="btn-glass flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium text-red-300"><LogOut size={18}/>خروج از حساب</button>
  </div><SiteFooter/><BottomNav/></>;
}

"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Phone, Zap, Check, ShieldCheck, MessageCircle } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const TELEGRAM_BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "kiyaNetBot";
const BALE_BOT = process.env.NEXT_PUBLIC_BALE_BOT_USERNAME || "kiyaNetBot";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function LoginPage() {
  const r = useRouter();
  const [step, setStep] = useState<"choose"|"phone"|"otp"|"telegram"|"bale">("choose");
  const [ph, setPh] = useState(""); const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false); const [err, setErr] = useState("");
  const [devCode, setDevCode] = useState("");

  const reqOtp = async () => {
    setErr(""); if(!/^09\d{9}$/.test(ph)){setErr("شماره معتبر نیست");return;}
    setLoading(true);
    try{const res=await fetch("/api/auth/request-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phoneNumber:ph})});const d=await res.json();if(d.success){if(d.code)setDevCode(d.code);setStep("otp");}else setErr(d.error);}catch{setErr("خطا");}finally{setLoading(false);}
  };

  const verifyOtp = async () => {
    setErr(""); if(!otp||otp.length<4){setErr("کد را وارد کنید");return;}
    setLoading(true);
    try{const res=await fetch("/api/auth/verify-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phoneNumber:ph,code:otp})});const d=await res.json();if(d.success){r.push("/");r.refresh();}else setErr(d.error);}catch{setErr("خطا");}finally{setLoading(false);}
  };

  const [botToken, setBotToken] = useState("");

  const openTelegram = () => {
    const token = "kiyanet_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setBotToken(token);
    setStep("telegram");
    window.open(`https://t.me/${TELEGRAM_BOT}?start=${token}`, "_blank");
  };

  const openBale = () => {
    const token = "kiyanet_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setBotToken(token);
    setStep("bale");
    window.open(`https://bale.ai/${BALE_BOT}?start=${token}`, "_blank");
  };

  // Google OAuth redirect
  const googleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  // Poll for bot login completion
  useEffect(() => {
    if (step !== "telegram" && step !== "bale") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/bot-check?phone=" + encodeURIComponent(ph));
        const d = await res.json();
        if (d.success && d.code) {
          setDevCode(d.code);
          setStep("otp");
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [step, ph]);

  return <>
    <SiteHeader />
    <div className="mx-auto max-w-md px-4 py-16 pb-24">
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
        <div className="mb-8 text-center">
          <motion.div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-violet-500 shadow-2xl" whileHover={{scale:1.05}}><Zap size={30} className="text-[var(--brand-ink)]"/></motion.div>
          <h1 className="text-2xl font-extrabold text-[var(--ink)]">کیانت</h1>
          <p className="mt-1 text-sm text-[var(--ink-dim)]">ورود به کافی‌نت آنلاین</p>
        </div>

        <AnimatePresence mode="wait">
          {/* CHOOSE METHOD */}
          {step==="choose"&&(
            <motion.div key="choose" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-4">
              {/* Phone */}
              <GlassCard onClick={()=>setStep("phone")} className="p-5 card-hover flex items-center gap-4 cursor-pointer">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300"><Phone size={20}/></div>
                <div className="flex-1"><h3 className="text-sm font-bold text-[var(--ink)]">ورود با شماره موبایل</h3><p className="text-[11px] text-[var(--ink-dim)]">دریافت کد تایید از طریق پیامک یا ربات</p></div>
              </GlassCard>

              {/* Telegram */}
              <GlassCard onClick={openTelegram} className="p-5 card-hover flex items-center gap-4 cursor-pointer">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-400"><MessageCircle size={20}/></div>
                <div className="flex-1"><h3 className="text-sm font-bold text-[var(--ink)]">ورود با ربات تلگرام</h3><p className="text-[11px] text-[var(--ink-dim)]">استارت ربات @{TELEGRAM_BOT} — کد تایید در چت تلگرام</p></div>
              </GlassCard>

              {/* Bale */}
              <GlassCard onClick={openBale} className="p-5 card-hover flex items-center gap-4 cursor-pointer">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-400/15 text-orange-400"><MessageCircle size={20}/></div>
                <div className="flex-1"><h3 className="text-sm font-bold text-[var(--ink)]">ورود با ربات بله</h3><p className="text-[11px] text-[var(--ink-dim)]">استارت ربات @{BALE_BOT} — کد تایید در چت بله</p></div>
              </GlassCard>

              {/* Google */}
              <GlassCard onClick={googleLogin} className="p-5 card-hover flex items-center gap-4 cursor-pointer">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10"><GoogleIcon/></div>
                <div className="flex-1"><h3 className="text-sm font-bold text-[var(--ink)]">ورود با حساب گوگل</h3><p className="text-[11px] text-[var(--ink-dim)]">ورود سریع با Google OAuth 2.0</p></div>
              </GlassCard>
            </motion.div>
          )}

          {/* PHONE INPUT */}
          {step==="phone"&&(
            <motion.div key="phone" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <GlassCard className="p-6 space-y-5">
                <div className="text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300"><Phone size={22}/></div><h2 className="text-lg font-bold text-[var(--ink)]">ورود با شماره موبایل</h2><p className="mt-1 text-xs text-[var(--ink-dim)]">کد تایید برای شما ارسال خواهد شد</p></div>
                <input value={ph} onChange={e=>setPh(e.target.value)} type="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" maxLength={11} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)] focus:border-emerald-400/60"/>
                {err&&<p className="text-xs text-red-400">{err}</p>}
                <button onClick={reqOtp} disabled={loading} className="btn-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold disabled:opacity-60">{loading?"در حال ارسال...":"دریافت کد تایید"}</button>
                <button onClick={()=>setStep("choose")} className="btn-glass flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-[var(--ink-dim)]">بازگشت</button>
              </GlassCard>
            </motion.div>
          )}

          {/* TELEGRAM WAIT */}
          {step==="telegram"&&(
            <motion.div key="tg" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <GlassCard className="p-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-400"><MessageCircle size={26}/></div>
                <h2 className="text-lg font-bold text-[var(--ink)]">ربات تلگرام را استارت کنید</h2>
                <p className="text-xs text-[var(--ink-dim)] leading-relaxed">
                  ربات <span className="font-mono text-sky-400">@{TELEGRAM_BOT}</span> در تلگرام باز شده.
                  دکمه <b>«Start»</b> یا <b>«ارسال شماره موبایل»</b> را بزنید.
                </p>
                <p className="text-xs text-[var(--ink-dim)]">کد تایید ۶ رقمی در چت تلگرام برای شما ارسال می‌شود.</p>
                {devCode?(
                  <div className="rounded-xl bg-emerald-400/10 p-4">
                    <p className="text-xs text-emerald-300 mb-2">کد تایید دریافت شد:</p>
                    <p className="text-2xl font-mono font-bold text-emerald-300 tracking-[0.3em]">{devCode}</p>
                    <button onClick={()=>{setStep("otp");setPh(ph||"");}} className="btn-brand mt-3 rounded-xl px-6 py-2.5 text-sm font-bold">ادامه و ورود</button>
                  </div>
                ):(
                  <div className="flex items-center justify-center gap-2 text-xs text-[var(--ink-dim)]">
                    <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse"/> منتظر دریافت کد از ربات...
                  </div>
                )}
                <a href={`https://t.me/${TELEGRAM_BOT}`} target="_blank" rel="noreferrer" className="btn-glass flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-[var(--ink)]">
                  <MessageCircle size={16}/> باز کردن مجدد تلگرام
                </a>
                <button onClick={()=>setStep("choose")} className="text-xs text-[var(--ink-dim)] hover:text-[var(--ink)]">انتخاب روش دیگر</button>
              </GlassCard>
            </motion.div>
          )}

          {/* BALE WAIT */}
          {step==="bale"&&(
            <motion.div key="bale" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <GlassCard className="p-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-400/15 text-orange-400"><MessageCircle size={26}/></div>
                <h2 className="text-lg font-bold text-[var(--ink)]">ربات بله را استارت کنید</h2>
                <p className="text-xs text-[var(--ink-dim)] leading-relaxed">
                  ربات <span className="font-mono text-orange-400">@{BALE_BOT}</span> در پیام‌رسان بله باز شده.
                  دکمه <b>«Start»</b> را بزنید.
                </p>
                <p className="text-xs text-[var(--ink-dim)]">کد تایید ۶ رقمی در چت بله برای شما ارسال می‌شود.</p>
                {devCode?(
                  <div className="rounded-xl bg-emerald-400/10 p-4">
                    <p className="text-xs text-emerald-300 mb-2">کد تایید دریافت شد:</p>
                    <p className="text-2xl font-mono font-bold text-emerald-300 tracking-[0.3em]">{devCode}</p>
                    <button onClick={()=>{setStep("otp");setPh(ph||"");}} className="btn-brand mt-3 rounded-xl px-6 py-2.5 text-sm font-bold">ادامه و ورود</button>
                  </div>
                ):(
                  <div className="flex items-center justify-center gap-2 text-xs text-[var(--ink-dim)]">
                    <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse"/> منتظر دریافت کد از ربات...
                  </div>
                )}
                <a href={`https://bale.ai/${BALE_BOT}`} target="_blank" rel="noreferrer" className="btn-glass flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-[var(--ink)]">
                  <MessageCircle size={16}/> باز کردن مجدد بله
                </a>
                <button onClick={()=>setStep("choose")} className="text-xs text-[var(--ink-dim)] hover:text-[var(--ink)]">انتخاب روش دیگر</button>
              </GlassCard>
            </motion.div>
          )}

          {/* OTP VERIFY */}
          {step==="otp"&&(
            <motion.div key="otp" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <GlassCard className="p-6 space-y-5">
                <div className="text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300"><ShieldCheck size={22}/></div><h2 className="text-lg font-bold text-[var(--ink)]">کد تایید</h2><p className="mt-1 text-xs text-[var(--ink-dim)]">کد ۶ رقمی ارسال شده را وارد کنید</p>{devCode&&<p className="mt-2 rounded-xl bg-amber-400/10 px-3 py-1.5 text-xs text-amber-400 inline-block">کد: <span className="font-mono font-bold">{devCode}</span></p>}</div>
                <input value={otp} onChange={e=>setOtp(e.target.value)} type="number" placeholder="------" dir="ltr" maxLength={6} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono text-[var(--ink)] outline-none focus:border-emerald-400/60"/>
                {err&&<p className="text-xs text-red-400">{err}</p>}
                <button onClick={verifyOtp} disabled={loading||otp.length<4} className="btn-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold disabled:opacity-60"><Check size={18}/>{loading?"در حال بررسی...":"تایید و ورود"}</button>
                <div className="flex items-center justify-between text-xs">
                  <button onClick={()=>{setStep("phone");setErr("");setOtp("");}} className="text-emerald-300">اصلاح شماره</button>
                  <button onClick={reqOtp} disabled={loading} className="text-[var(--ink-dim)] hover:text-[var(--ink)]">ارسال مجدد</button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-[11px] text-[var(--ink-dim)]">با ورود، شرایط استفاده از خدمات را می‌پذیرید</p>
      </motion.div>
    </div>
    <SiteFooter />
  </>;
}

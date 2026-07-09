"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";

const QUESTIONS = [
  { q: "پایتخت ایران کدام شهر است؟", options: ["مشهد", "تهران", "اصفهان", "شیراز"], correct: 1 },
  { q: "کدام سیاره به «سیاره سرخ» معروف است؟", options: ["زهره", "مشتری", "مریخ", "زمین"], correct: 2 },
  { q: "بزرگ‌ترین اقیانوس جهان کدام است؟", options: ["اقیانوس هند", "اقیانوس آرام", "اقیانوس اطلس", "اقیانوس منجمد شمالی"], correct: 1 },
  { q: "تعداد استان‌های ایران چندتا است؟", options: ["۳۰", "۳۱", "۲۸", "۳۲"], correct: 1 },
  { q: "نخستین کسی که به فضا رفت چه کسی بود؟", options: ["نیل آرمسترانگ", "بوز آلدرین", "یوری گاگارین", "آلن شپرد"], correct: 2 },
  { q: "عنصر شیمیایی طلا چیست؟", options: ["Ag", "Au", "Fe", "Cu"], correct: 1 },
  { q: "رنگ مکمل آبی چیست؟", options: ["قرمز", "سبز", "نارنجی", "زرد"], correct: 2 },
  { q: "کدام حیوان سریع‌ترین دویدن را دارد؟", options: ["شیر", "یوزپلنگ", "اسب", "غزال"], correct: 1 },
  { q: "تعداد سیارات منظومه شمسی چندتا است؟", options: ["۷", "۸", "۹", "۱۰"], correct: 1 },
  { q: "کدام کشور به «کشور هزار دریاچه» معروف است؟", options: ["سوئد", "نروژ", "فنلاند", "دانمارک"], correct: 2 },
];

export default function QuizGame() {
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function answer(index: number) {
    if (index === QUESTIONS[current].correct) setCorrect((c) => c + 1);
    if (current + 1 >= QUESTIONS.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
    }
  }

  const score = correct * 100;
  async function submitScore() {
    const points = correct * 50;
    try {
      await fetch("/api/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: "quiz", score, points }),
      });
      setSubmitted(true);
    } catch {}
  }

  function restart() {
    setCurrent(0);
    setCorrect(0);
    setFinished(false);
    setSubmitted(false);
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-8 pb-28">
        <Link href="/games" className="mb-4 flex items-center gap-2 text-sm text-[var(--ink-dim)]">
          <ArrowLeft size={16} /> بازگشت به بازی‌ها
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/15 text-blue-400">
            <HelpCircle size={20} />
          </div>
          <h1 className="text-xl font-extrabold text-[var(--ink)]">آزمون عمومی</h1>
        </div>

        {!finished ? (
          <GlassCard className="p-6">
            <p className="mb-4 text-xs text-[var(--ink-dim)]">سوال {current + 1} از {QUESTIONS.length}</p>
            <h2 className="mb-5 text-base font-bold text-[var(--ink)]">{QUESTIONS[current].q}</h2>
            <div className="space-y-2">
              {QUESTIONS[current].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  className="btn-glass w-full rounded-xl px-4 py-3 text-right text-sm font-medium text-[var(--ink)]"
                >
                  {opt}
                </button>
              ))}
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 text-center">
            <p className="text-lg font-bold text-[var(--ink)]">آزمون تمام شد!</p>
            <p className="mt-2 text-sm text-[var(--ink-dim)]">پاسخ صحیح: {correct} از {QUESTIONS.length} — امتیاز: {score}</p>
            {!submitted ? (
              <button onClick={submitScore} className="btn-brand mt-4 rounded-xl px-5 py-2.5 text-sm font-bold">ثبت امتیاز</button>
            ) : (
              <p className="mt-4 text-sm text-emerald-300">امتیاز ثبت شد!</p>
            )}
          </GlassCard>
        )}

        <button onClick={restart} className="btn-glass mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[var(--ink)]">
          <RotateCcw size={16} /> شروع دوباره
        </button>
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}

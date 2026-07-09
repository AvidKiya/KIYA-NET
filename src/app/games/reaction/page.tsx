"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Zap, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";

export default function ReactionGame() {
  const [state, setState] = useState<"idle" | "waiting" | "ready" | "clicked" | "tooSoon">("idle");
  const [reactionTime, setReactionTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function start() {
    setState("waiting");
    setSubmitted(false);
    const delay = 1500 + Math.random() * 2500;
    const id = setTimeout(() => {
      setState("ready");
      setStartTime(Date.now());
    }, delay);
    setTimeoutId(id);
  }

  function click() {
    if (state === "waiting") {
      if (timeoutId) clearTimeout(timeoutId);
      setState("tooSoon");
    } else if (state === "ready") {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setState("clicked");
    }
  }

  const score = state === "clicked" ? Math.max(0, Math.round(500 - reactionTime / 5)) : 0;

  async function submitScore() {
    const points = Math.floor(score / 5);
    try {
      await fetch("/api/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: "reaction", score, points }),
      });
      setSubmitted(true);
    } catch {}
  }

  const boxColor = state === "ready" ? "bg-emerald-400" : state === "tooSoon" ? "bg-red-400" : "bg-amber-400";
  const text = state === "idle" ? "شروع" : state === "waiting" ? "منتظر سبز شدن..." : state === "ready" ? "بزن!" : state === "tooSoon" ? "زود زدی!" : `زمان واکنش: ${reactionTime}ms`;

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-8 pb-28">
        <Link href="/games" className="mb-4 flex items-center gap-2 text-sm text-[var(--ink-dim)]">
          <ArrowLeft size={16} /> بازگشت به بازی‌ها
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
            <Zap size={20} />
          </div>
          <h1 className="text-xl font-extrabold text-[var(--ink)]">تست واکنش</h1>
        </div>

        <GlassCard className="p-6 text-center">
          <button
            onClick={state === "idle" || state === "clicked" || state === "tooSoon" ? start : click}
            className={`mx-auto flex h-48 w-full max-w-md items-center justify-center rounded-2xl transition-colors ${boxColor} text-[#052018] font-bold text-xl`}
          >
            {text}
          </button>

          {state === "clicked" && (
            <div className="mt-5">
              <p className="text-sm text-[var(--ink-dim)]">امتیاز: {score}</p>
              {!submitted ? (
                <button onClick={submitScore} className="btn-brand mt-3 rounded-xl px-5 py-2.5 text-sm font-bold">ثبت امتیاز</button>
              ) : (
                <p className="mt-3 text-sm text-emerald-300">امتیاز ثبت شد!</p>
              )}
            </div>
          )}
        </GlassCard>

        <button onClick={start} className="btn-glass mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[var(--ink)]">
          <RotateCcw size={16} /> شروع دوباره
        </button>
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}

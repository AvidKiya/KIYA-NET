"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";

const COLORS = ["#21F1A8", "#8b7bff", "#f5b942", "#ef4444", "#3b82f6", "#ec4899", "#06b6d4", "#a78bfa"];

export default function MemoryGame() {
  const [cards, setCards] = useState<{ id: number; color: string; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    startGame();
  }, []);

  function startGame() {
    const pairs = [...COLORS, ...COLORS].map((color, i) => ({ id: i, color, flipped: false, matched: false }));
    pairs.sort(() => Math.random() - 0.5);
    setCards(pairs);
    setFlipped([]);
    setMoves(0);
    setScore(0);
    setGameOver(false);
    setSubmitted(false);
  }

  function flipCard(index: number) {
    if (flipped.length === 2 || cards[index].flipped || cards[index].matched || gameOver) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, flipped: true } : c)));

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped;
      if (cards[a].color === cards[b].color) {
        setTimeout(() => {
          setCards((prev) => prev.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
          setFlipped([]);
          setScore((s) => s + 100);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
          setFlipped([]);
        }, 800);
      }
    }
  }

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      const finalScore = Math.max(0, 1000 - moves * 20 + score);
      setScore(finalScore);
      setGameOver(true);
    }
  }, [cards]);

  async function submitScore() {
    const points = Math.floor(score / 10);
    try {
      await fetch("/api/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: "memory", score, points }),
      });
      setSubmitted(true);
    } catch {}
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-8 pb-28">
        <Link href="/games" className="mb-4 flex items-center gap-2 text-sm text-[var(--ink-dim)]">
          <ArrowLeft size={16} /> بازگشت به بازی‌ها
        </Link>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
              <Brain size={20} />
            </div>
            <h1 className="text-xl font-extrabold text-[var(--ink)]">حافظه رنگ‌ها</h1>
          </div>
          <div className="text-xs text-[var(--ink-dim)]">حرکت: {moves} | امتیاز: {score}</div>
        </div>

        <GlassCard className="p-4">
          <div className="grid grid-cols-4 gap-2">
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => flipCard(i)}
                disabled={card.flipped || card.matched}
                className={`aspect-square rounded-xl transition-all duration-300 ${card.flipped || card.matched ? "scale-100" : "scale-95 hover:scale-100"}`}
                style={{ backgroundColor: card.flipped || card.matched ? card.color : "rgba(255,255,255,0.08)" }}
              />
            ))}
          </div>
        </GlassCard>

        {gameOver && (
          <GlassCard className="mt-4 p-5 text-center">
            <p className="text-lg font-bold text-[var(--ink)]">تبریک! بازی تمام شد.</p>
            <p className="mt-2 text-sm text-[var(--ink-dim)]">امتیاز: {score} — امتیاز قابل تبدیل: {Math.floor(score / 10)}</p>
            {!submitted ? (
              <button onClick={submitScore} className="btn-brand mt-3 rounded-xl px-5 py-2.5 text-sm font-bold">ثبت امتیاز</button>
            ) : (
              <p className="mt-3 text-sm text-emerald-300">امتیاز ثبت شد!</p>
            )}
          </GlassCard>
        )}

        <button onClick={startGame} className="btn-glass mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[var(--ink)]">
          <RotateCcw size={16} /> شروع دوباره
        </button>
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}

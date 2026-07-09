"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Puzzle, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";

const SIZE = 4;

function isSolved(tiles: number[]) {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return true;
}

function canMove(index: number, empty: number) {
  const x = index % SIZE;
  const y = Math.floor(index / SIZE);
  const ex = empty % SIZE;
  const ey = Math.floor(empty / SIZE);
  return Math.abs(x - ex) + Math.abs(y - ey) === 1;
}

export default function PuzzleGame() {
  const [tiles, setTiles] = useState<number[]>([]);
  const [empty, setEmpty] = useState(15);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    shuffle();
  }, []);

  function shuffle() {
    const arr = Array.from({ length: SIZE * SIZE - 1 }, (_, i) => i + 1);
    arr.push(0);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setTiles(arr);
    setEmpty(arr.indexOf(0));
    setMoves(0);
    setSolved(false);
    setSubmitted(false);
  }

  function move(index: number) {
    if (solved || !canMove(index, empty)) return;
    const newTiles = [...tiles];
    [newTiles[index], newTiles[empty]] = [newTiles[empty], newTiles[index]];
    setTiles(newTiles);
    setEmpty(index);
    setMoves((m) => m + 1);
    if (isSolved(newTiles)) {
      setSolved(true);
    }
  }

  const score = solved ? Math.max(0, 1000 - moves * 5) : 0;

  async function submitScore() {
    const points = Math.floor(score / 10);
    try {
      await fetch("/api/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: "puzzle", score, points }),
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
              <Puzzle size={20} />
            </div>
            <h1 className="text-xl font-extrabold text-[var(--ink)]">پازل عددی</h1>
          </div>
          <div className="text-xs text-[var(--ink-dim)]">حرکت: {moves}</div>
        </div>

        <GlassCard className="p-4">
          <div className="grid grid-cols-4 gap-2">
            {tiles.map((tile, i) => (
              <button
                key={i}
                onClick={() => move(i)}
                disabled={tile === 0}
                className={`aspect-square flex items-center justify-center rounded-xl text-lg font-bold transition-all ${
                  tile === 0 ? "opacity-0" : "bg-white/10 text-[var(--ink)] hover:bg-emerald-400/20"
                }`}
              >
                {tile}
              </button>
            ))}
          </div>
        </GlassCard>

        {solved && (
          <GlassCard className="mt-4 p-5 text-center">
            <p className="text-lg font-bold text-[var(--ink)]">آفرین! پازل حل شد.</p>
            <p className="mt-2 text-sm text-[var(--ink-dim)]">امتیاز: {score}</p>
            {!submitted ? (
              <button onClick={submitScore} className="btn-brand mt-3 rounded-xl px-5 py-2.5 text-sm font-bold">ثبت امتیاز</button>
            ) : (
              <p className="mt-3 text-sm text-emerald-300">امتیاز ثبت شد!</p>
            )}
          </GlassCard>
        )}

        <button onClick={shuffle} className="btn-glass mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[var(--ink)]">
          <RotateCcw size={16} /> شروع دوباره
        </button>
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}

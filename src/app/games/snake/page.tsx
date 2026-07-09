"use client";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const GRID = 20;
    const SIZE = 20;
    let snake = [{ x: 10, y: 10 }];
    let dir = { x: 1, y: 0 };
    let food = { x: 15, y: 15 };
    let interval: any;

    function draw() {
      if (!ctx) return;
      ctx.fillStyle = "#0a0f1e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Snake
      ctx.fillStyle = "#10b981";
      snake.forEach(s => ctx.fillRect(s.x * GRID, s.y * GRID, SIZE - 2, SIZE - 2));

      // Food
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(food.x * GRID, food.y * GRID, SIZE - 2, SIZE - 2);
    }

    function update() {
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
        endGame();
        return;
      }
      if (snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame();
        return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
      } else {
        snake.pop();
      }
    }

    function endGame() {
      clearInterval(interval);
      setGameOver(true);
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowUp" && dir.y !== 1) dir = { x: 0, y: -1 };
      if (e.key === "ArrowDown" && dir.y !== -1) dir = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" && dir.x !== 1) dir = { x: -1, y: 0 };
      if (e.key === "ArrowRight" && dir.x !== -1) dir = { x: 1, y: 0 };
    }

    document.addEventListener("keydown", handleKey);
    interval = setInterval(() => {
      update();
      draw();
    }, 140);

    draw();

    return () => {
      clearInterval(interval);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <h1 className="text-3xl font-black mb-2">Snake</h1>
        <p className="text-xs text-[var(--ink-dim)] mb-6">با کلیدهای جهت‌دار حرکت کنید</p>

        <canvas ref={canvasRef} width={400} height={400} className="rounded-3xl border border-white/10 mx-auto" />

        <div className="mt-5 text-5xl font-black text-emerald-400">{score}</div>

        {gameOver && (
          <button onClick={() => window.location.reload()} className="mt-6 btn-brand px-8 py-3 rounded-2xl">
            شروع دوباره
          </button>
        )}
      </div>
      <SiteFooter />
    </>
  );
}

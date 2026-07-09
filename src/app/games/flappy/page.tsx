"use client";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let birdY = 200;
    let velocity = 0;
    let pipes: any[] = [];
    let frame = 0;
    let currentScore = 0;
    let animationFrame: number;

    const GRAVITY = 0.5;
    const JUMP = -9;
    const PIPE_WIDTH = 60;
    const PIPE_GAP = 160;
    const PIPE_SPEED = 2.2;

    function resetGame() {
      birdY = 200;
      velocity = 0;
      pipes = [];
      currentScore = 0;
      setScore(0);
      setGameOver(false);
      setStarted(false);
    }

    function draw() {
      if (!ctx || !canvas) return;

      // Background - theme aware
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-0') || '#0a0f1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bird
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(80, birdY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(85, birdY - 5, 6, 0, Math.PI * 2);
      ctx.fill();

      // Pipes
      ctx.fillStyle = "#059669";
      pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
        ctx.fillRect(pipe.x, pipe.top + PIPE_GAP, PIPE_WIDTH, canvas.height);
      });

      // Score
      ctx.fillStyle = "#fff";
      ctx.font = "bold 28px Vazirmatn, sans-serif";
      ctx.fillText(currentScore.toString(), canvas.width / 2 - 15, 50);
    }

    function update() {
      if (!started || gameOver) return;

      velocity += GRAVITY;
      birdY += velocity;

      // Pipes
      if (frame % 90 === 0) {
        const top = Math.random() * 180 + 80;
        pipes.push({ x: canvas!.width, top });
      }

      pipes.forEach(pipe => pipe.x -= PIPE_SPEED);

      // Collision
      for (let pipe of pipes) {
        if (
          80 + 18 > pipe.x &&
          80 - 18 < pipe.x + PIPE_WIDTH &&
          (birdY - 18 < pipe.top || birdY + 18 > pipe.top + PIPE_GAP)
        ) {
          setGameOver(true);
          return;
        }
        if (pipe.x + PIPE_WIDTH < 80 && !pipe.passed) {
          pipe.passed = true;
          currentScore++;
          setScore(currentScore);
        }
      }

      // Ground / Ceiling
      if (birdY > canvas!.height - 20 || birdY < 20) {
        setGameOver(true);
      }

      frame++;
    }

    function loop() {
      update();
      draw();
      animationFrame = requestAnimationFrame(loop);
    }

    function handleJump() {
      if (!started) {
        setStarted(true);
      }
      if (!gameOver) {
        velocity = JUMP;
      } else {
        resetGame();
      }
    }

    canvas.addEventListener("click", handleJump);
    document.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        e.preventDefault();
        handleJump();
      }
    });

    loop();

    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("click", handleJump);
    };
  }, [started, gameOver]);

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black">Flappy Bird</h1>
          <p className="text-[var(--ink-dim)] mt-1">با کلیک یا Space بپر</p>
        </div>

        <div className="glass rounded-3xl p-6 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={380}
            height={520}
            className="rounded-2xl border border-white/10 bg-[#0a0f1e]"
          />

          <div className="mt-6 text-center">
            <div className="text-4xl font-black text-emerald-400">{score}</div>
            <div className="text-xs text-[var(--ink-dim)]">امتیاز</div>
          </div>

          {gameOver && (
            <button
              onClick={() => window.location.reload()}
              className="mt-6 btn-brand px-8 py-3 rounded-2xl"
            >
              شروع مجدد
            </button>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

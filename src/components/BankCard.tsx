"use client";

import { useState, useRef } from "react";
import { Copy, Check, Download, CreditCard } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

interface BankCardProps {
  cardNumber: string;
  cardHolder: string;
  bankName: string;
  sheba?: string;
  onCopy?: () => void;
  onInvoice?: () => void;
  className?: string;
}

export function BankCard({
  cardNumber,
  cardHolder,
  bankName,
  sheba,
  onCopy,
  onInvoice,
  className = "",
}: BankCardProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const formatCardNumber = (num: string) => {
    const digits = num.replace(/\D/g, "");
    return digits.match(/.{1,4}/g)?.join(" ") || digits;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ""));
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 12, y: -x * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative aspect-[1.586/1] rounded-2xl p-6 text-white shadow-2xl cursor-pointer select-none overflow-hidden"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.1s ease-out",
          background: "linear-gradient(135deg, rgba(0,71,65,0.95) 0%, rgba(33,241,168,0.75) 100%)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        {/* Holographic sheen */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(circle at ${50 + tilt.y * 3}% ${50 + tilt.x * 3}%, rgba(255,255,255,0.35) 0%, transparent 60%)`,
          }}
        />
        {/* Glass overlay */}
        <div className="pointer-events-none absolute inset-0 backdrop-blur-sm bg-black/10" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-start justify-between">
            {/* Chip */}
            <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 flex items-center justify-center shadow-inner">
              <div className="grid grid-cols-2 gap-px w-8 h-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="border border-amber-700/40 rounded-[1px]" />
                ))}
              </div>
            </div>
            {/* Bank / Network */}
            <div className="text-right">
              <div className="text-xs font-medium opacity-90">{bankName}</div>
              <CreditCard size={28} className="mt-1 opacity-80" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest opacity-70">شماره کارت</div>
            <div className="flex items-center gap-3">
              <div dir="ltr" className="font-mono text-xl sm:text-2xl tracking-[0.15em] font-bold">
                {formatCardNumber(cardNumber)}
              </div>
              <button
                onClick={handleCopy}
                className="rounded-lg p-2 bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="کپی شماره کارت"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest opacity-70">نام صاحب کارت</div>
              <div className="text-sm sm:text-base font-bold mt-0.5">{cardHolder}</div>
            </div>
            {sheba && (
              <div className="text-left" dir="ltr">
                <div className="text-[10px] uppercase tracking-widest opacity-70">شبا</div>
                <div className="text-xs font-mono mt-0.5 opacity-90">{sheba}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {onInvoice && (
        <button
          onClick={onInvoice}
          className="mt-4 w-full btn-glass flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
        >
          <Download size={16} />
          دانلود فاکتور
        </button>
      )}
    </div>
  );
}

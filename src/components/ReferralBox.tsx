"use client";

import { useEffect, useState } from "react";

export function ReferralBox() {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral")
      .then(r => r.json())
      .then(d => setCode(d.referralCode || ""));
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) return null;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-sm font-medium mb-2">دعوت از دوستان</div>
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-xl bg-white/10 px-4 py-2 text-sm font-mono">{code}</code>
        <button onClick={copy} className="btn-glass px-4 py-2 text-xs">
          {copied ? "کپی شد!" : "کپی"}
        </button>
      </div>
      <p className="mt-2 text-xs text-[var(--ink-dim)]">با هر دعوت موفق ۱۰۰ امتیاز هدیه بگیرید</p>
    </div>
  );
}
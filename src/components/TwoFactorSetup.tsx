"use client";

import { useState } from "react";

export function TwoFactorSetup() {
  const [enabled, setEnabled] = useState(false);
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");

  const enable = async () => {
    const res = await fetch("/api/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enable" }),
    });
    const data = await res.json();
    setSecret(data.secret);
    setBackupCodes(data.backupCodes || []);
    setEnabled(true);
  };

  const verify = async () => {
    const res = await fetch("/api/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", code }),
    });
    const data = await res.json();
    if (data.valid) alert("احراز هویت دو مرحله‌ای فعال شد!");
  };

  return (
    <div className="glass rounded-2xl p-5">
      <h4 className="font-bold mb-3">احراز هویت دو مرحله‌ای (2FA)</h4>

      {!enabled ? (
        <button onClick={enable} className="btn-brand px-5 py-2 text-sm rounded-xl">
          فعال‌سازی 2FA
        </button>
      ) : (
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-[var(--ink-dim)]">کد مخفی:</p>
            <code className="block mt-1 p-2 bg-white/5 rounded">{secret}</code>
          </div>

          <div>
            <p className="text-[var(--ink-dim)]">کدهای پشتیبان:</p>
            <div className="mt-1 space-y-1">
              {backupCodes.map((c, i) => (
                <code key={i} className="block text-xs bg-white/5 p-1.5 rounded">{c}</code>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="کد تأیید"
              className="flex-1 rounded-xl bg-white/5 px-4 py-2 text-sm"
            />
            <button onClick={verify} className="btn-brand px-5 rounded-xl text-sm">
              تأیید
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
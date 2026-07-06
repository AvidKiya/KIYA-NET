"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("نام را کامل وارد کنید.");
      return;
    }
    if (!/^0?9\d{9}$/.test(phone.trim())) {
      setError("شماره موبایل معتبر نیست.");
      return;
    }
    if (message.trim().length < 5) {
      setError("پیام خیلی کوتاه است.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), message: message.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "ارسال پیام با خطا مواجه شد.");
        return;
      }
      setSuccess(true);
      setName("");
      setPhone("");
      setMessage("");
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
          <CheckCircle2 size={26} />
        </div>
        <p className="mt-4 text-sm font-medium text-[var(--ink)]">پیام شما با موفقیت ارسال شد.</p>
        <p className="mt-1 text-xs text-[var(--ink-dim)]">تیم کیانت به‌زودی باهاتون تماس می‌گیره.</p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="btn-glass mt-6 rounded-xl px-5 py-2.5 text-xs font-medium text-[var(--ink)]"
        >
          ارسال پیام دیگر
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">نام و نام‌خانوادگی</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)] focus:border-emerald-400/60"
          placeholder="نام شما"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">شماره موبایل</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="numeric"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)] focus:border-emerald-400/60"
          placeholder="09xxxxxxxxx"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">پیام شما</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)] focus:border-emerald-400/60"
          placeholder="سوال یا درخواستتو بنویس..."
        />
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl bg-red-400/10 px-4 py-3 text-xs text-red-300">
          <AlertCircle size={15} />
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="btn-brand mt-2 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold disabled:opacity-60"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        ارسال پیام
      </button>
    </form>
  );
}

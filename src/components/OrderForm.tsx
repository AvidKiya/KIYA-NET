"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Loader2,
  Paperclip,
  Sparkles,
  X,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { ServiceIcon } from "@/components/ServiceIcon";
import { formatToman } from "@/lib/format";
import { serviceCategories, prdCategories } from "@/lib/services";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type SuccessState = {
  trackingCode: string;
  estimatedPrice: number;
};

export function OrderForm() {
  const searchParams = useSearchParams();
  const allCatsInit = [...serviceCategories, ...prdCategories];
  const initialCategory = searchParams.get("category") ?? allCatsInit[0]?.slug ?? "";
  const initialServiceParam = searchParams.get("service");
  const initialService = initialServiceParam
    ? (allCatsInit.find((c) => c.slug === initialCategory)?.items.find((i) => i.slug === initialServiceParam || String(i.price) === initialServiceParam || String((i as any).id) === initialServiceParam)?.slug ?? initialServiceParam)
    : allCatsInit.find((c) => c.slug === initialCategory)?.items[0]?.slug ?? "";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [serviceSlug, setServiceSlug] = useState(initialService);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [urgent, setUrgent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [copied, setCopied] = useState(false);

  const allCategories = useMemo(() => [...serviceCategories, ...prdCategories], []);
  const category = useMemo(
    () => allCategories.find((c) => c.slug === categorySlug) ?? allCategories[0] ?? serviceCategories[0],
    [categorySlug, allCategories],
  );
  const service = useMemo(
    () => category.items.find((i) => i.slug === serviceSlug) ?? category.items[0],
    [category, serviceSlug],
  );

  const estimatedPrice = Math.round(service.price * quantity * (urgent ? 1.3 : 1));

  function handleCategoryChange(slug: string) {
    setCategorySlug(slug);
    const nextCategory = serviceCategories.find((c) => c.slug === slug);
    setServiceSlug(nextCategory?.items[0]?.slug ?? "");
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_FILE_BYTES) {
      setError("حجم فایل نباید بیشتر از ۵ مگابایت باشد.");
      e.target.value = "";
      return;
    }
    setError(null);
    setFile(selected);
  }

  function goToStep2() {
    setError(null);
    setStep(2);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 3) {
      setError("نام و نام‌خانوادگی را کامل وارد کنید.");
      return;
    }
    if (!/^0?9\d{9}$/.test(phone.trim())) {
      setError("شماره موبایل معتبر نیست (مثال: ۰۹۱۲xxxxxxx).");
      return;
    }
    if (description.trim().length < 10) {
      setError("توضیحات سفارش را کامل‌تر بنویسید (حداقل ۱۰ حرف).");
      return;
    }

    setSubmitting(true);
    try {
      let attachment: { name: string; mime: string; data: string } | null = null;
      if (file) {
        const dataUrl = await readFileAsDataUrl(file);
        const base64 = dataUrl.split(",")[1] ?? "";
        attachment = { name: file.name, mime: file.type || "application/octet-stream", data: base64 };
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categorySlug: category.slug,
          serviceSlug: service.slug,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          description: description.trim(),
          quantity,
          urgent,
          attachment,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "ثبت سفارش با خطا مواجه شد.");
        setSubmitting(false);
        return;
      }

      setSuccess({ trackingCode: json.order.trackingCode, estimatedPrice: json.order.estimatedPrice });
      setStep(3);
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  function copyCode() {
    if (!success) return;
    navigator.clipboard.writeText(success.trackingCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  if (success) {
    return (
      <GlassCard className="mx-auto max-w-2xl p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="mt-6 text-2xl font-extrabold text-[var(--ink)]">سفارش شما ثبت شد!</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-dim)]">
          کد رهگیری‌تون رو یادداشت کنید. با این کد می‌تونید وضعیت سفارش و فایل نهایی رو پیگیری کنید.
        </p>

        <div className="glass mx-auto mt-6 flex max-w-xs items-center justify-between rounded-2xl px-5 py-4">
          <span className="font-mono text-lg font-bold tracking-wider text-emerald-300">
            {success.trackingCode}
          </span>
          <button type="button" onClick={copyCode} className="btn-glass flex h-9 w-9 items-center justify-center rounded-full">
            {copied ? <CheckCircle2 size={15} className="text-emerald-300" /> : <Copy size={15} />}
          </button>
        </div>

        <p className="mt-4 text-sm font-medium text-[var(--ink)]">
          مبلغ قابل پرداخت: <span className="text-emerald-300">{formatToman(success.estimatedPrice)}</span>
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`/api/orders/${success.trackingCode}/document?type=receipt`}
            target="_blank"
            rel="noreferrer"
            className="btn-brand flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
          >
            <FileText size={16} />
            دانلود رسید PDF
          </a>
          <Link
            href={`/track?code=${success.trackingCode}`}
            className="btn-glass flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-[var(--ink)]"
          >
            پیگیری سفارش
            <ArrowLeft size={15} />
          </Link>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step >= s ? "bg-emerald-400 text-[#052018]" : "bg-white/10 text-[var(--ink-dim)]"
              }`}
            >
              {s}
            </div>
            {s < 2 ? <div className={`h-0.5 w-10 sm:w-16 ${step > s ? "bg-emerald-400" : "bg-white/10"}`} /> : null}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <GlassCard className="p-6 sm:p-8">
          <div className="flex items-center gap-2 text-emerald-300">
            <Sparkles size={16} />
            <p className="text-xs font-medium">مرحله ۱ از ۲ — انتخاب خدمت</p>
          </div>
          <h2 className="mt-2 text-xl font-extrabold text-[var(--ink)] sm:text-2xl">چه کاری برات انجام بدیم؟</h2>

          <div className="mt-6">
            <label className="mb-2 block text-xs font-medium text-[var(--ink-dim)]">دسته‌بندی خدمت</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[...serviceCategories, ...prdCategories].slice(0, 13).map((c) => (
                <button
                  type="button"
                  key={c.slug}
                  onClick={() => handleCategoryChange(c.slug)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-right text-xs transition-colors sm:text-sm ${
                    categorySlug === c.slug
                      ? "border-emerald-400/60 bg-emerald-400/10 text-[var(--ink)]"
                      : "border-white/10 bg-white/5 text-[var(--ink-dim)] hover:text-[var(--ink)]"
                  }`}
                >
                  <ServiceIcon name={c.icon} size={15} />
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-xs font-medium text-[var(--ink-dim)]">نوع خدمت</label>
            <div className="flex flex-col gap-2">
              {category.items.map((item) => (
                <label
                  key={item.slug}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${
                    serviceSlug === item.slug
                      ? "border-emerald-400/60 bg-emerald-400/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="service"
                      className="mt-1 accent-emerald-400"
                      checked={serviceSlug === item.slug}
                      onChange={() => setServiceSlug(item.slug)}
                    />
                    <div>
                      <p className="text-sm font-bold text-[var(--ink)]">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--ink-dim)]">{item.description}</p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--ink-dim)]">
                        <Clock3 size={11} />
                        {item.deliveryTime}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-emerald-300 sm:text-sm">
                    {formatToman(item.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={goToStep2}
            className="btn-brand mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold"
          >
            ادامه ثبت سفارش
            <ArrowLeft size={16} />
          </button>
        </GlassCard>
      ) : (
        <form onSubmit={handleSubmit}>
          <GlassCard className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink-dim)] hover:text-[var(--ink)]"
              >
                <ArrowRight size={14} />
                تغییر خدمت
              </button>
              <p className="text-xs font-medium text-emerald-300">مرحله ۲ از ۲ — اطلاعات سفارش</p>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                <ServiceIcon name={category.icon} size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--ink)]">{service.title}</p>
                <p className="text-xs text-[var(--ink-dim)]">{category.title}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">نام و نام‌خانوادگی</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)] focus:border-emerald-400/60"
                  placeholder="مثلاً: علی رضایی"
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
                <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">ایمیل (اختیاری)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)] focus:border-emerald-400/60"
                  placeholder="example@mail.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">تعداد / تعداد صفحه</label>
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  type="number"
                  min={1}
                  max={500}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">توضیحات سفارش</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)] focus:border-emerald-400/60"
                placeholder="دقیقاً توضیح بده چه کاری می‌خوای انجام بدیم..."
              />
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">پیوست فایل (اختیاری، حداکثر ۵ مگابایت)</label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-3.5 text-xs text-[var(--ink-dim)] hover:border-emerald-400/50">
                <span className="flex items-center gap-2">
                  <Paperclip size={15} />
                  {file ? file.name : "انتخاب فایل (عکس، ورد، PDF و ...)"}
                </span>
                {file ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10"
                  >
                    <X size={12} />
                  </button>
                ) : null}
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <label className="mt-4 flex items-center gap-2.5 rounded-xl bg-amber-400/10 px-4 py-3 text-xs font-medium">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="accent-amber-400"
              />
              سفارش فوری (اولویت‌دار) — ۳۰٪ هزینه اضافه
            </label>

            {error ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-400/10 px-4 py-3 text-xs text-red-300">
                <AlertCircle size={15} />
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-emerald-400/10 px-5 py-4">
              <span className="text-xs font-medium text-[var(--ink-dim)] sm:text-sm">مبلغ تخمینی سفارش</span>
              <span className="text-lg font-extrabold text-emerald-300 sm:text-xl">{formatToman(estimatedPrice)}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-brand mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? "در حال ثبت سفارش..." : "ثبت نهایی سفارش"}
            </button>
          </GlassCard>
        </form>
      )}
    </div>
  );
}

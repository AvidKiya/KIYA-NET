import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileCheck2,
  MessageSquareText,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Star,
  UploadCloud,
  Wallet,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ShopClock } from "@/components/ShopClock";
import { FaqAccordion } from "@/components/FaqAccordion";
import { formatToman } from "@/lib/format";
import { serviceCategories } from "@/lib/services";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "بدون نیاز به حضور",
    desc: "همه‌چیز از خونه یا محل کارتون انجام می‌شه، دقیقاً مثل مراجعه به یک کافی‌نت واقعی.",
  },
  {
    icon: FileCheck2,
    title: "تحویل فایل PDF نهایی",
    desc: "خروجی هر سفارش، یک فایل PDF مرتب و آماده چاپ یا ارسال است.",
  },
  {
    icon: Clock3,
    title: "تحویل سریع",
    desc: "بیشتر سفارش‌ها بین چند ساعت تا حداکثر ۲ روز کاری آماده می‌شن.",
  },
  {
    icon: Wallet,
    title: "قیمت شفاف",
    desc: "پیش از ثبت سفارش، هزینه دقیق کار رو می‌بینید؛ بدون هیچ هزینه پنهانی.",
  },
];

const STEPS = [
  {
    icon: Sparkles,
    title: "انتخاب خدمت",
    desc: "از بین ده‌ها خدمت کافی‌نتی، همونی که نیاز دارید رو انتخاب کنید.",
  },
  {
    icon: UploadCloud,
    title: "ثبت سفارش و ارسال مدارک",
    desc: "توضیحات و فایل موردنیاز (عکس، ورد، مدارک) رو براتون آپلود می‌کنید.",
  },
  {
    icon: MessageSquareText,
    title: "انجام کار توسط اپراتور کیانت",
    desc: "تیم کیانت با دقت سفارش شما رو بررسی و اجرا می‌کنه.",
  },
  {
    icon: FileCheck2,
    title: "دریافت فایل PDF تحویلی",
    desc: "از صفحه پیگیری سفارش، فایل نهایی و رسید کار رو دانلود می‌کنید.",
  },
];

const TESTIMONIALS = [
  {
    name: "سارا محمدی",
    role: "دانشجوی ارشد",
    text: "پایان‌نامه‌مو نصف شب برای تایپ فرستادم، صبح فایل ورد و PDF آماده بود. دقیقاً مثل این بود که برم کافی‌نت محل ولی راحت‌تر!",
    rating: 5,
  },
  {
    name: "علی رضایی",
    role: "کارمند اداره",
    text: "ثبت‌نام سامانه دولتی که همیشه گیر می‌کردم رو کیانت برام انجام داد. کد رهگیری داشتم و همه چیز شفاف بود.",
    rating: 5,
  },
  {
    name: "نگار احمدی",
    role: "صاحب فروشگاه اینستاگرامی",
    text: "طراحی کارت ویزیت و پک استوری رو سفارش دادم، خیلی حرفه‌ای تحویل گرفتم و فایل PDF لایه‌باز هم داشت.",
    rating: 5,
  },
];

export default function HomePage() {
  const popularServices = serviceCategories.flatMap((c) => c.items.slice(0, 1)).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-8 sm:px-6 sm:pt-12">
      {/* Hero */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-rise">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--ink-dim)]">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            کافی‌نت ۱۰۰٪ مجازی — همیشه در دسترس
          </span>

          <h1 className="mt-6 text-[clamp(2.1rem,5.5vw,3.6rem)] font-extrabold leading-[1.2] text-[var(--ink)]">
            کیانت؛ کافی‌نتی که
            <br />
            <span className="text-gradient-brand">هیچ‌وقت درش بسته نمی‌شه</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--ink-dim)] sm:text-lg">
            هر کاری که تو یه کافی‌نت واقعی انجام می‌دید — تایپ، پرینت، اسکن، ثبت‌نام‌های اینترنتی،
            طراحی و ترجمه — رو حالا کاملاً آنلاین و بدون مراجعه حضوری از «کیانت» بگیرید و فایل نهایی
            رو به‌صورت PDF تحویل بگیرید.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/order" className="btn-brand flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold">
              ثبت سفارش جدید
              <ArrowLeft size={16} />
            </Link>
            <Link href="/services" className="btn-glass rounded-2xl px-6 py-3.5 text-sm font-medium text-[var(--ink)]">
              مشاهده همه خدمات
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 sm:max-w-md">
            {[
              { n: "+۲۵۰۰", l: "سفارش موفق" },
              { n: "۴.۹ / ۵", l: "رضایت مشتری" },
              { n: "۲۴/۷", l: "ثبت سفارش آنلاین" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl px-3 py-4 text-center">
                <p className="text-lg font-extrabold text-[var(--ink)] sm:text-xl">{s.n}</p>
                <p className="mt-1 text-[11px] text-[var(--ink-dim)]">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-rise" style={{ animationDelay: "0.15s" }}>
          <GlassCard className="p-6 sm:p-7">
            <p className="mb-1 text-xs font-medium text-[var(--ink-dim)]">پیشخوان زنده کیانت</p>
            <ShopClock />
            <div className="my-6 border-t border-white/10" />
            <div className="space-y-3">
              {[
                { t: "تایپ پایان‌نامه سعیدی", s: "در حال انجام" },
                { t: "کارت ویزیت فروشگاه رزا", s: "آماده تحویل" },
                { t: "ثبت‌نام سامانه یارانه", s: "در انتظار بررسی" },
              ].map((row) => (
                <div key={row.t} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-xs sm:text-sm">
                  <span className="text-[var(--ink)]">{row.t}</span>
                  <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-medium text-emerald-300 sm:text-xs">
                    {row.s}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features */}
      <section className="mt-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <GlassCard key={f.title} className="card-hover animate-rise p-6" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20 text-emerald-300">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 text-sm font-bold text-[var(--ink)] sm:text-base">{f.title}</h3>
              <p className="mt-2 text-xs leading-6 text-[var(--ink-dim)] sm:text-sm">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Services preview */}
      <section className="mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-emerald-300">خدمات کیانت</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">
              همه‌ی خدمات یک کافی‌نت، این‌بار آنلاین
            </h2>
          </div>
          <Link href="/services" className="btn-glass rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--ink)]">
            مشاهده کامل خدمات و قیمت‌ها
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((category, i) => (
            <GlassCard
              key={category.slug}
              className="card-hover animate-rise relative overflow-hidden p-6"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className={`pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${category.color} blur-2xl`} />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[var(--ink)]">
                  <ServiceIcon name={category.icon} size={22} />
                </div>
                <h3 className="mt-4 text-base font-bold text-[var(--ink)]">{category.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--ink-dim)] sm:text-sm">{category.tagline}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-[var(--ink-dim)]">
                  <span>{category.items.length} خدمت</span>
                  <Link
                    href={`/services#${category.slug}`}
                    className="flex items-center gap-1 font-medium text-emerald-300"
                  >
                    مشاهده و سفارش
                    <ArrowLeft size={13} />
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-24">
        <p className="text-xs font-medium text-emerald-300">فرآیند سفارش</p>
        <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">
          دقیقاً مثل رفتن به کافی‌نت، فقط از راه دور
        </h2>

        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <GlassCard className="animate-rise h-full p-6" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="text-4xl font-extrabold text-white/10">{`0${i + 1}`}</span>
                <div className="-mt-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20 text-emerald-300">
                  <step.icon size={19} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-[var(--ink)]">{step.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--ink-dim)]">{step.desc}</p>
              </GlassCard>
              {i < STEPS.length - 1 ? (
                <div className="absolute -left-3 top-1/2 hidden h-px w-6 bg-gradient-to-l from-emerald-400/60 to-transparent lg:block" />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Popular pricing */}
      <section className="mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-emerald-300">پرطرفدارترین سفارش‌ها</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">قیمت شفاف، بدون سورپرایز</h2>
          </div>
        </div>

        <GlassCard className="mt-8 overflow-hidden p-0">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[var(--ink-dim)]">
                  <th className="px-6 py-4 text-right font-medium">خدمت</th>
                  <th className="px-6 py-4 text-right font-medium">واحد</th>
                  <th className="px-6 py-4 text-right font-medium">زمان تحویل</th>
                  <th className="px-6 py-4 text-right font-medium">قیمت</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {popularServices.map((service) => (
                  <tr key={service.slug} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 font-medium text-[var(--ink)]">{service.title}</td>
                    <td className="px-6 py-4 text-[var(--ink-dim)]">{service.unit}</td>
                    <td className="px-6 py-4 text-[var(--ink-dim)]">{service.deliveryTime}</td>
                    <td className="px-6 py-4 font-bold text-emerald-300">{formatToman(service.price)}</td>
                    <td className="px-6 py-4">
                      <Link href="/order" className="text-xs font-medium text-[var(--ink)] underline underline-offset-4">
                        سفارش
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </section>

      {/* Testimonials */}
      <section className="mt-24">
        <p className="text-xs font-medium text-emerald-300">نظر مشتری‌ها</p>
        <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">مشتری‌های راضی کیانت</h2>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <GlassCard key={t.name} className="animate-rise p-6" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--ink-dim)]">«{t.text}»</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-violet-500/30 text-xs font-bold text-[var(--ink)]">
                  {t.name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--ink)]">{t.name}</p>
                  <p className="text-[11px] text-[var(--ink-dim)]">{t.role}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Security strip */}
      <section className="mt-24">
        <GlassCard className="grid gap-6 p-8 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "حریم خصوصی تضمینی", d: "مدارک شما فقط برای انجام سفارش استفاده و سپس حذف می‌شود." },
            { icon: ScanLine, t: "کیفیت بازبینی‌شده", d: "پیش از تحویل، هر سفارش توسط اپراتور کیانت کنترل کیفی می‌شود." },
            { icon: CheckCircle2, t: "ضمانت بازانجام", d: "در صورت وجود ایراد در فایل تحویلی، رایگان اصلاح می‌شود." },
          ].map((item) => (
            <div key={item.t} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--ink)]">{item.t}</p>
                <p className="mt-1 text-xs leading-6 text-[var(--ink-dim)]">{item.d}</p>
              </div>
            </div>
          ))}
        </GlassCard>
      </section>

      {/* FAQ */}
      <section className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-medium text-emerald-300">سوالات متداول</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">
            هرچی لازمه بدونید، اینجاست
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--ink-dim)]">
            سوال دیگه‌ای دارید؟ از صفحه تماس با ما در ارتباط باشید تا تیم کیانت در سریع‌ترین زمان
            پاسخ‌گو باشد.
          </p>
          <Link href="/contact" className="btn-glass mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-medium text-[var(--ink)]">
            تماس با پشتیبانی
          </Link>
        </div>
        <FaqAccordion />
      </section>

      {/* Final CTA */}
      <section className="mt-24">
        <GlassCard className="relative overflow-hidden p-8 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-violet-500/10" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold text-[var(--ink)] sm:text-4xl">
              همین حالا سفارشتو ثبت کن
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--ink-dim)] sm:text-base">
              کافیه چند دقیقه وقت بذاری؛ کارتو با کیفیت انجام می‌دیم و فایل PDF نهایی رو برات
              می‌فرستیم.
            </p>
            <Link href="/order" className="btn-brand mt-8 inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold">
              شروع سفارش
              <ArrowLeft size={16} />
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

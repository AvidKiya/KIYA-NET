"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, FileCheck2, MessageSquareText, ShieldCheck, Sparkles, Star, UploadCloud, Wallet, Zap } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { ServiceIcon } from "@/components/ServiceIcon";
import { DynamicIcon } from "@/components/DynamicIcon";
import { ShopClock } from "@/components/ShopClock";
import { FaqAccordion } from "@/components/FaqAccordion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";
import { SearchableCounters } from "@/components/SearchableCounters";
import { useCMS } from "@/components/cms/CMSContext";
import { Editable } from "@/components/cms/Editable";

const DEFAULT_FEATURES = [
  { icon: "ShieldCheck", title: "بدون نیاز به حضور", desc: "همه‌چیز از خونه یا محل کارتون انجام می‌شه، دقیقاً مثل مراجعه به یک کافی‌نت واقعی." },
  { icon: "FileCheck2", title: "تحویل فایل PDF نهایی", desc: "خروجی هر سفارش، یک فایل PDF مرتب و آماده چاپ یا ارسال است." },
  { icon: "Clock3", title: "تحویل سریع", desc: "بیشتر سفارش‌ها بین چند ساعت تا حداکثر ۲ روز کاری آماده می‌شن." },
  { icon: "Wallet", title: "قیمت شفاف", desc: "پیش از ثبت سفارش، هزینه دقیق کار رو می‌بینید؛ بدون هیچ هزینه پنهانی." },
];

const DEFAULT_STEPS = [
  { icon: "Sparkles", title: "انتخاب خدمت", desc: "از بین ده‌ها خدمت کافی‌نتی، همونی که نیاز دارید رو انتخاب کنید." },
  { icon: "UploadCloud", title: "ثبت سفارش و ارسال مدارک", desc: "توضیحات و فایل موردنیاز رو آپلود می‌کنید." },
  { icon: "MessageSquareText", title: "انجام کار توسط اپراتور", desc: "تیم کیانت با دقت سفارش شما رو بررسی و اجرا می‌کنه." },
  { icon: "FileCheck2", title: "دریافت فایل PDF تحویلی", desc: "از صفحه پیگیری سفارش، فایل نهایی رو دانلود می‌کنید." },
];

const DEFAULT_TESTIMONIALS = [
  { name: "سارا محمدی", role: "دانشجوی ارشد", text: "پایان‌نامه‌مو نصف شب برای تایپ فرستادم، صبح فایل ورد و PDF آماده بود. دقیقاً مثل این بود که برم کافی‌نت محل ولی راحت‌تر!", rating: 5 },
  { name: "علی رضایی", role: "کارمند اداره", text: "ثبت‌نام سامانه دولتی که همیشه گیر می‌کردم رو کیانت برام انجام داد. کد رهگیری داشتم و همه چیز شفاف بود.", rating: 5 },
  { name: "نگار احمدی", role: "صاحب فروشگاه", text: "طراحی کارت ویزیت و پک استوری رو سفارش دادم، خیلی حرفه‌ای تحویل گرفتم.", rating: 5 },
];

const DEFAULT_STATS = [
  { n: "+۲۵۰۰", l: "سفارش موفق" },
  { n: "۴.۹ / ۵", l: "رضایت مشتری" },
  { n: "۲۴/۷", l: "ثبت سفارش آنلاین" },
];


export default function HomePage() {
  const { data } = useCMS();
  const s = data.siteSettings;

  const features = Array.isArray(s.features) ? s.features : DEFAULT_FEATURES;
  const steps = Array.isArray(s.steps) ? s.steps : DEFAULT_STEPS;
  const testimonials = Array.isArray(s.testimonials) ? s.testimonials : DEFAULT_TESTIMONIALS;
  const stats = [
    { n: s.stats_orders || DEFAULT_STATS[0].n, l: s.stats_orders_label || DEFAULT_STATS[0].l },
    { n: s.stats_customers || DEFAULT_STATS[1].n, l: s.stats_customers_label || DEFAULT_STATS[1].l },
    { n: s.stats_years || DEFAULT_STATS[2].n, l: s.stats_years_label || DEFAULT_STATS[2].l },
  ];

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-3 pt-8 pb-32 sm:px-6 sm:pt-12">
        <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="animate-rise">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--ink-dim)]">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <Editable table="site_settings" recordId="hero_badge" field="value" value={s.hero_badge} label="نشان هدر">
                {s.hero_badge || "کافی‌نت ۱۰۰٪ مجازی — همیشه در دسترس"}
              </Editable>
            </span>
            <h1 className="mt-6 text-[clamp(2.1rem,5.5vw,3.6rem)] font-extrabold leading-[1.2] text-[var(--ink)]">
              <Editable table="site_settings" recordId="hero_title" field="value" value={s.hero_title} label="عنوان اصلی" className="block">
                {s.hero_title || "کیانت؛ کافی‌نتی که"}
              </Editable>
              <span className="text-[var(--brand)]">
                <Editable table="site_settings" recordId="hero_highlight" field="value" value={s.hero_highlight} label="عنوان برجسته" className="block">
                  {s.hero_highlight || "هیچ‌وقت درش بسته نمی‌شه"}
                </Editable>
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--ink-dim)] sm:text-lg">
              <Editable table="site_settings" recordId="hero_subtitle" field="value" value={s.hero_subtitle} label="زیرعنوان" type="textarea">
                {s.hero_subtitle || "از ثبت‌نام کنکور و وام ازدواج گرفته تا اظهارنامه مالیاتی و طراحی کارت ویزیت — همه رو آنلاین و بدون مراجعه حضوری از «کیانت» بگیرید."}
              </Editable>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/order" className="btn-brand flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold">
                <Editable table="site_settings" recordId="hero_cta_primary" field="value" value={s.hero_cta_primary} label="دکمه اصلی">
                  {s.hero_cta_primary || "ثبت سفارش جدید"}
                </Editable>
                <ArrowLeft size={16} />
              </Link>
              <Link href="/services" className="btn-glass rounded-2xl px-6 py-3.5 text-sm font-medium text-[var(--ink)]">
                <Editable table="site_settings" recordId="hero_cta_secondary" field="value" value={s.hero_cta_secondary} label="دکمه فرعی">
                  {s.hero_cta_secondary || "مشاهده همه خدمات"}
                </Editable>
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3 sm:max-w-md">
              {stats.map((st) => (
                <div key={st.l} className="glass rounded-2xl px-3 py-4 text-center">
                  <p className="text-lg font-extrabold text-[var(--ink)] sm:text-xl">{st.n}</p>
                  <p className="mt-1 text-[11px] text-[var(--ink-dim)]">{st.l}</p>
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
                {[{ t: "تایپ پایان‌نامه سعیدی", s: "در حال انجام" }, { t: "کارت ویزیت فروشگاه رزا", s: "آماده تحویل" }, { t: "ثبت‌نام سامانه یارانه", s: "در انتظار بررسی" }].map(row => (
                  <div key={row.t} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-xs sm:text-sm"><span className="text-[var(--ink)]">{row.t}</span><span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-medium text-emerald-300 sm:text-xs">{row.s}</span></div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        <SearchableCounters />

        <section className="mt-24">
          <p className="text-center text-xs font-medium text-emerald-300">
            <Editable table="site_settings" recordId="features_title" field="value" value={s.features_title} label="عنوان ویژگی‌ها">
              {s.features_title || "چرا کیانت؟"}
            </Editable>
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f: any, i: number) => {
              return (
                <GlassCard key={i} className="card-hover animate-rise p-6" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20 text-emerald-300"><DynamicIcon name={f.icon} size={20} /></div>
                  <h3 className="mt-4 text-sm font-bold text-[var(--ink)] sm:text-base">{f.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[var(--ink-dim)] sm:text-sm">{f.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </section>

        <section className="mt-24">
          <p className="text-xs font-medium text-emerald-300">
            <Editable table="site_settings" recordId="steps_title" field="value" value={s.steps_title} label="عنوان فرآیند">
              {s.steps_title || "فرآیند سفارش"}
            </Editable>
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">
            <Editable table="site_settings" recordId="steps_subtitle" field="value" value={s.steps_subtitle} label="زیرعنوان فرآیند" type="textarea">
              {s.steps_subtitle || "دقیقاً مثل رفتن به کافی‌نت، فقط از راه دور"}
            </Editable>
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {steps.map((step: any, i: number) => {
              return (
                <div key={i} className="relative">
                  <GlassCard className="animate-rise h-full p-6" style={{ animationDelay: `${i * 0.08}s` }}>
                    <span className="text-4xl font-extrabold text-white/10">{`0${i + 1}`}</span>
                    <div className="-mt-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20 text-emerald-300"><DynamicIcon name={step.icon} size={19} /></div>
                    <h3 className="mt-4 text-sm font-bold text-[var(--ink)]">{step.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-[var(--ink-dim)]">{step.desc}</p>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-24">
          <p className="text-xs font-medium text-emerald-300">
            <Editable table="site_settings" recordId="testimonials_title" field="value" value={s.testimonials_title} label="عنوان نظرات">
              {s.testimonials_title || "نظرات مشتریان"}
            </Editable>
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">مشتری‌های کیانت چی می‌گن؟</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {testimonials.map((t: any, i: number) => (
              <GlassCard key={i} className="animate-rise p-6" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="mb-3 flex gap-0.5">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={13} className="fill-amber-400 text-amber-400" />)}</div>
                <p className="text-xs leading-7 text-[var(--ink-dim)] sm:text-sm">{t.text}</p>
                <div className="mt-4 border-t border-white/10 pt-4"><p className="text-sm font-bold text-[var(--ink)]">{t.name}</p><p className="text-xs text-[var(--ink-dim)]">{t.role}</p></div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <p className="text-xs font-medium text-emerald-300">
            <Editable table="site_settings" recordId="faq_title" field="value" value={s.faq_title} label="عنوان FAQ">
              {s.faq_title || "سوالات متداول"}
            </Editable>
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">هر سوالی که ممکنه داشته باشید</h2>
          <div className="mx-auto mt-8 max-w-2xl"><FaqAccordion items={Array.isArray(s.faq_items) ? s.faq_items : undefined} /></div>
        </section>
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}

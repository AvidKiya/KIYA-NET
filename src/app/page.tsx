import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, FileCheck2, MessageSquareText, ShieldCheck, Sparkles, Star, UploadCloud, Wallet } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ShopClock } from "@/components/ShopClock";
import { FaqAccordion } from "@/components/FaqAccordion";
import { serviceCategories } from "@/lib/services";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BottomNav } from "@/components/BottomNav";
import { SearchableCounters } from "@/components/SearchableCounters";

const FEATURES = [
  { icon: ShieldCheck, title: "بدون نیاز به حضور", desc: "همه‌چیز از خونه یا محل کارتون انجام می‌شه، دقیقاً مثل مراجعه به یک کافی‌نت واقعی." },
  { icon: FileCheck2, title: "تحویل فایل PDF نهایی", desc: "خروجی هر سفارش، یک فایل PDF مرتب و آماده چاپ یا ارسال است." },
  { icon: Clock3, title: "تحویل سریع", desc: "بیشتر سفارش‌ها بین چند ساعت تا حداکثر ۲ روز کاری آماده می‌شن." },
  { icon: Wallet, title: "قیمت شفاف", desc: "پیش از ثبت سفارش، هزینه دقیق کار رو می‌بینید؛ بدون هیچ هزینه پنهانی." },
];

const STEPS = [
  { icon: Sparkles, title: "انتخاب خدمت", desc: "از بین ده‌ها خدمت کافی‌نتی، همونی که نیاز دارید رو انتخاب کنید." },
  { icon: UploadCloud, title: "ثبت سفارش و ارسال مدارک", desc: "توضیحات و فایل موردنیاز رو آپلود می‌کنید." },
  { icon: MessageSquareText, title: "انجام کار توسط اپراتور", desc: "تیم کیانت با دقت سفارش شما رو بررسی و اجرا می‌کنه." },
  { icon: FileCheck2, title: "دریافت فایل PDF تحویلی", desc: "از صفحه پیگیری سفارش، فایل نهایی رو دانلود می‌کنید." },
];

const TESTIMONIALS = [
  { name: "سارا محمدی", role: "دانشجوی ارشد", text: "پایان‌نامه‌مو نصف شب برای تایپ فرستادم، صبح فایل ورد و PDF آماده بود. دقیقاً مثل این بود که برم کافی‌نت محل ولی راحت‌تر!", rating: 5 },
  { name: "علی رضایی", role: "کارمند اداره", text: "ثبت‌نام سامانه دولتی که همیشه گیر می‌کردم رو کیانت برام انجام داد. کد رهگیری داشتم و همه چیز شفاف بود.", rating: 5 },
  { name: "نگار احمدی", role: "صاحب فروشگاه", text: "طراحی کارت ویزیت و پک استوری رو سفارش دادم، خیلی حرفه‌ای تحویل گرفتم.", rating: 5 },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-3 pt-8 pb-32 sm:px-6 sm:pt-12">
        <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="animate-rise">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--ink-dim)]">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              کافی‌نت ۱۰۰٪ مجازی — همیشه در دسترس
            </span>
            <h1 className="mt-6 text-[clamp(2.1rem,5.5vw,3.6rem)] font-extrabold leading-[1.2] text-[var(--ink)]">
              کیانت؛ کافی‌نتی که<br /><span className="text-[var(--brand)]">هیچ‌وقت درش بسته نمی‌شه</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--ink-dim)] sm:text-lg">
              از ثبت‌نام کنکور و وام ازدواج گرفته تا اظهارنامه مالیاتی و طراحی کارت ویزیت —
              همه رو آنلاین و بدون مراجعه حضوری از «کیانت» بگیرید.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/order" className="btn-brand flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold">ثبت سفارش جدید <ArrowLeft size={16} /></Link>
              <Link href="/services" className="btn-glass rounded-2xl px-6 py-3.5 text-sm font-medium text-[var(--ink)]">مشاهده همه خدمات</Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3 sm:max-w-md">
              {[{ n: "+۲۵۰۰", l: "سفارش موفق" }, { n: "۴.۹ / ۵", l: "رضایت مشتری" }, { n: "۲۴/۷", l: "ثبت سفارش آنلاین" }].map(s => (
                <div key={s.l} className="glass rounded-2xl px-3 py-4 text-center"><p className="text-lg font-extrabold text-[var(--ink)] sm:text-xl">{s.n}</p><p className="mt-1 text-[11px] text-[var(--ink-dim)]">{s.l}</p></div>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <GlassCard key={f.title} className="card-hover animate-rise p-6" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20 text-emerald-300"><f.icon size={20} /></div>
                <h3 className="mt-4 text-sm font-bold text-[var(--ink)] sm:text-base">{f.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--ink-dim)] sm:text-sm">{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <p className="text-xs font-medium text-emerald-300">فرآیند سفارش</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">دقیقاً مثل رفتن به کافی‌نت، فقط از راه دور</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <GlassCard className="animate-rise h-full p-6" style={{ animationDelay: `${i * 0.08}s` }}>
                  <span className="text-4xl font-extrabold text-white/10">{`0${i + 1}`}</span>
                  <div className="-mt-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20 text-emerald-300"><step.icon size={19} /></div>
                  <h3 className="mt-4 text-sm font-bold text-[var(--ink)]">{step.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[var(--ink-dim)]">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <p className="text-xs font-medium text-emerald-300">نظرات مشتریان</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">مشتری‌های کیانت چی می‌گن؟</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <GlassCard key={t.name} className="animate-rise p-6" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="mb-3 flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={13} className="fill-amber-400 text-amber-400" />)}</div>
                <p className="text-xs leading-7 text-[var(--ink-dim)] sm:text-sm">{t.text}</p>
                <div className="mt-4 border-t border-white/10 pt-4"><p className="text-sm font-bold text-[var(--ink)]">{t.name}</p><p className="text-xs text-[var(--ink-dim)]">{t.role}</p></div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <p className="text-xs font-medium text-emerald-300">سوالات متداول</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">هر سوالی که ممکنه داشته باشید</h2>
          <div className="mx-auto mt-8 max-w-2xl"><FaqAccordion /></div>
        </section>
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}

"use client";

import { Globe2, Award } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { DynamicIcon } from "@/components/DynamicIcon";
import { useCMS } from "@/components/cms/CMSContext";
import { Editable } from "@/components/cms/Editable";

const DEFAULT_VALUES = [
  { icon: "ShieldCheck", title: "امانت‌داری", desc: "مدارک و اطلاعات مشتری‌ها فقط برای انجام سفارش استفاده می‌شود." },
  { icon: "Sparkles", title: "کیفیت", desc: "هر سفارش پیش از تحویل، بازبینی و کنترل کیفی می‌شود." },
  { icon: "Rocket", title: "سرعت", desc: "بیشتر سفارش‌ها در همان روز آماده تحویل هستند." },
  { icon: "HeartHandshake", title: "مشتری‌مداری", desc: "پشتیبانی مستقیم و پاسخ‌گویی سریع در تمام مراحل سفارش." },
];

const DEFAULT_TIMELINE = [
  { year: "۱۴۰۲", title: "شروع ایده", desc: "اوید کیا با تجربه سال‌ها کار در حوزه فناوری، ایده یک کافی‌نت کاملاً مجازی را شکل داد." },
  { year: "۱۴۰۳", title: "راه‌اندازی کیانت", desc: "کیانت (KIYA NET) با چند خدمت پایه مثل تایپ و ثبت‌نام اینترنتی فعالیتش را آغاز کرد." },
  { year: "۱۴۰۴", title: "گسترش خدمات", desc: "افزودن طراحی گرافیک، ترجمه و تحویل فایل PDF هوشمند برای تمام سفارش‌ها." },
  { year: "امروز", title: "کافی‌نت شماره یک آنلاین", desc: "کیانت با هزاران سفارش موفق، جایگزین کافی‌نت‌های سنتی برای مشتریانش شده است." },
];

const DEFAULT_STATS = [
  { icon: "Globe2", value: "۱۰۰٪", label: "مجازی و بدون نیاز به حضور" },
  { icon: "Award", value: "+۲۵۰۰", label: "سفارش تکمیل‌شده" },
  { icon: "ShieldCheck", value: "۴.۹/۵", label: "میانگین رضایت مشتری" },
];

export default function AboutPageClient() {
  const { data } = useCMS();
  const a = data.aboutContent;
  const s = data.siteSettings;

  const values = Array.isArray(a.values) ? a.values : DEFAULT_VALUES;
  const timeline = Array.isArray(a.timeline) ? a.timeline : DEFAULT_TIMELINE;
  const stats = Array.isArray(a.stats) ? a.stats : DEFAULT_STATS;

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-3 pb-24 pt-10 sm:px-6">
        <section className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--ink-dim)]">
              درباره کیانت
            </span>
            <h1 className="mt-5 text-[clamp(1.9rem,4.5vw,3rem)] font-extrabold leading-tight text-[var(--ink)]">
              <Editable table="about_content" recordId="page_title" field="value" value={a.page_title} label="عنوان صفحه" type="textarea">
                {a.page_title || "کافی‌نتی که از دل یک ایده ساده متولد شد"}
              </Editable>
            </h1>
            <p className="mt-5 text-sm leading-8 text-[var(--ink-dim)] sm:text-base">
              <Editable table="about_content" recordId="story" field="value" value={a.story} label="داستان کیانت" type="textarea">
                {a.story || "«کیانت» (KIYA NET) توسط اوید کیا راه‌اندازی شده؛ جایی که به‌جای اجاره یک مغازه فیزیکی، تمام تجربه یک کافی‌نت واقعی — از امور اداری، دانشگاهی و قضایی گرفته تا طراحی گرافیک و چاپ حرفه‌ای — به‌صورت کاملاً آنلاین در اختیار مشتری‌ها قرار می‌گیرد. هدف ما ساده است: هرکسی، هر زمان و هر جایی، بتونه بدون مراجعه حضوری، کارهای اداری و دیجیتالی‌شو با کیفیت بالا و پشتیبانی ۲۴ ساعته انجام بده و فایل نهایی رو تحویل بگیره."}
              </Editable>
            </p>
          </div>

          <GlassCard className="p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-violet-500 text-2xl font-extrabold text-[#052018]">
              AK
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-[var(--ink)]">
              <Editable table="about_content" recordId="founder_name" field="value" value={a.founder_name} label="نام بنیان‌گذار">
                {a.founder_name || "اوید کیا"}
              </Editable>
            </h3>
            <p className="text-xs text-[var(--ink-dim)]">
              <Editable table="about_content" recordId="founder_title" field="value" value={a.founder_title} label="عنوان بنیان‌گذار">
                {a.founder_title || "Avid Kiya — بنیان‌گذار کیانت"}
              </Editable>
            </p>
            <p className="mt-4 text-xs leading-6 text-[var(--ink-dim)]">
              <Editable table="about_content" recordId="founder_quote" field="value" value={a.founder_quote} label="نقل‌قول بنیان‌گذار" type="textarea">
                {a.founder_quote || "«باور دارم هر کسب‌وکاری می‌تونه بدون فروشگاه فیزیکی هم به بهترین شکل به مشتری‌هاش خدمت کنه؛ کیانت نتیجه همین باوره.»"}
              </Editable>
            </p>
          </GlassCard>
        </section>

        <section className="mt-24">
          <p className="text-center text-xs font-medium text-emerald-300">ارزش‌های کیانت</p>
          <h2 className="mt-2 text-center text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">
            چیزی که کیانت رو متفاوت می‌کنه
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v: any, i: number) => (
              <GlassCard key={i} className="card-hover p-6 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20 text-emerald-300">
                  <DynamicIcon name={v.icon} size={19} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-[var(--ink)]">{v.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--ink-dim)]">{v.desc}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <p className="text-center text-xs font-medium text-emerald-300">مسیر ما</p>
          <h2 className="mt-2 text-center text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">
            از یک ایده تا کافی‌نت آنلاین کیانت
          </h2>

          <div className="relative mt-12">
            <div className="absolute right-1/2 top-0 hidden h-full w-px translate-x-1/2 bg-white/10 lg:block" />
            <div className="flex flex-col gap-8">
              {timeline.map((item: any, i: number) => (
                <div key={i} className={`flex flex-col gap-4 lg:flex-row ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                  <div className="flex-1">
                    <GlassCard className="p-6">
                      <span className="text-xs font-bold text-emerald-300">{item.year}</span>
                      <h3 className="mt-2 text-base font-bold text-[var(--ink)]">{item.title}</h3>
                      <p className="mt-2 text-xs leading-6 text-[var(--ink-dim)]">{item.desc}</p>
                    </GlassCard>
                  </div>
                  <div className="hidden flex-1 lg:block" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-24">
          <GlassCard className="grid gap-6 p-8 text-center sm:grid-cols-3">
            {stats.map((st: any, i: number) => (
              <div key={i}>
                <DynamicIcon name={st.icon} className="mx-auto text-emerald-300" size={24} />
                <p className="mt-3 text-2xl font-extrabold text-[var(--ink)]">{st.value}</p>
                <p className="mt-1 text-xs text-[var(--ink-dim)]">{st.label}</p>
              </div>
            ))}
          </GlassCard>
        </section>
      </div>
    </>
  );
}

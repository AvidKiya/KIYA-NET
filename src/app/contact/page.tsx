import type { Metadata } from "next";
import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { ContactForm } from "@/components/ContactForm";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "تماس با ما | کیانت",
  description: "راه‌های ارتباطی با کافی‌نت آنلاین کیانت.",
};

const CONTACT_ITEMS = [
  { icon: Phone, title: "تماس تلفنی", value: "۰۹۱۲ ۰۰۰ ۰۰۰۰", href: "tel:+989120000000" },
  { icon: MessageCircle, title: "تلگرام و واتساپ", value: "kiya_net@", href: "https://t.me/kiyanet" },
  { icon: Mail, title: "ایمیل پشتیبانی", value: "support@kiyanet.ir", href: "mailto:support@kiyanet.ir" },
  { icon: MapPin, title: "موقعیت", value: "کافی‌نت کاملاً مجازی — سراسر ایران", href: undefined },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-10 sm:px-6">
      <div className="mb-10 text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--ink-dim)]">
          تماس با کیانت
        </span>
        <h1 className="mt-5 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-tight text-[var(--ink)]">
          هر سوالی داری، بپرس
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--ink-dim)]">
          تیم کیانت آماده پاسخ‌گویی به سوالات شماست؛ از طریق فرم زیر یا راه‌های ارتباطی پیام بدید.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-4">
          {CONTACT_ITEMS.map((item) => (
            <GlassCard key={item.title} className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20 text-emerald-300">
                <item.icon size={19} />
              </div>
              <div>
                <p className="text-xs text-[var(--ink-dim)]">{item.title}</p>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noreferrer" className="text-sm font-bold text-[var(--ink)]">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-bold text-[var(--ink)]">{item.value}</p>
                )}
              </div>
            </GlassCard>
          ))}

          <GlassCard className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20 text-emerald-300">
              <Clock3 size={19} />
            </div>
            <div>
              <p className="text-xs text-[var(--ink-dim)]">ساعات پاسخ‌گویی</p>
              <p className="text-sm font-bold text-[var(--ink)]">۲۴ ساعته (۷ روز هفته، بدون تعطیلی)</p>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-extrabold text-[var(--ink)]">فرم تماس</h2>
          <ContactForm />
        </GlassCard>
      </div>
    </div>
    </>
  );
}

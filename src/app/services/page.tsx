import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Clock3 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { ServiceIcon } from "@/components/ServiceIcon";
import { formatToman } from "@/lib/format";
import { serviceCategories } from "@/lib/services";

export const metadata: Metadata = {
  title: "خدمات کیانت | کافی‌نت آنلاین",
  description: "لیست کامل خدمات کافی‌نت آنلاین کیانت به همراه قیمت و زمان تحویل هر خدمت.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-10 sm:px-6">
      <div className="text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--ink-dim)]">
          دفترچه خدمات کیانت
        </span>
        <h1 className="mt-5 text-[clamp(1.9rem,4.5vw,3rem)] font-extrabold leading-tight text-[var(--ink)]">
          همه خدمات یک کافی‌نت واقعی، آنلاین
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-dim)] sm:text-base">
          خدمت موردنظرتون رو پیدا کنید، قیمت و زمان تحویلش رو ببینید و مستقیم سفارش بدید.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {serviceCategories.map((category) => (
          <a
            key={category.slug}
            href={`#${category.slug}`}
            className="btn-glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-[var(--ink)] sm:text-sm"
          >
            <ServiceIcon name={category.icon} size={15} />
            {category.title}
          </a>
        ))}
      </div>

      <div className="mt-14 flex flex-col gap-16">
        {serviceCategories.map((category) => (
          <section key={category.slug} id={category.slug} className="scroll-mt-28">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                <ServiceIcon name={category.icon} size={22} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[var(--ink)] sm:text-2xl">{category.title}</h2>
                <p className="mt-1 text-xs text-[var(--ink-dim)] sm:text-sm">{category.tagline}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <GlassCard key={item.slug} className="card-hover flex flex-col p-6">
                  <h3 className="text-sm font-bold text-[var(--ink)] sm:text-base">{item.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-6 text-[var(--ink-dim)] sm:text-sm">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-[var(--ink-dim)]">
                    <span className="flex items-center gap-1">
                      <Clock3 size={12} />
                      {item.deliveryTime}
                    </span>
                    <span>{item.unit}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-sm font-extrabold text-emerald-300 sm:text-base">
                      {formatToman(item.price)}
                    </span>
                    <Link
                      href={`/order?category=${category.slug}&service=${item.slug}`}
                      className="btn-brand flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold"
                    >
                      سفارش
                      <ArrowLeft size={13} />
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

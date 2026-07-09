"use client";

import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { ServiceIcon } from "@/components/ServiceIcon";
import { formatToman } from "@/lib/format";
import { SiteHeader } from "@/components/SiteHeader";
import { useCMS } from "@/components/cms/CMSContext";
import { Editable } from "@/components/cms/Editable";

export default function ServicesPageClient() {
  const { data } = useCMS();
  const categories = data.serviceCategories
    .filter((c) => c.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const services = data.services.filter((s) => s.isActive !== false);

  const servicesByCategory = (categoryId: string) =>
    services
      .filter((s) => s.categoryId === categoryId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-3 pb-24 pt-10 sm:px-6">
        <div className="text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--ink-dim)]">
            دفترچه خدمات کیانت
          </span>
          <h1 className="mt-5 text-[clamp(1.9rem,4.5vw,3rem)] font-extrabold leading-tight text-[var(--ink)]">
            همه خدمات تخصصی کافی‌نت و دولت الکترونیک، آنلاین و غیرحضوری
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-dim)] sm:text-base">
            خدمت موردنظرتون رو پیدا کنید، قیمت و زمان تحویلش رو ببینید و مستقیم سفارش بدید.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`#${category.slug}`}
              className="btn-glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-[var(--ink)] sm:text-sm"
            >
              <ServiceIcon name={category.iconName} size={15} />
              {category.name}
            </a>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-16">
          {categories.map((category) => {
            const items = servicesByCategory(category.id);
            if (items.length === 0) return null;
            return (
              <section key={category.id} id={category.slug} className="scroll-mt-28">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-violet-500/20 text-emerald-300">
                    <ServiceIcon name={category.iconName} size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[var(--ink)] sm:text-2xl">{category.name}</h2>
                    <p className="mt-1 text-xs text-[var(--ink-dim)] sm:text-sm">{category.tagline || category.description}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <GlassCard key={item.id} className="card-hover flex flex-col p-6">
                      <h3 className="text-sm font-bold text-[var(--ink)] sm:text-base">{item.serviceName}</h3>
                      <p className="mt-2 flex-1 text-xs leading-6 text-[var(--ink-dim)] sm:text-sm">
                        {item.description || "—"}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-[11px] text-[var(--ink-dim)]">
                        <span className="flex items-center gap-1">
                          <Clock3 size={12} />
                          {item.estimatedTimeText || `${item.estimatedTimeMinutes} دقیقه`}
                        </span>
                        <span>{item.unit}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="text-sm font-extrabold text-emerald-300 sm:text-base">
                          {formatToman(Number(item.kiyanetPrice))}
                        </span>
                        <Link
                          href={`/order?category=${category.id}&serviceId=${item.id}`}
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
            );
          })}
        </div>
      </div>
    </>
  );
}

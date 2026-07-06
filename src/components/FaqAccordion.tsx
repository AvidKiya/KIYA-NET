"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "چطور بدون حضور فیزیکی سفارش بدم؟",
    a: "کافیه از صفحه «ثبت سفارش» خدمت موردنظرتون رو انتخاب کنید، توضیحات و فایل لازم (در صورت نیاز) رو بارگذاری کنید و اطلاعات تماستون رو وارد کنید. یک کد رهگیری دریافت می‌کنید و تیم کیانت کارتون رو شروع می‌کنه.",
  },
  {
    q: "فایل نهایی رو چطور تحویل می‌گیرم؟",
    a: "به‌محض تکمیل سفارش، وضعیت اون در صفحه «پیگیری سفارش» به «آماده تحویل» تغییر می‌کنه و می‌تونید فایل PDF نهایی همراه با گزارش کار رو مستقیماً دانلود کنید.",
  },
  {
    q: "هزینه هر سفارش چطور محاسبه می‌شه؟",
    a: "قیمت هر خدمت به‌صورت شفاف در صفحه «خدمات» اعلام شده و بر اساس تعداد صفحه یا مقدار درخواستی محاسبه می‌شه. برای سفارش فوری ۳۰٪ به هزینه اضافه می‌شود.",
  },
  {
    q: "امنیت مدارک و اطلاعات من تضمین می‌شه؟",
    a: "تمام فایل‌ها و اطلاعات فقط برای انجام سفارش شما استفاده می‌شن و پس از تحویل نهایی، امکان حذف کامل اطلاعات از سرور رو در صورت درخواست فراهم می‌کنیم.",
  },
  {
    q: "چقدر طول می‌کشه سفارشم آماده بشه؟",
    a: "بسته به نوع خدمت، بین چند ساعت تا حداکثر ۲ روز کاری. زمان تقریبی هر خدمت در کارت همون خدمت درج شده است.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {FAQS.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.q} className="glass overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right"
            >
              <span className="text-sm font-medium text-[var(--ink)] sm:text-base">{item.q}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-[var(--ink-dim)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className="grid transition-all duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-8 text-[var(--ink-dim)]">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

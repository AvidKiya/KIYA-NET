"use client";

import { useEffect, useState } from "react";
import { toPersianDigits } from "@/lib/format";

const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

function toJalali(date: Date) {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    gDaysInMonth.slice(0, gm - 1).reduce((a, b) => a + b, 0);
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number, jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { year: jy, month: jm, day: jd };
}

export function ShopClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return (
      <div className="flex h-[120px] items-center justify-center text-sm text-[var(--ink-dim)]">
        در حال بارگذاری ساعت...
      </div>
    );
  }

  const tehranHourStr = now.toLocaleString("en-US", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    hour12: false,
  });
  const tehranHour = Number(tehranHourStr);
  const isOpen = true; // Kiya Net is fully virtual — open 24/7
  const timeStr = now.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const { year, month, day } = toJalali(now);

  const hour12 = tehranHour % 12 === 0 ? 12 : tehranHour % 12;
  const period = tehranHour < 5 ? "بامداد" : tehranHour < 12 ? "صبح" : tehranHour === 12 ? "ظهر" : tehranHour < 18 ? "عصر" : "شب";

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-300">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
          ۲۴/۷ آنلاین (همیشه باز)
        </span>
        <span className="text-[11px] text-[var(--ink-dim)]">Asia/Tehran</span>
      </div>
      <p className="mt-4 text-center font-[family-name:var(--font-vazir)] text-4xl font-bold tracking-wider text-[var(--ink)] sm:text-5xl">
        {toPersianDigits(timeStr)}
      </p>
      <p className="mt-2 text-center text-sm text-[var(--ink-dim)]">
        {toPersianDigits(day)} {JALALI_MONTHS[month - 1]} {toPersianDigits(year)}
      </p>
      <p className="mt-1 text-center text-[11px] text-[var(--ink-dim)]" suppressHydrationWarning>
        ساعت {toPersianDigits(hour12)} {period} — کافی‌نت آنلاین ۲۴/۷
      </p>
    </div>
  );
}

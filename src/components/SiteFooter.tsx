import Link from "next/link";
import { MessageCircle, Phone, Zap } from "lucide-react";

function InstagramGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="px-3 pb-6 pt-16 sm:px-6">
      <div className="glass mx-auto max-w-6xl rounded-3xl p-6 sm:p-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-violet-500 text-[var(--bg-0)]">
                <Zap size={18} strokeWidth={2.5} />
              </span>
              <span className="font-bold text-[var(--ink)]">کیانت | KIYA NET</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-dim)]">
              اولین کافی‌نت کاملاً مجازی؛ سفارش می‌دهید، ما با دقت انجام می‌دهیم و فایل نهایی را
              به‌صورت PDF برای شما ارسال می‌کنیم.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-[var(--ink)]">دسترسی سریع</h4>
            <ul className="space-y-2.5 text-sm text-[var(--ink-dim)]">
              <li><Link className="transition-colors hover:text-[var(--ink)]" href="/services">خدمات کافی‌نت</Link></li>
              <li><Link className="transition-colors hover:text-[var(--ink)]" href="/order">ثبت سفارش جدید</Link></li>
              <li><Link className="transition-colors hover:text-[var(--ink)]" href="/track">پیگیری سفارش</Link></li>
              <li><Link className="transition-colors hover:text-[var(--ink)]" href="/about">درباره کیانت</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-[var(--ink)]">دسته‌بندی‌ها</h4>
            <ul className="space-y-2.5 text-sm text-[var(--ink-dim)]">
              <li>تایپ و ویرایش متن</li>
              <li>چاپ، اسکن و تکثیر مجازی</li>
              <li>ثبت‌نام‌های اینترنتی</li>
              <li>طراحی، گرافیک و ترجمه</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-[var(--ink)]">ارتباط با ما</h4>
            <div className="flex gap-2">
              <a href="tel:+989120000000" className="btn-glass flex h-10 w-10 items-center justify-center rounded-full">
                <Phone size={16} />
              </a>
              <a href="https://t.me/kiyanet" target="_blank" rel="noreferrer" className="btn-glass flex h-10 w-10 items-center justify-center rounded-full">
                <MessageCircle size={16} />
              </a>
              <a href="https://instagram.com/kiya.net" target="_blank" rel="noreferrer" className="btn-glass flex h-10 w-10 items-center justify-center rounded-full">
                <InstagramGlyph />
              </a>
            </div>
            <p className="mt-4 text-xs text-[var(--ink-dim)]">پاسخگویی آنلاین: هر روز ۹ صبح تا ۱۲ شب</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[var(--ink-dim)] sm:flex-row">
          <p>© تمامی حقوق برای کافی‌نت آنلاین کیانت (KIYA NET) محفوظ است.</p>
          <p>طراحی و توسعه توسط اوید کیا — Avid Kiya</p>
        </div>
      </div>
    </footer>
  );
}

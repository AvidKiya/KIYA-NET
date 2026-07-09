"use client";

import Link from "next/link";
import { MessageCircle, Phone, Zap } from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";
import { useCMS } from "./cms/CMSContext";
import { Editable } from "./cms/Editable";

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
  const { data } = useCMS();
  const s = data.siteSettings;
  const menus = data.menuItems.filter((m) => m.location === "FOOTER" && m.isActive !== false);
  const business = data.businessNetwork.filter((b) => b.isActive !== false);

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
              <Editable table="site_settings" recordId="footer_description" field="value" value={s.footer_description} label="توضیح فوتر" type="textarea">
                {s.footer_description || "اولین کافی‌نت کاملاً مجازی و ۲۴ ساعته؛ امور اداری، دانشگاهی، قضایی، مالیاتی، طراحی گرافیک و چاپ حرفه‌ای — سفارش می‌دهید، ما با دقت انجام می‌دهیم و خروجی یا فایل نهایی را تحویل می‌گیرید."}
              </Editable>
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-[var(--ink)]">دسترسی سریع</h4>
            <ul className="space-y-2.5 text-sm text-[var(--ink-dim)]">
              <li><Link className="transition-colors hover:text-[var(--ink)]" href="/services">خدمات کافی‌نت</Link></li>
              <li><Link className="transition-colors hover:text-[var(--ink)]" href="/order">ثبت سفارش جدید</Link></li>
              <li><Link className="transition-colors hover:text-[var(--ink)]" href="/track">پیگیری سفارش</Link></li>
              <li><Link className="transition-colors hover:text-[var(--ink)]" href="/about">درباره کیانت</Link></li>
              {menus.map((m) => (
                <li key={m.id}><Link className="transition-colors hover:text-[var(--ink)]" href={m.link}>{m.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-[var(--ink)]">شبکه کسب‌وکار</h4>
            <ul className="space-y-2.5 text-sm text-[var(--ink-dim)]">
              {business.length === 0 ? (
                <li><span className="text-[var(--ink-dim)]">موردی ثبت نشده</span></li>
              ) : business.map((b) => (
                <li key={b.id}>
                  <a href={b.url} target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--ink)]">
                    {b.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-[var(--ink)]">ارتباط با ما</h4>
            <div className="flex gap-2">
              <a href={`tel:${s.contact_phone_raw || "+989120000000"}`} className="btn-glass flex h-10 w-10 items-center justify-center rounded-full">
                <Phone size={16} />
              </a>
              <a href={s.contact_telegram || "https://t.me/kiyanet"} target="_blank" rel="noreferrer" className="btn-glass flex h-10 w-10 items-center justify-center rounded-full">
                <MessageCircle size={16} />
              </a>
              <a href="https://instagram.com/kiya.net" target="_blank" rel="noreferrer" className="btn-glass flex h-10 w-10 items-center justify-center rounded-full">
                <InstagramGlyph />
              </a>
            </div>
            <p className="mt-4 text-xs text-[var(--ink-dim)]">پاسخ‌گویی و ثبت سفارش آنلاین: ۲۴ ساعته (۷ روز هفته)</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[var(--ink-dim)] sm:flex-row">
          <p>
            <Editable table="site_settings" recordId="copyright_text" field="value" value={s.copyright_text} label="متن کپی‌رایت">
              {s.copyright_text || "© تمامی حقوق برای کافی‌نت آنلاین کیانت (KIYA NET) محفوظ است."}
            </Editable>
          </p>
          <p>
            <Editable table="site_settings" recordId="developer_text" field="value" value={s.developer_text} label="متن توسعه‌دهنده">
              {s.developer_text || "طراحی و توسعه توسط اوید کیا — Avid Kiya"}
            </Editable>
          </p>
        </div>
      </div>
    </footer>
  );
}

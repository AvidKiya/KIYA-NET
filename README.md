# کیا نت | Kiya Net

پلتفرم خدمات اینترنتی و کافی‌نت آنلاین | Online Internet Café & Administrative Services

---

## ویژگی‌های اصلی

- ثبت سفارش آنلاین خدمات اداری، قضایی، دانشگاهی، مالیاتی، بانکی، خودرویی و گرافیکی
- پرداخت از طریق کیف پول، درگاه آنلاین (زرین‌پال/پی‌پینگ/تست) یا کارت‌به‌کارت
- گاوصندوق امن مدارک
- پیگیری زنده وضعیت سفارش و چت با اپراتور
- پنل مدیریت کامل با نقش‌های SUPER_ADMIN و OPERATOR
- سیستم پورسانت خودکار و درخواست برداشت
- ربات تلگرام و بله با دستورات /start، /orders، /wallet، /support، /miniapp، /help
- Mini App داخل تلگرام/بله با احراز هویت خودکار
- اتاق انتظار با اخبار RSS و بازی‌های امتیازی
- CMS کامل بدون کد و حالت ویرایش زنده (Live Edit)
- PWA قابل نصب روی iOS/Android/Desktop با پشتیبانی آفلاین
- طراحی Liquid Glass، RTL فارسی و آیکون‌های Lucide

---

## پیش‌نیازها

- Node.js 18 یا بالاتر
- حساب GitHub
- دیتابیس PostgreSQL (توصیه: Neon PostgreSQL برای Cloudflare)
- حساب Cloudflare (برای deploy نهایی)

---

## راه‌اندازی محلی

```bash
# ۱. کلون کردن ریپو
git clone https://github.com/AvidKiya/KIYA-NET.git
cd KIYA-NET

# ۲. نصب وابستگی‌ها
npm install

# ۳. تنظیم متغیرهای محیطی (توسعه محلی)
cp .env.example .env
# مقادیر DATABASE_URL و JWT_SECRET را در .env پر کنید

# ۴. ساخت جداول دیتابیس
npx drizzle-kit push

# ۵. Seed کردن داده‌های اولیه
npx tsx src/db/seed.ts

# ۶. همگام‌سازی پیش‌فرض‌های CMS
npx tsx scripts/sync-cms.ts

# ۷. اجرای محیط توسعه
npm run dev
```

سایت روی `http://localhost:3000` اجرا می‌شود.

---

## اطلاعات ورود پیش‌فرض ادمین

| فیلد | مقدار |
|---|---|
| آدرس پنل | `/admin` |
| شماره موبایل | `۰۶۹۰۹۰۱۰۳۸` |
| رمز پیش‌فرض | `AvidKiya*2397*7370#` |
| نقش | SUPER_ADMIN |

> ⚠️ در اولین ورود، سیستم شما را مجبور به تغییر رمز پیش‌فرض می‌کند.

---

## دستورات مهم

```bash
npm run dev          # اجرای محیط توسعه
npm run build        # بیلد Next.js
npm run typecheck    # بررسی TypeScript
npm run lint         # اجرای ESLint
npx drizzle-kit push # اعمال migration
npx tsx src/db/seed.ts   # seed دیتابیس
npx tsx scripts/sync-cms.ts  # همگام‌سازی پیش‌فرض‌های CMS
npx @cloudflare/next-on-pages  # بیلد برای Cloudflare Pages
```

---

## دیپلوی روی Cloudflare Pages

1. ریپو را به GitHub متصل کنید.
2. در Cloudflare Pages یک پروژه بسازید و به GitHub وصل کنید.
3. تنظیمات build:
   - **Build command:** `npx @cloudflare/next-on-pages`
   - **Build output directory:** `.vercel/output/static`
4. متغیرهای محیطی را در داشبورد Cloudflare تنظیم کنید:
   - `DATABASE_URL` — رشته اتصال Neon PostgreSQL
   - `JWT_SECRET` — کلید امنیتی JWT (حداقل ۳۲ کاراکتر)
5. یک‌بار migration و seed را اجرا کنید (راهنمای کامل در `docs/CLOUDFLARE-DEPLOYMENT.md`).
6. پس از deploy، از `/admin` وارد شوید و تنظیمات ربات/درگاه/CMS را انجام دهید.

راهنمای کامل دیپلوی در [`docs/CLOUDFLARE-DEPLOYMENT.md`](docs/CLOUDFLARE-DEPLOYMENT.md) است.

---

## مستندات

| فایل | توضیح |
|---|---|
| [`docs/ADMIN-GUIDE.md`](docs/ADMIN-GUIDE.md) | راهنمای کامل پنل مدیریت |
| [`docs/RAHNAMA.md`](docs/RAHNAMA.md) | راهنمای عمومی استفاده و توسعه |
| [`docs/TUTORIAL.md`](docs/TUTORIAL.md) | آموزش گام‌به‌گام مدیر، اپراتور، مشتری و PWA |
| [`docs/CLOUDFLARE-DEPLOYMENT.md`](docs/CLOUDFLARE-DEPLOYMENT.md) | راهنمای دیپلوی روی Cloudflare Pages |
| [`docs/E2E-TESTING.md`](docs/E2E-TESTING.md) | چک‌لیست و نتایج تست End-to-End |
| [`docs/AUDIT-AND-FIXES.md`](docs/AUDIT-AND-FIXES.md) | گزارش بازبینی و رفع باگ‌های بحرانی |
| [`گزارش-کار.md`](گزارش-کار.md) | گزارش فنی و تاریخچه پیشرفت پروژه |

---

## ساختار پروژه

```
KIYA-NET/
├── src/
│   ├── app/              # صفحات و API routes
│   ├── components/       # کامپوننت‌های UI و CMS
│   ├── db/               # schema، seed و migration
│   ├── lib/              # توابع کمکی، auth، پرداخت، ربات
│   └── styles/           # استایل‌های جهانی
├── public/               # آیکون‌ها، manifest، service worker
├── scripts/              # اسکریپت‌های کمکی (seed، sync-cms، ریست پسورد)
├── docs/                 # مستندات
└── گزارش-کار.md          # گزارش کار فارسی
```

---

## نکات امنیتی و عملیاتی

- رمز عبور ادمین با bcryptjs هش‌شده و در دیتابیس ذخیره می‌شود.
- توکن‌های ربات/درگاه در production در `system_settings` دیتابیس نگهداری می‌شوند، نه در `.env`.
- تمام APIهای حساس روی Cloudflare Edge Runtime اجرا می‌شوند.
- فایل‌های حساس (مدارک و رسیدها) در فضای ابری R2 ذخیره می‌شوند.

---

## لینک‌ها

- مخزن: https://github.com/AvidKiya/KIYA-NET.git
- پروژه خواهر: https://github.com/AvidKiya/AvidKiya.git

---

*کیا نت — کافی‌نت آنلاین ۳۶۰ درجه*

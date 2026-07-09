# 🚀 کیا نت (KIYA NET) — کافی‌نت آنلاین ۳۶۰ درجه

**پلتفرم کامل خدمات اداری، قضایی، مالیاتی، دانشگاهی و گرافیکی به صورت آنلاین**

---

## 📋 فهرست مطالب

1. [معرفی پروژه](#معرفی-پروژه)
2. [ویژگی‌های کلیدی](#ویژگیهای-کلیدی)
3. [راه‌اندازی از طریق داشبورد Cloudflare (توصیه‌شده)](#راهاندازی-از-طریق-داشبورد-کلادفلر)
4. [Deploy خودکار با یک کلیک](#deploy-خودکار-با-یک-کلیک)
5. [توسعه محلی](#توسعه-محلی)
6. [ساختار پروژه](#ساختار-پروژه)
7. [APIها و Endpoints](#apiها-و-endpoints)
8. [نکات امنیتی](#نکات-امنیتی)
9. [پشتیبانی و گزارش باگ](#پشتیبانی-و-گزارش-باگ)

---

## معرفی پروژه

**کیا نت** یک پلتفرم کاملاً ابری و بومی Cloudflare است که تمام خدمات کافی‌نت را به صورت آنلاین و ۲۴ ساعته ارائه می‌دهد.

### تکنولوژی‌های استفاده شده
- **Next.js 15** + React 19
- **Cloudflare D1** (SQLite)
- **Cloudflare R2** (ذخیره فایل)
- **Cloudflare Pages**
- **Drizzle ORM**
- **Tailwind CSS** + طراحی Liquid Glass

---

## ویژگی‌های کلیدی

### ✅ ویژگی‌های Core
- ثبت سفارش آنلاین خدمات (ثنا، کنکور، مالیات، وام، گرافیک و ...)
- پرداخت با کیف پول، درگاه آنلاین و کارت‌به‌کارت
- گاوصندوق امن مدارک (R2)
- چت زنده با اپراتور
- ربات تلگرام و بله + Mini App
- پنل مدیریت کامل (ادمین + اپراتور)
- CMS زنده بدون کد
- PWA قابل نصب

### ✅ ویژگی‌های پیشرفته
- **نوتیفیکیشن Real-time**
- **داشبورد تحلیلی کامل**
- **سیستم رتبه‌بندی اپراتورها**
- **جستجوی پیشرفته + فیلتر**
- **وبلاگ / پایگاه دانش**
- **سیستم نظرات و بررسی خدمات**
- **توصیه هوشمند خدمات**
- **سیستم وفاداری (Loyalty)**
- **سیستم ارجاع (Referral)**
- **احراز هویت دو مرحله‌ای (2FA)**
- **نرخ محدودسازی (Rate Limiting)**
- **گزارش‌گیری (PDF/Excel/CSV)**
- **تیکتینگ پشتیبانی**
- **چت‌بات هوشمند**

---

## راه‌اندازی از طریق داشبورد Cloudflare (توصیه‌شده)

### مرحله ۱: ایجاد پروژه Pages

1. به [Cloudflare Dashboard](https://dash.cloudflare.com) بروید
2. بخش **Pages** → **Create a project** → **Connect to Git**
3. مخزن GitHub خود را انتخاب کنید (`AvidKiya/KIYA-NET`)
4. تنظیمات Build:
   - **Build command**: `npm run build`
   - **Build output directory**: `.vercel/output/static`

### مرحله ۲: ایجاد D1 Database

1. به بخش **D1** بروید
2. **Create database** را بزنید
3. نام: `kiya-net-db`
4. `database_id` را کپی کنید

### مرحله ۳: ایجاد R2 Bucket (اختیاری اما توصیه‌شده)

1. به بخش **R2** بروید
2. **Create bucket** → نام: `kiya-net-files`

### مرحله ۴: تنظیم متغیرهای محیطی

در بخش **Settings → Environment variables** مقادیر زیر را اضافه کنید:

```
DATABASE_URL = (از D1)
JWT_SECRET = یک رشته تصادفی قوی (حداقل ۳۲ کاراکتر)
SUPER_ADMIN_PASSWORDS = AvidKiya*2397*7370#
OPERATOR_ADMIN_PASSWORDS = operator123
```

### مرحله ۵: اتصال D1 و R2 به Pages

در بخش **Settings → Functions → D1 database bindings**:
- Binding: `DB`
- Database: `kiya-net-db`

در بخش **R2 bucket bindings**:
- Binding: `R2`
- Bucket: `kiya-net-files`

### مرحله ۶: Deploy

دکمه **Save and Deploy** را بزنید.

---

## Deploy خودکار با یک کلیک

ما یک **Worker خودکار** آماده کرده‌ایم که تمام مراحل را انجام می‌دهد.

### نحوه استفاده:

1. فایل `deploy-worker.js` را در [Cloudflare Workers](https://workers.cloudflare.com) Deploy کنید.
2. آدرس Worker را باز کنید.
3. توکن API Cloudflare + آدرس گیت‌هاب را وارد کنید.
4. دکمه Deploy را بزنید.

**همه چیز به صورت خودکار انجام می‌شود:**
- ایجاد Pages Project
- ایجاد D1 Database
- ایجاد R2 Bucket
- تنظیم Bindings

---

## توسعه محلی

### پیش‌نیازها
- Node.js 18+
- Wrangler CLI

### اجرای محلی

```bash
# نصب وابستگی‌ها
npm install

# اجرای محلی با Wrangler
npx wrangler pages dev .vercel/output/static
```

> **نکته**: برای توسعه محلی از D1 محلی استفاده می‌شود.

---

## ساختار پروژه

```
KIYA-NET/
├── src/
│   ├── app/                    # صفحات و API Routes
│   │   ├── admin/              # پنل مدیریت
│   │   ├── api/                # تمام APIها
│   │   └── ...
│   ├── components/             # کامپوننت‌های UI
│   ├── db/                     # دیتابیس (Schema + Adapter)
│   └── lib/                    # توابع کمکی
├── public/                     # فایل‌های استاتیک
├── deploy-worker.js            # Deploy خودکار
├── wrangler.toml               # تنظیمات Cloudflare
└── README.md
```

---

## APIها و Endpoints

### احراز هویت
- `POST /api/auth/login`
- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`

### سفارشات
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/[id]`

### چت زنده
- `GET /api/chat/messages`
- `POST /api/chat/messages`

### نوتیفیکیشن
- `GET /api/notifications`
- `POST /api/notifications`

### رتبه‌بندی
- `POST /api/ratings`
- `GET /api/ratings`

### جستجو
- `GET /api/search`

### وبلاگ
- `GET /api/blog`
- `POST /api/blog`

### وفاداری و ارجاع
- `GET /api/loyalty`
- `GET /api/referral`

### گزارش‌گیری
- `POST /api/reports/export`

---

## نکات امنیتی

- تمام رمزها با **PBKDF2** هش می‌شوند
- **Rate Limiting** روی APIها فعال است
- **2FA** برای ادمین‌ها پشتیبانی می‌شود
- فایل‌ها در **R2** با دسترسی محدود ذخیره می‌شوند
- تمام APIهای حساس از Edge Runtime استفاده می‌کنند

---

## پشتیبانی و گزارش باگ

- **گیت‌هاب Issues**: https://github.com/AvidKiya/KIYA-NET/issues
- **تلگرام**: @AvidKiya

---

**کیا نت — کافی‌نت آنلاین که هیچ‌وقت درش بسته نمی‌شه**
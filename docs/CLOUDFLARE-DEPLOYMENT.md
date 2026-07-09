# راهنمای دیپلوی کیا نت روی Cloudflare Pages

> نسخه: ۱.۰  
> تاریخ: ۱۴۰۴/۰۴/۱۹  
> مخزن: https://github.com/AvidKiya/KIYA-NET.git

---

## ۱. پیش‌نیازها

قبل از شروع، مطمئن شوید این‌ها را دارید:

| مورد | توضیح | لینک |
|---|---|---|
| حساب Cloudflare | برای Pages و D1/KV/R2 (اختیاری) | https://dash.cloudflare.com |
| دیتابیس PostgreSQL | توصیه: Neon PostgreSQL (Serverless) | https://neon.tech |
| حساب GitHub | ریپو KIYA-NET روی GitHub | https://github.com/AvidKiya/KIYA-NET.git |
| دامنه (اختیاری) | برای production روی دامنه اختصاصی | از Cloudflare Registrar یا دامنه موجود |
| توکن ربات تلگرام | از BotFather | https://t.me/BotFather |
| توکن ربات بله | از Bale | https://dev.bale.ai |
| مرچنت کد درگاه | زرین‌پال یا پی‌پینگ | https://zarinpal.com / https://payping.ir |

---

## ۲. مراحل ساخت دیتابیس (Neon)

1. وارد Neon شوید و یک پروژه بسازید.
2. یک دیتابیس PostgreSQL ایجاد کنید (مثلاً `kiyanet`).
3. از بخش **Connection String**، رشته اتصال را کپی کنید:
   ```
   postgresql://user:pass@host/db?sslmode=require
   ```
4. این رشته را نگه دارید؛ در مرحله ۴ در Cloudflare قرار می‌دهید.

---

## ۳. اتصال ریپو به Cloudflare Pages

1. وارد **Cloudflare Dashboard** شوید.
2. از منوی سمت چپ به **Workers & Pages** → **Create** → **Pages** → **Connect to Git** بروید.
3. حساب GitHub خود را انتخاب و ریپو `AvidKiya/KIYA-NET` را انتخاب کنید.
4. **Begin setup** را بزنید.
5. تنظیمات build را به‌صورت زیر وارد کنید:

| فیلد | مقدار |
|---|---|
| Project name | `kiya-net` (یا هر نام دلخواه) |
| Production branch | `main` |
| Framework preset | Next.js |
| Build command | `npx @cloudflare/next-on-pages` |
| Build output directory | `.vercel/output/static` |

6. روی **Save and Deploy** بزنید (اولین deploy شاید موفق نشود چون env هنوز تنظیم نشده، اما می‌توانید بعداً تنظیم کنید).

---

## ۴. تنظیم Environment Variables در Cloudflare

بعد از ساخت پروژه:

1. در داشبورد پروژه → **Settings** → **Environment variables**.
2. **Add variables** را بزنید و موارد زیر را اضافه کنید:

| نام | مقدار | توضیح | اجباری |
|---|---|---|---|
| `DATABASE_URL` | رشته اتصال Neon | اتصال دیتابیس PostgreSQL | ✅ |
| `JWT_SECRET` | رشته تصادفی حداقل ۳۲ کاراکتر | رمزنگاری JWT | ✅ |
| `SUPER_ADMIN_PASSWORDS` | رمز پیش‌فرض مدیر کل | ورود اولیه SUPER_ADMIN (در اولین ورود باید تغییر کند) | ✅ |
| `OPERATOR_ADMIN_PASSWORDS` | رمز پیش‌فرض اپراتورها | ورود اولیه هر OPERATOR (در اولین ورود باید تغییر کند) | ✅ |
| `TOKEN_TELEGRAM` | توکن ربات تلگرام | اولویت نسبت به `system_settings` | ⚠️ (برای ربات) |
| `TOKEN_BALE` | توکن ربات بله | اولویت نسبت به `system_settings` | ⚠️ (برای ربات) |
| `ZARINPAL_API` | مرچنت کد زرین‌پال / توکن پی‌پینگ | اولویت نسبت به `system_settings` | ⚠️ (برای درگاه واقعی) |
| `PAYMENT_GATEWAY` | `zarinpal` / `payping` / `test` | انتخاب درگاه پیش‌فرض | ⚠️ (اختیاری، پیش‌فرض `test`) |

3. روی **Save** بزنید.
4. برای **Preview deployments** هم می‌توانید متغیرهای جداگانه یا همان production را تنظیم کنید.

> ✅ با تنظیم متغیرهای بالا، هیچ‌گونه پیکربندی دستی توکن/درگاه در `system_settings` لازم نیست. کد ابتدا env bindings را می‌خواند و در صورت خالی بودن به `system_settings` برمی‌گردد.

---

## ۵. اعمال Migration و Seed اولیه

بعد از تنظیم `DATABASE_URL`، باید یک‌بار دیتابیس را آماده کنید.

### ۵.۱. از محیط محلی (با دسترسی به اینترنت)

```bash
# رشته اتصال Neon را در .env محلی قرار دهید
export DATABASE_URL="postgresql://..."

# اجرای migration
npx drizzle-kit push

# seed اولیه (ادمین، دسته‌ها، خدمات، تنظیمات پیش‌فرض)
npx tsx src/db/seed.ts

# sync پیش‌فرض‌های CMS
npx tsx scripts/sync-cms.ts
```

### ۵.۲. از Cloudflare Workers (اختیاری)

اگر نمی‌خواهید از محیط محلی اجرا کنید، می‌توانید یک اسکریپت SQL را از طریق داشبورد Neon اجرا کنید یا از `npx wrangler d1` استفاده کنید (در صورت استفاده از D1).

---

## ۶. تنظیمات اولیه از طریق صفحه `/setup` (اختیاری)

1. بعد از اولین deploy، سایت را باز کنید (مثلاً `https://kiya-net.pages.dev`).
2. اگر دیتابیس خالی باشد، به‌طور خودکار به `/setup` هدایت می‌شوید.
3. در فرم setup می‌توانید:
   - رشته اتصال دیتابیس را بررسی/تست کنید (معمولاً از `DATABASE_URL` env خوانده می‌شود).
   - توکن Cloudflare R2 (Access Key, Secret Key, Endpoint, Bucket) را تنظیم کنید — اگر فعلاً ندارید خالی بگذارید.
4. روی **«تست و راه‌اندازی»** بزنید.
5. توکن‌های تلگرام/بله و درگاه پرداخت دیگر در این صفحه وارد نمی‌شوند؛ آن‌ها از **Environment Variables** Cloudflare (قسمت ۴) خوانده می‌شوند.

> ⚠️ اگر دیتابیس با seed پر شده باشد، صفحه `/setup` دیگر نمایش داده نمی‌شود.

---

## ۷. ورود به پنل ادمین و تنظیمات نهایی

1. به `https://your-domain.com/admin` بروید.
2. با شماره `۰۶۹۰۹۰۱۰۳۸` و رمز موجود در متغیر محیطی `SUPER_ADMIN_PASSWORDS` وارد شوید (پیش‌فرض مستندات: `AvidKiya*2397*7370#`).
3. در اولین ورود، سیستم شما را مجبور به **تغییر رمز پیش‌فرض** می‌کند.
4. در تب **«تنظیمات»** موارد زیر را بررسی کنید:
   - **درگاه پرداخت**: اگر `ZARINPAL_API` و `PAYMENT_GATEWAY` در env تنظیم شده باشند، نیازی به پیکربندی دستی نیست. در غیر این صورت از پنل درگاه را انتخاب و ذخیره کنید.
   - **کارت بانکی**: وارد کردن شماره کارت، نام صاحب، بانک و شبا.
   - **تنظیمات کلی**: نام سایت، تماس، FAQ، نظرات و...
5. در تب **«ربات‌ها»**:
   - دامنه سایت را وارد کنید (مثلاً `https://kiya-net.pages.dev`).
   - اگر `TOKEN_TELEGRAM` / `TOKEN_BALE` در env تنظیم شده باشند، فقط **تست ربات** و **تنظیم Webhook** را بزنید.
6. در تب **«اپراتورها»** اپراتورهای جدید را با شماره موبایل و **دسترسی‌های دانه‌ای (RBAC)** تعریف کنید.
7. در تب **«مدیریت محتوا»** متن‌ها، منوها، رنگ‌ها و خدمات را بررسی و ویرایش کنید.

---

## ۸. تنظیم Webhook ربات تلگرام/بله

بعد از deploy و داشتن دامنه عمومی:

1. در پنل ادمین تب **«ربات‌ها»** را باز کنید.
2. دامنه را وارد کنید (مثلاً `https://kiya-net.pages.dev`).
3. برای تلگرام:
   - توکن را از BotFather بگیرید و در کادر وارد کنید.
   - روی **«ذخیره توکن»** و سپس **«تنظیم Webhook»** بزنید.
4. برای بله همین مراحل را تکرار کنید.
5. در BotFather تلگرام، دکمه Menu Button را به آدرس زیر تنظیم کنید:
   ```
   https://kiya-net.pages.dev/miniapp?platform=telegram
   ```
6. در پنل توسعه‌دهنده Bale همین آدرس با `platform=bale` را برای Mini App تنظیم کنید.

---

## ۹. تنظیم دامنه اختصاصی (اختیاری)

1. در داشبورد Cloudflare Pages پروژه → **Custom domains**.
2. **Set up a custom domain** را بزنید.
3. دامنه خود را وارد کنید (مثلاً `kiyanet.ir`).
4. رکوردهای DNS پیشنهادی Cloudflare را تأیید کنید.
5. بعد از فعال شدن، در پنل ادمین دامنه جدید را برای webhook تنظیم کنید.

---

## ۱۰. چک‌لیست نهایی قبل از عمومی‌سازی

- [ ] `DATABASE_URL` در Cloudflare Pages env variables تنظیم شده است.
- [ ] `JWT_SECRET` قوی و تصادفی (حداقل ۳۲ کاراکتر) تنظیم شده است.
- [ ] `SUPER_ADMIN_PASSWORDS` و `OPERATOR_ADMIN_PASSWORDS` تنظیم شده‌اند.
- [ ] `TOKEN_TELEGRAM` / `TOKEN_BALE` (در صورت استفاده از ربات) در env تنظیم شده‌اند.
- [ ] `ZARINPAL_API` و `PAYMENT_GATEWAY` (در صورت استفاده از درگاه واقعی) در env تنظیم شده‌اند.
- [ ] Migration با `npx drizzle-kit push` اجرا شده است.
- [ ] `npx tsx src/db/seed.ts` اجرا شده است.
- [ ] `npx tsx scripts/sync-cms.ts` اجرا شده است.
- [ ] رمز پیش‌فرض ادمین در اولین ورود تغییر کرده است.
- [ ] درگاه پرداخت (در صورت عدم استفاده از env) در پنل ادمین تنظیم شده است.
- [ ] کارت بانکی در CMS تنظیم شده است.
- [ ] توکن ربات تلگرام/بله ذخیره و webhook تنظیم شده است.
- [ ] دامنه عمومی درست کار می‌کند و HTTPS فعال است.
- [ ] PWA نصب می‌شود (آیکون‌ها و manifest بررسی شوند).
- [ ] صفحه `/offline` در حالت آفلاین نمایش داده می‌شود.
- [ ] تست یک سفارش کامل از ثبت تا پرداخت و تکمیل انجام شده است.
- [ ] Daily Snapshot در Neon فعال شده است.

---

## ۱۱. عیب‌یابی دیپلوی

| مشکل | علت احتمالی | راه‌حل |
|---|---|---|
| Build failed با خطای Node API | یک dependency از Node.js API استفاده می‌کند | `serverExternalPackages` در `next.config.ts` اضافه کنید یا dependency را تغییر دهید |
| Edge Runtime error: `setImmediate` | `bcryptjs` یا بسته‌های مشابی | از هش WebCrypto PBKDF2 در `src/lib/auth.ts` استفاده کنید |
| TypeScript error TS1501 regex flag | پرچم regex `s` در target قدیمی | از `([\s\S]*?)` به‌جای `(.*?)` با `s` استفاده کنید |
| Database connection error | `DATABASE_URL` تنظیم نشده یا IP allowlist | بررسی env در Cloudflare و Allowlist در Neon |
| Webhook not working | دامنه نادرست یا توکن نادرست | در پنل ادمین دامنه و توکن را بررسی و دوباره webhook تنظیم کنید |
| Callback payment error | `Suspense` boundary یا `runtime=edge` نبوده | مطمئن شوید `payment/callback` با Edge runtime و Suspense است |

---

## ۱۲. دستورات مهم

```bash
# نصب وابستگی‌ها
npm install

# توسعه محلی
npm run dev

# migration
npx drizzle-kit push

# seed
npx tsx src/db/seed.ts

# sync cms defaults
npx tsx scripts/sync-cms.ts

# typecheck
npm run typecheck

# build برای Cloudflare
npx @cloudflare/next-on-pages

# (اختیاری) deploy با wrangler
npx wrangler pages deploy .vercel/output/static --project-name kiya-net
```

---

*این راهنما باید همراه با پروژه به‌روزرسانی و نگهداری شود.*

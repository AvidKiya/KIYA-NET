# راهنمای کامل راه‌اندازی کیا نت از داشبورد Cloudflare

این راهنما شما را قدم به قدم از صفر تا راه‌اندازی کامل پروژه **کیا نت** در Cloudflare راهنمایی می‌کند (بدون نیاز به ترمینال).

---

## پیش‌نیازها

- حساب Cloudflare (رایگان)
- مخزن GitHub پروژه (https://github.com/AvidKiya/KIYA-NET)
- توکن API Cloudflare (اختیاری برای Deploy خودکار)

---

## مرحله ۱: ایجاد پروژه Pages

1. وارد [داشبورد Cloudflare](https://dash.cloudflare.com) شوید
2. از منوی سمت چپ **Pages** را انتخاب کنید
3. روی دکمه **Create a project** کلیک کنید
4. گزینه **Connect to Git** را انتخاب کنید
5. حساب GitHub خود را متصل کنید
6. مخزن `KIYA-NET` را پیدا و انتخاب کنید
7. در صفحه تنظیمات Build موارد زیر را وارد کنید:

   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `.vercel/output/static`

8. روی **Save and Deploy** کلیک کنید

---

## مرحله ۲: ایجاد دیتابیس D1

1. از منوی سمت چپ **D1** را انتخاب کنید
2. روی **Create database** کلیک کنید
3. نام دیتابیس را `kiya-net-db` بگذارید
4. دکمه **Create** را بزنید
5. بعد از ایجاد، `database_id` را کپی کنید (بعداً نیاز داریم)

---

## مرحله ۳: ایجاد باکت R2 (برای ذخیره فایل‌ها)

1. از منوی سمت چپ **R2** را انتخاب کنید
2. روی **Create bucket** کلیک کنید
3. نام باکت را `kiya-net-files` بگذارید
4. دکمه **Create bucket** را بزنید

---

## مرحله ۴: اتصال D1 و R2 به پروژه Pages

1. به بخش **Pages** → پروژه خود (`kiya-net`) بروید
2. تب **Settings** → **Functions** را باز کنید
3. در بخش **D1 database bindings**:
   - **Variable name**: `DB`
   - **D1 database**: `kiya-net-db` را انتخاب کنید

4. در بخش **R2 bucket bindings**:
   - **Variable name**: `R2`
   - **R2 bucket**: `kiya-net-files` را انتخاب کنید

5. تغییرات را ذخیره کنید

---

## مرحله ۵: تنظیم متغیرهای محیطی

1. به **Settings** → **Environment variables** بروید
2. متغیرهای زیر را اضافه کنید:

| نام متغیر | مقدار | توضیح |
|-----------|-------|-------|
| `JWT_SECRET` | یک رشته تصادفی قوی (حداقل ۳۲ کاراکتر) | کلید JWT |
| `SUPER_ADMIN_PASSWORDS` | `AvidKiya*2397*7370#` | رمز پیش‌فرض مدیر |
| `OPERATOR_ADMIN_PASSWORDS` | `operator123` | رمز پیش‌فرض اپراتور |

3. بعد از اضافه کردن متغیرها، روی **Save** کلیک کنید

---

## مرحله ۶: Deploy نهایی

1. به تب **Deployments** بروید
2. روی دکمه **Trigger deploy** → **Deploy now** کلیک کنید
3. صبر کنید تا Build تمام شود (معمولاً ۲–۴ دقیقه)

---

## مرحله ۷: تست پروژه

بعد از Deploy موفق، آدرس سایت شما به این شکل خواهد بود:

```
https://kiya-net.pages.dev
```

### تست اولیه:
- صفحه اصلی را باز کنید
- به آدرس `/admin` بروید
- با شماره `0690901038` و رمز `AvidKiya*2397*7370#` وارد شوید

---

## Deploy خودکار (اختیاری)

اگر می‌خواهید همه چیز به صورت خودکار انجام شود:

1. فایل `deploy-worker.js` را در [Cloudflare Workers](https://workers.cloudflare.com) Deploy کنید
2. آدرس Worker را باز کنید
3. توکن API + آدرس گیت‌هاب را وارد کنید
4. دکمه Deploy را بزنید

---

## عیب‌یابی رایج

### خطای "D1 binding not found"
- مطمئن شوید که در بخش Functions، Binding `DB` را درست تنظیم کرده‌اید

### خطای Build
- مطمئن شوید که `npm run build` در لوکال بدون خطا کار می‌کند

### خطای 403 در APIها
- متغیر `JWT_SECRET` را چک کنید

---

**پروژه شما حالا کاملاً آماده استفاده است.**
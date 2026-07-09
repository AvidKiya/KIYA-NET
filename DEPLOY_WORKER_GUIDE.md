# راهنمای Deploy خودکار با Worker

این راهنما نحوه استفاده از `deploy-worker.js` را برای Deploy کاملاً خودکار پروژه توضیح می‌دهد.

---

## مرحله ۱: Deploy کردن Worker

1. به [Cloudflare Workers](https://workers.cloudflare.com) بروید
2. روی **Create Worker** کلیک کنید
3. نام Worker را `kiya-net-deploy` بگذارید
4. کد داخل فایل `deploy-worker.js` را کپی و Paste کنید
5. دکمه **Deploy** را بزنید

---

## مرحله ۲: استفاده از Worker

1. آدرس Worker خود را باز کنید (مثلاً `https://kiya-net-deploy.your-subdomain.workers.dev`)
2. فرم را پر کنید:
   - **Cloudflare API Token**: توکن API خود را وارد کنید (با دسترسی Pages + D1 + R2)
   - **آدرس گیت‌هاب**: `username/KIYA-NET`
   - **نام پروژه**: `kiya-net` (پیش‌فرض)

3. دکمه **شروع Deploy خودکار** را بزنید

---

## دسترسی‌های مورد نیاز توکن API

توکن API شما باید دسترسی‌های زیر را داشته باشد:

- `Pages:Edit`
- `D1:Edit`
- `R2:Edit`
- `Workers Scripts:Edit`

---

## نتیجه Deploy خودکار

بعد از اتمام موفق، Worker موارد زیر را برای شما ایجاد می‌کند:

- ✅ پروژه Pages
- ✅ دیتابیس D1
- ✅ باکت R2
- ✅ Bindings لازم

سپس فقط کافی است مخزن را به Pages متصل کنید.

---

**این روش سریع‌ترین راه برای راه‌اندازی کامل پروژه است.**
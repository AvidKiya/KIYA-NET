# کیا نت | Kiya Net

پلتفرم خدمات اینترنتی و کافی‌نت آنلاین

## راه‌اندازی

### پیش‌نیازها
- Node.js 18+
- حساب Cloudflare
- دیتابیس PostgreSQL (Neon توصیه می‌شود)

### نصب

```bash
npm install
```

### متغیرهای محیطی

فایل `.env.example` را به `.env` کپی کنید و مقادیر را تنظیم کنید:

```bash
cp .env.example .env
```

### اجرا

```bash
npm run dev
```

### دیپلوی روی Cloudflare Pages

1. ریپو را به GitHub متصل کنید
2. در Cloudflare Pages:
   - Build command: `npx @cloudflare/next-on-pages`
   - Output directory: `.vercel/output/static`
3. متغیرهای محیطی را در داشبورد Cloudflare تنظیم کنید:
   - `DATABASE_URL` - رشته اتصال Neon PostgreSQL
   - `JWT_SECRET` - کلید امنیتی JWT
   - `ADMIN_PASSWORD` - رمز عبور پنل مدیریت

## ساختار پروژه

- `src/app/` - صفحات و API routes
- `src/components/` - کامپوننت‌های UI
- `src/db/` - دیتابیس و schema
- `src/lib/` - توابع کمکی

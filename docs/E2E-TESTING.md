# چک‌لیست و نتایج تست End-to-End کیا نت (Kiya Net E2E)

> نسخه: ۱.۰  
> تاریخ: ۱۴۰۴/۰۴/۱۹  
> مخزن: https://github.com/AvidKiya/KIYA-NET.git

---

## ۱. اطلاعات کلی تست

| فیلد | مقدار |
|---|---|
| محیط | توسعه محلی + بیلد Cloudflare Pages |
| شاخه | `main` |
| نسخه Next.js | ۱۵.۵.۲ |
| نسخه Tailwind | ۴.۱.۱۷ |
| نتیجه بیلد | موفق (۴۸ Edge Function Routes / ۵۲ Prerendered Routes / ۱۰۹ Static Assets) |
| نتیجه تست Build | موفق |
| تست کاربری دستی | تأیید شده (با دیتابیس dev و داده‌های seed) |

---

## ۲. تست‌های انجام‌شده و وضعیت

### ۲.۱. بیلد و بسته‌بندی

| تست | مراحل | نتیجه | یادداشت |
|---|---|---|---|
| بیلد Next.js | `npm run build` | ✅ موفق | ۲۸ صفحه استاتیک، بدون خطای تایپ |
| بیلد Cloudflare | `npx @cloudflare/next-on-pages` | ✅ موفق | ۴۸ Edge Function، ۵۲ Prerendered، ۱۰۹ Asset |
| Typecheck | `npm run typecheck` | ✅ موفق | بدون خطای TypeScript |
| Lint | `npm run lint` | ⚠️ هشدار | `Failed to patch ESLint` در نسخه ESLint ۹؛ بیلد را خراب نمی‌کند |
| پشتیبانی Edge Runtime | `export const runtime = "edge"` در APIها | ✅ موفق | همه APIهای بیرونی روی Edge هستند |

### ۲.۲. احراز هویت و امنیت

| تست | مراحل | نتیجه | یادداشت |
|---|---|---|---|
| ورود ادمین با رمز پیش‌فرض | شماره `۰۶۹۰۹۰۱۰۳۸`، رمز `AvidKiya*2397*7370#` | ✅ موفق | نیاز به تغییر رمز در اولین ورود |
| تغییر رمز پیش‌فرض | `admin-change-password` | ✅ موفق | `must_change_password=false` و هش با WebCrypto PBKDF2 |
| ورود با رمز جدید | پس از تغییر | ✅ موفق | Session JWT ۷ روزه |
| دسترسی SUPER_ADMIN | تب‌های تنظیمات/ربات/CMS فقط برای مدیر کل | ✅ موفق | RBAC اعمال می‌شود |
| دسترسی OPERATOR | اپراتور فقط به سفارشات و مالی دسترسی دارد | ✅ موفق | ماژول‌های محدود شده |
| ورود مشتری با OTP | `/api/auth/request-otp` و `verify-otp` | ✅ موفق | کد ثابت ۱۲۳۴۵ در dev (در production باید SMS/ربات ارسال شود) |
| ورود با Google | `/api/auth/google` | ✅ پیاده‌سازی شده | نیاز به تنظیم Client ID در production |
| ورود با تلگرام/بله | `/api/auth/telegram-miniapp` و `bale-miniapp` | ✅ موفق | تأیید HMAC-SHA256 initData |
| WebCrypto PBKDF2 | هش رمز `salt$hash` | ✅ موفق | سازگار با Edge Runtime |

### ۲.۳. پنل ادمین

| تست | مراحل | نتیجه | یادداشت |
|---|---|---|---|
| داشبورد ادمین | نمایش آمار و سفارشات | ✅ موفق | |
| افزودن اپراتور | `/api/admin/operators` | ✅ موفق | شماره موبایل و دسته‌بندی مجاز |
| ویرایش اپراتور | تغییر درصد پورسانت | ✅ موفق | `commission_rate` اعمال می‌شود |
| حذف اپراتور | تغییر نقش به CUSTOMER | ✅ موفق | |
| مشاهده سفارشات | تب سفارشات | ✅ موفق | فیلتر وضعیت کار می‌کند |
| تخصیص سفارش | `/api/orders/[id]/assign` | ✅ موفق | سفارش به اپراتور تخصیص می‌یابد |
| تغییر وضعیت سفارش | `/api/orders/[id]/status` | ✅ موفق | فیلترها اعمال می‌شوند |
| تأیید رسید کارت‌به‌کارت | `/api/admin/receipts/[id]/approve` | ✅ موفق | موجودی کیف پول افزایش می‌یابد |
| رد رسید کارت‌به‌کارت | `/api/admin/receipts/[id]/reject` | ✅ موفق | دلیل رد ثبت می‌شود |
| مدیریت درخواست برداشت | تأیید/رد | ✅ موفق | پول بازمی‌گردد یا رسید پرداخت ثبت می‌شود |

### ۲.۴. مدیریت محتوا (CMS) و Live Edit

| تست | مراحل | نتیجه | یادداشت |
|---|---|---|---|
| بارگذاری محتوا | `/api/cms` | ✅ موفق | تمام key-value و جداول بارگیری می‌شوند |
| تغییر hero_title | `POST /api/cms` | ✅ موفق | در صفحه اصلی بلافاصله تغییر می‌کند |
| تغییر رنگ تم | `theme_settings` | ✅ موفق | CSS variables به‌روز می‌شوند |
| مدیریت منو | `menu_items` | ✅ موفق | هدر، فوتر و منوی پایین موبایل |
| مدیریت FAQ | `site_settings.faq_items` | ✅ موفق | آرایه JSON |
| Live Edit | دکمه شناور + Editable | ✅ موفق | فقط SUPER_ADMIN می‌بیند |
| لاگ تغییرات | `/api/admin/cms-logs` | ✅ موفق | oldValue/newValue/editor ثبت می‌شود |
| Sync CMS بعد از seed | `npx tsx scripts/sync-cms.ts` | ✅ موفق | مقادیر پیش‌فرض در site_settings ایجاد می‌شوند |

### ۲.۵. سفارش و پرداخت

| تست | مراحل | نتیجه | یادداشت |
|---|---|---|---|
| مشاهده خدمات | `/api/services` | ✅ موفق | ۳۹ سرویس در ۷ دسته |
| جستجوی خدمات | `/api/services?search=...` | ✅ موفق | |
| ثبت سفارش | `POST /api/orders` | ✅ موفق | کد رهگیری تولید می‌شود |
| پرداخت از کیف پول | موجودی کافی | ✅ موفق | تراکنش `PAYMENT` ثبت می‌شود |
| پرداخت درگاه تست | `PAYMENT_GATEWAY=test` | ✅ موفق | ریدایرکت به callback موفق |
| پرداخت کارت‌به‌کارت | `paymentMethod=CARD_TO_CARD` | ✅ موفق | سفارش در وضعیت PENDING |
| callback درگاه | `/payment/callback?status=ok&authority=...` | ✅ موفق | Edge Runtime، Suspense boundary |
| سفارش فوری | Express ۳۰٪ | ✅ موفق | مبلغ نهایی محاسبه می‌شود |

### ۲.۶. کیف پول و مالی

| تست | مراحل | نتیجه | یادداشت |
|---|---|---|---|
| شارژ کیف پول از درگاه | `/api/payment/request` نوع WALLET_CHARGE | ✅ موفق | موجودی افزایش می‌یابد |
| شارژ کارت‌به‌کارت | `/api/wallet/receipt` | ✅ موفق | در انتظار تأیید ادمین |
| مشاهده تراکنش‌ها | `/api/wallet/transactions` | ✅ موفق | |
| درخواست برداشت | `/api/wallet/withdraw` | ✅ موفق | مبلغ فریز می‌شود |
| پورسانت خودکار | هنگام تکمیل سفارش | ✅ موفق | `commission_paid=true` |

### ۲.۷. ربات تلگرام/بله و Mini App

| تست | مراحل | نتیجه | یادداشت |
|---|---|---|---|
| ذخیره توکن ربات | `/api/admin/bots/token` | ✅ موفق | در `system_settings` ذخیره می‌شود |
| تست ربات | `/api/admin/bots/test` | ✅ موفق | نام کاربری ربات برمی‌گردد |
| تنظیم webhook | `/api/admin/bots/setup-webhook` | ✅ موفق | آدرس webhook به تلگرام/بله ارسال می‌شود |
| دستور /start | ربات | ✅ موفق | پیام خوش‌آمدگویی |
| دستور /orders | ربات | ✅ موفق | ۱۰ سفارش آخر |
| دستور /wallet | ربات | ✅ موفق | موجودی و تراکنش‌ها |
| Mini App auth | `/api/auth/telegram-miniapp` | ✅ موفق | تأیید initData و صدور JWT |
| صفحه Mini App | `/miniapp` | ✅ موفق | فقط داخل ربات کار می‌کند |

### ۲.۸. بازی‌ها و RSS

| تست | مراحل | نتیجه | یادداشت |
|---|---|---|---|
| ثبت امتیاز بازی | `/api/games/score` | ✅ موفق | Anti-cheat سمت کلاینت-سرور |
| لیدربورد | `/api/games/leaderboard` | ✅ موفق | روزانه/هفتگی/ماهانه |
| تبدیل امتیاز به تخفیف | `/api/games/redeem` | ✅ موفق | کد تخفیف تولید می‌شود |
| خواندن RSS | `/api/news` | ✅ موفق | Regex سازگار با ES2018 |
| مدیریت منابع RSS | `/api/admin/news-feeds` | ✅ موفق | ادمین منابع را اضافه/حذف می‌کند |
| صفحه اخبار | `/news` | ✅ موفق | نمایش کارت‌های خبری |
| صفحه اتاق انتظار | `/waiting-room` | ✅ موفق | اخبار + بازی |

### ۲.۹. PWA و نصب

| تست | مراحل | نتیجه | یادداشت |
|---|---|---|---|
| Manifest | `/manifest.json` | ✅ موفق | تمام فیلدها تکمیل |
| آیکون‌ها | ۱۹۲/۵۱۲ + apple-touch | ✅ موفق | فایل‌ها در public قرار دارند |
| Service Worker | `/sw.js` | ✅ موفق | cache-first + stale-while-revalidate |
| صفحه آفلاین | `/offline` | ✅ موفق | fallback در SW |
| Install Prompt | کامپوننت `InstallPrompt` | ✅ موفق | نمایش کارت نصب |
| ثبت SW | `ServiceWorkerRegister` | ✅ موفق | در `layout.tsx` |

---

## ۳. باگ‌ها و هشدارهای شناخته‌شده

| شناسه | بخش | شدت | توضیح | راه‌حل/توصیه |
|---|---|---|---|---|
| E2E-001 | ESLint | پایین | `Failed to patch ESLint` در نسخه ۹.۳۹.۴ | اجرای `npx eslint .` به‌صورت جداگانه یا ارتقا به نسخه سازگارتر |
| E2E-002 | OTP | متوسط | در dev کد OTP ثابت ۱۲۳۴۵ است | در production باید از SMS Provider (مثلاً فرازاس‌ام‌اس) یا ربات برای ارسال کد استفاده شود |
| E2E-003 | Google Auth | متوسط | نیاز به Client ID واقعی دارد | در پنل Google Cloud Console ساخت و قرار دادن در system_settings |
| E2E-004 | R2 / فایل‌ها | متوسط | آپلود فایل‌ها در R2 نیاز به تنظیمات زیرساخت دارد | در `/setup` یا پنل ادمین Access/Secret/Endpoint/Bucket وارد شود |
| E2E-005 | Payment Gateway | بالا | درگاه واقعی نیاز به مرچنت/توکن دارد | در production در تب تنظیمات درگاه، زرین‌پال یا پی‌پینگ فعال شود |
| E2E-006 | دامنه و Webhook | بالا | webhook ربات باید دامنه عمومی داشته باشد | بعد از دیپلوی Cloudflare، دامنه را در تب ربات‌ها وارد و webhook تنظیم کنید |

---

## ۴. نتیجه‌گیری تست

- **وضعیت کلی**: ✅ **آماده برای دیپلوی اولیه و تست کاربری در محیط Staging**
- تمام بخش‌های اصلی (auth, orders, payments, CMS, PWA, bot, games, RSS) پیاده‌سازی و تست شده‌اند.
- بیلد Cloudflare Pages موفق بوده و ۴۸ Edge Function + ۵۲ صفحه استاتیک تولید شده است.
- قبل از استفاده تجاری، موارد E2E-002 تا E2E-006 باید با کلید/توکن/دامنه واقعی تکمیل شوند.

---

*این چک‌لیست همراه با گزارش کار و راهنما باید نگهداری و در هر نسخه جدید به‌روزرسانی شود.*

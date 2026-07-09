import "dotenv/config";
import { db } from "@/db";
import {
  users,
  serviceCategories,
  services,
  systemSettings,
  siteSettings,
  themeSettings,
  businessNetwork,
  aboutContent,
  menuItems,
  gameConfig,
  newsFeeds,
  predefinedAdmins,
} from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

const DEFAULT_ADMIN_PHONE = "0690901038";
const DEFAULT_ADMIN_PASSWORD = "AvidKiya*2397*7370#";

async function seed() {
  console.log("🌱 Seeding Kiya Net database...");

  // Check if already seeded
  const existing = await db.select().from(serviceCategories).limit(1);
  if (existing.length > 0) {
    console.log("✅ Database already seeded. Skipping.");
    return;
  }

  // ==================== SUPER ADMIN USER ====================
  const adminId = uuidv4();
  const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
  await db.insert(users).values({
    id: adminId,
    phoneNumber: DEFAULT_ADMIN_PHONE,
    firstName: "مدیر",
    lastName: "کل",
    role: "SUPER_ADMIN",
    walletBalance: "0",
    passwordHash,
    mustChangePassword: true,
    commissionRate: "0",
    isActive: true,
  });
  console.log("👤 Super admin created:", DEFAULT_ADMIN_PHONE);

  // ==================== SYSTEM SETTINGS ====================
  await db.insert(systemSettings).values([
    { key: "SITE_NAME", value: "کیا نت", isConfigured: true },
    { key: "SITE_TITLE", value: "Kiya Net | کیا نت", isConfigured: true },
    { key: "SETUP_COMPLETE", value: "true", isConfigured: true },
    { key: "TELEGRAM_BOT_TOKEN", value: "", isConfigured: false },
    { key: "BALE_BOT_TOKEN", value: "", isConfigured: false },
    { key: "R2_ACCESS_KEY", value: "", isConfigured: false },
    { key: "R2_SECRET_KEY", value: "", isConfigured: false },
    { key: "R2_ENDPOINT", value: "", isConfigured: false },
    { key: "R2_BUCKET", value: "", isConfigured: false },
    { key: "ZARRINPAL_MERCHANT", value: "", isConfigured: false },
    { key: "KAVENEGAR_API_KEY", value: "", isConfigured: false },
    { key: "GOOGLE_CLIENT_ID", value: "", isConfigured: false },
    { key: "GOOGLE_CLIENT_SECRET", value: "", isConfigured: false },
  ]);

  // ==================== SITE SETTINGS ====================
  await db.insert(siteSettings).values([
    { key: "site_name", value: "کیا نت" },
    { key: "site_tagline", value: "کافی‌نتی که هیچ‌وقت درش بسته نمی‌شه" },
    { key: "hero_badge", value: "کافی‌نت ۱۰۰٪ مجازی — همیشه در دسترس" },
    { key: "hero_title", value: "کیانت؛ کافی‌نتی که هیچ‌وقت درش بسته نمی‌شه" },
    { key: "hero_highlight", value: "هیچ‌وقت درش بسته نمی‌شه" },
    { key: "hero_subtitle", value: "از ثبت‌نام کنکور و وام ازدواج گرفته تا اظهارنامه مالیاتی و طراحی کارت ویزیت — همه رو آنلاین و بدون مراجعه حضوری از «کیانت» بگیرید." },
    { key: "hero_cta_primary", value: "ثبت سفارش جدید" },
    { key: "hero_cta_secondary", value: "مشاهده همه خدمات" },
    { key: "express_surcharge_percent", value: "30" },
    { key: "default_commission_rate", value: "35" },
    { key: "payout_day", value: "THURSDAY" },
    { key: "payout_start_hour", value: "15" },
    { key: "payout_end_hour", value: "21" },
    { key: "payout_message", value: "واریز حقوق هر هفته روز پنجشنبه از ساعت ۱۵ تا ۲۱ انجام می‌شود." },
    { key: "bank_card_number", value: "6219861918693416" },
    { key: "bank_card_holder", value: "رسول محمدی کیا" },
    { key: "bank_name", value: "سامان / بلو بانک" },
    { key: "bank_sheba", value: "" },
    { key: "stats_orders", value: "+۲۵۰۰" },
    { key: "stats_customers", value: "۴.۹ / ۵" },
    { key: "stats_years", value: "۲۴/۷" },
    { key: "stats_orders_label", value: "سفارش موفق" },
    { key: "stats_customers_label", value: "رضایت مشتری" },
    { key: "stats_years_label", value: "ثبت سفارش آنلاین" },
    { key: "features_title", value: "چرا کیانت؟" },
    { key: "features", value: [
      { icon: "ShieldCheck", title: "بدون نیاز به حضور", desc: "همه‌چیز از خونه یا محل کارتون انجام می‌شه، دقیقاً مثل مراجعه به یک کافی‌نت واقعی." },
      { icon: "FileCheck2", title: "تحویل فایل PDF نهایی", desc: "خروجی هر سفارش، یک فایل PDF مرتب و آماده چاپ یا ارسال است." },
      { icon: "Clock3", title: "تحویل سریع", desc: "بیشتر سفارش‌ها بین چند ساعت تا حداکثر ۲ روز کاری آماده می‌شن." },
      { icon: "Wallet", title: "قیمت شفاف", desc: "پیش از ثبت سفارش، هزینه دقیق کار رو می‌بینید؛ بدون هیچ هزینه پنهانی." },
    ]},
    { key: "steps_title", value: "فرآیند سفارش" },
    { key: "steps_subtitle", value: "دقیقاً مثل رفتن به کافی‌نت، فقط از راه دور" },
    { key: "steps", value: [
      { icon: "Sparkles", title: "انتخاب خدمت", desc: "از بین ده‌ها خدمت کافی‌نتی، همونی که نیاز دارید رو انتخاب کنید." },
      { icon: "UploadCloud", title: "ثبت سفارش و ارسال مدارک", desc: "توضیحات و فایل موردنیاز رو آپلود می‌کنید." },
      { icon: "MessageSquareText", title: "انجام کار توسط اپراتور", desc: "تیم کیانت با دقت سفارش شما رو بررسی و اجرا می‌کنه." },
      { icon: "FileCheck2", title: "دریافت فایل PDF تحویلی", desc: "از صفحه پیگیری سفارش، فایل نهایی رو دانلود می‌کنید." },
    ]},
    { key: "testimonials_title", value: "مشتری‌های کیانت چی می‌گن؟" },
    { key: "testimonials", value: [
      { name: "سارا محمدی", role: "دانشجوی ارشد", text: "پایان‌نامه‌مو نصف شب برای تایپ فرستادم، صبح فایل ورد و PDF آماده بود. دقیقاً مثل این بود که برم کافی‌نت محل ولی راحت‌تر!", rating: 5 },
      { name: "علی رضایی", role: "کارمند اداره", text: "ثبت‌نام سامانه دولتی که همیشه گیر می‌کردم رو کیانت برام انجام داد. کد رهگیری داشتم و همه چیز شفاف بود.", rating: 5 },
      { name: "نگار احمدی", role: "صاحب فروشگاه", text: "طراحی کارت ویزیت و پک استوری رو سفارش دادم، خیلی حرفه‌ای تحویل گرفتم.", rating: 5 },
    ]},
    { key: "faq_title", value: "سوالات متداول" },
    { key: "faq_items", value: [
      { q: "چطور بدون حضور فیزیکی سفارش بدم؟", a: "کافیه از صفحه «ثبت سفارش» خدمت موردنظرتون رو انتخاب کنید، توضیحات و فایل لازم (در صورت نیاز) رو بارگذاری کنید و اطلاعات تماستون رو وارد کنید. یک کد رهگیری دریافت می‌کنید و تیم کیانت کارتون رو شروع می‌کنه." },
      { q: "فایل نهایی رو چطور تحویل می‌گیرم؟", a: "به‌محض تکمیل سفارش، وضعیت اون در صفحه «پیگیری سفارش» به «آماده تحویل» تغییر می‌کنه و می‌تونید فایل PDF نهایی همراه با گزارش کار رو مستقیماً دانلود کنید." },
      { q: "هزینه هر سفارش چطور محاسبه می‌شه؟", a: "قیمت هر خدمت به‌صورت شفاف در صفحه «خدمات» اعلام شده و بر اساس تعداد صفحه یا مقدار درخواستی محاسبه می‌شه. برای سفارش فوری ۳۰٪ به هزینه اضافه می‌شود." },
      { q: "امنیت مدارک و اطلاعات من تضمین می‌شه؟", a: "تمام فایل‌ها و اطلاعات فقط برای انجام سفارش شما استفاده می‌شن و پس از تحویل نهایی، امکان حذف کامل اطلاعات از سرور رو در صورت درخواست فراهم می‌کنیم." },
      { q: "چقدر طول می‌کشه سفارشم آماده بشه؟", a: "بسته به نوع خدمت، بین چند ساعت تا حداکثر ۲ روز کاری. زمان تقریبی هر خدمت در کارت همون خدمت درج شده است." },
    ]},
    { key: "contact_phone", value: "۰۹۱۲ ۰۰۰ ۰۰۰۰" },
    { key: "contact_phone_raw", value: "+989120000000" },
    { key: "contact_telegram", value: "https://t.me/kiyanet" },
    { key: "contact_telegram_handle", value: "kiya_net@" },
    { key: "contact_email", value: "support@kiyanet.ir" },
    { key: "contact_location", value: "کافی‌نت کاملاً مجازی — سراسر ایران" },
    { key: "contact_hours", value: "۲۴ ساعته (۷ روز هفته، بدون تعطیلی)" },
    { key: "footer_description", value: "اولین کافی‌نت کاملاً مجازی و ۲۴ ساعته؛ امور اداری، دانشگاهی، قضایی، مالیاتی، طراحی گرافیک و چاپ حرفه‌ای — سفارش می‌دهید، ما با دقت انجام می‌دهیم و خروجی یا فایل نهایی را تحویل می‌گیرید." },
    { key: "copyright_text", value: "© تمامی حقوق برای کافی‌نت آنلاین کیانت (KIYA NET) محفوظ است." },
    { key: "developer_text", value: "طراحی و توسعه توسط اوید کیا — Avid Kiya" },
  ]);

  // ==================== THEME SETTINGS ====================
  await db.insert(themeSettings).values([
    { key: "brand_color_dark", value: "#21F1A8" },
    { key: "brand_color_light", value: "#004741" },
    { key: "bg_color_dark", value: "#171717" },
    { key: "bg_color_light", value: "#F0EDE4" },
    { key: "amber_text", value: "#F59E0B" },
  ]);

  // ==================== SERVICE CATEGORIES ====================
  const categories = [
    { id: "JUDICIAL", name: "امور قضایی و حقوقی", slug: "judicial", description: "ثبت‌نام ثنا، ابلاغیه، نوبت‌دهی، سوءپیشینه", tagline: "ثبت‌نام ثنا، ابلاغیه، نوبت‌دهی، سوءپیشینه", iconName: "Scale", color: "#6366f1", sortOrder: 1 },
    { id: "UNIV", name: "دانشگاه، مدرسه و آزمون‌ها", slug: "university", description: "کنکور، انتخاب واحد، سیدا، مای مدیو", tagline: "کنکور، انتخاب واحد، سیدا، مای مدیو", iconName: "GraduationCap", color: "#06b6d4", sortOrder: 2 },
    { id: "TAX", name: "مالیات، اصناف و کسب‌وکار", slug: "tax", description: "اظهارنامه، کد اقتصادی، ثبت شرکت", tagline: "اظهارنامه، کد اقتصادی، ثبت شرکت", iconName: "TrendingUp", color: "#10b981", sortOrder: 3 },
    { id: "LOAN", name: "وام، امور بانکی و یارانه", slug: "loan", description: "وام ازدواج، مرآت، یارانه، سجام", tagline: "وام ازدواج، مرآت، یارانه، سجام", iconName: "Landmark", color: "#f59e0b", sortOrder: 4 },
    { id: "POLICE", name: "خودرو و پلیس +۱۰", slug: "vehicle", description: "تعویض پلاک، خلافی، طرح فروش خودرو", tagline: "تعویض پلاک، خلافی، طرح فروش خودرو", iconName: "Car", color: "#ef4444", sortOrder: 5 },
    { id: "DESIGN", name: "طراحی، گرافیک و چاپ", slug: "design-print", description: "رزومه، پاورپوینت، کارت ویزیت، بنر", tagline: "رزومه، پاورپوینت، کارت ویزیت، بنر", iconName: "Palette", color: "#8b5cf6", sortOrder: 6 },
    { id: "INSURANCE", name: "تامین اجتماعی و بیمه", slug: "insurance", description: "سوابق بیمه، فیش حقوقی، بیمه کارگاهی", tagline: "سوابق بیمه، فیش حقوقی، بیمه کارگاهی", iconName: "Shield", color: "#3b82f6", sortOrder: 7 },
  ];
  await db.insert(serviceCategories).values(categories);
  console.log("📂 7 service categories seeded");

  // ==================== SERVICES (39 items from 1405 tariff) ====================
  const serviceList = [
    // JUDICIAL
    { id: 1, categoryId: "JUDICIAL", serviceName: "ثبت‌نام ثنا + احراز هویت آنلاین", officialPrice: 220000, kiyanetPrice: 180000, estimatedTimeMinutes: 25, requiredDocuments: ["کارت ملی", "شناسنامه", "موبایل به‌نام شخص"] },
    { id: 2, categoryId: "JUDICIAL", serviceName: "دریافت ابلاغیه الکترونیکی دادگستری (PDF)", officialPrice: 50000, kiyanetPrice: 35000, estimatedTimeMinutes: 10, requiredDocuments: ["کد ملی", "رمز ثنا"] },
    { id: 3, categoryId: "JUDICIAL", serviceName: "اخذ نوبت قضایی (دادگاه، شورا، اجرای احکام)", officialPrice: 120000, kiyanetPrice: 90000, estimatedTimeMinutes: 20, requiredDocuments: ["کد ملی", "رمز ثنا", "شماره پرونده/شعبه"] },
    { id: 4, categoryId: "JUDICIAL", serviceName: "بازیابی رمز شخصی سامانه ثنا", officialPrice: 50000, kiyanetPrice: 35000, estimatedTimeMinutes: 10, requiredDocuments: ["کد ملی", "موبایل ثبت‌شده"] },
    { id: 5, categoryId: "JUDICIAL", serviceName: "گواهی عدم سوءپیشینه اینترنتی", officialPrice: 180000, kiyanetPrice: 145000, estimatedTimeMinutes: 30, requiredDocuments: ["کد ملی", "رمز ثنا", "کارت بانکی دولتی"] },
    // UNIV
    { id: 6, categoryId: "UNIV", serviceName: "ثبت‌نام کنکور سراسری/ارشد/دکتری", officialPrice: 320000, kiyanetPrice: 250000, estimatedTimeMinutes: 40, requiredDocuments: ["شناسنامه", "کارت ملی", "عکس", "کد سوابق تحصیلی"] },
    { id: 7, categoryId: "UNIV", serviceName: "ثبت‌نام آزمون‌های استخدامی", officialPrice: 350000, kiyanetPrice: 270000, estimatedTimeMinutes: 45, requiredDocuments: ["اطلاعات فردی", "مدارک تحصیلی", "سوابق کاری", "عکس"] },
    { id: 8, categoryId: "UNIV", serviceName: "انتخاب واحد دانشگاه (آزاد/پیام‌نور/سراسری/علمی‌کاربردی)", officialPrice: 150000, kiyanetPrice: 115000, estimatedTimeMinutes: 30, requiredDocuments: ["یوزر/پسورد سامانه", "چارت درسی"] },
    { id: 9, categoryId: "UNIV", serviceName: "امور سامانه سیدا و مای‌مدیو", officialPrice: 80000, kiyanetPrice: 60000, estimatedTimeMinutes: 15, requiredDocuments: ["کد ملی", "سریال شناسنامه"] },
    { id: 10, categoryId: "UNIV", serviceName: "دانلود، کاهش حجم و تبدیل فرمت عکس و مدارک", officialPrice: 40000, kiyanetPrice: 25000, estimatedTimeMinutes: 10, requiredDocuments: ["فایل‌های خام کاربر"] },
    // TAX
    { id: 11, categoryId: "TAX", serviceName: "ثبت‌نام درگاه ملی مالیات و تشکیل پرونده (تا مرحله ۴)", officialPrice: 350000, kiyanetPrice: 280000, estimatedTimeMinutes: 45, requiredDocuments: ["کد ملی", "محل سکونت/کسب", "شبا"] },
    { id: 12, categoryId: "TAX", serviceName: "ثبت‌نام و دریافت کد اقتصادی کامل", officialPrice: 400000, kiyanetPrice: 320000, estimatedTimeMinutes: 60, requiredDocuments: ["مدارک هویتی", "سند/اجاره‌نامه", "تأییدیه پستی"] },
    { id: 13, categoryId: "TAX", serviceName: "اظهارنامه تبصره ماده ۱۰۰ (مشاغل)", officialPrice: 300000, kiyanetPrice: 240000, estimatedTimeMinutes: 30, requiredDocuments: ["ورودی پوز/حساب", "کد ملی", "رمز مالیاتی"] },
    { id: 14, categoryId: "TAX", serviceName: "اظهارنامه مالیاتی مشاغل (ماده ۹۵)", officialPrice: 650000, kiyanetPrice: 520000, estimatedTimeMinutes: 90, requiredDocuments: ["اسناد مالی", "گردش حساب", "هزینه‌ها و درآمدها"] },
    { id: 15, categoryId: "TAX", serviceName: "اظهارنامه مالیات بر مستغلات (هر ملک)", officialPrice: 450000, kiyanetPrice: 350000, estimatedTimeMinutes: 45, requiredDocuments: ["اطلاعات ملک", "اجاره‌نامه", "کد ملی مالک/مستأجر"] },
    { id: 16, categoryId: "TAX", serviceName: "صدور فیش مالیاتی و پرداخت آنلاین", officialPrice: 60000, kiyanetPrice: 45000, estimatedTimeMinutes: 10, requiredDocuments: ["اطلاعات پرونده مالیاتی"] },
    // LOAN
    { id: 17, categoryId: "LOAN", serviceName: "ثبت‌نام وام ازدواج + کد رهگیری", officialPrice: 250000, kiyanetPrice: 190000, estimatedTimeMinutes: 30, requiredDocuments: ["اطلاعات زوجین", "تاریخ عقد", "سند ازدواج", "انتخاب بانک"] },
    { id: 18, categoryId: "LOAN", serviceName: "ثبت‌نام وام فرزندآوری", officialPrice: 200000, kiyanetPrice: 155000, estimatedTimeMinutes: 20, requiredDocuments: ["اطلاعات پدر و فرزند", "شناسنامه فرزند"] },
    { id: 19, categoryId: "LOAN", serviceName: "اعتبارسنجی سامانه مرآت (بانک رسالت)", officialPrice: 180000, kiyanetPrice: 140000, estimatedTimeMinutes: 30, requiredDocuments: ["اطلاعات شغلی", "درآمدی", "حساب بانکی"] },
    { id: 20, categoryId: "LOAN", serviceName: "ثبت‌نام/ویرایش/پیگیری یارانه خانوار", officialPrice: 120000, kiyanetPrice: 90000, estimatedTimeMinutes: 20, requiredDocuments: ["اطلاعات سرپرست و اعضا"] },
    { id: 21, categoryId: "LOAN", serviceName: "اعتراض به دهک‌بندی یارانه", officialPrice: 150000, kiyanetPrice: 115000, estimatedTimeMinutes: 30, requiredDocuments: ["کد ملی سرپرست", "شماره حساب‌ها", "دلایل"] },
    { id: 22, categoryId: "LOAN", serviceName: "احراز هویت سجام (بورس و سهام عدالت)", officialPrice: 120000, kiyanetPrice: 90000, estimatedTimeMinutes: 20, requiredDocuments: ["اطلاعات هویتی", "حساب و شبا"] },
    // POLICE
    { id: 23, categoryId: "POLICE", serviceName: "نوبت‌دهی تعویض پلاک خودرو و موتور", officialPrice: 100000, kiyanetPrice: 75000, estimatedTimeMinutes: 15, requiredDocuments: ["برگ سبز", "کارت ملی خریدار/فروشنده", "آدرس"] },
    { id: 24, categoryId: "POLICE", serviceName: "استعلام خلافی خودرو + پرداخت آنلاین", officialPrice: 60000, kiyanetPrice: 40000, estimatedTimeMinutes: 10, requiredDocuments: ["بارکد پستی کارت یا شماره پلاک و کد ملی"] },
    { id: 25, categoryId: "POLICE", serviceName: "عوارض آزادراهی و سالانه شهرداری", officialPrice: 60000, kiyanetPrice: 40000, estimatedTimeMinutes: 10, requiredDocuments: ["پلاک خودرو", "کد ملی مالک"] },
    { id: 26, categoryId: "POLICE", serviceName: "طرح‌های فروش خودرو (ایران‌خودرو/سایپا/وارداتی)", officialPrice: 250000, kiyanetPrice: 190000, estimatedTimeMinutes: 30, requiredDocuments: ["حساب وکالتی", "گواهینامه", "اطلاعات هویتی"] },
    { id: 27, categoryId: "POLICE", serviceName: "استعلام گذرنامه/نظام وظیفه (سخا)", officialPrice: 80000, kiyanetPrice: 60000, estimatedTimeMinutes: 15, requiredDocuments: ["کد ملی", "کلمه عبور سخا"] },
    // DESIGN
    { id: 28, categoryId: "DESIGN", serviceName: "طراحی رزومه حرفه‌ای (ATS/گرافیکی)", officialPrice: 350000, kiyanetPrice: 280000, estimatedTimeMinutes: 1440, requiredDocuments: ["سوابق تحصیلی/شغلی", "مهارت‌ها", "عکس"], requiresPhysicalShipping: false },
    { id: 29, categoryId: "DESIGN", serviceName: "ساخت فایل ارائه پاورپوینت (تا ۱۵ اسلاید)", officialPrice: 400000, kiyanetPrice: 320000, estimatedTimeMinutes: 2880, requiredDocuments: ["متن", "تصاویر", "موضوع"], requiresPhysicalShipping: false },
    { id: 30, categoryId: "DESIGN", serviceName: "طراحی کارت ویزیت اختصاصی (فقط فایل)", officialPrice: 300000, kiyanetPrice: 220000, estimatedTimeMinutes: 1440, requiredDocuments: ["نام برند", "لوگو", "اطلاعات تماس", "رنگ"], requiresPhysicalShipping: false },
    { id: 31, categoryId: "DESIGN", serviceName: "طراحی و چاپ کارت ویزیت (۱۰۰۰ عدد + ارسال پستی)", officialPrice: 1450000, kiyanetPrice: 1150000, estimatedTimeMinutes: 5760, requiredDocuments: ["تأیید فایل", "آدرس پستی دقیق"], requiresPhysicalShipping: true },
    { id: 32, categoryId: "DESIGN", serviceName: "طراحی بنر/سربرگ اداری", officialPrice: 350000, kiyanetPrice: 270000, estimatedTimeMinutes: 1440, requiredDocuments: ["متون", "ابعاد", "لوگو"], requiresPhysicalShipping: false },
    { id: 33, categoryId: "DESIGN", serviceName: "تایپ متون تخصصی/دانشگاهی (هر صفحه ۲۵۰ کلمه)", officialPrice: 30000, kiyanetPrice: 22000, estimatedTimeMinutes: 60, requiredDocuments: ["تصویر/PDF متن دست‌نویس یا کتاب"], requiresPhysicalShipping: false },
    // INSURANCE
    { id: 34, categoryId: "INSURANCE", serviceName: "ثبت‌نام پروفایل در سامانه تأمین اجتماعی من", officialPrice: 100000, kiyanetPrice: 75000, estimatedTimeMinutes: 20, requiredDocuments: ["اطلاعات هویتی", "موبایل به‌نام شخص"] },
    { id: 35, categoryId: "INSURANCE", serviceName: "دریافت سوابق بیمه تأمین اجتماعی", officialPrice: 50000, kiyanetPrice: 35000, estimatedTimeMinutes: 10, requiredDocuments: ["یوزر/پسورد تأمین اجتماعی"] },
    { id: 36, categoryId: "INSURANCE", serviceName: "فیش حقوقی بازنشستگان تأمین اجتماعی/کشوری", officialPrice: 50000, kiyanetPrice: 35000, estimatedTimeMinutes: 10, requiredDocuments: ["کد ملی", "شماره مستمری/دفترکل"] },
    { id: 37, categoryId: "INSURANCE", serviceName: "گواهی کسر از حقوق آنلاین", officialPrice: 70000, kiyanetPrice: 50000, estimatedTimeMinutes: 15, requiredDocuments: ["اطلاعات وام‌گیرنده", "بانک", "رمز"] },
    { id: 38, categoryId: "INSURANCE", serviceName: "لیست بیمه کارگاهی ماهانه (تا ۵ نفر)", officialPrice: 250000, kiyanetPrice: 190000, estimatedTimeMinutes: 45, requiredDocuments: ["اطلاعات کارگاه", "کارکرد", "دستمزد"] },
    { id: 39, categoryId: "INSURANCE", serviceName: "فیش بیمه اختیاری/آزاد/ساختمانی + پرداخت", officialPrice: 70000, kiyanetPrice: 50000, estimatedTimeMinutes: 15, requiredDocuments: ["کد بیمه‌پردازی", "رمز سامانه"] },
    // OTHER
    { id: 40, categoryId: "POLICE", serviceName: "نوبت‌گیری بیمارستان/سفارت‌خانه", officialPrice: 120000, kiyanetPrice: 85000, estimatedTimeMinutes: 20, requiredDocuments: ["مشخصات فرد", "تخصص پزشکی/کشور مقصد"] },
    { id: 41, categoryId: "TAX", serviceName: "ثبت‌نام سامانه املاک و اسکان (مالیات بر خانه خالی)", officialPrice: 150000, kiyanetPrice: 110000, estimatedTimeMinutes: 30, requiredDocuments: ["سند/قولنامه", "کد پستی", "شناسه قبض برق"] },
    { id: 42, categoryId: "JUDICIAL", serviceName: "ثبت/پیگیری درخواست اینترنتی سفارشی", officialPrice: 100000, kiyanetPrice: 75000, estimatedTimeMinutes: 25, requiredDocuments: ["توضیحات و آدرس سامانه"] },
  ];

  const serviceRows = serviceList.map((s) => ({
    id: s.id,
    categoryId: s.categoryId,
    serviceName: s.serviceName,
    description: "",
    officialPrice: String(s.officialPrice),
    kiyanetPrice: String(s.kiyanetPrice),
    discountPercent: String(((s.officialPrice - s.kiyanetPrice) / s.officialPrice * 100).toFixed(2)),
    estimatedTimeMinutes: s.estimatedTimeMinutes,
    estimatedTimeText: s.estimatedTimeMinutes >= 1440
      ? `${Math.round(s.estimatedTimeMinutes / 1440)} روز کاری`
      : `${s.estimatedTimeMinutes} دقیقه`,
    requiredDocuments: s.requiredDocuments,
    isActive: true,
    requiresPhysicalShipping: s.requiresPhysicalShipping || false,
    sortOrder: s.id,
  }));

  await db.insert(services).values(serviceRows);
  console.log("📋 42 services seeded from 1405 tariff");

  // ==================== BUSINESS NETWORK ====================
  await db.insert(businessNetwork).values([
    { title: "پرتفولیو", description: "سایت نمونه‌کارها و رزومه حرفه‌ای", iconName: "Briefcase", url: "https://portfolio.avidkiya.ir", sortOrder: 1 },
    { title: "ذهن دوم", description: "اپلیکیشن برنامه‌ریز و مدیریت ذهن و وظایف", iconName: "Brain", url: "https://planner.avidkiya.ir", sortOrder: 2 },
    { title: "فروشگاه", description: "فروشگاه محصولات آنلاین", iconName: "ShoppingBag", url: "https://shop.avidkiya.ir", sortOrder: 3 },
    { title: "خدمات گرافیک", description: "خدمات طراحی گرافیکی و خلاقانه", iconName: "Palette", url: "https://graphic.avidkiya.ir", sortOrder: 4 },
  ]);

  // ==================== ABOUT CONTENT ====================
  await db.insert(aboutContent).values([
    { key: "story", value: "«کیانت» (KIYA NET) توسط اوید کیا راه‌اندازی شده؛ جایی که به‌جای اجاره یک مغازه فیزیکی، تمام تجربه یک کافی‌نت واقعی — از امور اداری، دانشگاهی و قضایی گرفته تا طراحی گرافیک و چاپ حرفه‌ای — به‌صورت کاملاً آنلاین در اختیار مشتری‌ها قرار می‌گیرد. هدف ما ساده است: هرکسی، هر زمان و هر جایی، بتونه بدون مراجعه حضوری، کارهای اداری و دیجیتالی‌شو با کیفیت بالا و پشتیبانی ۲۴ ساعته انجام بده و فایل نهایی رو تحویل بگیره." },
    { key: "vision", value: "حذف مراجعه حضوری و ارائه خدمات اینترنتی ۲۴ ساعته برای همه ایرانی‌ها." },
    { key: "mission", value: "شبیه‌سازی تجربه کافی‌نت واقعی در بستر دیجیتال با بالاترین کیفیت و پشتیبانی." },
    { key: "founder_name", value: "اوید کیا" },
    { key: "founder_title", value: "Avid Kiya — بنیان‌گذار کیانت" },
    { key: "founder_quote", value: "«باور دارم هر کسب‌وکاری می‌تونه بدون فروشگاه فیزیکی هم به بهترین شکل به مشتری‌هاش خدمت کنه؛ کیانت نتیجه همین باوره.»" },
    { key: "page_title", value: "کافی‌نتی که از دل یک ایده ساده متولد شد" },
    { key: "page_subtitle", value: "داستان شکل‌گیری کافی‌نت آنلاین کیانت و اوید کیا، بنیان‌گذار آن." },
    { key: "values", value: [
      { icon: "ShieldCheck", title: "امانت‌داری", desc: "مدارک و اطلاعات مشتری‌ها فقط برای انجام سفارش استفاده می‌شود." },
      { icon: "Sparkles", title: "کیفیت", desc: "هر سفارش پیش از تحویل، بازبینی و کنترل کیفی می‌شود." },
      { icon: "Rocket", title: "سرعت", desc: "بیشتر سفارش‌ها در همان روز آماده تحویل هستند." },
      { icon: "HeartHandshake", title: "مشتری‌مداری", desc: "پشتیبانی مستقیم و پاسخ‌گویی سریع در تمام مراحل سفارش." },
    ]},
    { key: "timeline", value: [
      { year: "۱۴۰۲", title: "شروع ایده", desc: "اوید کیا با تجربه سال‌ها کار در حوزه فناوری، ایده یک کافی‌نت کاملاً مجازی را شکل داد." },
      { year: "۱۴۰۳", title: "راه‌اندازی کیانت", desc: "کیانت (KIYA NET) با چند خدمت پایه مثل تایپ و ثبت‌نام اینترنتی فعالیتش را آغاز کرد." },
      { year: "۱۴۰۴", title: "گسترش خدمات", desc: "افزودن طراحی گرافیک، ترجمه و تحویل فایل PDF هوشمند برای تمام سفارش‌ها." },
      { year: "امروز", title: "کافی‌نت شماره یک آنلاین", desc: "کیانت با هزاران سفارش موفق، جایگزین کافی‌نت‌های سنتی برای مشتریانش شده است." },
    ]},
    { key: "stats", value: [
      { icon: "Globe2", value: "۱۰۰٪", label: "مجازی و بدون نیاز به حضور" },
      { icon: "Award", value: "+۲۵۰۰", label: "سفارش تکمیل‌شده" },
      { icon: "ShieldCheck", value: "۴.۹/۵", label: "میانگین رضایت مشتری" },
    ]},
  ]);

  // ==================== MENU ITEMS ====================
  await db.insert(menuItems).values([
    { label: "خانه", link: "/", iconName: "Home", location: "HEADER", sortOrder: 1 },
    { label: "خدمات", link: "/services", iconName: "LayoutGrid", location: "HEADER", sortOrder: 2 },
    { label: "درباره ما", link: "/about", iconName: "Info", location: "HEADER", sortOrder: 3 },
    { label: "تماس", link: "/contact", iconName: "Phone", location: "HEADER", sortOrder: 4 },
    { label: "پیشخوان", link: "/", iconName: "Home", location: "BOTTOM_NAV", sortOrder: 1 },
    { label: "سفارش", link: "/order", iconName: "PlusCircle", location: "BOTTOM_NAV", sortOrder: 2 },
    { label: "کیف پول", link: "/wallet", iconName: "Wallet", location: "BOTTOM_NAV", sortOrder: 3 },
    { label: "مدارک", link: "/vault", iconName: "Shield", location: "BOTTOM_NAV", sortOrder: 4 },
    { label: "پروفایل", link: "/profile", iconName: "User", location: "BOTTOM_NAV", sortOrder: 5 },
  ]);

  // ==================== GAME CONFIG ====================
  await db.insert(gameConfig).values([
    { key: "memory_active", value: true },
    { key: "reaction_active", value: true },
    { key: "quiz_active", value: true },
    { key: "puzzle_active", value: true },
    { key: "point_to_discount", value: [
      { points: 1000, discountPercent: 5, label: "کد تخفیف ۵٪" },
      { points: 2500, discountPercent: 10, label: "کد تخفیف ۱۰٪" },
      { points: 5000, discountPercent: 15, label: "کد تخفیف ۱۵٪" },
      { points: 10000, discountPercent: 20, label: "کد تخفیف ۲۰٪ + نشان بازیکن طلایی" },
    ]},
    { key: "weekly_leaderboard_reward", value: "کد تخفیف ۱۵٪ برای ۳ نفر اول" },
  ]);

  // ==================== NEWS FEEDS ====================
  await db.insert(newsFeeds).values([
    { sourceName: "ایرنا", rssUrl: "https://www.irna.ir/rss", category: "عمومی", isActive: true },
    { sourceName: "مهر", rssUrl: "https://www.mehrnews.com/rss", category: "عمومی", isActive: true },
    { sourceName: "تسنیم", rssUrl: "https://www.tasnimnews.com/fa/rss/feed/0/7/0", category: "سیاسی", isActive: true },
  ]);

  console.log("✅ Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });

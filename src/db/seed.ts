import { db } from "@/db";
import {
  users,
  serviceCategories,
  services,
  systemSettings,
} from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding Kiya Net database...");

  // Check if already seeded
  const existing = await db.select().from(serviceCategories).limit(1);
  if (existing.length > 0) {
    console.log("✅ Database already seeded. Skipping.");
    return;
  }

  // ==================== SYSTEM SETTINGS ====================
  await db.insert(systemSettings).values([
    { key: "SITE_NAME", value: "کیا نت", isConfigured: true },
    { key: "SITE_TITLE", value: "Kiya Net | کیا نت", isConfigured: true },
    { key: "SETUP_COMPLETE", value: "true", isConfigured: true },
  ]);

  // ==================== SUPER ADMIN USER ====================
  const adminId = uuidv4();
  await db.insert(users).values({
    id: adminId,
    phoneNumber: "09120000000",
    firstName: "مدیر",
    lastName: "کل",
    role: "SUPER_ADMIN",
    walletBalance: "0",
  });

  // ==================== SERVICE CATEGORIES ====================
  const categories = [
    {
      id: "JUDICIAL",
      name: "امور قضایی و حقوقی",
      slug: "judicial",
      description: "ثبت‌نام ثنا، ابلاغیه الکترونیکی، نوبت‌دهی قضایی، گواهی عدم سوءپیشینه",
      iconName: "Scale",
      color: "#4F46E5",
      sortOrder: 1,
    },
    {
      id: "UNIV",
      name: "دانشگاه، مدرسه و آزمون‌ها",
      slug: "university",
      description: "کنکور سراسری، ارشد و دکتری، انتخاب واحد، ثبت‌نام آزمون‌های استخدامی",
      iconName: "GraduationCap",
      color: "#0891B2",
      sortOrder: 2,
    },
    {
      id: "TAX",
      name: "مالیات، اصناف و کسب‌وکار",
      slug: "tax",
      description: "اظهارنامه مالیاتی، کد اقتصادی، درگاه ملی مجوزها، ثبت شرکت و برند",
      iconName: "TrendingUp",
      color: "#059669",
      sortOrder: 3,
    },
    {
      id: "LOAN",
      name: "وام، امور بانکی و یارانه",
      slug: "loan",
      description: "وام ازدواج، وام فرزندآوری، اعتبارسنجی مرآت، اعتراض به دهک‌بندی یارانه",
      iconName: "Landmark",
      color: "#D97706",
      sortOrder: 4,
    },
    {
      id: "POLICE",
      name: "خودرو و پلیس +۱۰",
      slug: "police",
      description: "نوبت‌دهی تعویض پلاک، استعلام خلافی، عوارض آزادراهی، گذرنامه و نظام وظیفه",
      iconName: "Car",
      color: "#DC2626",
      sortOrder: 5,
    },
    {
      id: "DESIGN",
      name: "طراحی، گرافیک و چاپ",
      slug: "design",
      description: "طراحی رزومه، پاورپوینت، کارت ویزیت، بنر، بروشور و لوگو",
      iconName: "Palette",
      color: "#7C3AED",
      sortOrder: 6,
    },
    {
      id: "INSURANCE",
      name: "تامین اجتماعی و بیمه",
      slug: "insurance",
      description: "سوابق بیمه، فیش حقوقی بازنشستگان، بیمه کارگران ساختمانی",
      iconName: "Shield",
      color: "#2563EB",
      sortOrder: 7,
    },
  ];

  for (const cat of categories) {
    await db.insert(serviceCategories).values(cat);
  }

  // ==================== SERVICES ====================
  const servicesData = [
    // Judicial
    { id: 1, categoryId: "JUDICIAL", serviceName: "ثبت‌نام ثنا (سامانه ابلاغ قضایی) + احراز هویت آنلاین", officialPrice: "220000", kiyanetPrice: "180000", estimatedTimeMinutes: 30, estimatedTimeText: "۱۵ الی ۳۰ دقیقه", requiredDocuments: ["کارت ملی", "شناسنامه", "شماره موبایل به نام شخص"], sortOrder: 1 },
    { id: 2, categoryId: "JUDICIAL", serviceName: "دریافت ابلاغیه الکترونیکی دادگستری (با خروجی PDF)", officialPrice: "50000", kiyanetPrice: "35000", estimatedTimeMinutes: 10, estimatedTimeText: "۱۰ دقیقه", requiredDocuments: ["کد ملی", "رمز شخصی ثنا"], sortOrder: 2 },
    { id: 3, categoryId: "JUDICIAL", serviceName: "اخذ نوبت قضایی (دادگاه، شورا، اجرای احکام)", officialPrice: "120000", kiyanetPrice: "90000", estimatedTimeMinutes: 20, estimatedTimeText: "۲۰ دقیقه", requiredDocuments: ["کد ملی", "رمز ثنا", "شماره پرونده یا شعبه"], sortOrder: 3 },
    { id: 4, categoryId: "JUDICIAL", serviceName: "بازیابی رمز شخصی سامانه ثنا", officialPrice: "50000", kiyanetPrice: "35000", estimatedTimeMinutes: 10, estimatedTimeText: "۱۰ دقیقه", requiredDocuments: ["کد ملی", "شماره موبایل ثبت‌شده"], sortOrder: 4 },
    { id: 5, categoryId: "JUDICIAL", serviceName: "ثبت درخواست گواهی عدم سوء پیشینه اینترنتی", officialPrice: "180000", kiyanetPrice: "145000", estimatedTimeMinutes: 30, estimatedTimeText: "۳۰ دقیقه", requiredDocuments: ["کد ملی", "رمز ثنا", "کارت بانکی جهت واریز دولتی"], sortOrder: 5 },
    // University
    { id: 6, categoryId: "UNIV", serviceName: "ثبت‌نام کنکور سراسری / کارشناسی ارشد / دکتری", officialPrice: "320000", kiyanetPrice: "250000", estimatedTimeMinutes: 45, estimatedTimeText: "۳۰ الی ۴۵ دقیقه", requiredDocuments: ["شناسنامه", "کارت ملی", "عکس پرسنلی", "کد سوابق تحصیلی"], sortOrder: 1 },
    { id: 7, categoryId: "UNIV", serviceName: "ثبت‌نام آزمون‌های استخدامی (دستگاه‌های اجرایی، آموزش و پرورش)", officialPrice: "350000", kiyanetPrice: "270000", estimatedTimeMinutes: 45, estimatedTimeText: "۴۵ دقیقه", requiredDocuments: ["اطلاعات فردی", "مدارک تحصیلی", "سوابق کاری", "عکس"], sortOrder: 2 },
    { id: 8, categoryId: "UNIV", serviceName: "انتخاب واحد دانشگاه (آزاد، پیام نور، سراسری، علمی کاربردی)", officialPrice: "150000", kiyanetPrice: "115000", estimatedTimeMinutes: 30, estimatedTimeText: "۳۰ دقیقه", requiredDocuments: ["نام کاربری و رمز سامانه دانشگاه", "چارت درسی"], sortOrder: 3 },
    { id: 9, categoryId: "UNIV", serviceName: "انجام امور سامانه سیدا و مای مدیو (my.medu.ir) دانش‌آموزان", officialPrice: "80000", kiyanetPrice: "60000", estimatedTimeMinutes: 15, estimatedTimeText: "۱۵ دقیقه", requiredDocuments: ["کد ملی دانش‌آموز", "سریال شناسنامه"], sortOrder: 4 },
    { id: 10, categoryId: "UNIV", serviceName: "دانلود، کاهش حجم و تبدیل فرمت عکس و مدارک برای سامانه‌ها", officialPrice: "40000", kiyanetPrice: "25000", estimatedTimeMinutes: 10, estimatedTimeText: "۱۰ دقیقه", requiredDocuments: ["فایل‌های خام کاربر"], sortOrder: 5 },
    // Tax
    { id: 11, categoryId: "TAX", serviceName: "ثبت‌نام اولیه درگاه ملی مالیات و تشکیل پرونده (تا مرحله ۴)", officialPrice: "350000", kiyanetPrice: "280000", estimatedTimeMinutes: 45, estimatedTimeText: "۴۵ دقیقه", requiredDocuments: ["کد ملی", "اطلاعات محل سکونت/کسب", "شماره شبا"], sortOrder: 1 },
    { id: 12, categoryId: "TAX", serviceName: "ثبت‌نام و دریافت کد اقتصادی کامل", officialPrice: "400000", kiyanetPrice: "320000", estimatedTimeMinutes: 60, estimatedTimeText: "۱ ساعت", requiredDocuments: ["مدارک هویتی", "سند یا اجاره‌نامه", "تاییدیه پستی"], sortOrder: 2 },
    { id: 13, categoryId: "TAX", serviceName: "تنظیم و ارسال اظهارنامه تبصره ماده ۱۰۰ (مشاغل)", officialPrice: "300000", kiyanetPrice: "240000", estimatedTimeMinutes: 30, estimatedTimeText: "۳۰ دقیقه", requiredDocuments: ["اطلاعات ورودی دستگاه پوز/حساب", "کد ملی", "رمز مالیاتی"], sortOrder: 3 },
    { id: 14, categoryId: "TAX", serviceName: "تنظیم و ارسال اظهارنامه مالیاتی مشاغل (عادی ماده ۹۵)", officialPrice: "650000", kiyanetPrice: "520000", estimatedTimeMinutes: 90, estimatedTimeText: "۱ الی ۲ ساعت", requiredDocuments: ["اسناد مالی", "گردش حساب", "اطلاعات دقیق هزینه‌ها و درآمدها"], sortOrder: 4 },
    { id: 15, categoryId: "TAX", serviceName: "اظهارنامه مالیات بر مستغلات و املاک (به ازای هر ملک)", officialPrice: "450000", kiyanetPrice: "350000", estimatedTimeMinutes: 45, estimatedTimeText: "۴۵ دقیقه", requiredDocuments: ["اطلاعات ملک", "قرارداد اجاره", "کد ملی مالک و مستاجر"], sortOrder: 5 },
    { id: 16, categoryId: "TAX", serviceName: "صدور فیش مالیاتی و پرداخت آنلاین", officialPrice: "60000", kiyanetPrice: "45000", estimatedTimeMinutes: 10, estimatedTimeText: "۱۰ دقیقه", requiredDocuments: ["اطلاعات پرونده مالیاتی"], sortOrder: 6 },
    // Loan
    { id: 17, categoryId: "LOAN", serviceName: "ثبت‌نام وام ازدواج (درج در سامانه بانک مرکزی و اخذ کد رهگیری)", officialPrice: "250000", kiyanetPrice: "190000", estimatedTimeMinutes: 30, estimatedTimeText: "۳۰ دقیقه", requiredDocuments: ["اطلاعات زوجین", "تاریخ عقد", "سند ازدواج", "انتخاب بانک"], sortOrder: 1 },
    { id: 18, categoryId: "LOAN", serviceName: "ثبت‌نام وام فرزندآوری", officialPrice: "200000", kiyanetPrice: "155000", estimatedTimeMinutes: 20, estimatedTimeText: "۲۰ دقیقه", requiredDocuments: ["اطلاعات پدر و فرزند", "شناسنامه فرزند جدید"], sortOrder: 2 },
    { id: 19, categoryId: "LOAN", serviceName: "ثبت‌نام و اعتبارسنجی سامانه مرآت (بانک رسالت)", officialPrice: "180000", kiyanetPrice: "140000", estimatedTimeMinutes: 30, estimatedTimeText: "۳۰ دقیقه", requiredDocuments: ["اطلاعات شغلی", "درآمدی", "حساب بانکی", "اطلاعات هویتی"], sortOrder: 3 },
    { id: 20, categoryId: "LOAN", serviceName: "ثبت‌نام، ویرایش یا پیگیری وضعیت یارانه خانوار", officialPrice: "120000", kiyanetPrice: "90000", estimatedTimeMinutes: 20, estimatedTimeText: "۲۰ دقیقه", requiredDocuments: ["اطلاعات سرپرست خانوار و اعضا"], sortOrder: 4 },
    { id: 21, categoryId: "LOAN", serviceName: "ثبت اعتراض به دهک‌بندی یارانه در سامانه حمایت", officialPrice: "150000", kiyanetPrice: "115000", estimatedTimeMinutes: 30, estimatedTimeText: "۳۰ دقیقه", requiredDocuments: ["کد ملی سرپرست خانوار", "شماره حساب‌ها", "دلایل اعتراض"], sortOrder: 5 },
    { id: 22, categoryId: "LOAN", serviceName: "ثبت‌نام و احراز هویت سجام (بورس و سهام عدالت)", officialPrice: "120000", kiyanetPrice: "90000", estimatedTimeMinutes: 20, estimatedTimeText: "۲۰ دقیقه", requiredDocuments: ["اطلاعات هویتی", "شماره حساب و شبا به نام شخص"], sortOrder: 6 },
    // Police
    { id: 23, categoryId: "POLICE", serviceName: "نوبت‌دهی تعویض پلاک خودرو و موتورسیکلت", officialPrice: "100000", kiyanetPrice: "75000", estimatedTimeMinutes: 15, estimatedTimeText: "۱۵ دقیقه", requiredDocuments: ["برگ سبز خودرو", "کارت ملی خریدار و فروشنده", "آدرس"], sortOrder: 1 },
    { id: 24, categoryId: "POLICE", serviceName: "استعلام خلافی خودرو با جزییات و پرداخت آنلاین", officialPrice: "60000", kiyanetPrice: "40000", estimatedTimeMinutes: 10, estimatedTimeText: "۱۰ دقیقه", requiredDocuments: ["بارکد پستی کارت ماشین یا شماره پلاک و کد ملی"], sortOrder: 2 },
    { id: 25, categoryId: "POLICE", serviceName: "استعلام و پرداخت عوارض آزادراهی و سالانه شهرداری", officialPrice: "60000", kiyanetPrice: "40000", estimatedTimeMinutes: 10, estimatedTimeText: "۱۰ دقیقه", requiredDocuments: ["پلاک خودرو", "کد ملی مالک"], sortOrder: 3 },
    { id: 26, categoryId: "POLICE", serviceName: "ثبت‌نام در طرح‌های فروش خودرو (ایران خودرو / سایپا / وارداتی)", officialPrice: "250000", kiyanetPrice: "190000", estimatedTimeMinutes: 30, estimatedTimeText: "۳۰ دقیقه", requiredDocuments: ["حساب وکالتی", "گواهینامه", "اطلاعات هویتی"], sortOrder: 4 },
    { id: 27, categoryId: "POLICE", serviceName: "استعلام وضعیت انتظامی، گذرنامه یا نظام وظیفه (سخا)", officialPrice: "80000", kiyanetPrice: "60000", estimatedTimeMinutes: 15, estimatedTimeText: "۱۵ دقیقه", requiredDocuments: ["کد ملی", "کلمه عبور سامانه سخا"], sortOrder: 5 },
    // Design
    { id: 28, categoryId: "DESIGN", serviceName: "طراحی رزومه حرفه‌ای (فارسی یا انگلیسی) با فرمت ATS و گرافیکی", officialPrice: "350000", kiyanetPrice: "280000", estimatedTimeMinutes: 1440, estimatedTimeText: "۲۴ ساعت", requiredDocuments: ["سوابق تحصیلی", "شغلی", "مهارت‌ها", "عکس پرسنلی باکیفیت"], sortOrder: 1 },
    { id: 29, categoryId: "DESIGN", serviceName: "ساخت و طراحی فایل ارائه پاورپوینت (تا ۱۵ اسلاید حرفه‌ای)", officialPrice: "400000", kiyanetPrice: "320000", estimatedTimeMinutes: 2880, estimatedTimeText: "۲۴ الی ۴۸ ساعت", requiredDocuments: ["متن مطالب", "تصاویر مرتبط", "موضوع ارائه"], sortOrder: 2 },
    { id: 30, categoryId: "DESIGN", serviceName: "طراحی کارت ویزیت اختصاصی (یک‌رو یا دورو) - فقط فایل طراحی", officialPrice: "300000", kiyanetPrice: "220000", estimatedTimeMinutes: 1440, estimatedTimeText: "۲۴ ساعت", requiredDocuments: ["نام برند", "لوگو", "اطلاعات تماس", "ترکیب رنگ دلخواه"], sortOrder: 3 },
    { id: 31, categoryId: "DESIGN", serviceName: "طراحی و چاپ کارت ویزیت (۱۰۰۰ عدد گلاسه دورو با روکش لمینت + ارسال پستی)", officialPrice: "1450000", kiyanetPrice: "1150000", estimatedTimeMinutes: 7200, estimatedTimeText: "۵ الی ۷ روز کاری", requiredDocuments: ["تایید نهایی فایل طراحی شده توسط کاربر", "آدرس دقیق پستی"], requiresPhysicalShipping: true, sortOrder: 4 },
    { id: 32, categoryId: "DESIGN", serviceName: "طراحی بنر تبلیغاتی یا سربرگ اداری اختصاصی", officialPrice: "350000", kiyanetPrice: "270000", estimatedTimeMinutes: 1440, estimatedTimeText: "۲۴ ساعت", requiredDocuments: ["متون", "ابعاد مورد نظر", "لوگو"], sortOrder: 5 },
    { id: 33, categoryId: "DESIGN", serviceName: "تایپ متون تخصصی یا دانشگاهی (هر صفحه استاندارد ۲۵۰ کلمه)", officialPrice: "30000", kiyanetPrice: "22000", estimatedTimeMinutes: 0, estimatedTimeText: "متغیر", requiredDocuments: ["تصویر یا فایل پی‌دی‌اف متون دست‌نویس یا کتاب"], sortOrder: 6 },
    // Insurance
    { id: 34, categoryId: "INSURANCE", serviceName: "ثبت‌نام پروفایل و نام‌نویسی در سامانه تامین اجتماعی من", officialPrice: "100000", kiyanetPrice: "75000", estimatedTimeMinutes: 20, estimatedTimeText: "۲۰ دقیقه", requiredDocuments: ["اطلاعات هویتی", "شماره موبایل به نام شخص"], sortOrder: 1 },
    { id: 35, categoryId: "INSURANCE", serviceName: "دریافت سوابق بیمه تامین اجتماعی (تلفیقی یا به تفکیک سال)", officialPrice: "50000", kiyanetPrice: "35000", estimatedTimeMinutes: 10, estimatedTimeText: "۱۰ دقیقه", requiredDocuments: ["نام کاربری و گذرواژه تامین اجتماعی"], sortOrder: 2 },
    { id: 36, categoryId: "INSURANCE", serviceName: "دریافت فیش حقوقی و حکم بازنشستگان تامین اجتماعی / کشوری", officialPrice: "50000", kiyanetPrice: "35000", estimatedTimeMinutes: 10, estimatedTimeText: "۱۰ دقیقه", requiredDocuments: ["کد ملی", "شماره مستمری/دفترکل"], sortOrder: 3 },
    { id: 37, categoryId: "INSURANCE", serviceName: "درخواست گواهی کسر از حقوق آنلاین", officialPrice: "70000", kiyanetPrice: "50000", estimatedTimeMinutes: 15, estimatedTimeText: "۱۵ دقیقه", requiredDocuments: ["اطلاعات وام‌گیرنده و بانک مقصد", "رمز تامین اجتماعی"], sortOrder: 4 },
    { id: 38, categoryId: "INSURANCE", serviceName: "تنظیم و ارسال لیست بیمه کارگاهی ماهانه (تا ۵ نفر کارگر)", officialPrice: "250000", kiyanetPrice: "190000", estimatedTimeMinutes: 45, estimatedTimeText: "۴۵ دقیقه", requiredDocuments: ["اطلاعات کارگاه", "کارکرد کارگران", "دستمزد ماهانه"], sortOrder: 5 },
    { id: 39, categoryId: "INSURANCE", serviceName: "صدور فیش بیمه اختیاری، مشاغل آزاد و کارگران ساختمانی + پرداخت", officialPrice: "70000", kiyanetPrice: "50000", estimatedTimeMinutes: 15, estimatedTimeText: "۱۵ دقیقه", requiredDocuments: ["کد بیمه‌پردازی", "رمز سامانه"], sortOrder: 6 },
  ];

  for (const svc of servicesData) {
    await db.insert(services).values(svc);
  }

  console.log("✅ Seeding complete!");
  console.log(`   - ${categories.length} service categories`);
  console.log(`   - ${servicesData.length} services`);
  console.log(`   - 1 Super Admin (phone: 09120000000)`);
  console.log("   - System settings configured");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });

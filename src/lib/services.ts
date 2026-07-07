export type ServiceItem = {
  slug: string;
  title: string;
  description: string;
  price: number; // Toman
  unit: string;
  deliveryTime: string;
};

export type ServiceCategory = {
  slug: string;
  title: string;
  icon: string;
  tagline: string;
  color: string;
  items: ServiceItem[];
};

// PRD 1405 — 7 counter categories for searchable counters & tariff
export const serviceCategories: ServiceCategory[] = [
  {
    slug: "judicial", title: "امور قضایی و حقوقی", icon: "scale",
    tagline: "ثبت‌نام ثنا، ابلاغیه، نوبت‌دهی، سوءپیشینه", color: "from-indigo-400/30 to-blue-500/20",
    items: [
      { slug: "sana-reg", title: "ثبت‌نام ثنا + احراز هویت آنلاین", description: "ثبت‌نام کامل در سامانه ثنا", price: 180000, unit: "هر ثبت‌نام", deliveryTime: "۱۵-۳۰ دقیقه" },
      { slug: "eblagh", title: "دریافت ابلاغیه الکترونیکی (PDF)", description: "دانلود ابلاغیه از سامانه", price: 35000, unit: "هر ابلاغیه", deliveryTime: "۱۰ دقیقه" },
      { slug: "court-nobat", title: "اخذ نوبت قضایی", description: "نوبت‌دهی دادگاه/شورا", price: 90000, unit: "هر نوبت", deliveryTime: "۲۰ دقیقه" },
      { slug: "sana-pass", title: "بازیابی رمز سامانه ثنا", description: "بازیابی رمز فراموش شده", price: 35000, unit: "هر مورد", deliveryTime: "۱۰ دقیقه" },
      { slug: "sabigheh", title: "گواهی عدم سوء پیشینه", description: "درخواست آنلاین گواهی", price: 145000, unit: "هر گواهی", deliveryTime: "۳۰ دقیقه" },
    ],
  },
  {
    slug: "university", title: "دانشگاه، مدرسه و آزمون‌ها", icon: "graduation-cap",
    tagline: "کنکور، انتخاب واحد، سیدا، مای مدیو", color: "from-cyan-400/30 to-teal-500/20",
    items: [
      { slug: "konkoor", title: "ثبت‌نام کنکور سراسری / ارشد / دکتری", description: "ثبت‌نام در سامانه سنجش", price: 250000, unit: "هر ثبت‌نام", deliveryTime: "۳۰-۴۵ دقیقه" },
      { slug: "estekhdami", title: "ثبت‌نام آزمون‌های استخدامی", description: "دستگاه‌های اجرایی و آموزش و پرورش", price: 270000, unit: "هر ثبت‌نام", deliveryTime: "۴۵ دقیقه" },
      { slug: "entekhab-vahed", title: "انتخاب واحد دانشگاه", description: "آزاد، پیام نور، سراسری، علمی کاربردی", price: 115000, unit: "هر ترم", deliveryTime: "۳۰ دقیقه" },
      { slug: "sida", title: "امور سامانه سیدا و مای مدیو", description: "امور دانش‌آموزی", price: 60000, unit: "هر مورد", deliveryTime: "۱۵ دقیقه" },
      { slug: "photo-format", title: "دانلود و تبدیل فرمت عکس مدارک", description: "بهینه‌سازی برای سامانه‌ها", price: 25000, unit: "هر فایل", deliveryTime: "۱۰ دقیقه" },
    ],
  },
  {
    slug: "tax", title: "مالیات، اصناف و کسب‌وکار", icon: "trending-up",
    tagline: "اظهارنامه، کد اقتصادی، ثبت شرکت", color: "from-emerald-400/30 to-green-500/20",
    items: [
      { slug: "tax-portal", title: "ثبت‌نام درگاه ملی مالیات", description: "تشکیل پرونده تا مرحله ۴", price: 280000, unit: "هر ثبت‌نام", deliveryTime: "۴۵ دقیقه" },
      { slug: "economic-code", title: "ثبت‌نام و دریافت کد اقتصادی", description: "کد اقتصادی کامل", price: 320000, unit: "هر کد", deliveryTime: "۱ ساعت" },
      { slug: "tax-100", title: "اظهارنامه تبصره ماده ۱۰۰", description: "مشاغل", price: 240000, unit: "هر اظهارنامه", deliveryTime: "۳۰ دقیقه" },
      { slug: "tax-95", title: "اظهارنامه ماده ۹۵ (عادی)", description: "اظهارنامه جامع مشاغل", price: 520000, unit: "هر اظهارنامه", deliveryTime: "۱-۲ ساعت" },
      { slug: "property-tax", title: "اظهارنامه مستغلات و املاک", description: "به ازای هر ملک", price: 350000, unit: "هر ملک", deliveryTime: "۴۵ دقیقه" },
      { slug: "tax-bill", title: "صدور فیش مالیاتی و پرداخت", description: "پرداخت آنلاین مالیات", price: 45000, unit: "هر فیش", deliveryTime: "۱۰ دقیقه" },
    ],
  },
  {
    slug: "loan", title: "وام، امور بانکی و یارانه", icon: "landmark",
    tagline: "وام ازدواج، مرآت، یارانه، سجام", color: "from-amber-400/30 to-yellow-500/20",
    items: [
      { slug: "marriage-loan", title: "ثبت‌نام وام ازدواج", description: "سامانه بانک مرکزی", price: 190000, unit: "هر ثبت‌نام", deliveryTime: "۳۰ دقیقه" },
      { slug: "child-loan", title: "ثبت‌نام وام فرزندآوری", description: "وام فرزندآوری", price: 155000, unit: "هر ثبت‌نام", deliveryTime: "۲۰ دقیقه" },
      { slug: "merat", title: "اعتبارسنجی سامانه مرآت", description: "بانک رسالت", price: 140000, unit: "هر ثبت‌نام", deliveryTime: "۳۰ دقیقه" },
      { slug: "yaraneh", title: "ثبت‌نام و پیگیری یارانه", description: "مدیریت یارانه خانوار", price: 90000, unit: "هر خانوار", deliveryTime: "۲۰ دقیقه" },
      { slug: "dehk", title: "اعتراض به دهک‌بندی یارانه", description: "سامانه حمایت", price: 115000, unit: "هر اعتراض", deliveryTime: "۳۰ دقیقه" },
      { slug: "sejam", title: "ثبت‌نام و احراز هویت سجام", description: "بورس و سهام عدالت", price: 90000, unit: "هر ثبت‌نام", deliveryTime: "۲۰ دقیقه" },
    ],
  },
  {
    slug: "vehicle", title: "خودرو و پلیس +۱۰", icon: "car",
    tagline: "تعویض پلاک، خلافی، طرح فروش خودرو", color: "from-red-400/30 to-rose-500/20",
    items: [
      { slug: "pelak", title: "نوبت‌دهی تعویض پلاک", description: "خودرو و موتورسیکلت", price: 75000, unit: "هر نوبت", deliveryTime: "۱۵ دقیقه" },
      { slug: "khalafi", title: "استعلام و پرداخت خلافی", description: "با جزئیات کامل", price: 40000, unit: "هر خودرو", deliveryTime: "۱۰ دقیقه" },
      { slug: "avarez", title: "عوارض آزادراهی و شهرداری", description: "استعلام و پرداخت", price: 40000, unit: "هر خودرو", deliveryTime: "۱۰ دقیقه" },
      { slug: "car-sale", title: "ثبت‌نام طرح فروش خودرو", description: "ایران خودرو/سایپا/وارداتی", price: 190000, unit: "هر ثبت‌نام", deliveryTime: "۳۰ دقیقه" },
      { slug: "sakha", title: "استعلام وضعیت نظام وظیفه", description: "گذرنامه و انتظامی", price: 60000, unit: "هر استعلام", deliveryTime: "۱۵ دقیقه" },
    ],
  },
  {
    slug: "design-print", title: "طراحی، گرافیک و چاپ", icon: "palette",
    tagline: "رزومه، پاورپوینت، کارت ویزیت، بنر", color: "from-violet-400/30 to-purple-500/20",
    items: [
      { slug: "resume", title: "طراحی رزومه حرفه‌ای", description: "ATS و گرافیکی، فارسی/انگلیسی", price: 280000, unit: "هر رزومه", deliveryTime: "۲۴ ساعت" },
      { slug: "ppt", title: "ساخت پاورپوینت ارائه", description: "تا ۱۵ اسلاید حرفه‌ای", price: 320000, unit: "هر فایل", deliveryTime: "۲۴-۴۸ ساعت" },
      { slug: "card-design", title: "طراحی کارت ویزیت", description: "فقط فایل طراحی", price: 220000, unit: "هر طرح", deliveryTime: "۲۴ ساعت" },
      { slug: "card-print", title: "طراحی + چاپ کارت ویزیت", description: "۱۰۰۰ عدد + ارسال پستی", price: 1150000, unit: "۱۰۰۰ عدد", deliveryTime: "۵-۷ روز" },
      { slug: "banner", title: "طراحی بنر و سربرگ", description: "تبلیغاتی و اداری", price: 270000, unit: "هر طرح", deliveryTime: "۲۴ ساعت" },
      { slug: "typing-pro", title: "تایپ متون تخصصی", description: "هر صفحه ۲۵۰ کلمه", price: 22000, unit: "هر صفحه", deliveryTime: "متغیر" },
    ],
  },
  {
    slug: "insurance", title: "تامین اجتماعی و بیمه", icon: "shield",
    tagline: "سوابق بیمه، فیش حقوقی، بیمه کارگاهی", color: "from-blue-400/30 to-sky-500/20",
    items: [
      { slug: "tamin-prof", title: "ثبت‌نام پروفایل تامین اجتماعی", description: "سامانه تامین اجتماعی من", price: 75000, unit: "هر ثبت‌نام", deliveryTime: "۲۰ دقیقه" },
      { slug: "bimeh-sabegheh", title: "دریافت سوابق بیمه", description: "تلفیقی یا تفکیک سال", price: 35000, unit: "هر استعلام", deliveryTime: "۱۰ دقیقه" },
      { slug: "fish", title: "فیش حقوقی بازنشستگان", description: "تامین اجتماعی و کشوری", price: 35000, unit: "هر فیش", deliveryTime: "۱۰ دقیقه" },
      { slug: "kasr", title: "گواهی کسر از حقوق", description: "درخواست آنلاین", price: 50000, unit: "هر گواهی", deliveryTime: "۱۵ دقیقه" },
      { slug: "kargahi", title: "لیست بیمه کارگاهی ماهانه", description: "تا ۵ نفر کارگر", price: 190000, unit: "هر لیست", deliveryTime: "۴۵ دقیقه" },
      { slug: "optional-bimeh", title: "فیش بیمه اختیاری و مشاغل آزاد", description: "کارگران ساختمانی", price: 50000, unit: "هر فیش", deliveryTime: "۱۵ دقیقه" },
    ],
  },
];

export const prdCategories = serviceCategories;

export function findService(categorySlug: string, serviceSlug: string) {
  const category = serviceCategories.find((c) => c.slug === categorySlug);
  const service = category?.items.find((i) => i.slug === serviceSlug);
  return { category, service };
}

export function allServicesFlat() {
  return serviceCategories.flatMap((category) =>
    category.items.map((item) => ({ category, item })),
  );
}

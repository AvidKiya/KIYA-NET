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

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "typing",
    title: "تایپ و ویرایش متن",
    icon: "keyboard",
    tagline: "تایپ سریع، تمیز و بدون غلط از روی دست‌نویس، عکس یا فایل صوتی",
    color: "from-emerald-400/30 to-teal-500/20",
    items: [
      {
        slug: "typing-farsi",
        title: "تایپ فارسی (هر صفحه)",
        description: "تایپ استاندارد فارسی از روی دست‌نویس، عکس یا PDF اسکن‌شده",
        price: 18000,
        unit: "هر صفحه A4",
        deliveryTime: "۲ تا ۶ ساعت",
      },
      {
        slug: "typing-latin",
        title: "تایپ لاتین (هر صفحه)",
        description: "تایپ متون انگلیسی یا چندزبانه با رعایت فرمت اصلی",
        price: 25000,
        unit: "هر صفحه A4",
        deliveryTime: "۲ تا ۶ ساعت",
      },
      {
        slug: "typing-thesis",
        title: "تایپ پایان‌نامه و پروپوزال",
        description: "تایپ کامل با فرمول، جدول، منابع و فرمت‌بندی دانشگاهی",
        price: 22000,
        unit: "هر صفحه",
        deliveryTime: "۱ تا ۲ روز",
      },
      {
        slug: "editing-rewrite",
        title: "ویرایش و بازنویسی متن",
        description: "ویرایش نگارشی، رفع غلط املایی و روان‌سازی جملات",
        price: 15000,
        unit: "هر صفحه",
        deliveryTime: "۲ تا ۸ ساعت",
      },
    ],
  },
  {
    slug: "print-scan",
    title: "چاپ، اسکن و تکثیر مجازی",
    icon: "printer",
    tagline: "فایل‌های آماده چاپ، اسکن حرفه‌ای و خروجی PDF با کیفیت بالا",
    color: "from-sky-400/30 to-blue-500/20",
    items: [
      {
        slug: "scan-pro",
        title: "اسکن حرفه‌ای مدارک از روی عکس",
        description: "تبدیل عکس موبایل مدارک به اسکن صاف، تمیز و باکیفیت چاپ",
        price: 8000,
        unit: "هر برگ",
        deliveryTime: "۳۰ دقیقه تا ۲ ساعت",
      },
      {
        slug: "print-ready-file",
        title: "آماده‌سازی فایل چاپی (رنگی/سیاه‌سفید)",
        description: "تنظیم سایز، حاشیه و رزولوشن برای چاپ در هر چاپخانه",
        price: 10000,
        unit: "هر فایل",
        deliveryTime: "۱ تا ۳ ساعت",
      },
      {
        slug: "merge-pdf",
        title: "ترکیب و صحافی مجازی فایل‌ها",
        description: "تبدیل چند عکس یا فایل به یک PDF یکجا با جلد و شماره صفحه",
        price: 12000,
        unit: "هر مجموعه",
        deliveryTime: "۱ تا ۳ ساعت",
      },
    ],
  },
  {
    slug: "gov-registration",
    title: "ثبت‌نام‌های اینترنتی و امور اداری",
    icon: "landmark",
    tagline: "ثبت‌نام سامانه‌های دولتی، آزمون‌ها و امور اداری بدون مراجعه حضوری",
    color: "from-violet-400/30 to-purple-500/20",
    items: [
      {
        slug: "gov-portal",
        title: "ثبت‌نام سامانه‌های دولتی",
        description: "یارانه، سهام عدالت، کارت سوخت، سامانه‌های ثبت‌احوال و رفاه",
        price: 35000,
        unit: "هر مورد",
        deliveryTime: "۲ تا ۱۲ ساعت",
      },
      {
        slug: "exam-registration",
        title: "ثبت‌نام کنکور و آزمون‌های استخدامی",
        description: "تکمیل فرم، بارگذاری مدارک و دریافت کارت ورود به جلسه",
        price: 45000,
        unit: "هر ثبت‌نام",
        deliveryTime: "۱ روز",
      },
      {
        slug: "university-affairs",
        title: "امور دانشگاهی (انتخاب واحد، شهریه)",
        description: "پیگیری سامانه آموزشی دانشگاه و انجام امور ثبت‌نامی",
        price: 40000,
        unit: "هر مورد",
        deliveryTime: "۱ روز",
      },
    ],
  },
  {
    slug: "design",
    title: "طراحی و گرافیک",
    icon: "palette",
    tagline: "طراحی کارت ویزیت، پوستر، رزومه و قالب شبکه‌های اجتماعی",
    color: "from-amber-400/30 to-orange-500/20",
    items: [
      {
        slug: "business-card",
        title: "طراحی کارت ویزیت",
        description: "طراحی اختصاصی دو رو، آماده چاپ با فایل PDF لایه‌باز",
        price: 60000,
        unit: "هر طرح",
        deliveryTime: "۱ روز",
      },
      {
        slug: "poster-banner",
        title: "طراحی پوستر یا بنر",
        description: "طراحی حرفه‌ای برای تبلیغات، مراسم و فروشگاه‌ها",
        price: 90000,
        unit: "هر طرح",
        deliveryTime: "۱ تا ۲ روز",
      },
      {
        slug: "resume-design",
        title: "طراحی رزومه حرفه‌ای",
        description: "رزومه خلاقانه و استاندارد با خروجی PDF آماده ارسال",
        price: 70000,
        unit: "هر رزومه",
        deliveryTime: "۱ روز",
      },
      {
        slug: "social-template",
        title: "طراحی قالب اینستاگرام",
        description: "پک پست و استوری اختصاصی متناسب با برند شما",
        price: 120000,
        unit: "هر پک (۵ طرح)",
        deliveryTime: "۲ روز",
      },
    ],
  },
  {
    slug: "translation",
    title: "ترجمه و تحقیق دانشجویی",
    icon: "languages",
    tagline: "ترجمه تخصصی، تحقیق و جمع‌آوری منابع علمی",
    color: "from-rose-400/30 to-pink-500/20",
    items: [
      {
        slug: "translate-en-fa",
        title: "ترجمه انگلیسی به فارسی",
        description: "ترجمه روان و تخصصی هر ۲۵۰ کلمه متن",
        price: 45000,
        unit: "هر ۲۵۰ کلمه",
        deliveryTime: "۱ روز",
      },
      {
        slug: "translate-fa-en",
        title: "ترجمه فارسی به انگلیسی",
        description: "ترجمه دقیق برای مقاله، رزومه و مدارک رسمی",
        price: 55000,
        unit: "هر ۲۵۰ کلمه",
        deliveryTime: "۱ روز",
      },
      {
        slug: "research-collect",
        title: "تحقیق و جمع‌آوری مقاله",
        description: "جست‌وجو، جمع‌آوری و خلاصه‌نویسی منابع علمی معتبر",
        price: 50000,
        unit: "هر تحقیق",
        deliveryTime: "۱ تا ۲ روز",
      },
    ],
  },
  {
    slug: "office",
    title: "رزومه، پاورپوینت و اداری",
    icon: "briefcase",
    tagline: "ساخت فایل‌های اداری، پاورپوینت و اکسل حرفه‌ای",
    color: "from-cyan-400/30 to-emerald-500/20",
    items: [
      {
        slug: "powerpoint",
        title: "طراحی پاورپوینت پروژه/دانشگاهی",
        description: "اسلایدهای حرفه‌ای با گرافیک اختصاصی و انیمیشن ساده",
        price: 8000,
        unit: "هر اسلاید",
        deliveryTime: "۱ روز",
      },
      {
        slug: "excel-sheet",
        title: "طراحی فایل اکسل و محاسباتی",
        description: "طراحی جدول، فرمول‌نویسی و گزارش‌گیری خودکار",
        price: 60000,
        unit: "هر فایل",
        deliveryTime: "۱ روز",
      },
      {
        slug: "bill-payment",
        title: "پیگیری قبوض و امور بانکی غیرحساس",
        description: "استعلام قبض، خلافی خودرو و پیگیری سامانه‌های مالی عمومی",
        price: 20000,
        unit: "هر مورد",
        deliveryTime: "چند ساعت",
      },
    ],
  },
];

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

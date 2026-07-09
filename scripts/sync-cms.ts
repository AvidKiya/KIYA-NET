import "dotenv/config";
import { db } from "@/db";
import { siteSettings, aboutContent, serviceCategories, services } from "@/db/schema";
import { eq } from "drizzle-orm";

async function upsertSetting(key: string, value: any) {
  const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1).then((r) => r[0]);
  if (existing) {
    await db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({ key, value });
  }
}

async function upsertAbout(key: string, value: any) {
  const existing = await db.select().from(aboutContent).where(eq(aboutContent.key, key)).limit(1).then((r) => r[0]);
  if (existing) {
    await db.update(aboutContent).set({ value, updatedAt: new Date() }).where(eq(aboutContent.key, key));
  } else {
    await db.insert(aboutContent).values({ key, value });
  }
}

async function sync() {
  console.log("🔄 Syncing CMS defaults...");

  // Update categories with tagline if missing
  const categoryTaglines: Record<string, string> = {
    JUDICIAL: "ثبت‌نام ثنا، ابلاغیه، نوبت‌دهی، سوءپیشینه",
    UNIV: "کنکور، انتخاب واحد، سیدا، مای مدیو",
    TAX: "اظهارنامه، کد اقتصادی، ثبت شرکت",
    LOAN: "وام ازدواج، مرآت، یارانه، سجام",
    POLICE: "تعویض پلاک، خلافی، طرح فروش خودرو",
    DESIGN: "رزومه، پاورپوینت، کارت ویزیت، بنر",
    INSURANCE: "سوابق بیمه، فیش حقوقی، بیمه کارگاهی",
  };
  for (const [id, tagline] of Object.entries(categoryTaglines)) {
    await db.update(serviceCategories).set({ tagline }).where(eq(serviceCategories.id, id));
  }

  // Site settings
  await upsertSetting("site_name", "کیا نت");
  await upsertSetting("site_tagline", "کافی‌نتی که هیچ‌وقت درش بسته نمی‌شه");
  await upsertSetting("hero_badge", "کافی‌نت ۱۰۰٪ مجازی — همیشه در دسترس");
  await upsertSetting("hero_title", "کیانت؛ کافی‌نتی که هیچ‌وقت درش بسته نمی‌شه");
  await upsertSetting("hero_highlight", "هیچ‌وقت درش بسته نمی‌شه");
  await upsertSetting("hero_subtitle", "از ثبت‌نام کنکور و وام ازدواج گرفته تا اظهارنامه مالیاتی و طراحی کارت ویزیت — همه رو آنلاین و بدون مراجعه حضوری از «کیانت» بگیرید.");
  await upsertSetting("hero_cta_primary", "ثبت سفارش جدید");
  await upsertSetting("hero_cta_secondary", "مشاهده همه خدمات");
  await upsertSetting("stats_orders", "+۲۵۰۰");
  await upsertSetting("stats_customers", "۴.۹ / ۵");
  await upsertSetting("stats_years", "۲۴/۷");
  await upsertSetting("stats_orders_label", "سفارش موفق");
  await upsertSetting("stats_customers_label", "رضایت مشتری");
  await upsertSetting("stats_years_label", "ثبت سفارش آنلاین");
  await upsertSetting("features_title", "چرا کیانت؟");
  await upsertSetting("features", [
    { icon: "ShieldCheck", title: "بدون نیاز به حضور", desc: "همه‌چیز از خونه یا محل کارتون انجام می‌شه، دقیقاً مثل مراجعه به یک کافی‌نت واقعی." },
    { icon: "FileCheck2", title: "تحویل فایل PDF نهایی", desc: "خروجی هر سفارش، یک فایل PDF مرتب و آماده چاپ یا ارسال است." },
    { icon: "Clock3", title: "تحویل سریع", desc: "بیشتر سفارش‌ها بین چند ساعت تا حداکثر ۲ روز کاری آماده می‌شن." },
    { icon: "Wallet", title: "قیمت شفاف", desc: "پیش از ثبت سفارش، هزینه دقیق کار رو می‌بینید؛ بدون هیچ هزینه پنهانی." },
  ]);
  await upsertSetting("steps_title", "فرآیند سفارش");
  await upsertSetting("steps_subtitle", "دقیقاً مثل رفتن به کافی‌نت، فقط از راه دور");
  await upsertSetting("steps", [
    { icon: "Sparkles", title: "انتخاب خدمت", desc: "از بین ده‌ها خدمت کافی‌نتی، همونی که نیاز دارید رو انتخاب کنید." },
    { icon: "UploadCloud", title: "ثبت سفارش و ارسال مدارک", desc: "توضیحات و فایل موردنیاز رو آپلود می‌کنید." },
    { icon: "MessageSquareText", title: "انجام کار توسط اپراتور", desc: "تیم کیانت با دقت سفارش شما رو بررسی و اجرا می‌کنه." },
    { icon: "FileCheck2", title: "دریافت فایل PDF تحویلی", desc: "از صفحه پیگیری سفارش، فایل نهایی رو دانلود می‌کنید." },
  ]);
  await upsertSetting("testimonials_title", "مشتری‌های کیانت چی می‌گن؟");
  await upsertSetting("testimonials", [
    { name: "سارا محمدی", role: "دانشجوی ارشد", text: "پایان‌نامه‌مو نصف شب برای تایپ فرستادم، صبح فایل ورد و PDF آماده بود. دقیقاً مثل این بود که برم کافی‌نت محل ولی راحت‌تر!", rating: 5 },
    { name: "علی رضایی", role: "کارمند اداره", text: "ثبت‌نام سامانه دولتی که همیشه گیر می‌کردم رو کیانت برام انجام داد. کد رهگیری داشتم و همه چیز شفاف بود.", rating: 5 },
    { name: "نگار احمدی", role: "صاحب فروشگاه", text: "طراحی کارت ویزیت و پک استوری رو سفارش دادم، خیلی حرفه‌ای تحویل گرفتم.", rating: 5 },
  ]);
  await upsertSetting("faq_title", "سوالات متداول");
  await upsertSetting("faq_items", [
    { q: "چطور بدون حضور فیزیکی سفارش بدم؟", a: "کافیه از صفحه «ثبت سفارش» خدمت موردنظرتون رو انتخاب کنید، توضیحات و فایل لازم (در صورت نیاز) رو بارگذاری کنید و اطلاعات تماستون رو وارد کنید. یک کد رهگیری دریافت می‌کنید و تیم کیانت کارتون رو شروع می‌کنه." },
    { q: "فایل نهایی رو چطور تحویل می‌گیرم؟", a: "به‌محض تکمیل سفارش، وضعیت اون در صفحه «پیگیری سفارش» به «آماده تحویل» تغییر می‌کنه و می‌تونید فایل PDF نهایی همراه با گزارش کار رو مستقیماً دانلود کنید." },
    { q: "هزینه هر سفارش چطور محاسبه می‌شه؟", a: "قیمت هر خدمت به‌صورت شفاف در صفحه «خدمات» اعلام شده و بر اساس تعداد صفحه یا مقدار درخواستی محاسبه می‌شه. برای سفارش فوری ۳۰٪ به هزینه اضافه می‌شود." },
    { q: "امنیت مدارک و اطلاعات من تضمین می‌شه؟", a: "تمام فایل‌ها و اطلاعات فقط برای انجام سفارش شما استفاده می‌شن و پس از تحویل نهایی، امکان حذف کامل اطلاعات از سرور رو در صورت درخواست فراهم می‌کنیم." },
    { q: "چقدر طول می‌کشه سفارشم آماده بشه؟", a: "بسته به نوع خدمت، بین چند ساعت تا حداکثر ۲ روز کاری. زمان تقریبی هر خدمت در کارت همون خدمت درج شده است." },
  ]);
  await upsertSetting("contact_phone", "۰۹۱۲ ۰۰۰ ۰۰۰۰");
  await upsertSetting("contact_phone_raw", "+989120000000");
  await upsertSetting("contact_telegram", "https://t.me/kiyanet");
  await upsertSetting("contact_telegram_handle", "kiya_net@");
  await upsertSetting("contact_email", "support@kiyanet.ir");
  await upsertSetting("contact_location", "کافی‌نت کاملاً مجازی — سراسر ایران");
  await upsertSetting("contact_hours", "۲۴ ساعته (۷ روز هفته، بدون تعطیلی)");
  await upsertSetting("footer_description", "اولین کافی‌نت کاملاً مجازی و ۲۴ ساعته؛ امور اداری، دانشگاهی، قضایی، مالیاتی، طراحی گرافیک و چاپ حرفه‌ای — سفارش می‌دهید، ما با دقت انجام می‌دهیم و خروجی یا فایل نهایی را تحویل می‌گیرید.");
  await upsertSetting("copyright_text", "© تمامی حقوق برای کافی‌نت آنلاین کیانت (KIYA NET) محفوظ است.");
  await upsertSetting("developer_text", "طراحی و توسعه توسط اوید کیا — Avid Kiya");

  // About content
  await upsertAbout("story", "«کیانت» (KIYA NET) توسط اوید کیا راه‌اندازی شده؛ جایی که به‌جای اجاره یک مغازه فیزیکی، تمام تجربه یک کافی‌نت واقعی — از امور اداری، دانشگاهی و قضایی گرفته تا طراحی گرافیک و چاپ حرفه‌ای — به‌صورت کاملاً آنلاین در اختیار مشتری‌ها قرار می‌گیرد. هدف ما ساده است: هرکسی، هر زمان و هر جایی، بتونه بدون مراجعه حضوری، کارهای اداری و دیجیتالی‌شو با کیفیت بالا و پشتیبانی ۲۴ ساعته انجام بده و فایل نهایی رو تحویل بگیره.");
  await upsertAbout("vision", "حذف مراجعه حضوری و ارائه خدمات اینترنتی ۲۴ ساعته برای همه ایرانی‌ها.");
  await upsertAbout("mission", "شبیه‌سازی تجربه کافی‌نت واقعی در بستر دیجیتال با بالاترین کیفیت و پشتیبانی.");
  await upsertAbout("founder_name", "اوید کیا");
  await upsertAbout("founder_title", "Avid Kiya — بنیان‌گذار کیانت");
  await upsertAbout("founder_quote", "«باور دارم هر کسب‌وکاری می‌تونه بدون فروشگاه فیزیکی هم به بهترین شکل به مشتری‌هاش خدمت کنه؛ کیانت نتیجه همین باوره.»");
  await upsertAbout("page_title", "کافی‌نتی که از دل یک ایده ساده متولد شد");
  await upsertAbout("page_subtitle", "داستان شکل‌گیری کافی‌نت آنلاین کیانت و اوید کیا، بنیان‌گذار آن.");
  await upsertAbout("values", [
    { icon: "ShieldCheck", title: "امانت‌داری", desc: "مدارک و اطلاعات مشتری‌ها فقط برای انجام سفارش استفاده می‌شود." },
    { icon: "Sparkles", title: "کیفیت", desc: "هر سفارش پیش از تحویل، بازبینی و کنترل کیفی می‌شود." },
    { icon: "Rocket", title: "سرعت", desc: "بیشتر سفارش‌ها در همان روز آماده تحویل هستند." },
    { icon: "HeartHandshake", title: "مشتری‌مداری", desc: "پشتیبانی مستقیم و پاسخ‌گویی سریع در تمام مراحل سفارش." },
  ]);
  await upsertAbout("timeline", [
    { year: "۱۴۰۲", title: "شروع ایده", desc: "اوید کیا با تجربه سال‌ها کار در حوزه فناوری، ایده یک کافی‌نت کاملاً مجازی را شکل داد." },
    { year: "۱۴۰۳", title: "راه‌اندازی کیانت", desc: "کیانت (KIYA NET) با چند خدمت پایه مثل تایپ و ثبت‌نام اینترنتی فعالیتش را آغاز کرد." },
    { year: "۱۴۰۴", title: "گسترش خدمات", desc: "افزودن طراحی گرافیک، ترجمه و تحویل فایل PDF هوشمند برای تمام سفارش‌ها." },
    { year: "امروز", title: "کافی‌نت شماره یک آنلاین", desc: "کیانت با هزاران سفارش موفق، جایگزین کافی‌نت‌های سنتی برای مشتریانش شده است." },
  ]);
  await upsertAbout("stats", [
    { icon: "Globe2", value: "۱۰۰٪", label: "مجازی و بدون نیاز به حضور" },
    { icon: "Award", value: "+۲۵۰۰", label: "سفارش تکمیل‌شده" },
    { icon: "ShieldCheck", value: "۴.۹/۵", label: "میانگین رضایت مشتری" },
  ]);

  console.log("✅ CMS sync complete!");
}

sync()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ CMS sync failed:", err);
    process.exit(1);
  });

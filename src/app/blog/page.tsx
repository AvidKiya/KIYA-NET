import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import Link from "next/link";

export default async function BlogPage() {
  // In production, fetch from API
  const posts = [
    {
      id: "1",
      title: "راهنمای کامل ثبت‌نام ثنا",
      slug: "guide-sana",
      excerpt: "چگونه به راحتی و بدون مراجعه حضوری در سامانه ثنا ثبت‌نام کنید",
      category: "امور قضایی",
      publishedAt: "۱۴۰۴/۰۴/۱۰",
    },
    {
      id: "2",
      title: "۵ نکته مهم برای اظهارنامه مالیاتی ۱۴۰۴",
      slug: "tax-declaration-tips",
      excerpt: "نکاتی که باید قبل از ارسال اظهارنامه مالیاتی بدانید",
      category: "مالیات",
      publishedAt: "۱۴۰۴/۰۴/۰۸",
    },
  ];

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[var(--ink)]">پایگاه دانش کیانت</h1>
          <p className="mt-3 text-[var(--ink-dim)]">آموزش‌های کاربردی و راهنماهای کامل خدمات</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="glass rounded-2xl p-6 block hover:border-emerald-400/30 transition-all"
            >
              <div className="text-xs text-emerald-400 font-medium">{post.category}</div>
              <h3 className="mt-3 text-xl font-bold text-[var(--ink)]">{post.title}</h3>
              <p className="mt-3 text-sm text-[var(--ink-dim)] line-clamp-3">{post.excerpt}</p>
              <div className="mt-4 text-xs text-[var(--ink-dim)]">{post.publishedAt}</div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/blog" className="text-sm text-emerald-400 hover:underline">
            مشاهده همه مقالات →
          </Link>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

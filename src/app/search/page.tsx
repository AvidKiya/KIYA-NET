import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AdvancedSearch } from "@/components/AdvancedSearch";

export default function SearchPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-[var(--ink)]">جستجوی پیشرفته خدمات</h1>
          <p className="mt-2 text-[var(--ink-dim)]">با فیلترهای هوشمند، خدمت مورد نظر خود را پیدا کنید</p>
        </div>

        <AdvancedSearch />
      </div>
      <SiteFooter />
    </>
  );
}

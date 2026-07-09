"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";

interface SearchResult {
  id: number;
  serviceName: string;
  description: string;
  kiyanetPrice: string;
  categoryName: string;
  estimatedTimeText: string;
}

export function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim() && !filters.category) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      params.append("sort", filters.sort);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="جستجوی خدمت (مثلاً: ثنا، کنکور، مالیات...)"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 pr-12 text-sm text-[var(--ink)] placeholder:text-[var(--ink-dim)] focus:border-[var(--brand)] focus:outline-none"
          />
          <Search className="absolute right-4 top-4 text-[var(--ink-dim)]" size={18} />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-glass flex items-center gap-2 rounded-2xl px-5"
        >
          <Filter size={16} /> فیلتر
        </button>
        <button onClick={search} className="btn-brand rounded-2xl px-8">
          جستجو
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-[var(--ink-dim)]">دسته‌بندی</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="mt-1 w-full rounded-xl bg-white/5 px-4 py-2 text-sm"
              >
                <option value="">همه</option>
                <option value="judicial">امور قضایی</option>
                <option value="university">دانشگاه</option>
                <option value="tax">مالیات</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--ink-dim)]">حداقل قیمت</label>
              <input
                type="number"
                placeholder="تومان"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="mt-1 w-full rounded-xl bg-white/5 px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--ink-dim)]">حداکثر قیمت</label>
              <input
                type="number"
                placeholder="تومان"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="mt-1 w-full rounded-xl bg-white/5 px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--ink-dim)]">مرتب‌سازی</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="mt-1 w-full rounded-xl bg-white/5 px-4 py-2 text-sm"
              >
                <option value="newest">جدیدترین</option>
                <option value="price-low">ارزان‌ترین</option>
                <option value="price-high">گران‌ترین</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              setFilters({ category: "", minPrice: "", maxPrice: "", sort: "newest" });
              setQuery("");
              setResults([]);
            }}
            className="text-xs text-red-400 flex items-center gap-1"
          >
            <X size={14} /> پاک کردن فیلترها
          </button>
        </div>
      )}

      {/* Results */}
      {loading && <div className="text-center py-6 text-sm text-[var(--ink-dim)]">در حال جستجو...</div>}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r) => (
            <div key={r.id} className="glass rounded-2xl p-5 flex justify-between items-center">
              <div>
                <div className="font-bold text-[var(--ink)]">{r.serviceName}</div>
                <div className="text-xs text-[var(--ink-dim)] mt-0.5">{r.description}</div>
                <div className="text-[10px] text-emerald-400 mt-1">{r.categoryName} • {r.estimatedTimeText}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[var(--ink)]">
                  {Number(r.kiyanetPrice).toLocaleString("fa-IR")}
                </div>
                <div className="text-xs text-[var(--ink-dim)]">تومان</div>
                <a href={`/order?serviceId=${r.id}`} className="btn-brand mt-2 inline-block text-xs px-4 py-1.5 rounded-xl">
                  سفارش
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && query && !loading && (
        <div className="text-center py-8 text-sm text-[var(--ink-dim)]">نتیجه‌ای یافت نشد</div>
      )}
    </div>
  );
}
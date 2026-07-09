"use client";

import { useState } from "react";
import { useCMS, CMSTable } from "./CMSContext";
import {
  Globe, Palette, Menu, Info, Briefcase, Layers, List, CreditCard, ScrollText, Plus, Save, Trash2, X, Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

const TABS = [
  { k: "site", l: "تنظیمات سایت", i: Globe },
  { k: "theme", l: "تم", i: Palette },
  { k: "menus", l: "منوها", i: Menu },
  { k: "about", l: "درباره ما", i: Info },
  { k: "business", l: "شبکه کسب‌وکار", i: Briefcase },
  { k: "categories", l: "دسته‌بندی‌ها", i: Layers },
  { k: "services", l: "خدمات", i: List },
  { k: "bank", l: "کارت بانکی", i: CreditCard },
  { k: "logs", l: "تاریخچه تغییرات", i: ScrollText },
];

const MENU_LOCATIONS = [
  { value: "HEADER", label: "هدر" },
  { value: "FOOTER", label: "فوتر" },
  { value: "BOTTOM_NAV", label: "منوی پایین" },
];

const CATEGORY_IDS = [
  { value: "JUDICIAL", label: "امور قضایی" },
  { value: "UNIV", label: "دانشگاه و آزمون‌ها" },
  { value: "TAX", label: "مالیات و اصناف" },
  { value: "LOAN", label: "وام و بانک" },
  { value: "POLICE", label: "خودرو و پلیس +۱۰" },
  { value: "DESIGN", label: "طراحی و چاپ" },
  { value: "INSURANCE", label: "تامین اجتماعی" },
];

export function CMSAdminPanel() {
  const { data, save, remove, refresh } = useCMS();
  const [tab, setTab] = useState("site");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoaded, setLogsLoaded] = useState(false);

  const showMsg = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 3000);
  };

  const doSave = async (table: CMSTable, payload: any, recordId?: string | number) => {
    const key = `${table}.${recordId || payload[table === "site_settings" || table === "theme_settings" || table === "about_content" ? "key" : "id"]}`;
    setLoading((prev) => ({ ...prev, [key]: true }));
    const res = await save({ table, data: payload, recordId });
    setLoading((prev) => ({ ...prev, [key]: false }));
    if (res.success) {
      showMsg("ذخیره شد");
    } else {
      showMsg(res.error || "خطا");
    }
    return res;
  };

  const doDelete = async (table: CMSTable, recordId: string | number) => {
    if (!confirm("آیا مطمئنید؟")) return;
    const res = await remove(table, recordId);
    if (res.success) showMsg("حذف شد");
    else showMsg(res.error || "خطا");
  };

  const loadLogs = async () => {
    if (logsLoaded) return;
    try {
      const res = await fetch("/api/admin/cms-logs");
      const d = await res.json();
      if (d.logs) setLogs(d.logs);
    } catch {
      showMsg("خطا در بارگذاری لاگ‌ها");
    }
    setLogsLoaded(true);
  };

  if (tab === "logs" && !logsLoaded) loadLogs();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const I = t.i;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                tab === t.k ? "bg-emerald-400/15 text-emerald-300" : "btn-glass text-[var(--ink-dim)]"
              }`}
            >
              <I size={14} />
              {t.l}
            </button>
          );
        })}
      </div>

      {msg && (
        <p className={`text-xs ${msg.includes("خطا") ? "text-red-400" : "text-emerald-300"}`}>{msg}</p>
      )}

      {tab === "site" && <KeyValuePanel table="site_settings" data={data.siteSettings} onSave={doSave} onDelete={doDelete} loading={loading} />}
      {tab === "theme" && <KeyValuePanel table="theme_settings" data={data.themeSettings} onSave={doSave} onDelete={doDelete} loading={loading} valueType="color" />}
      {tab === "menus" && <MenuPanel data={data.menuItems} onSave={doSave} onDelete={doDelete} loading={loading} />}
      {tab === "about" && <KeyValuePanel table="about_content" data={data.aboutContent} onSave={doSave} onDelete={doDelete} loading={loading} valueType="textarea" />}
      {tab === "business" && <BusinessPanel data={data.businessNetwork} onSave={doSave} onDelete={doDelete} loading={loading} />}
      {tab === "categories" && <CategoryPanel data={data.serviceCategories} onSave={doSave} onDelete={doDelete} loading={loading} />}
      {tab === "services" && <ServicePanel data={data.services} categories={data.serviceCategories} onSave={doSave} onDelete={doDelete} loading={loading} />}
      {tab === "bank" && <BankCardPanel data={data.siteSettings} onSave={doSave} loading={loading} />}
      {tab === "logs" && <LogsPanel logs={logs} />}
    </div>
  );
}

function KeyValuePanel({
  table,
  data,
  onSave,
  onDelete,
  loading,
  valueType = "text",
}: {
  table: "site_settings" | "theme_settings" | "about_content";
  data: Record<string, any>;
  onSave: (table: CMSTable, payload: any, recordId?: string | number) => Promise<any>;
  onDelete: (table: CMSTable, recordId: string | number) => void;
  loading: Record<string, boolean>;
  valueType?: "text" | "textarea" | "color";
}) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});

  const entries = Object.entries(data);

  const handleSave = (key: string) => {
    let value: any = edits[key];
    if (table === "site_settings" || table === "about_content") {
      try {
        value = JSON.parse(value);
      } catch {
        // keep as string
      }
    }
    onSave(table, { key, value }, key);
  };

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="grid gap-3">
        {entries.map(([key, value]) => {
          const display = typeof value === "object" ? JSON.stringify(value) : String(value);
          const current = edits[key] !== undefined ? edits[key] : display;
          const isLoading = loading[`${table}.${key}`];
          return (
            <div key={key} className="flex flex-col gap-2 rounded-xl bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">{key}</span>
                <button onClick={() => onDelete(table, key)} className="text-red-300"><Trash2 size={13} /></button>
              </div>
              {valueType === "color" ? (
                <div className="flex items-center gap-2">
                  <input type="color" value={current} onChange={(e) => setEdits({ ...edits, [key]: e.target.value })} className="h-8 w-12 rounded border border-white/10" />
                  <input value={current} onChange={(e) => setEdits({ ...edits, [key]: e.target.value })} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" dir="ltr" />
                </div>
              ) : valueType === "textarea" ? (
                <textarea value={current} onChange={(e) => setEdits({ ...edits, [key]: e.target.value })} rows={3} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
              ) : (
                <input value={current} onChange={(e) => setEdits({ ...edits, [key]: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
              )}
              <button onClick={() => handleSave(key)} disabled={isLoading} className="btn-brand flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold">
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                ذخیره
              </button>
            </div>
          );
        })}
      </div>
      <div className="border-t border-white/10 pt-4">
        <p className="mb-2 text-xs font-bold text-[var(--ink)]">افزودن مورد جدید</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="کلید" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
          <input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="مقدار" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
          <button
            onClick={() => {
              if (!newKey) return;
              let value: any = newValue;
              try { value = JSON.parse(newValue); } catch {}
              onSave(table, { key: newKey, value }, newKey).then(() => { setNewKey(""); setNewValue(""); });
            }}
            className="btn-brand flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold"
          >
            <Plus size={12} /> افزودن
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function MenuPanel({
  data,
  onSave,
  onDelete,
  loading,
}: {
  data: any[];
  onSave: (table: CMSTable, payload: any, recordId?: string | number) => Promise<any>;
  onDelete: (table: CMSTable, recordId: string | number) => void;
  loading: Record<string, boolean>;
}) {
  const [form, setForm] = useState<Partial<any>>({ location: "HEADER" });
  const [editId, setEditId] = useState<number | null>(null);

  const startEdit = (item: any) => {
    setForm({ ...item });
    setEditId(item.id);
  };

  const reset = () => {
    setForm({ location: "HEADER" });
    setEditId(null);
  };

  const submit = () => {
    if (!form.label || !form.link) return;
    onSave("menu_items", { id: editId, label: form.label, link: form.link, iconName: form.iconName || "Circle", location: form.location, sortOrder: Number(form.sortOrder || 0), isActive: form.isActive !== false }, editId || undefined).then(() => reset());
  };

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="grid gap-2 sm:grid-cols-6">
        <input value={form.label || ""} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="برچسب" className="sm:col-span-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.link || ""} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="لینک" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" dir="ltr" />
        <input value={form.iconName || ""} onChange={(e) => setForm({ ...form, iconName: e.target.value })} placeholder="آیکون Lucide" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <select value={form.location || "HEADER"} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none">
          {MENU_LOCATIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <input value={form.sortOrder || 0} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} type="number" placeholder="ترتیب" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} className="btn-brand flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"><Save size={12} /> {editId ? "بروزرسانی" : "افزودن"}</button>
        {editId && <button onClick={reset} className="btn-glass rounded-lg px-3 py-2 text-xs"><X size={12} /> انصراف</button>}
      </div>
      <div className="space-y-2">
        {data.length === 0 ? <p className="text-sm text-[var(--ink-dim)]">موردی یافت نشد</p> : data.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[var(--ink)]">{item.label}</p>
              <p className="text-[11px] text-[var(--ink-dim)]" dir="ltr">{item.link} — {item.location}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(item)} className="btn-glass rounded-lg p-2"><Save size={13} /></button>
              <button onClick={() => onDelete("menu_items", item.id)} className="btn-glass rounded-lg p-2 text-red-300"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function BusinessPanel({
  data,
  onSave,
  onDelete,
  loading,
}: {
  data: any[];
  onSave: (table: CMSTable, payload: any, recordId?: string | number) => Promise<any>;
  onDelete: (table: CMSTable, recordId: string | number) => void;
  loading: Record<string, boolean>;
}) {
  const [form, setForm] = useState<Partial<any>>({});
  const [editId, setEditId] = useState<number | null>(null);

  const startEdit = (item: any) => { setForm({ ...item }); setEditId(item.id); };
  const reset = () => { setForm({}); setEditId(null); };
  const submit = () => {
    if (!form.title || !form.url) return;
    onSave("business_network", { id: editId, title: form.title, description: form.description, iconName: form.iconName || "Briefcase", url: form.url, sortOrder: Number(form.sortOrder || 0), isActive: form.isActive !== false }, editId || undefined).then(() => reset());
  };

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="grid gap-2 sm:grid-cols-5">
        <input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="توضیح" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.iconName || ""} onChange={(e) => setForm({ ...form, iconName: e.target.value })} placeholder="آیکون" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.url || ""} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="آدرس" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" dir="ltr" />
        <input value={form.sortOrder || 0} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} type="number" placeholder="ترتیب" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} className="btn-brand flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"><Save size={12} /> {editId ? "بروزرسانی" : "افزودن"}</button>
        {editId && <button onClick={reset} className="btn-glass rounded-lg px-3 py-2 text-xs"><X size={12} /> انصراف</button>}
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[var(--ink)]">{item.title}</p>
              <p className="text-[11px] text-[var(--ink-dim)]" dir="ltr">{item.url}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(item)} className="btn-glass rounded-lg p-2"><Save size={13} /></button>
              <button onClick={() => onDelete("business_network", item.id)} className="btn-glass rounded-lg p-2 text-red-300"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function CategoryPanel({
  data,
  onSave,
  onDelete,
  loading,
}: {
  data: any[];
  onSave: (table: CMSTable, payload: any, recordId?: string | number) => Promise<any>;
  onDelete: (table: CMSTable, recordId: string | number) => void;
  loading: Record<string, boolean>;
}) {
  const [form, setForm] = useState<Partial<any>>({});
  const [editId, setEditId] = useState<string | null>(null);

  const startEdit = (item: any) => { setForm({ ...item }); setEditId(item.id); };
  const reset = () => { setForm({}); setEditId(null); };
  const submit = () => {
    if (!form.id || !form.name || !form.slug) return;
    onSave("service_categories", {
      id: form.id,
      name: form.name,
      slug: form.slug,
      description: form.description || "",
      iconName: form.iconName || "Circle",
      color: form.color || "#10b981",
      sortOrder: Number(form.sortOrder || 0),
      isActive: form.isActive !== false,
    }, form.id).then(() => reset());
  };

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="grid gap-2 sm:grid-cols-7">
        <input value={form.id || ""} onChange={(e) => setForm({ ...form, id: e.target.value.toUpperCase() })} placeholder="شناسه (مثل JUDICIAL)" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" dir="ltr" />
        <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام" className="sm:col-span-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="اسلاگ" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" dir="ltr" />
        <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="توضیح" className="sm:col-span-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.iconName || ""} onChange={(e) => setForm({ ...form, iconName: e.target.value })} placeholder="آیکون" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.color || ""} onChange={(e) => setForm({ ...form, color: e.target.value })} type="color" placeholder="رنگ" className="rounded-lg border border-white/10 bg-white/5 px-1 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.sortOrder || 0} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} type="number" placeholder="ترتیب" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} className="btn-brand flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"><Save size={12} /> {editId ? "بروزرسانی" : "افزودن"}</button>
        {editId && <button onClick={reset} className="btn-glass rounded-lg px-3 py-2 text-xs"><X size={12} /> انصراف</button>}
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div>
                <p className="text-sm font-bold text-[var(--ink)]">{item.name}</p>
                <p className="text-[11px] text-[var(--ink-dim)]" dir="ltr">{item.id} / {item.slug}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(item)} className="btn-glass rounded-lg p-2"><Save size={13} /></button>
              <button onClick={() => onDelete("service_categories", item.id)} className="btn-glass rounded-lg p-2 text-red-300"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ServicePanel({
  data,
  categories,
  onSave,
  onDelete,
  loading,
}: {
  data: any[];
  categories: any[];
  onSave: (table: CMSTable, payload: any, recordId?: string | number) => Promise<any>;
  onDelete: (table: CMSTable, recordId: string | number) => void;
  loading: Record<string, boolean>;
}) {
  const [form, setForm] = useState<Partial<any>>({});
  const [editId, setEditId] = useState<number | null>(null);

  const startEdit = (item: any) => { setForm({ ...item }); setEditId(item.id); };
  const reset = () => { setForm({}); setEditId(null); };
  const submit = () => {
    if (!form.serviceName || !form.categoryId) return;
    onSave("services", {
      id: editId,
      categoryId: form.categoryId,
      serviceName: form.serviceName,
      description: form.description || "",
      officialPrice: String(form.officialPrice || 0),
      kiyanetPrice: String(form.kiyanetPrice || 0),
      discountPercent: String(form.discountPercent || 0),
      estimatedTimeMinutes: Number(form.estimatedTimeMinutes || 0),
      estimatedTimeText: form.estimatedTimeText || "",
      requiredDocuments: Array.isArray(form.requiredDocuments) ? form.requiredDocuments : (form.requiredDocuments || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      isActive: form.isActive !== false,
      requiresPhysicalShipping: form.requiresPhysicalShipping === true,
      sortOrder: Number(form.sortOrder || 0),
    }, editId || undefined).then(() => reset());
  };

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="grid gap-2 sm:grid-cols-4">
        <select value={form.categoryId || ""} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none">
          <option value="">دسته‌بندی</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={form.serviceName || ""} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} placeholder="نام خدمت" className="sm:col-span-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.officialPrice || 0} onChange={(e) => setForm({ ...form, officialPrice: e.target.value })} type="number" placeholder="قیمت مصوب" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.kiyanetPrice || 0} onChange={(e) => setForm({ ...form, kiyanetPrice: e.target.value })} type="number" placeholder="قیمت کیانت" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.discountPercent || 0} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} type="number" placeholder="٪ تخفیف" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.estimatedTimeMinutes || 0} onChange={(e) => setForm({ ...form, estimatedTimeMinutes: e.target.value })} type="number" placeholder="زمان دقیقه" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={form.sortOrder || 0} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} type="number" placeholder="ترتیب" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <input value={Array.isArray(form.requiredDocuments) ? form.requiredDocuments.join(", ") : (form.requiredDocuments || "")} onChange={(e) => setForm({ ...form, requiredDocuments: e.target.value })} placeholder="مدارک موردنیاز (با کاما)" className="sm:col-span-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="توضیحات" rows={2} className="sm:col-span-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} className="btn-brand flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"><Save size={12} /> {editId ? "بروزرسانی" : "افزودن"}</button>
        {editId && <button onClick={reset} className="btn-glass rounded-lg px-3 py-2 text-xs"><X size={12} /> انصراف</button>}
      </div>
      <div className="space-y-2 max-h-[24rem] overflow-y-auto pr-1">
        {data.length === 0 ? <p className="text-sm text-[var(--ink-dim)]">موردی یافت نشد</p> : data.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[var(--ink)]">{item.serviceName}</p>
              <p className="text-[11px] text-[var(--ink-dim)]">{categories.find((c) => c.id === item.categoryId)?.name || item.categoryId} — {item.kiyanetPrice} تومان</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(item)} className="btn-glass rounded-lg p-2"><Save size={13} /></button>
              <button onClick={() => onDelete("services", item.id)} className="btn-glass rounded-lg p-2 text-red-300"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function BankCardPanel({
  data,
  onSave,
  loading,
}: {
  data: Record<string, any>;
  onSave: (table: CMSTable, payload: any, recordId?: string | number) => Promise<any>;
  loading: Record<string, boolean>;
}) {
  const [form, setForm] = useState({
    bankCardNumber: data.bankCardNumber || "",
    bankCardHolder: data.bankCardHolder || "",
    bankName: data.bankName || "",
    bankSheba: data.bankSheba || "",
  });

  const submit = () => {
    Promise.all([
      onSave("site_settings", { key: "bankCardNumber", value: form.bankCardNumber }, "bankCardNumber"),
      onSave("site_settings", { key: "bankCardHolder", value: form.bankCardHolder }, "bankCardHolder"),
      onSave("site_settings", { key: "bankName", value: form.bankName }, "bankName"),
      onSave("site_settings", { key: "bankSheba", value: form.bankSheba }, "bankSheba"),
    ]);
  };

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-[var(--ink-dim)]">شماره کارت</label>
          <input value={form.bankCardNumber} onChange={(e) => setForm({ ...form, bankCardNumber: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" dir="ltr" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--ink-dim)]">نام صاحب کارت</label>
          <input value={form.bankCardHolder} onChange={(e) => setForm({ ...form, bankCardHolder: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--ink-dim)]">نام بانک</label>
          <input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--ink-dim)]">شبا</label>
          <input value={form.bankSheba} onChange={(e) => setForm({ ...form, bankSheba: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" dir="ltr" />
        </div>
      </div>
      <button onClick={submit} className="btn-brand flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"><Save size={12} /> ذخیره کارت بانکی</button>
    </GlassCard>
  );
}

function LogsPanel({ logs }: { logs: any[] }) {
  return (
    <GlassCard className="p-5">
      <div className="max-h-[30rem] overflow-y-auto space-y-2">
        {logs.length === 0 ? <p className="text-sm text-[var(--ink-dim)]">لاگی ثبت نشده</p> : logs.map((log) => (
          <div key={log.id} className="rounded-xl bg-white/5 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">{log.settingKey}</span>
              <span className="text-[10px] text-[var(--ink-dim)]">{new Date(log.editedAt).toLocaleString("fa-IR")}</span>
            </div>
            <p className="text-[11px] text-[var(--ink-dim)]">توسط: {log.editorName || "—"}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-red-400/10 p-2 text-[10px] text-red-300">{JSON.stringify(log.oldValue)}</div>
              <div className="rounded-lg bg-emerald-400/10 p-2 text-[10px] text-emerald-300">{JSON.stringify(log.newValue)}</div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

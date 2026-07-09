"use client";

import { useState, ReactNode } from "react";
import { useCMS, CMSTable } from "./CMSContext";
import { Pencil, Check, X, Loader2 } from "lucide-react";

const PK_BY_TABLE: Record<CMSTable, string> = {
  site_settings: "key",
  theme_settings: "key",
  menu_items: "id",
  about_content: "key",
  business_network: "id",
  service_categories: "id",
  services: "id",
};

export interface EditableProps {
  table: CMSTable;
  recordId: string | number;
  field: string;
  value?: any;
  type?: "text" | "textarea" | "number" | "boolean" | "select" | "json" | "color";
  options?: { value: string; label: string }[];
  label?: string;
  className?: string;
  children?: ReactNode;
}

export function Editable({
  table,
  recordId,
  field,
  value,
  type = "text",
  options,
  label,
  className = "",
  children,
}: EditableProps) {
  const { liveEditMode, isAdmin, save } = useCMS();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin || !liveEditMode) {
    return <>{children}</>;
  }

  const startEdit = () => {
    let initial = "";
    if (value !== undefined && value !== null) {
      if (type === "json" && typeof value === "object") {
        initial = JSON.stringify(value, null, 2);
      } else {
        initial = String(value);
      }
    }
    setDraft(initial);
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      let newValue: any = draft;
      if (type === "number") {
        newValue = Number(draft);
        if (Number.isNaN(newValue)) throw new Error("عدد نامعتبر");
      } else if (type === "boolean") {
        newValue = draft === "true";
      } else if (type === "json") {
        try {
          newValue = JSON.parse(draft);
        } catch {
          throw new Error("JSON نامعتبر");
        }
      } else if (type === "color") {
        newValue = draft;
      }

      const pk = PK_BY_TABLE[table];
      const data = { [pk]: recordId, [field]: newValue };
      const result = await save({ table, data, recordId, oldValue: value });
      if (result.success) {
        setEditing(false);
      } else {
        setError(result.error || "خطا در ذخیره");
      }
    } catch (err: any) {
      setError(err.message || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <span
        className={`relative inline-block align-middle ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="editable-active inline-flex items-center gap-1 rounded-lg px-2 py-1">
          {children}
        </span>

        <span className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-white/10 bg-[#1f1f1f] p-2 shadow-2xl">
          {label && <span className="mb-1 block text-[10px] text-[var(--ink-dim)]">{label}</span>}
          {type === "textarea" || type === "json" ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={type === "json" ? 6 : 3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-emerald-400/60"
              dir={type === "json" ? "ltr" : "auto"}
            />
          ) : type === "select" ? (
            <select
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-[var(--ink)] outline-none"
            >
              {options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : type === "boolean" ? (
            <select
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-[var(--ink)] outline-none"
            >
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
          ) : type === "color" ? (
            <input
              type="color"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-1 py-1 outline-none"
            />
          ) : (
            <input
              type={type === "number" ? "number" : "text"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-emerald-400/60"
              dir={type === "number" ? "ltr" : "auto"}
            />
          )}
          {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}
          <span className="mt-1 flex items-center justify-end gap-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/20 text-emerald-300"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            </button>
            <button
              onClick={cancel}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-[var(--ink-dim)]"
            >
              <X size={12} />
            </button>
          </span>
        </span>
      </span>
    );
  }

  return (
    <span
      data-editable
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startEdit();
      }}
      className={`group inline-flex cursor-pointer items-center gap-1 rounded-lg px-1 transition-colors hover:bg-emerald-400/10 ${className}`}
      title={label ? `ویرایش: ${label}` : "ویرایش"}
    >
      {children}
      <Pencil size={10} className="editable-pencil opacity-0 transition-opacity group-hover:opacity-60" />
    </span>
  );
}

"use client";

import { useState } from "react";

export function ReportExporter() {
  const [type, setType] = useState("ORDERS");
  const [format, setFormat] = useState("CSV");
  const [loading, setLoading] = useState(false);

  const exportReport = async () => {
    setLoading(true);
    const res = await fetch("/api/reports/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, format }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.fileUrl) {
      window.open(data.fileUrl, "_blank");
    }
  };

  return (
    <div className="glass rounded-2xl p-5">
      <h4 className="font-bold mb-4">خروجی گرفتن گزارش</h4>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <select value={type} onChange={e => setType(e.target.value)} className="rounded-xl bg-white/5 px-4 py-2 text-sm">
          <option value="ORDERS">سفارش‌ها</option>
          <option value="REVENUE">درآمد</option>
          <option value="USERS">کاربران</option>
        </select>
        <select value={format} onChange={e => setFormat(e.target.value)} className="rounded-xl bg-white/5 px-4 py-2 text-sm">
          <option value="CSV">CSV</option>
          <option value="EXCEL">Excel</option>
          <option value="PDF">PDF</option>
        </select>
      </div>
      <button onClick={exportReport} disabled={loading} className="btn-brand w-full py-2.5 rounded-xl text-sm">
        {loading ? "در حال آماده‌سازی..." : "دانلود گزارش"}
      </button>
    </div>
  );
}


---

### ۴. به‌روزرسانی Layout و صفحات

حالا این کامپوننت‌ها را در جاهای مناسب قرار می‌دهم:
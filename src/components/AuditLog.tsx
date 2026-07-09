"use client";

import { useEffect, useState } from "react";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  userId?: string;
}

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/audit");
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (e) {
        console.error("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="text-sm text-[var(--ink-dim)]">در حال بارگذاری لاگ‌ها...</div>;

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-bold text-[var(--ink)] mb-4">لاگ فعالیت‌ها (Audit Log)</h3>
      {logs.length === 0 ? (
        <p className="text-sm text-[var(--ink-dim)]">هنوز لاگی ثبت نشده است.</p>
      ) : (
        <div className="space-y-3 text-sm">
          {logs.map((log) => (
            <div key={log.id} className="flex justify-between border-b border-white/10 pb-2">
              <div>
                <span className="font-medium text-emerald-300">{log.action}</span>
                <span className="mx-2 text-[var(--ink-dim)]">•</span>
                <span>{log.entityType}</span>
                {log.entityId && <span className="text-xs text-[var(--ink-dim)]"> ({log.entityId})</span>}
              </div>
              <div className="text-xs text-[var(--ink-dim)]">
                {new Date(log.createdAt).toLocaleDateString("fa-IR")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
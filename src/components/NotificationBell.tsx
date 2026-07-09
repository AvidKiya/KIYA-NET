"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  orderId?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-[var(--ink)] hover:bg-white/10"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-white/10 bg-[#0a0a0a] p-2 shadow-2xl">
          <div className="px-3 py-2 text-xs font-medium text-[var(--ink-dim)]">اعلان‌ها</div>
          
          {notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-[var(--ink-dim)]">
              اعلان جدیدی ندارید
            </div>
          ) : (
            <div className="max-h-80 space-y-1 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif.id);
                    setIsOpen(false);
                  }}
                  className={`cursor-pointer rounded-xl px-3 py-3 text-sm transition-colors hover:bg-white/5 ${
                    !notif.isRead ? "bg-white/5" : ""
                  }`}
                >
                  <p className="font-medium text-[var(--ink)]">{notif.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--ink-dim)]">{notif.message}</p>
                  <p className="mt-1 text-[9px] text-[var(--ink-dim)]/60">
                    {new Date(notif.createdAt).toLocaleDateString("fa-IR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
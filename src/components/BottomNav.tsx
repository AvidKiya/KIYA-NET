"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, FileText, Wallet, FolderLock, User } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { href: "/", label: "پیشخوان", icon: Home },
  { href: "/orders", label: "سفارش‌ها", icon: FileText },
  { href: "/wallet", label: "کیف پول", icon: Wallet },
  { href: "/vault", label: "گاوصندوق", icon: FolderLock },
  { href: "/profile", label: "پروفایل", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-strong mx-3 mb-3 rounded-3xl px-1 py-1.5 shadow-2xl">
        <div className="flex items-center justify-around relative">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-300"
              >
                {active && (
                  <motion.div
                    layoutId="bottomNavPill"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: "var(--brand)", opacity: 0.18 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 1.5}
                  className="relative z-10 transition-colors duration-300"
                  style={{ color: active ? "var(--brand)" : undefined }}
                />
                <span
                  className="relative z-10 text-[10px] font-medium transition-colors duration-300"
                  style={{ color: active ? "var(--brand)" : undefined }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

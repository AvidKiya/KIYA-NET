import type { HTMLAttributes, ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass rounded-3xl ${className}`} {...props}>
      {children}
    </div>
  );
}

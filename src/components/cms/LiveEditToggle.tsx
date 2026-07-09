"use client";

import { useCMS } from "./CMSContext";
import { Pencil, PencilOff } from "lucide-react";

export function LiveEditToggle() {
  const { isAdmin, liveEditMode, setLiveEditMode } = useCMS();

  if (!isAdmin) return null;

  return (
    <button
      onClick={() => setLiveEditMode(!liveEditMode)}
      className={`fixed bottom-20 left-4 z-[100] flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold shadow-2xl transition-all md:bottom-6 ${
        liveEditMode
          ? "bg-emerald-400 text-[#052018]"
          : "bg-[var(--glass-fill-strong)] text-[var(--ink)] border border-white/10"
      }`}
      style={{ backdropFilter: "blur(8px)" }}
    >
      {liveEditMode ? <PencilOff size={14} /> : <Pencil size={14} />}
      {liveEditMode ? "خروج از ویرایش زنده" : "ویرایش زنده"}
    </button>
  );
}

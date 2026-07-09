"use client";

interface EstimatedTimeProps {
  minutes: number;
  text?: string;
}

export function EstimatedTime({ minutes, text }: EstimatedTimeProps) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  let display = "";
  if (hours > 0) display += `${hours} ساعت `;
  if (mins > 0) display += `${mins} دقیقه`;

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
      ⏱ {text || display}
    </div>
  );
}
"use client";

import { useState } from "react";

const BOT_RESPONSES: Record<string, string> = {
  "سلام": "سلام! چطور می‌تونم کمکتون کنم؟",
  "سفارش": "برای ثبت سفارش به صفحه /order برید.",
  "قیمت": "قیمت‌ها در صفحه خدمات مشخص شده.",
  "پیگیری": "از صفحه پیگیری سفارش استفاده کنید.",
  "پشتیبانی": "تیکت پشتیبانی ثبت کنید یا با ما تماس بگیرید.",
  default: "متوجه نشدم. لطفاً سؤال خود را واضح‌تر بنویسید.",
};

export function SmartChatbot() {
  const [messages, setMessages] = useState<Array<{ from: string; text: string }>>([
    { from: "bot", text: "سلام! من دستیار هوشمند کیانت هستم. چطور کمکتون کنم؟" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;

    const userMsg = input.trim().toLowerCase();
    setMessages(prev => [...prev, { from: "user", text: input }]);

    let response = BOT_RESPONSES.default;
    for (const key in BOT_RESPONSES) {
      if (userMsg.includes(key)) {
        response = BOT_RESPONSES[key];
        break;
      }
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { from: "bot", text: response }]);
    }, 600);

    setInput("");
  };

  return (
    <div className="glass rounded-2xl p-4 w-full max-w-md">
      <div className="h-64 overflow-y-auto space-y-3 mb-3 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={m.from === "user" ? "text-right" : ""}>
            <div className={`inline-block px-4 py-2 rounded-2xl ${m.from === "user" ? "bg-[var(--brand)] text-black" : "bg-white/10"}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="سؤال خود را بنویسید..."
          className="flex-1 rounded-xl bg-white/5 px-4 py-2 text-sm"
        />
        <button onClick={send} className="btn-brand px-5 rounded-xl">ارسال</button>
      </div>
    </div>
  );
}

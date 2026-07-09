"use client";

import { useState } from "react";

export function SupportTicket() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!subject || !message) return;

    await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });

    setSubmitted(true);
    setSubject("");
    setMessage("");
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-bold mb-4">ارسال تیکت پشتیبانی</h3>
      
      {submitted ? (
        <div className="text-emerald-400">تیکت شما با موفقیت ثبت شد.</div>
      ) : (
        <div className="space-y-4">
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="موضوع"
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm"
          />
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="توضیحات..."
            rows={4}
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm"
          />
          <button onClick={submit} className="btn-brand px-6 py-2.5 rounded-xl text-sm">
            ارسال تیکت
          </button>
        </div>
      )}
    </div>
  );
}
```

---

### ۲. چت‌بات هوشمند ساده

```tsx
// src/components/SmartChatbot.tsx
```
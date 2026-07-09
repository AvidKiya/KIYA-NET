"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Paperclip } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  messageText: string;
  messageType: string;
  createdAt: string;
}

interface LiveChatProps {
  orderId: string;
  currentUserId: string;
}

export function LiveChat({ orderId, currentUserId }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = async (since?: string) => {
    try {
      const url = since 
        ? `/api/chat/messages?orderId=${orderId}&since=${since}`
        : `/api/chat/messages?orderId=${orderId}`;
      
      const res = await fetch(url);
      if (!res.ok) return;
      
      const data: Message[] = await res.json();
      
      if (since) {
        setMessages(prev => [...prev, ...data]);
      } else {
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  // Initial load + polling
  useEffect(() => {
    fetchMessages();

    // Poll every 3 seconds for new messages
    pollInterval.current = setInterval(() => {
      if (messages.length > 0) {
        const lastMessageTime = messages[messages.length - 1].createdAt;
        fetchMessages(lastMessageTime);
      }
    }, 3000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [orderId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          messageText: newMessage.trim(),
        }),
      });

      if (res.ok) {
        const sentMessage = await res.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[400px] flex-col rounded-2xl border border-white/10 bg-black/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[var(--ink)]">چت زنده با اپراتور</p>
          <p className="text-[10px] text-emerald-400">آنلاین • پاسخگویی سریع</p>
        </div>
        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-xs text-[var(--ink-dim)]">
            هنوز پیامی ارسال نشده.<br />اولین پیام را بفرستید.
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMine
                    ? "bg-[var(--brand)] text-black"
                    : "bg-white/10 text-[var(--ink)]"
                }`}
              >
                <p>{msg.messageText}</p>
                <p className="mt-1 text-[9px] opacity-60">
                  {new Date(msg.createdAt).toLocaleTimeString("fa-IR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-white/10 p-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="پیام خود را بنویسید..."
          className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || isLoading}
          className="btn-brand flex h-10 w-10 items-center justify-center rounded-xl disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
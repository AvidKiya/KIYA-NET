"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, LayoutDashboard, ListOrdered, Settings, CheckCircle2, Clock, Loader2,
  AlertCircle, XCircle, RefreshCcw, UserCheck, Wallet, Save, Edit3, X, Lock, KeyRound,
  Plus, Trash2, BadgePercent, CreditCard, Banknote, Upload, Search, ArrowLeft, LogOut,
  Bot, MessageCircle, Send, Newspaper, Gamepad2,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CMSAdminPanel } from "@/components/cms/CMSAdminPanel";

const SM: Record<string,{label:string;icon:any;color:string;bg:string}> = {
  PENDING_ASSIGNMENT:{label:"در انتظار",icon:Clock,color:"text-amber-400",bg:"bg-amber-400/10 border-amber-400/20"},
  UNDER_REVIEW:{label:"بررسی",icon:Loader2,color:"text-blue-400",bg:"bg-blue-400/10 border-blue-400/20"},
  NEEDS_INFO:{label:"نیازمند اطلاعات",icon:AlertCircle,color:"text-orange-400",bg:"bg-orange-400/10 border-orange-400/20"},
  IN_PROGRESS:{label:"در حال انجام",icon:Loader2,color:"text-purple-400",bg:"bg-purple-400/10 border-purple-400/20"},
  COMPLETED:{label:"تکمیل",icon:CheckCircle2,color:"text-emerald-300",bg:"bg-emerald-400/10 border-emerald-400/20"},
  CANCELLED:{label:"لغو",icon:XCircle,color:"text-red-400",bg:"bg-red-400/10 border-red-400/20"},
};

const ALL_MODULES = [
  { id: "JUDICIAL", label: "امور قضایی و حقوقی" },
  { id: "UNIV", label: "دانشگاه و آزمون‌ها" },
  { id: "TAX", label: "مالیات و اصناف" },
  { id: "LOAN", label: "وام و بانک" },
  { id: "POLICE", label: "خودرو و پلیس +۱۰" },
  { id: "DESIGN", label: "طراحی و چاپ" },
  { id: "INSURANCE", label: "تامین اجتماعی" },
];

const PERMISSION_CATEGORIES = [
  {
    key: "orders",
    label: "سفارش‌ها",
    items: [
      { key: "view", label: "مشاهده سفارشات" },
      { key: "assign", label: "قبول/تخصیص سفارش" },
      { key: "changeStatus", label: "تغییر وضعیت سفارش" },
    ],
  },
  {
    key: "services",
    label: "نرخنامه",
    items: [
      { key: "view", label: "مشاهده خدمات" },
      { key: "edit", label: "ویرایش قیمت/تخفیف" },
    ],
  },
  {
    key: "receipts",
    label: "رسیدها",
    items: [
      { key: "view", label: "مشاهده رسیدها" },
      { key: "approve", label: "تأیید رسید" },
      { key: "reject", label: "رد رسید" },
    ],
  },
  {
    key: "withdrawals",
    label: "برداشت‌ها",
    items: [
      { key: "view", label: "مشاهده درخواست‌ها" },
      { key: "approve", label: "تأیید برداشت" },
      { key: "reject", label: "رد برداشت" },
    ],
  },
  {
    key: "payments",
    label: "مالی",
    items: [
      { key: "withdraw", label: "درخواست برداشت (اپراتور)" },
      { key: "manage", label: "مدیریت مالی (مدیر)" },
    ],
  },
  {
    key: "bots",
    label: "ربات‌ها",
    items: [
      { key: "view", label: "مشاهده" },
      { key: "manage", label: "تنظیم/تست وب‌هوک" },
    ],
  },
  {
    key: "news",
    label: "اخبار",
    items: [
      { key: "view", label: "مشاهده" },
      { key: "manage", label: "مدیریت منابع RSS" },
    ],
  },
  {
    key: "games",
    label: "بازی‌ها",
    items: [
      { key: "view", label: "مشاهده" },
      { key: "manage", label: "مدیریت تنظیمات" },
    ],
  },
  {
    key: "cms",
    label: "مدیریت محتوا",
    items: [
      { key: "view", label: "مشاهده" },
      { key: "manage", label: "ویرایش محتوا" },
    ],
  },
  {
    key: "settings",
    label: "تنظیمات",
    items: [
      { key: "view", label: "مشاهده" },
      { key: "manage", label: "مدیریت درگاه/کارت" },
    ],
  },
  {
    key: "operators",
    label: "اپراتورها",
    items: [
      { key: "view", label: "مشاهده" },
      { key: "manage", label: "افزودن/ویرایش/حذف" },
    ],
  },
];

const getFullPermissions = () => {
  const perms: Record<string, any> = {};
  for (const cat of PERMISSION_CATEGORIES) {
    perms[cat.key] = {};
    for (const item of cat.items) {
      perms[cat.key][item.key] = true;
    }
  }
  return perms;
};

const getDefaultOperatorPermissions = () => {
  const perms: Record<string, any> = {};
  for (const cat of PERMISSION_CATEGORIES) {
    perms[cat.key] = {};
    for (const item of cat.items) {
      perms[cat.key][item.key] = false;
    }
  }
  // Default operator can only view/assign/change status orders and request withdrawal
  perms.orders = { view: true, assign: true, changeStatus: true };
  perms.payments = { withdraw: true, manage: false };
  return perms;
};

const checkPerm = (permissions: Record<string, any> | null | undefined, category: string, action: string) => {
  if (!permissions) return false;
  return permissions[category]?.[action] === true;
};

const canAccessTab = (user: any, tab: string) => {
  if (user?.role === "SUPER_ADMIN") return true;
  const perms = user?.permissions || {};
  switch (tab) {
    case "dashboard": return true;
    case "orders": return checkPerm(perms, "orders", "view");
    case "services": return checkPerm(perms, "services", "view");
    case "operators": return checkPerm(perms, "operators", "view");
    case "payments": return checkPerm(perms, "payments", "withdraw") || checkPerm(perms, "payments", "manage") || checkPerm(perms, "withdrawals", "view") || checkPerm(perms, "receipts", "view");
    case "receipts": return checkPerm(perms, "receipts", "view");
    case "bots": return checkPerm(perms, "bots", "view");
    case "news": return checkPerm(perms, "news", "view");
    case "games": return checkPerm(perms, "games", "view");
    case "cms": return checkPerm(perms, "cms", "view");
    case "settings": return checkPerm(perms, "settings", "view");
    default: return false;
  }
};

export default function AdminPage() {
  const r = useRouter();
  // Auth state
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [needsPwChange, setNeedsPwChange] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwChangeMsg, setPwChangeMsg] = useState("");

  // Data state
  const [tab, setTab] = useState("dashboard");
  const [orders, setOrders] = useState<any[]>([]);
  const [svcs, setSvcs] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Service editing
  const [editingSvc, setEditingSvc] = useState<any>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editDiscount, setEditDiscount] = useState("");

  // Operator management
  const [newOpPhone, setNewOpPhone] = useState("");
  const [newOpModules, setNewOpModules] = useState<string[]>([]);
  const [newOpCommission, setNewOpCommission] = useState("10");
  const [newOpPermissions, setNewOpPermissions] = useState<Record<string, any>>(getDefaultOperatorPermissions());
  const [showAddOp, setShowAddOp] = useState(false);
  const [editingOpId, setEditingOpId] = useState<string | null>(null);
  const [opActionMsg, setOpActionMsg] = useState<string | null>(null);

  // Payment requests
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [withdrawFilter, setWithdrawFilter] = useState("all");
  const [withdrawRejectReason, setWithdrawRejectReason] = useState("");
  const [withdrawRejectingId, setWithdrawRejectingId] = useState<string | null>(null);
  const [withdrawReceiptUrl, setWithdrawReceiptUrl] = useState("");
  const [withdrawAdminNote, setWithdrawAdminNote] = useState("");

  // News feeds
  const [newsFeeds, setNewsFeeds] = useState<any[]>([]);
  const [newsFeedsLoading, setNewsFeedsLoading] = useState(false);
  const [newsForm, setNewsForm] = useState({ sourceName: "", rssUrl: "", category: "عمومی" });
  const [newsMsg, setNewsMsg] = useState<string | null>(null);

  // Game config
  const [gameConfigRows, setGameConfigRows] = useState<any[]>([]);
  const [gameConfigLoading, setGameConfigLoading] = useState(false);
  const [gameForm, setGameForm] = useState({ key: "", value: "" });
  const [gameMsg, setGameMsg] = useState<string | null>(null);

  // Bot management
  const [telegramToken, setTelegramToken] = useState("");
  const [baleToken, setBaleToken] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [botTestLoading, setBotTestLoading] = useState<{ telegram: boolean; bale: boolean }>({ telegram: false, bale: false });
  const [botTestResult, setBotTestResult] = useState<{ telegram: string | null; bale: string | null }>({ telegram: null, bale: null });
  const [webhookLoading, setWebhookLoading] = useState<{ telegram: boolean; bale: boolean }>({ telegram: false, bale: false });
  const [webhookResult, setWebhookResult] = useState<{ telegram: string | null; bale: string | null }>({ telegram: null, bale: null });
  const [tokenSaveMsg, setTokenSaveMsg] = useState<{ telegram: string | null; bale: string | null }>({ telegram: null, bale: null });

  // Card-to-card receipts
  const [receipts, setReceipts] = useState<any[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [receiptFilter, setReceiptFilter] = useState("all");
  const [receiptActionMsg, setReceiptActionMsg] = useState<string | null>(null);
  const [receiptRejectReason, setReceiptRejectReason] = useState("");
  const [receiptRejectingId, setReceiptRejectingId] = useState<string | null>(null);

  // Payment gateway settings
  const [paymentGateway, setPaymentGateway] = useState("test");
  const [zarinpalMerchant, setZarinpalMerchant] = useState("");
  const [paypingToken, setPaypingToken] = useState("");
  const [paymentSettingsMsg, setPaymentSettingsMsg] = useState<string | null>(null);


  const fmt = (p: string) => Number(p || 0).toLocaleString("fa-IR");
  const fd = (d: string) => new Date(d).toLocaleDateString("fa-IR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const hasPerm = (category: string, action: string) => user?.role === "SUPER_ADMIN" || checkPerm(user?.permissions, category, action);

  // Check if already logged in via session
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user && (d.user.role === "OPERATOR" || d.user.role === "SUPER_ADMIN")) {
        setUser(d.user);
        setAuthenticated(true);
        loadData();
      }
    }).catch(() => {}).finally(() => setAuthLoading(false));
  }, []);

  const loadData = async () => {
    const [o, s] = await Promise.all([fetch("/api/orders"), fetch("/api/services")]);
    const od = await o.json(); const sd = await s.json();
    if (od.orders) setOrders(od.orders); if (sd.services) setSvcs(sd.services);
    // Load operators
    fetch("/api/admin/operators").then(r => r.json()).then(d => { if (d.operators) setOperators(d.operators); }).catch(() => {});
    setLoading(false);
  };

  useEffect(() => {
    if (tab === "receipts") loadReceipts();
    if (tab === "settings") loadPaymentSettings();
    if (tab === "payments") loadWithdrawals();
    if (tab === "news") loadNewsFeeds();
    if (tab === "games") loadGameConfig();
  }, [tab]);

  const handleLogin = async () => {
    setLoginErr("");
    if (!loginPhone || !loginPass) { setLoginErr("شماره و رمز را وارد کنید"); return; }
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phoneNumber: loginPhone, password: loginPass }) });
      const d = await res.json();
      if (d.success) {
        setUser(d.user); setAuthenticated(true);
        if (d.needsPasswordChange) setNeedsPwChange(true);
        loadData();
      } else setLoginErr(d.error || "خطا در ورود");
    } catch { setLoginErr("خطا در اتصال"); }
    finally { setAuthLoading(false); }
  };

  const handleChangePassword = async () => {
    if (!newPw || newPw.length < 8) { setPwChangeMsg("حداقل ۸ کاراکتر"); return; }
    try {
      const res = await fetch("/api/auth/admin-change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }) });
      const d = await res.json();
      if (d.success) { setNeedsPwChange(false); setPwChangeMsg(""); setCurrentPw(""); setNewPw(""); }
      else setPwChangeMsg(d.error);
    } catch { setPwChangeMsg("خطا"); }
  };

  const assignToMe = async (id: string) => { await fetch(`/api/orders/${id}/assign`, { method: "POST" }); loadData(); };
  const changeStatus = async (id: string, st: string) => { await fetch(`/api/orders/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: st }) }); loadData(); };

  const savePrice = async () => {
    if (!editingSvc) return;
    const discount = Number(editDiscount) || 0;
    const official = Number(editingSvc.officialPrice);
    const kiyanet = Math.round(official * (1 - discount / 100));
    const updated = { ...editingSvc, discountPercent: String(discount), kiyanetPrice: String(kiyanet) };
    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsert", table: "services", data: updated, recordId: editingSvc.id }),
      });
      const d = await res.json();
      if (d.success) {
        setSvcs(prev => prev.map(s => s.id === editingSvc.id ? updated : s));
        setEditingSvc(null);
      } else {
        alert(d.error || "خطا در ذخیره قیمت");
      }
    } catch {
      alert("خطا در ذخیره قیمت");
    }
  };

  const addOperator = async () => {
    if (!newOpPhone) return;
    try {
      const res = await fetch("/api/admin/operators", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phoneNumber: newOpPhone, modules: newOpModules, commission: Number(newOpCommission), permissions: newOpPermissions }) });
      const d = await res.json();
      setOpActionMsg(d.success ? (editingOpId ? "اپراتور بروزرسانی شد" : "اپراتور افزوده شد") : d.error || "خطا");
      setShowAddOp(false); setNewOpPhone(""); setNewOpModules([]); setNewOpCommission("10"); setNewOpPermissions(getDefaultOperatorPermissions()); setEditingOpId(null);
      loadData();
      setTimeout(() => setOpActionMsg(null), 3000);
    } catch {
      setOpActionMsg("خطا در ذخیره اپراتور");
    }
  };

  const startEditOperator = (op: any) => {
    setEditingOpId(op.id);
    setNewOpPhone(op.phoneNumber || "");
    setNewOpModules(Array.isArray(op.assignedModules) ? op.assignedModules : []);
    setNewOpCommission(String(op.commissionRate || "10"));
    setNewOpPermissions(op.permissions && Object.keys(op.permissions).length > 0 ? op.permissions : getDefaultOperatorPermissions());
    setShowAddOp(true);
  };

  const cancelEditOperator = () => {
    setEditingOpId(null);
    setNewOpPhone("");
    setNewOpModules([]);
    setNewOpCommission("10");
    setNewOpPermissions(getDefaultOperatorPermissions());
    setShowAddOp(false);
  };

  const togglePermission = (category: string, key: string) => {
    setNewOpPermissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category]?.[key],
      },
    }));
  };

  const deleteOperator = async (op: any) => {
    if (!confirm(`آیا مطمئنید که می‌خواهید دسترسی ${op.firstName || ""} ${op.lastName || ""} را حذف کنید؟`)) return;
    try {
      const res = await fetch("/api/admin/operators", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: op.id }),
      });
      const d = await res.json();
      setOpActionMsg(d.success ? "دسترسی اپراتور حذف شد" : d.error || "خطا");
      loadData();
      setTimeout(() => setOpActionMsg(null), 3000);
    } catch {
      setOpActionMsg("خطا در حذف اپراتور");
    }
  };

  const saveBotToken = async (platform: "telegram" | "bale") => {
    const token = platform === "telegram" ? telegramToken : baleToken;
    if (!token) return;
    try {
      const res = await fetch("/api/admin/bots/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform, token }) });
      const d = await res.json();
      setTokenSaveMsg(prev => ({ ...prev, [platform]: d.success ? "ذخیره شد" : d.error || "خطا" }));
      setTimeout(() => setTokenSaveMsg(prev => ({ ...prev, [platform]: null })), 3000);
    } catch {
      setTokenSaveMsg(prev => ({ ...prev, [platform]: "خطا در اتصال" }));
    }
  };

  const testBot = async (platform: "telegram" | "bale") => {
    setBotTestLoading(prev => ({ ...prev, [platform]: true }));
    setBotTestResult(prev => ({ ...prev, [platform]: null }));
    try {
      const res = await fetch("/api/admin/bots/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform }) });
      const d = await res.json();
      setBotTestResult(prev => ({ ...prev, [platform]: d.success ? `فعال: @${d.bot?.username || "نامشخص"}` : d.error || "خطا" }));
    } catch {
      setBotTestResult(prev => ({ ...prev, [platform]: "خطا در اتصال" }));
    } finally {
      setBotTestLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  const setupWebhook = async (platform: "telegram" | "bale") => {
    if (!publicUrl) return;
    setWebhookLoading(prev => ({ ...prev, [platform]: true }));
    setWebhookResult(prev => ({ ...prev, [platform]: null }));
    try {
      const res = await fetch("/api/admin/bots/setup-webhook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform, publicUrl }) });
      const d = await res.json();
      setWebhookResult(prev => ({ ...prev, [platform]: d.success ? `Webhook تنظیم شد: ${d.webhookUrl}` : d.error || "خطا" }));
    } catch {
      setWebhookResult(prev => ({ ...prev, [platform]: "خطا در اتصال" }));
    } finally {
      setWebhookLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  const submitWithdrawal = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) { setWithdrawMsg("مبلغ نامعتبر است"); return; }
    try {
      const res = await fetch("/api/wallet/withdraw", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(withdrawAmount), note: withdrawNote }) });
      const d = await res.json();
      setWithdrawMsg(d.success ? "درخواست برداشت ثبت شد" : d.error || "خطا");
      if (d.success) { setWithdrawAmount(""); setWithdrawNote(""); }
      setTimeout(() => setWithdrawMsg(null), 3000);
    } catch {
      setWithdrawMsg("خطا در ثبت درخواست");
    }
  };

  const loadWithdrawals = async () => {
    setWithdrawalsLoading(true);
    try {
      const res = await fetch("/api/admin/withdrawals");
      const d = await res.json();
      if (d.withdrawals) setWithdrawals(d.withdrawals);
    } catch {
      setWithdrawals([]);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const approveWithdrawal = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptUrl: withdrawReceiptUrl, adminNote: withdrawAdminNote }),
      });
      const d = await res.json();
      setWithdrawMsg(d.success ? "درخواست برداشت تأیید شد" : d.error || "خطا");
      setWithdrawReceiptUrl(""); setWithdrawAdminNote(""); setWithdrawRejectingId(null);
      loadWithdrawals();
      setTimeout(() => setWithdrawMsg(null), 3000);
    } catch {
      setWithdrawMsg("خطا در تأیید برداشت");
    }
  };

  const rejectWithdrawal = async (id: string) => {
    if (!withdrawRejectReason.trim()) return;
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: withdrawRejectReason }),
      });
      const d = await res.json();
      setWithdrawMsg(d.success ? "درخواست برداشت رد و مبلغ برگشت شد" : d.error || "خطا");
      setWithdrawRejectingId(null); setWithdrawRejectReason("");
      loadWithdrawals();
      setTimeout(() => setWithdrawMsg(null), 3000);
    } catch {
      setWithdrawMsg("خطا در رد برداشت");
    }
  };

  const loadNewsFeeds = async () => {
    setNewsFeedsLoading(true);
    try {
      const res = await fetch("/api/admin/news-feeds");
      const d = await res.json();
      if (d.feeds) setNewsFeeds(d.feeds);
    } catch {
      setNewsFeeds([]);
    } finally {
      setNewsFeedsLoading(false);
    }
  };

  const addNewsFeed = async () => {
    if (!newsForm.sourceName || !newsForm.rssUrl || !newsForm.category) return;
    try {
      const res = await fetch("/api/admin/news-feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsForm),
      });
      const d = await res.json();
      setNewsMsg(d.success ? "منبع خبری افزوده شد" : d.error || "خطا");
      if (d.success) { setNewsForm({ sourceName: "", rssUrl: "", category: "عمومی" }); loadNewsFeeds(); }
      setTimeout(() => setNewsMsg(null), 3000);
    } catch {
      setNewsMsg("خطا در افزودن منبع خبری");
    }
  };

  const deleteNewsFeed = async (id: number) => {
    if (!confirm("آیا مطمئنید؟")) return;
    try {
      const res = await fetch("/api/admin/news-feeds", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const d = await res.json();
      setNewsMsg(d.success ? "منبع خبری حذف شد" : d.error || "خطا");
      loadNewsFeeds();
      setTimeout(() => setNewsMsg(null), 3000);
    } catch {
      setNewsMsg("خطا در حذف منبع خبری");
    }
  };

  const loadGameConfig = async () => {
    setGameConfigLoading(true);
    try {
      const res = await fetch("/api/admin/game-config");
      const d = await res.json();
      if (d.config) setGameConfigRows(d.config);
    } catch {
      setGameConfigRows([]);
    } finally {
      setGameConfigLoading(false);
    }
  };

  const saveGameConfig = async (key: string, value: any) => {
    try {
      const res = await fetch("/api/admin/game-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const d = await res.json();
      setGameMsg(d.success ? "تنظیمات بازی ذخیره شد" : d.error || "خطا");
      loadGameConfig();
      setTimeout(() => setGameMsg(null), 3000);
    } catch {
      setGameMsg("خطا در ذخیره تنظیمات بازی");
    }
  };

  const deleteGameConfig = async (key: string) => {
    if (!confirm("آیا مطمئنید؟")) return;
    try {
      const res = await fetch("/api/admin/game-config", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const d = await res.json();
      setGameMsg(d.success ? "تنظیمات بازی حذف شد" : d.error || "خطا");
      loadGameConfig();
      setTimeout(() => setGameMsg(null), 3000);
    } catch {
      setGameMsg("خطا در حذف تنظیمات بازی");
    }
  };

  const loadReceipts = async () => {
    setReceiptsLoading(true);
    try {
      const res = await fetch("/api/admin/receipts");
      const d = await res.json();
      if (d.receipts) setReceipts(d.receipts);
    } catch {
      setReceipts([]);
    } finally {
      setReceiptsLoading(false);
    }
  };

  const approveReceipt = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/receipts/${id}/approve`, { method: "POST" });
      const d = await res.json();
      setReceiptActionMsg(d.success ? "رسید تأیید و موجودی شارژ شد" : d.error || "خطا");
      loadReceipts();
      setTimeout(() => setReceiptActionMsg(null), 3000);
    } catch {
      setReceiptActionMsg("خطا در تأیید رسید");
    }
  };

  const rejectReceipt = async (id: string) => {
    if (!receiptRejectReason.trim()) return;
    try {
      const res = await fetch(`/api/admin/receipts/${id}/reject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: receiptRejectReason }) });
      const d = await res.json();
      setReceiptActionMsg(d.success ? "رسید رد شد" : d.error || "خطا");
      setReceiptRejectingId(null);
      setReceiptRejectReason("");
      loadReceipts();
      setTimeout(() => setReceiptActionMsg(null), 3000);
    } catch {
      setReceiptActionMsg("خطا در رد رسید");
    }
  };

  const loadPaymentSettings = async () => {
    try {
      const res = await fetch("/api/admin/payment-settings");
      const d = await res.json();
      if (d.settings) {
        setPaymentGateway(d.settings.PAYMENT_GATEWAY || "test");
        setZarinpalMerchant(d.settings.ZARRINPAL_MERCHANT || "");
        setPaypingToken(d.settings.PAYPING_TOKEN || "");
      }
    } catch {}
  };

  const savePaymentSettings = async () => {
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentGateway, zarinpalMerchant, paypingToken }),
      });
      const d = await res.json();
      setPaymentSettingsMsg(d.success ? "تنظیمات پرداخت ذخیره شد" : d.error || "خطا");
      setTimeout(() => setPaymentSettingsMsg(null), 3000);
    } catch {
      setPaymentSettingsMsg("خطا در ذخیره تنظیمات");
    }
  };

  const toggleModule = (mid: string) => {
    setNewOpModules(prev => prev.includes(mid) ? prev.filter(m => m !== mid) : [...prev, mid]);
  };

  const pending = orders.filter(o => o.status === "PENDING_ASSIGNMENT");
  const active = orders.filter(o => !["COMPLETED", "CANCELLED"].includes(o.status));
  const completed = orders.filter(o => o.status === "COMPLETED");
  const rev = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const allTabs = [
    { k: "dashboard", l: "داشبورد", i: LayoutDashboard },
    { k: "orders", l: "سفارش‌ها", i: ListOrdered },
    { k: "services", l: "نرخنامه", i: BadgePercent },
    { k: "operators", l: "اپراتورها", i: Users },
    { k: "payments", l: "مالی و پرداخت", i: Wallet },
    { k: "receipts", l: "رسیدها", i: CreditCard },
    { k: "bots", l: "ربات‌ها", i: Bot },
    { k: "news", l: "اخبار", i: Newspaper },
    { k: "games", l: "بازی‌ها", i: Gamepad2 },
    { k: "cms", l: "مدیریت محتوا", i: Edit3 },
    { k: "settings", l: "تنظیمات", i: Settings },
  ];

  const tabs = allTabs.filter(t => canAccessTab(user, t.k));

  // If current tab is not accessible, switch to dashboard
  useEffect(() => {
    if (user && !canAccessTab(user, tab)) {
      setTab("dashboard");
    }
  }, [user, tab]);

  // AUTH SCREEN
  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 size={32} className="animate-spin text-emerald-400" /></div>;

  if (!authenticated) return (<>
    <SiteHeader />
    <div className="mx-auto max-w-md px-4 py-20">
      <GlassCard className="p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300"><Lock size={28} /></div>
        <h1 className="mt-5 text-xl font-extrabold text-[var(--ink)]">ورود به پنل مدیریت</h1>
        <p className="mt-2 text-xs text-[var(--ink-dim)]">شماره موبایل و رمز عبور مدیریت را وارد کنید</p>
        <div className="mt-6 space-y-3">
          <input value={loginPhone} onChange={e => setLoginPhone(e.target.value)} type="tel" placeholder="شماره موبایل (مثلاً ۰۶۹۰۹۰۱۰۳۸)" dir="ltr" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
          <input value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} type="password" placeholder="رمز عبور" dir="ltr" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left tracking-widest" />
          {loginErr && <p className="text-xs text-red-400">{loginErr}</p>}
          <button onClick={handleLogin} disabled={authLoading} className="btn-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold">
            {authLoading ? <Loader2 size={18} className="animate-spin" /> : <><Lock size={16} /> ورود به پنل</>}
          </button>
        </div>
        <p className="mt-4 text-[10px] text-[var(--ink-dim)]">دسترسی فقط برای اپراتورها و مدیران</p>
      </GlassCard>
    </div>
    <SiteFooter />
  </>);

  // FORCE PASSWORD CHANGE SCREEN
  if (needsPwChange) return (<>
    <SiteHeader />
    <div className="mx-auto max-w-md px-4 py-20">
      <GlassCard className="p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400"><KeyRound size={28} /></div>
        <h1 className="mt-5 text-xl font-extrabold text-[var(--ink)]">تغییر رمز عبور</h1>
        <p className="mt-2 text-xs text-[var(--ink-dim)]">برای امنیت بیشتر، رمز پیش‌فرض را تغییر دهید</p>
        <div className="mt-6 space-y-3">
          <input value={currentPw} onChange={e => setCurrentPw(e.target.value)} type="password" placeholder="رمز فعلی (پیش‌فرض: AvidKiya*2397*7370#)" dir="ltr" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
          <input value={newPw} onChange={e => setNewPw(e.target.value)} type="password" placeholder="رمز جدید (حداقل ۸ کاراکتر)" dir="ltr" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
          {pwChangeMsg && <p className="text-xs text-red-400">{pwChangeMsg}</p>}
          <button onClick={handleChangePassword} className="btn-brand flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold"><Save size={16} /> ذخیره رمز جدید</button>
        </div>
      </GlassCard>
    </div>
    <SiteFooter />
  </>);

  // MAIN PANEL
  return (<>
    <SiteHeader />
    <div className="mx-auto max-w-7xl px-4 py-6 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--ink)]">پنل مدیریت کیانت</h1>
          <p className="text-[11px] text-[var(--ink-dim)]">{user?.firstName} {user?.lastName} — {user?.role === "SUPER_ADMIN" ? "مدیر کل" : "اپراتور"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"><RefreshCcw size={14} /> بروزرسانی</button>
          <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); r.push("/"); r.refresh(); }} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-red-300"><LogOut size={14} /> خروج</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${tab === t.k ? "bg-emerald-400/15 text-emerald-300" : "btn-glass text-[var(--ink-dim)]"}`}>
            {t.l}
            {t.k === "orders" && pending.length > 0 && <span className="mr-1 text-amber-400">({pending.length})</span>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ===== DASHBOARD ===== */}
        {tab === "dashboard" && <motion.div key="d" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[{ l: "در انتظار", v: pending.length, i: Clock, c: "text-amber-400" }, { l: "فعال", v: active.length, i: Loader2, c: "text-blue-400" }, { l: "تکمیل", v: completed.length, i: CheckCircle2, c: "text-emerald-300" }, { l: "درآمد کل", v: fmt(String(rev)) + " ت", i: Wallet, c: "text-violet-400" }].map((s, i) => { const I = s.i; return <GlassCard key={i} className="text-center p-5"><I size={22} className={`mx-auto ${s.c}`} /><p className="mt-2 text-xl font-extrabold text-[var(--ink)]">{s.v}</p><p className="text-[11px] text-[var(--ink-dim)]">{s.l}</p></GlassCard>; })}
          </div>
          <h3 className="text-sm font-bold text-[var(--ink)]">آخرین سفارش‌ها</h3>
          <div className="space-y-2">{orders.slice(0, 5).map(o => { const info = SM[o.status] || SM.PENDING_ASSIGNMENT; const I = info.icon; return <GlassCard key={o.id} className="flex items-center justify-between p-4"><div><span className="font-mono text-[11px] text-emerald-300">{o.id}</span><span className={`mr-2 rounded-full px-2 py-0.5 text-[10px] inline-flex items-center gap-1 ${info.bg} ${info.color}`}><I size={10} />{info.label}</span><p className="text-sm font-medium text-[var(--ink)] mt-1">{o.serviceName}</p><p className="text-[11px] text-[var(--ink-dim)]">{o.customerPhone} — {fmt(o.totalAmount)} تومان</p></div></GlassCard>; })}</div>
        </motion.div>}

        {/* ===== ORDERS ===== */}
        {tab === "orders" && <motion.div key="o" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-wrap gap-2">{[{ k: "all", l: "همه" }, { k: "PENDING_ASSIGNMENT", l: "در انتظار" }, { k: "IN_PROGRESS", l: "در حال انجام" }, { k: "NEEDS_INFO", l: "نیازمند اطلاعات" }, { k: "COMPLETED", l: "تکمیل" }, { k: "CANCELLED", l: "لغو" }].map(f => <button key={f.k} onClick={() => setFilter(f.k)} className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${filter === f.k ? "bg-emerald-400/20 text-emerald-300" : "btn-glass text-[var(--ink-dim)]"}`}>{f.l}</button>)}</div>
          <div className="space-y-3">{filtered.map(o => { const info = SM[o.status] || SM.PENDING_ASSIGNMENT; const I = info.icon; const canAssign = user?.role === "SUPER_ADMIN" || checkPerm(user?.permissions, "orders", "assign"); const canChangeStatus = user?.role === "SUPER_ADMIN" || checkPerm(user?.permissions, "orders", "changeStatus"); return <GlassCard key={o.id} className="p-5"><div><span className="font-mono text-xs font-bold text-emerald-300">{o.id}</span><span className={`mr-2 rounded-full px-2.5 py-0.5 text-[10px] inline-flex items-center gap-1 ${info.bg} ${info.color}`}><I size={11} />{info.label}</span><h4 className="font-bold text-sm text-[var(--ink)] mt-1">{o.serviceName}</h4><p className="text-[11px] text-[var(--ink-dim)] mt-1">{o.customerPhone} — {fmt(o.totalAmount)} تومان — {fd(o.createdAt)}</p></div>{o.userNotes && <div className="rounded-xl bg-white/5 p-3 text-xs text-[var(--ink-dim)] mt-3">{o.userNotes}</div>}<div className="flex flex-wrap gap-2 mt-3">{canAssign && o.status === "PENDING_ASSIGNMENT" && <button onClick={() => assignToMe(o.id)} className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"><UserCheck size={14} /> قبول</button>}{canChangeStatus && ["UNDER_REVIEW", "NEEDS_INFO"].includes(o.status) && <button onClick={() => changeStatus(o.id, "IN_PROGRESS")} className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"><Loader2 size={14} /> شروع</button>}{canChangeStatus && o.status === "IN_PROGRESS" && <button onClick={() => changeStatus(o.id, "COMPLETED")} className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"><CheckCircle2 size={14} /> تکمیل</button>}{canChangeStatus && !["COMPLETED", "CANCELLED"].includes(o.status) && <><button onClick={() => changeStatus(o.id, "NEEDS_INFO")} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium"><AlertCircle size={14} /> مدارک</button><button onClick={() => changeStatus(o.id, "CANCELLED")} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-red-300"><XCircle size={14} /> لغو</button></>}</div></GlassCard>; })}</div>
        </motion.div>}

        {/* ===== SERVICES ===== */}
        {tab === "services" && <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-[var(--ink)]">مدیریت نرخنامه ۱۴۰۵</h2><span className="text-xs text-[var(--ink-dim)]">قیمت مصوب ثابت — درصد تخفیف را تغییر دهید</span></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {svcs.map(s => {
              const currentDiscount = Math.round(((Number(s.officialPrice) - Number(s.kiyanetPrice)) / Number(s.officialPrice)) * 100);
              return <GlassCard key={s.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1"><h4 className="text-sm font-bold text-[var(--ink)] leading-snug">{s.serviceName}</h4>
                    {editingSvc?.id === s.id ? (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--ink-dim)]">درصد تخفیف:</span>
                          <input type="number" value={editDiscount} onChange={e => setEditDiscount(e.target.value)} className="w-20 rounded-lg border border-emerald-400/50 bg-white/5 px-3 py-1.5 text-sm font-bold text-emerald-300 outline-none" />
                          <span className="text-xs text-[var(--ink-dim)]">٪</span>
                        </div>
                        <p className="text-xs text-[var(--ink-dim)]">قیمت مصوب: {fmt(s.officialPrice)} → قیمت با تخفیف: <span className="text-emerald-300 font-bold">{fmt(String(Math.round(Number(s.officialPrice) * (1 - Number(editDiscount || 0) / 100))))}</span> تومان</p>
                        <div className="flex gap-2"><button onClick={savePrice} className="btn-brand rounded-lg px-3 py-1.5 text-xs font-bold"><Save size={12} /> ذخیره</button><button onClick={() => setEditingSvc(null)} className="btn-glass rounded-lg px-3 py-1.5 text-xs"><X size={12} /></button></div>
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className="text-[var(--ink-dim)]">مصوب: {fmt(s.officialPrice)}</span>
                        <span className="font-extrabold text-emerald-300">کیانت: {fmt(s.kiyanetPrice)} تومان</span>
                        <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">{currentDiscount}٪ تخفیف</span>
                      </div>
                    )}
                  </div>
                  {editingSvc?.id !== s.id && (user?.role === "SUPER_ADMIN" || checkPerm(user?.permissions, "services", "edit")) && <button onClick={() => { setEditingSvc(s); setEditDiscount(String(currentDiscount)); }} className="btn-glass rounded-lg p-2 shrink-0"><Edit3 size={14} /></button>}
                </div>
              </GlassCard>;
            })}
          </div>
        </motion.div>}

        {/* ===== OPERATORS ===== */}
        {tab === "operators" && <motion.div key="op" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-[var(--ink)]">مدیریت اپراتورها</h2>
            {user?.role === "SUPER_ADMIN" && <button onClick={() => { if (showAddOp && editingOpId) cancelEditOperator(); else setShowAddOp(!showAddOp); }} className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold">{showAddOp ? <X size={14} /> : <Plus size={14} />}{showAddOp ? "بستن" : "افزودن اپراتور"}</button>}
          </div>

          {opActionMsg && <p className={`text-xs ${opActionMsg.includes("خطا") ? "text-red-400" : "text-emerald-300"}`}>{opActionMsg}</p>}

          {showAddOp && <GlassCard className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--ink)]">{editingOpId ? "ویرایش اپراتور" : "افزودن اپراتور جدید"}</h3>
            <input value={newOpPhone} onChange={e => setNewOpPhone(e.target.value)} type="tel" placeholder="شماره موبایل" dir="ltr" disabled={!!editingOpId} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left disabled:opacity-50" />
            <div>
              <p className="text-xs text-[var(--ink-dim)] mb-2">دسترسی به پیشخوان‌ها (دسته‌های خدمت):</p>
              <div className="flex flex-wrap gap-2">{ALL_MODULES.map(m => <button key={m.id} onClick={() => toggleModule(m.id)} className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${newOpModules.includes(m.id) ? "bg-emerald-400/20 text-emerald-300" : "btn-glass text-[var(--ink-dim)]"}`}>{m.label}</button>)}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--ink-dim)]">درصد پورسانت:</span>
              <input value={newOpCommission} onChange={e => setNewOpCommission(e.target.value)} type="number" className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-[var(--ink)] outline-none" />
              <span className="text-xs text-[var(--ink-dim)]">٪ از هر سفارش</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--ink)] mb-2">دسترسی‌های دانه‌ای در پنل:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {PERMISSION_CATEGORIES.map(cat => (
                  <div key={cat.key} className="rounded-xl bg-[var(--glass-fill-strong)] p-3">
                    <p className="text-xs font-bold text-emerald-300 mb-2">{cat.label}</p>
                    <div className="space-y-1.5">
                      {cat.items.map(item => (
                        <label key={item.key} className="flex items-center gap-2 text-xs text-[var(--ink-dim)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!newOpPermissions[cat.key]?.[item.key]}
                            onChange={() => togglePermission(cat.key, item.key)}
                            className="h-3.5 w-3.5 rounded border-white/10 bg-white/5 text-emerald-400 accent-emerald-400"
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addOperator} className="btn-brand rounded-xl px-5 py-2.5 text-xs font-bold">{editingOpId ? "بروزرسانی اپراتور" : "ذخیره اپراتور"}</button>
              {editingOpId && <button onClick={cancelEditOperator} className="btn-glass rounded-xl px-4 py-2.5 text-xs">انصراف</button>}
            </div>
          </GlassCard>}

          <div className="space-y-3">
            {operators.length === 0 ? <div className="text-center py-10"><Users size={32} className="mx-auto text-white/10" /><p className="mt-3 text-sm text-[var(--ink-dim)]">هنوز اپراتوری ثبت نشده</p></div> :
              operators.map((op: any) => <GlassCard key={op.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--ink)]">{op.firstName || "اپراتور"} {op.lastName || ""}</h4>
                    <p className="text-[11px] text-[var(--ink-dim)]" dir="ltr">{op.phoneNumber}</p>
                    <div className="mt-2 flex flex-wrap gap-1">{(op.assignedModules || []).map((m: string) => { const mod = ALL_MODULES.find(mm => mm.id === m); return <span key={m} className="rounded-full bg-[var(--glass-fill-strong)] px-2 py-0.5 text-[10px] text-[var(--ink-dim)]">{mod?.label || m}</span>; })}</div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="text-[var(--ink-dim)]">پورسانت: <span className="text-emerald-300 font-bold">{op.commissionRate || 10}٪</span></span>
                      <span className="text-[var(--ink-dim)]">سفارش‌ها: <span className="text-[var(--ink)] font-bold">{op.orderCount || 0}</span></span>
                      <span className="text-[var(--ink-dim)]">درآمد: <span className="text-emerald-300 font-bold">{fmt(op.earnings || "0")} تومان</span></span>
                    </div>
                  </div>
                  {hasPerm("operators", "manage") && <div className="flex gap-1">
                    <button onClick={() => startEditOperator(op)} className="btn-glass rounded-lg p-2" title="ویرایش"><Edit3 size={13} /></button>
                    <button onClick={() => deleteOperator(op)} className="btn-glass rounded-lg p-2 text-red-300" title="حذف"><Trash2 size={13} /></button>
                  </div>}
                </div>
              </GlassCard>)}
          </div>
        </motion.div>}

        {/* ===== PAYMENTS ===== */}
        {tab === "payments" && <motion.div key="pm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {withdrawMsg && <p className={`text-xs ${withdrawMsg.includes("خطا") ? "text-red-400" : "text-emerald-300"}`}>{withdrawMsg}</p>}
          {(user?.role === "SUPER_ADMIN" || checkPerm(user?.permissions, "payments", "withdraw")) && <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-[var(--ink)] mb-4">درخواست برداشت (اپراتورها)</h3>
            <p className="text-xs text-[var(--ink-dim)] mb-4">پرداخت‌ها هر پنج‌شنبه ساعت ۳ تا ۹ شب انجام می‌شود</p>
            <div className="space-y-3">
              <input value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} type="number" placeholder="مبلغ درخواستی (تومان)" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
              <input value={withdrawNote} onChange={e => setWithdrawNote(e.target.value)} placeholder="توضیحات (شماره کارت، بانک...)" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60" />
              <button onClick={submitWithdrawal} className="btn-brand flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"><Banknote size={16} /> ثبت درخواست برداشت</button>
            </div>
          </GlassCard>}

          {(user?.role === "SUPER_ADMIN" || checkPerm(user?.permissions, "withdrawals", "view")) && <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--ink)]">درخواست‌های برداشت</h3>
              <button onClick={loadWithdrawals} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"><RefreshCcw size={14} /> بروزرسانی</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">{[{ k: "all", l: "همه" }, { k: "PENDING", l: "در انتظار" }, { k: "APPROVED", l: "تأیید شده" }, { k: "REJECTED", l: "رد شده" }].map(f => <button key={f.k} onClick={() => setWithdrawFilter(f.k)} className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${withdrawFilter === f.k ? "bg-emerald-400/20 text-emerald-300" : "btn-glass text-[var(--ink-dim)]"}`}>{f.l}</button>)}</div>
            {withdrawalsLoading ? <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-300" /></div> :
              <div className="space-y-3">
                {withdrawals.filter((w: any) => withdrawFilter === "all" || w.status === withdrawFilter).length === 0 ? <p className="text-center py-10 text-sm text-[var(--ink-dim)]">درخواستی یافت نشد</p> :
                  withdrawals.filter((w: any) => withdrawFilter === "all" || w.status === withdrawFilter).map((w: any) => {
                    const canApprove = user?.role === "SUPER_ADMIN" || checkPerm(user?.permissions, "withdrawals", "approve");
                    const canReject = user?.role === "SUPER_ADMIN" || checkPerm(user?.permissions, "withdrawals", "reject");
                    return <div key={w.id} className="rounded-xl bg-[var(--glass-fill-strong)] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[var(--ink)]">{w.operatorName || ""} <span className="text-[11px] text-[var(--ink-dim)]" dir="ltr">{w.operatorPhone}</span></p>
                          <p className="mt-1 text-sm font-extrabold text-emerald-300">{fmt(w.amount)} تومان</p>
                          <p className="text-[11px] text-[var(--ink-dim)]">{new Date(w.createdAt).toLocaleString("fa-IR")}</p>
                          <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${w.status === "PENDING" ? "bg-amber-400/10 text-amber-400" : w.status === "APPROVED" ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>{w.status === "PENDING" ? "در انتظار" : w.status === "APPROVED" ? "تأیید شده" : "رد شده"}</span>
                          {w.adminNote && <p className="mt-1 text-[11px] text-[var(--ink-dim)]">یادداشت: {w.adminNote}</p>}
                        </div>
                      </div>
                      {w.status === "PENDING" && (canApprove || canReject) && (
                        <div className="mt-4 space-y-2">
                          {withdrawRejectingId === w.id ? (
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <input value={withdrawRejectReason} onChange={e => setWithdrawRejectReason(e.target.value)} placeholder="دلیل رد" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
                              {canReject && <button onClick={() => rejectWithdrawal(w.id)} className="btn-glass rounded-xl px-3 py-2 text-xs text-red-300">تایید رد</button>}
                              <button onClick={() => { setWithdrawRejectingId(null); setWithdrawRejectReason(""); }} className="btn-glass rounded-xl px-3 py-2 text-xs">انصراف</button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <input value={withdrawReceiptUrl} onChange={e => setWithdrawReceiptUrl(e.target.value)} placeholder="URL رسید پرداخت (اختیاری)" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" dir="ltr" />
                              <input value={withdrawAdminNote} onChange={e => setWithdrawAdminNote(e.target.value)} placeholder="یادداشت مدیر (مثلاً واریز شد، بانک سامان)" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
                            </div>
                          )}
                          {withdrawRejectingId !== w.id && (
                            <div className="flex gap-2">
                              {canApprove && <button onClick={() => approveWithdrawal(w.id)} className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold"><CheckCircle2 size={13} /> تأیید و تسویه</button>}
                              {canReject && <button onClick={() => setWithdrawRejectingId(w.id)} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2 text-xs text-red-300"><XCircle size={13} /> رد</button>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>;
                  })}
              </div>
            }
          </GlassCard>}

          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-[var(--ink)] mb-4">روش‌های پرداخت مشتریان</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[var(--glass-fill-strong)] p-4">
                <div className="flex items-center gap-2 mb-2"><CreditCard size={18} className="text-emerald-300" /><span className="text-sm font-medium text-[var(--ink)]">درگاه پرداخت آنلاین</span></div>
                <p className="text-[11px] text-[var(--ink-dim)]">پرداخت مستقیم از طریق درگاه شاپرک</p>
              </div>
              <div className="rounded-xl bg-[var(--glass-fill-strong)] p-4">
                <div className="flex items-center gap-2 mb-2"><Upload size={18} className="text-emerald-300" /><span className="text-sm font-medium text-[var(--ink)]">کارت به کارت</span></div>
                <p className="text-[11px] text-[var(--ink-dim)]">ارسال رسید و تایید توسط ادمین</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>}

        {/* ===== RECEIPTS ===== */}
        {tab === "receipts" && <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-[var(--ink)]">رسیدهای کارت به کارت</h2>
            <button onClick={loadReceipts} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"><RefreshCcw size={14} /> بروزرسانی</button>
          </div>
          {receiptActionMsg && <p className={`text-xs ${receiptActionMsg.includes("خطا") ? "text-red-400" : "text-emerald-300"}`}>{receiptActionMsg}</p>}
          <div className="flex flex-wrap gap-2">{[{ k: "all", l: "همه" }, { k: "PENDING", l: "در انتظار" }, { k: "APPROVED", l: "تأیید شده" }, { k: "REJECTED", l: "رد شده" }].map(f => <button key={f.k} onClick={() => setReceiptFilter(f.k)} className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${receiptFilter === f.k ? "bg-emerald-400/20 text-emerald-300" : "btn-glass text-[var(--ink-dim)]"}`}>{f.l}</button>)}</div>
          {receiptsLoading ? <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-300" /></div> :
            <div className="space-y-3">
              {receipts.filter(r => receiptFilter === "all" || r.status === receiptFilter).length === 0 ? <p className="text-center py-10 text-sm text-[var(--ink-dim)]">رسیدی یافت نشد</p> :
                receipts.filter(r => receiptFilter === "all" || r.status === receiptFilter).map(r => (
                  <GlassCard key={r.id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[var(--ink)]">{r.firstName || ""} {r.lastName || ""}</p>
                        <p className="text-[11px] text-[var(--ink-dim)]" dir="ltr">{r.phone}</p>
                        <p className="mt-2 text-sm font-extrabold text-emerald-300">{fmt(r.amount)} تومان</p>
                        <p className="text-[11px] text-[var(--ink-dim)]">{new Date(r.createdAt).toLocaleString("fa-IR")}</p>
                        {r.orderId && <p className="text-[11px] text-[var(--ink-dim)]">سفارش: {r.orderId}</p>}
                        <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${r.status === "PENDING" ? "bg-amber-400/10 text-amber-400" : r.status === "APPROVED" ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>{r.status === "PENDING" ? "در انتظار" : r.status === "APPROVED" ? "تأیید شده" : "رد شده"}</span>
                        {r.rejectionReason && <p className="mt-1 text-[11px] text-red-300">دلیل رد: {r.rejectionReason}</p>}
                      </div>
                      {r.receiptUrl && <a href={r.receiptUrl} target="_blank" rel="noreferrer" className="btn-glass rounded-lg px-3 py-2 text-xs">مشاهده رسید</a>}
                    </div>
                    {r.status === "PENDING" && (hasPerm("receipts", "approve") || hasPerm("receipts", "reject")) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {receiptRejectingId === r.id ? (
                          <div className="flex w-full flex-col gap-2 sm:flex-row">
                            <input value={receiptRejectReason} onChange={e => setReceiptRejectReason(e.target.value)} placeholder="دلیل رد" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
                            {hasPerm("receipts", "reject") && <button onClick={() => rejectReceipt(r.id)} className="btn-glass rounded-xl px-3 py-2 text-xs text-red-300">تایید رد</button>}
                            <button onClick={() => { setReceiptRejectingId(null); setReceiptRejectReason(""); }} className="btn-glass rounded-xl px-3 py-2 text-xs">انصراف</button>
                          </div>
                        ) : (
                          <>{hasPerm("receipts", "approve") && <button onClick={() => approveReceipt(r.id)} className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold"><CheckCircle2 size={13} /> تأیید</button>}{hasPerm("receipts", "reject") && <button onClick={() => setReceiptRejectingId(r.id)} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2 text-xs text-red-300"><XCircle size={13} /> رد</button>}</>
                        )}
                      </div>
                    )}
                  </GlassCard>
                ))}
            </div>
          }
        </motion.div>}

        {/* ===== BOTS ===== */}
        {tab === "bots" && <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-[var(--ink)]">مدیریت ربات‌ها</h2></div>

          <GlassCard className="p-6 space-y-4">
            <h3 className="font-bold text-[var(--ink)] flex items-center gap-2"><Bot size={18} className="text-emerald-300" /> آدرس عمومی سایت (دامنه Cloudflare Pages)</h3>
            <input value={publicUrl} onChange={e => setPublicUrl(e.target.value)} type="url" placeholder="https://kiya-net.pages.dev" dir="ltr" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
            <p className="text-xs text-[var(--ink-dim)]">این آدرس برای تنظیم webhook تلگرام و بله استفاده می‌شود و باید با https:// شروع شود.</p>
          </GlassCard>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Telegram */}
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center gap-2"><MessageCircle size={18} className="text-blue-400" /><h3 className="font-bold text-[var(--ink)]">ربات تلگرام</h3></div>
              {hasPerm("bots", "manage") ? (
                <>
                  <input value={telegramToken} onChange={e => setTelegramToken(e.target.value)} type="password" placeholder="توکن ربات تلگرام (مثلاً 123456:ABC-DEF...)" dir="ltr" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => saveBotToken("telegram")} className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"><Save size={14} /> ذخیره توکن</button>
                    <button onClick={() => testBot("telegram")} disabled={botTestLoading.telegram} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium"><Loader2 size={14} className={`${botTestLoading.telegram ? "animate-spin" : "hidden"}`} /> تست ربات</button>
                    <button onClick={() => setupWebhook("telegram")} disabled={webhookLoading.telegram || !publicUrl} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium"><Send size={14} /> تنظیم Webhook</button>
                  </div>
                  {tokenSaveMsg.telegram && <p className={`text-xs ${tokenSaveMsg.telegram === "ذخیره شد" ? "text-emerald-300" : "text-red-400"}`}>{tokenSaveMsg.telegram}</p>}
                  {botTestResult.telegram && <p className="text-xs text-blue-400">{botTestResult.telegram}</p>}
                  {webhookResult.telegram && <p className="text-xs text-[var(--ink-dim)] break-all">{webhookResult.telegram}</p>}
                </>
              ) : (
                <p className="text-xs text-[var(--ink-dim)]">شما فقط مشاهده‌گر ربات‌ها هستید.</p>
              )}
            </GlassCard>

            {/* Bale */}
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center gap-2"><MessageCircle size={18} className="text-emerald-300" /><h3 className="font-bold text-[var(--ink)]">ربات بله</h3></div>
              {hasPerm("bots", "manage") ? (
                <>
                  <input value={baleToken} onChange={e => setBaleToken(e.target.value)} type="password" placeholder="توکن ربات بله" dir="ltr" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => saveBotToken("bale")} className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"><Save size={14} /> ذخیره توکن</button>
                    <button onClick={() => testBot("bale")} disabled={botTestLoading.bale} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium"><Loader2 size={14} className={`${botTestLoading.bale ? "animate-spin" : "hidden"}`} /> تست ربات</button>
                    <button onClick={() => setupWebhook("bale")} disabled={webhookLoading.bale || !publicUrl} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium"><Send size={14} /> تنظیم Webhook</button>
                  </div>
                  {tokenSaveMsg.bale && <p className={`text-xs ${tokenSaveMsg.bale === "ذخیره شد" ? "text-emerald-300" : "text-red-400"}`}>{tokenSaveMsg.bale}</p>}
                  {botTestResult.bale && <p className="text-xs text-emerald-300">{botTestResult.bale}</p>}
                  {webhookResult.bale && <p className="text-xs text-[var(--ink-dim)] break-all">{webhookResult.bale}</p>}
                </>
              ) : (
                <p className="text-xs text-[var(--ink-dim)]">شما فقط مشاهده‌گر ربات‌ها هستید.</p>
              )}
            </GlassCard>
          </div>

          <GlassCard className="p-6">
            <h3 className="font-bold text-[var(--ink)] mb-2">راهنمای تنظیم ربات</h3>
            <ol className="space-y-2 text-xs leading-6 text-[var(--ink-dim)] list-decimal pr-4">
              <li>ربات را از BotFather (تلگرام) یا Bale (myidbot) ایجاد کنید و توکن را کپی کنید.</li>
              <li>توکن را در کادر بالا وارد کرده و «ذخیره توکن» را بزنید.</li>
              <li>آدرس عمومی سایت (Cloudflare Pages) را در کادر بالا وارد کنید.</li>
              <li>دکمه «تست ربات» را بزنید تا از فعال بودن ربات اطمینان حاصل کنید.</li>
              <li>دکمه «تنظیم Webhook» را بزنید تا ربات به سایت متصل شود.</li>
              <li>در ربات، دستور /start ارسال کنید؛ پیام خوش‌آمدگویی باید دریافت شود.</li>
              <li>برای Mini App، در ربات دکمه‌ای با آدرس <code dir="ltr" className="rounded bg-white/10 px-1">/miniapp?platform=telegram</code> یا <code dir="ltr" className="rounded bg-white/10 px-1">/miniapp?platform=bale</code> تنظیم کنید.</li>
            </ol>
          </GlassCard>
        </motion.div>}

        {/* ===== CMS ===== */}
        {tab === "news" && <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-[var(--ink)]">مدیریت منابع اخبار (RSS)</h2>
            <button onClick={loadNewsFeeds} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"><RefreshCcw size={14} /> بروزرسانی</button>
          </div>
          {newsMsg && <p className={`text-xs ${newsMsg.includes("خطا") ? "text-red-400" : "text-emerald-300"}`}>{newsMsg}</p>}
          {hasPerm("news", "manage") && <GlassCard className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--ink)]">افزودن منبع خبری</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              <input value={newsForm.sourceName} onChange={e => setNewsForm({ ...newsForm, sourceName: e.target.value })} placeholder="نام منبع (مثلاً ایسنا)" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
              <input value={newsForm.rssUrl} onChange={e => setNewsForm({ ...newsForm, rssUrl: e.target.value })} placeholder="آدرس RSS" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" dir="ltr" />
              <input value={newsForm.category} onChange={e => setNewsForm({ ...newsForm, category: e.target.value })} placeholder="دسته‌بندی" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
            </div>
            <button onClick={addNewsFeed} className="btn-brand flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"><Plus size={12} /> افزودن منبع</button>
          </GlassCard>}
          {newsFeedsLoading ? <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-300" /></div> :
            <div className="space-y-3">
              {newsFeeds.length === 0 ? <p className="text-center py-10 text-sm text-[var(--ink-dim)]">منبعی یافت نشد</p> :
                newsFeeds.map(f => (
                  <GlassCard key={f.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[var(--ink)]">{f.sourceName}</p>
                        <p className="text-[11px] text-[var(--ink-dim)]" dir="ltr">{f.rssUrl}</p>
                        <p className="text-[11px] text-emerald-300">{f.category}</p>
                      </div>
                      {hasPerm("news", "manage") && <button onClick={() => deleteNewsFeed(f.id)} className="btn-glass rounded-lg p-2 text-red-300"><Trash2 size={13} /></button>}
                    </div>
                  </GlassCard>
                ))}
            </div>
          }
        </motion.div>}

        {tab === "games" && <motion.div key="games" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-[var(--ink)]">تنظیمات بازی‌ها</h2>
            <button onClick={loadGameConfig} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"><RefreshCcw size={14} /> بروزرسانی</button>
          </div>
          {gameMsg && <p className={`text-xs ${gameMsg.includes("خطا") ? "text-red-400" : "text-emerald-300"}`}>{gameMsg}</p>}
          {hasPerm("games", "manage") && <GlassCard className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--ink)]">افزودن/ویرایش تنظیم</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              <input value={gameForm.key} onChange={e => setGameForm({ ...gameForm, key: e.target.value })} placeholder="کلید (مثلاً memory_active)" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" dir="ltr" />
              <input value={gameForm.value} onChange={e => setGameForm({ ...gameForm, value: e.target.value })} placeholder="مقدار (JSON یا متن)" className="sm:col-span-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--ink)] outline-none" />
            </div>
            <button onClick={() => { saveGameConfig(gameForm.key, gameForm.value); setGameForm({ key: "", value: "" }); }} className="btn-brand flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"><Save size={12} /> ذخیره تنظیم</button>
          </GlassCard>}
          <p className="text-xs text-[var(--ink-dim)]">مثال‌های کلید: <code>memory_active</code>، <code>reaction_active</code>، <code>quiz_active</code>، <code>puzzle_active</code>، <code>point_to_discount</code> (آرایه JSON).</p>
          {gameConfigLoading ? <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-300" /></div> :
            <div className="space-y-3">
              {gameConfigRows.length === 0 ? <p className="text-center py-10 text-sm text-[var(--ink-dim)]">تنظیمی یافت نشد</p> :
                gameConfigRows.map((cfg: any) => (
                  <GlassCard key={cfg.key} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[var(--ink)]">{cfg.key}</p>
                        <p className="text-[11px] text-[var(--ink-dim)] break-all" dir="ltr">{typeof cfg.value === "object" ? JSON.stringify(cfg.value) : String(cfg.value)}</p>
                      </div>
                      {hasPerm("games", "manage") && <button onClick={() => deleteGameConfig(cfg.key)} className="btn-glass rounded-lg p-2 text-red-300"><Trash2 size={13} /></button>}
                    </div>
                  </GlassCard>
                ))}
            </div>
          }
        </motion.div>}

        {tab === "cms" && <motion.div key="cms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[var(--ink)]">مدیریت محتوا</h2>
            <p className="text-xs text-[var(--ink-dim)]">{hasPerm("cms", "manage") ? "فقط مدیر کل/دارندگان دسترسی ویرایش می‌توانند محتوا را تغییر دهند" : "مشاهده‌گر — ویرایش محتوا نیازمند دسترسی مدیریت محتوا است"}</p>
          </div>
          {hasPerm("cms", "manage") ? <CMSAdminPanel /> : (
            <GlassCard className="p-6 text-center">
              <p className="text-sm text-[var(--ink-dim)]">شما دسترسی ویرایش محتوا ندارید.</p>
            </GlassCard>
          )}
        </motion.div>}

        {/* ===== SETTINGS ===== */}
        {tab === "settings" && <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-bold text-[var(--ink)]">اطلاعات مدیر</h3>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><span className="text-[var(--ink-dim)]">نام:</span> <span className="text-[var(--ink)]">{user?.firstName || "—"}</span></div>
              <div><span className="text-[var(--ink-dim)]">شماره:</span> <span className="text-[var(--ink)]" dir="ltr">{user?.phoneNumber}</span></div>
              <div><span className="text-[var(--ink-dim)]">نقش:</span> <span className="text-emerald-300 font-bold">{user?.role === "SUPER_ADMIN" ? "مدیر کل" : "اپراتور"}</span></div>
              <div><span className="text-[var(--ink-dim)]">کیف پول:</span> <span className="text-emerald-300 font-bold">{fmt(user?.walletBalance || "0")} تومان</span></div>
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="font-bold text-[var(--ink)] mb-4">تنظیمات زیرساخت</h3>
            <div className="space-y-3">
              {[{ l: "ربات تلگرام", s: "تنظیم نشده" }, { l: "ربات بله", s: "تنظیم نشده" }, { l: "درگاه پرداخت", s: "تنظیم نشده" }, { l: "سامانه پیامکی", s: "تنظیم نشده" }, { l: "Google OAuth", s: "تنظیم نشده" }].map((item, i) => <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"><span className="text-sm text-[var(--ink)]">{item.l}</span><span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] text-amber-400">{item.s}</span></div>)}
            </div>
          </GlassCard>

          {hasPerm("settings", "manage") && <GlassCard className="p-6 space-y-4">
            <h3 className="font-bold text-[var(--ink)] mb-2">تنظیمات درگاه پرداخت</h3>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">درگاه فعال</label>
              <select value={paymentGateway} onChange={e => setPaymentGateway(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60">
                <option value="test">حالت تست (بدون درگاه واقعی)</option>
                <option value="zarinpal">زرین‌پال</option>
                <option value="payping">پی‌پینگ</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">مرچنت کد زرین‌پال</label>
              <input value={zarinpalMerchant} onChange={e => setZarinpalMerchant(e.target.value)} type="password" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" dir="ltr" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--ink-dim)]">توکن پی‌پینگ</label>
              <input value={paypingToken} onChange={e => setPaypingToken(e.target.value)} type="password" placeholder="Bearer Token" dir="ltr" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
            </div>
            <button onClick={savePaymentSettings} className="btn-brand flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"><Save size={16} /> ذخیره تنظیمات پرداخت</button>
            {paymentSettingsMsg && <p className={`text-xs ${paymentSettingsMsg.includes("خطا") ? "text-red-400" : "text-emerald-300"}`}>{paymentSettingsMsg}</p>}
          </GlassCard>}
        </motion.div>}
      </AnimatePresence>
    </div>
    <SiteFooter />
  </>);
}

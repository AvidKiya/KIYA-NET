"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, LayoutDashboard, ListOrdered, Wrench, Settings, CheckCircle2, Clock, Loader2,
  AlertCircle, XCircle, RefreshCcw, UserCheck, Wallet, Save, Edit3, X, Lock, KeyRound,
  Plus, Trash2, BadgePercent, CreditCard, Banknote, Upload, Search, ArrowLeft, TrendingUp, LogOut,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

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
  const [showAddOp, setShowAddOp] = useState(false);

  // Payment requests
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");

  const fmt = (p: string) => Number(p || 0).toLocaleString("fa-IR");
  const fd = (d: string) => new Date(d).toLocaleDateString("fa-IR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

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
      const res = await fetch("/api/auth/admin-change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword: newPw }) });
      const d = await res.json();
      if (d.success) { setNeedsPwChange(false); setPwChangeMsg(""); }
      else setPwChangeMsg(d.error);
    } catch { setPwChangeMsg("خطا"); }
  };

  const assignToMe = async (id: string) => { await fetch(`/api/orders/${id}/assign`, { method: "POST" }); loadData(); };
  const changeStatus = async (id: string, st: string) => { await fetch(`/api/orders/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: st }) }); loadData(); };

  const savePrice = () => {
    if (!editingSvc) return;
    const discount = Number(editDiscount) || 0;
    const official = Number(editingSvc.officialPrice);
    const kiyanet = Math.round(official * (1 - discount / 100));
    setSvcs(prev => prev.map(s => s.id === editingSvc.id ? { ...s, kiyanetPrice: String(kiyanet) } : s));
    setEditingSvc(null);
  };

  const addOperator = async () => {
    if (!newOpPhone) return;
    try {
      await fetch("/api/admin/operators", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phoneNumber: newOpPhone, modules: newOpModules, commission: Number(newOpCommission) }) });
      setShowAddOp(false); setNewOpPhone(""); setNewOpModules([]);
      loadData();
    } catch {}
  };

  const toggleModule = (mid: string) => {
    setNewOpModules(prev => prev.includes(mid) ? prev.filter(m => m !== mid) : [...prev, mid]);
  };

  const pending = orders.filter(o => o.status === "PENDING_ASSIGNMENT");
  const active = orders.filter(o => !["COMPLETED", "CANCELLED"].includes(o.status));
  const completed = orders.filter(o => o.status === "COMPLETED");
  const rev = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const tabs = [
    { k: "dashboard", l: "داشبورد", i: LayoutDashboard },
    { k: "orders", l: "سفارش‌ها", i: ListOrdered },
    { k: "services", l: "نرخنامه", i: BadgePercent },
    { k: "operators", l: "اپراتورها", i: Users },
    { k: "payments", l: "مالی و پرداخت", i: Wallet },
    { k: "settings", l: "تنظیمات", i: Settings },
  ];

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
          <input value={loginPhone} onChange={e => setLoginPhone(e.target.value)} type="tel" placeholder="شماره موبایل (مثلاً ۰۹۱۲۳۴۵۶۷۸۹)" dir="ltr" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
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
          <div className="space-y-3">{filtered.map(o => { const info = SM[o.status] || SM.PENDING_ASSIGNMENT; const I = info.icon; return <GlassCard key={o.id} className="p-5"><div><span className="font-mono text-xs font-bold text-emerald-300">{o.id}</span><span className={`mr-2 rounded-full px-2.5 py-0.5 text-[10px] inline-flex items-center gap-1 ${info.bg} ${info.color}`}><I size={11} />{info.label}</span><h4 className="font-bold text-sm text-[var(--ink)] mt-1">{o.serviceName}</h4><p className="text-[11px] text-[var(--ink-dim)] mt-1">{o.customerPhone} — {fmt(o.totalAmount)} تومان — {fd(o.createdAt)}</p></div>{o.userNotes && <div className="rounded-xl bg-white/5 p-3 text-xs text-[var(--ink-dim)] mt-3">{o.userNotes}</div>}<div className="flex flex-wrap gap-2 mt-3">{o.status === "PENDING_ASSIGNMENT" && <button onClick={() => assignToMe(o.id)} className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"><UserCheck size={14} /> قبول</button>}{["UNDER_REVIEW", "NEEDS_INFO"].includes(o.status) && <button onClick={() => changeStatus(o.id, "IN_PROGRESS")} className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"><Loader2 size={14} /> شروع</button>}{o.status === "IN_PROGRESS" && <button onClick={() => changeStatus(o.id, "COMPLETED")} className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"><CheckCircle2 size={14} /> تکمیل</button>}{!["COMPLETED", "CANCELLED"].includes(o.status) && <><button onClick={() => changeStatus(o.id, "NEEDS_INFO")} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium"><AlertCircle size={14} /> مدارک</button><button onClick={() => changeStatus(o.id, "CANCELLED")} className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium text-red-300"><XCircle size={14} /> لغو</button></>}</div></GlassCard>; })}</div>
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
                  {editingSvc?.id !== s.id && <button onClick={() => { setEditingSvc(s); setEditDiscount(String(currentDiscount)); }} className="btn-glass rounded-lg p-2 shrink-0"><Edit3 size={14} /></button>}
                </div>
              </GlassCard>;
            })}
          </div>
        </motion.div>}

        {/* ===== OPERATORS ===== */}
        {tab === "operators" && <motion.div key="op" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-[var(--ink)]">مدیریت اپراتورها</h2>
            {user?.role === "SUPER_ADMIN" && <button onClick={() => setShowAddOp(!showAddOp)} className="btn-brand flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"><Plus size={14} /> افزودن اپراتور</button>}
          </div>

          {showAddOp && <GlassCard className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--ink)]">افزودن اپراتور جدید</h3>
            <input value={newOpPhone} onChange={e => setNewOpPhone(e.target.value)} type="tel" placeholder="شماره موبایل" dir="ltr" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
            <div>
              <p className="text-xs text-[var(--ink-dim)] mb-2">دسترسی به پیشخوان‌ها:</p>
              <div className="flex flex-wrap gap-2">{ALL_MODULES.map(m => <button key={m.id} onClick={() => toggleModule(m.id)} className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${newOpModules.includes(m.id) ? "bg-emerald-400/20 text-emerald-300" : "btn-glass text-[var(--ink-dim)]"}`}>{m.label}</button>)}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--ink-dim)]">درصد پورسانت:</span>
              <input value={newOpCommission} onChange={e => setNewOpCommission(e.target.value)} type="number" className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-[var(--ink)] outline-none" />
              <span className="text-xs text-[var(--ink-dim)]">٪ از هر سفارش</span>
            </div>
            <button onClick={addOperator} className="btn-brand rounded-xl px-5 py-2.5 text-xs font-bold">ذخیره اپراتور</button>
          </GlassCard>}

          <div className="space-y-3">
            {operators.length === 0 ? <div className="text-center py-10"><Users size={32} className="mx-auto text-white/10" /><p className="mt-3 text-sm text-[var(--ink-dim)]">هنوز اپراتوری ثبت نشده</p></div> :
              operators.map((op: any) => <GlassCard key={op.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--ink)]">{op.firstName || "اپراتور"} {op.lastName || ""}</h4>
                    <p className="text-[11px] text-[var(--ink-dim)]" dir="ltr">{op.phoneNumber}</p>
                    <div className="mt-2 flex flex-wrap gap-1">{(op.assignedModules || []).map((m: string) => { const mod = ALL_MODULES.find(mm => mm.id === m); return <span key={m} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--ink-dim)]">{mod?.label || m}</span>; })}</div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="text-[var(--ink-dim)]">پورسانت: <span className="text-emerald-300 font-bold">{op.commission || 10}٪</span></span>
                      <span className="text-[var(--ink-dim)]">سفارش‌ها: <span className="text-[var(--ink)] font-bold">{op.orderCount || 0}</span></span>
                      <span className="text-[var(--ink-dim)]">درآمد: <span className="text-emerald-300 font-bold">{fmt(op.earnings || "0")} تومان</span></span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="btn-glass rounded-lg p-2" title="ویرایش"><Edit3 size={13} /></button>
                    <button className="btn-glass rounded-lg p-2 text-red-300" title="حذف"><Trash2 size={13} /></button>
                  </div>
                </div>
              </GlassCard>)}
          </div>
        </motion.div>}

        {/* ===== PAYMENTS ===== */}
        {tab === "payments" && <motion.div key="pm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-[var(--ink)] mb-4">درخواست برداشت (اپراتورها)</h3>
            <p className="text-xs text-[var(--ink-dim)] mb-4">پرداخت‌ها هر پنج‌شنبه ساعت ۳ تا ۹ شب انجام می‌شود</p>
            <div className="space-y-3">
              <input value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} type="number" placeholder="مبلغ درخواستی (تومان)" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60 text-left" />
              <input value={withdrawNote} onChange={e => setWithdrawNote(e.target.value)} placeholder="توضیحات (شماره کارت، بانک...)" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-emerald-400/60" />
              <button className="btn-brand flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"><Banknote size={16} /> ثبت درخواست برداشت</button>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-[var(--ink)] mb-4">روش‌های پرداخت مشتریان</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2"><CreditCard size={18} className="text-emerald-300" /><span className="text-sm font-medium text-[var(--ink)]">درگاه پرداخت آنلاین</span></div>
                <p className="text-[11px] text-[var(--ink-dim)]">پرداخت مستقیم از طریق درگاه شاپرک</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2"><Upload size={18} className="text-emerald-300" /><span className="text-sm font-medium text-[var(--ink)]">کارت به کارت</span></div>
                <p className="text-[11px] text-[var(--ink-dim)]">ارسال رسید و تایید توسط ادمین</p>
              </div>
            </div>
          </GlassCard>
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
        </motion.div>}
      </AnimatePresence>
    </div>
    <SiteFooter />
  </>);
}

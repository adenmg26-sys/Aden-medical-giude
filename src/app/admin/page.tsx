"use client";

import React, { useState, useEffect } from "react";
import { Users, FileText, AlertTriangle, TrendingUp, Mail, ArrowLeft, MessageSquare, Clock, ArrowRight, ShieldCheck, Send } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useAdminContext } from "@/components/admin/AdminContext";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const { isStaff } = useAdminContext();
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [sending, setSending] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) return;
    setSending(true);
    try {
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: notifTitle, body: notifBody })
      });
      if (res.ok) {
        setNotifSuccess(true);
        setNotifTitle("");
        setNotifBody("");
        setTimeout(() => setNotifSuccess(false), 3000);
      } else {
        alert("فشل إرسال الإشعار. تأكد من إعدادات Firebase.");
      }
    } catch (e) {
      alert("خطأ في الاتصال بالخادم.");
    } finally {
      setSending(false);
    }
  };
  // Counts from local DB (Sync handles Supabase -> DB)
  const providersCount = useLiveQuery(() => db.providers.count()) || 0;
  const pendingCount = useLiveQuery(() => db.providers.where('status').equals('قيد المراجعة').count()) || 0;
  const reportsCount = useLiveQuery(() => db.reports.count()) || 0;
  const messagesCount = useLiveQuery(() => db.messages.count()) || 0;

  const stats = [
    { label: "إجمالي الأطباء والمراكز", value: providersCount.toString(), icon: <Users size={24} />, color: "text-primary-blue", bg: "bg-blue-100", href: "/admin/providers" },
    { label: "مساهمات معلقة", value: pendingCount.toString(), icon: <FileText size={24} />, color: "text-emerald-600", bg: "bg-emerald-100", href: "/admin/providers" },
    { label: "بلاغات تصحيح", value: reportsCount.toString(), icon: <AlertTriangle size={24} />, color: "text-rose-500", bg: "bg-rose-100", href: "/admin/reports" },
    { label: "رسائل جديدة", value: messagesCount.toString(), icon: <Mail size={24} />, color: "text-purple-600", bg: "bg-purple-100", href: "/admin/messages" },
  ];

  // Fetch real data from local DB
  const recentReports = useLiveQuery(() => db.reports.orderBy('date').reverse().limit(3).toArray()) || [];
  const recentContributions = useLiveQuery(() => db.providers.where('status').equals('قيد المراجعة').reverse().limit(5).toArray()) || [];
  const recentMessages = useLiveQuery(() => db.messages.orderBy('date').reverse().limit(3).toArray()) || [];

  const [visitStats, setVisitStats] = useState({ today: 0, month: 0, total: 0 });
  const [showHistory, setShowHistory] = useState(false);
  const [historyStats, setHistoryStats] = useState<{month: string, count: number}[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    if (!supabase) return;
    setLoadingHistory(true);
    setShowHistory(true);
    try {
      const results = [];
      const now = new Date();
      // Fetch for the last 6 months individually
      for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthName = d.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
        
        const { count } = await supabase.from('visits').select('*', { count: 'exact', head: true })
          .gte('visited_at', d.toISOString())
          .lt('visited_at', nextD.toISOString());
          
        results.push({ month: monthName, count: count || 0 });
      }
      setHistoryStats(results);
    } catch (e) {
      console.error("Error fetching history", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    const fetchVisits = async () => {
      if (!supabase) return;
      try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Since we can't easily do complex aggregations in a single query via JS client without RPC,
        // we do 3 count queries.
        const { count: total } = await supabase.from('visits').select('*', { count: 'exact', head: true });
        const { count: month } = await supabase.from('visits').select('*', { count: 'exact', head: true }).gte('visited_at', startOfMonth);
        const { count: today } = await supabase.from('visits').select('*', { count: 'exact', head: true }).gte('visited_at', startOfDay);

        setVisitStats({
          total: total || 0,
          month: month || 0,
          today: today || 0
        });
      } catch (e) {
        console.error("Error fetching visits", e);
      }
    };
    fetchVisits();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Section */}
      <div className="flex justify-between items-center bg-gradient-to-l from-primary-blue/10 to-transparent p-6 rounded-2xl border border-primary-blue/5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">مرحباً بك في لوحة التحكم 👋</h2>
          <p className="text-slate-500 text-sm mt-1 font-bold">إليك نظرة سريعة على ما يحدث في مرشد عدن الطبي اليوم.</p>
        </div>
        <div className="hidden sm:block">
          <Link href="/" className="flex items-center gap-2 text-primary-blue text-sm font-bold hover:underline">
            عرض الموقع الرئيسي <ArrowLeft size={16} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Link key={idx} href={stat.href}>
            <GlassCard className="p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer border-transparent hover:border-primary-blue/20">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-slate-800 leading-tight font-sans">{stat.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
              <ArrowLeft size={16} className="text-slate-300" />
            </GlassCard>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right">
        {/* Main Feed: Contributions & Reports */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-emerald-500" /> أحدث المساهمات
              </h2>
              <Link href="/admin/providers" className="text-xs font-bold text-primary-blue hover:underline">عرض الكل</Link>
            </div>
            <div className="space-y-3">
              {recentContributions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  لا توجد مساهمات معلقة حالياً
                </div>
              ) : recentContributions.map((p) => (
                <Link key={p.id} href="/admin/providers" className="block">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm border border-slate-100">
                      {p.type === 'centers' ? '🏥' : '👨‍⚕️'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{p.specialty} - {p.district}</p>
                    </div>
                    <div className="text-left">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-600 rounded-md text-[10px] font-bold border border-amber-200">قيد المراجعة</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={20} className="text-rose-500" /> أحدث بلاغات التصحيح
              </h2>
              <Link href="/admin/reports" className="text-xs font-bold text-primary-blue hover:underline">عرض الكل</Link>
            </div>
            <div className="space-y-3">
              {recentReports.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  لا توجد بلاغات تصحيح جديدة
                </div>
              ) : recentReports.map((report) => (
                <div key={report.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-rose-500 shadow-sm shrink-0 border border-slate-100">
                      <AlertTriangle size={20} />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                         <p className="text-sm font-bold text-slate-800">{report.provider_name}</p>
                         <span className="text-[9px] text-slate-400 font-sans">{new Date(report.date).toLocaleDateString('ar-YE')}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{report.content}</p>
                   </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-6 flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare size={20} className="text-purple-500" /> أحدث الرسائل
              </h2>
              <Link href="/admin/messages" className="text-xs font-bold text-primary-blue hover:underline">عرض الكل</Link>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              {recentMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Mail size={32} strokeWidth={1.5} />
                  <p className="text-xs font-bold">لا توجد رسائل جديدة</p>
                </div>
              ) : recentMessages.map((msg) => (
                <Link key={msg.id} href="/admin/messages" className="block group">
                  <div className="space-y-1 p-3 rounded-xl border border-transparent group-hover:border-slate-100 group-hover:bg-slate-50 transition-all">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-slate-800">{msg.name}</p>
                      <span className="text-[9px] text-slate-400 flex items-center gap-1 font-sans"><Clock size={10} /> {new Date(msg.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{msg.content}</p>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-gradient-to-br from-primary-blue to-blue-700 text-white border-0 shadow-lg shadow-primary-blue/20">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                   <TrendingUp size={20} />
                </div>
                <h3 className="font-bold">نشاط الموقع</h3>
             </div>
             <p className="text-3xl font-bold mb-1 font-sans tracking-tight">{visitStats.today.toLocaleString('en-US')}</p>
             <p className="text-white/70 text-xs font-bold mb-4">زيارة فريدة اليوم</p>
             
             <div className="grid grid-cols-2 gap-4 text-center mt-2 border-t border-white/10 pt-4">
               <div>
                 <p className="text-xl font-bold font-sans">{visitStats.month.toLocaleString('en-US')}</p>
                 <p className="text-[10px] text-white/70 font-bold uppercase">هذا الشهر</p>
               </div>
               <div>
                 <p className="text-xl font-bold font-sans">{visitStats.total.toLocaleString('en-US')}</p>
                 <p className="text-[10px] text-white/70 font-bold uppercase">الإجمالي</p>
               </div>
             </div>

             <button 
               onClick={fetchHistory}
               className="mt-4 w-full bg-white/10 hover:bg-white/20 transition-colors rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-2"
             >
               <Clock size={14} /> سجل الزيارات السابقة
             </button>
             
             {showHistory && (
               <div className="mt-4 bg-white/10 rounded-xl p-4 text-right">
                 <h4 className="text-sm font-bold border-b border-white/20 pb-2 mb-2 flex justify-between">
                   الزيارات السابقة
                   <button onClick={() => setShowHistory(false)} className="text-white/60 hover:text-white">✕</button>
                 </h4>
                 {loadingHistory ? (
                   <p className="text-xs text-center py-4 text-white/70 animate-pulse">جاري جلب البيانات...</p>
                 ) : (
                   <ul className="space-y-2">
                     {historyStats.map((h, i) => (
                       <li key={i} className="flex justify-between items-center text-xs">
                         <span>{h.month}</span>
                         <span className="font-bold font-sans bg-white/20 px-2 py-0.5 rounded-full">{h.count.toLocaleString('en-US')}</span>
                       </li>
                     ))}
                   </ul>
                 )}
               </div>
             )}
          </GlassCard>

          {!isStaff && (
          <GlassCard className="p-6">
             <div className="flex items-center gap-2 mb-4">
               <Send size={18} className="text-primary-blue" />
               <h3 className="font-bold text-slate-800 text-sm">إرسال إشعار للمستخدمين</h3>
             </div>
             <form onSubmit={handleSendPush} className="space-y-3">
               <input 
                 type="text" 
                 placeholder="عنوان الإشعار..." 
                 value={notifTitle}
                 onChange={(e) => setNotifTitle(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
                 required
               />
               <textarea 
                 placeholder="محتوى الإشعار..." 
                 rows={3}
                 value={notifBody}
                 onChange={(e) => setNotifBody(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/30 resize-none"
                 required
               />
               <button 
                 type="submit" 
                 disabled={sending}
                 className="w-full bg-primary-blue text-white rounded-xl py-2 text-xs font-bold shadow-md shadow-primary-blue/20 hover:bg-blue-700 transition-colors disabled:opacity-50"
               >
                 {sending ? "جاري الإرسال..." : notifSuccess ? "تم الإرسال بنجاح ✓" : "إرسال الإشعار"}
               </button>
             </form>
          </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Mail, Trash2, Clock, User, Eye, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState<any>(null);

  const fetchMessages = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Filter out contribution payloads
      const filteredData = (data || []).filter(m => !m.content?.startsWith('[CONTRIBUTION] '));
      setMessages(filteredData);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markRead = async (id: string) => {
    if (!supabase) return;
    try {
      await supabase.from('messages').update({ status: 'مقروء' }).eq('id', id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'مقروء' } : m));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!supabase) return;
    try {
      await supabase.from('messages').delete().eq('id', id);
      setMessages(prev => prev.filter(m => m.id !== id));
      setViewModal(null);
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const openMessage = (msg: any) => {
    if (msg.status === 'جديد') markRead(msg.id);
    setViewModal(msg);
  };

  const unreadCount = messages.filter(m => m.status === 'جديد').length;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">الرسائل الواردة من صفحة "اتصل بنا". <span className="font-bold text-primary-blue">({unreadCount} غير مقروءة)</span></p>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-3 text-xs font-bold text-slate-600 w-8"></th>
                <th className="p-3 text-xs font-bold text-slate-600">المرسل</th>
                <th className="p-3 text-xs font-bold text-slate-600">وسيلة التواصل</th>
                <th className="p-3 text-xs font-bold text-slate-600">الرسالة</th>
                <th className="p-3 text-xs font-bold text-slate-600">التاريخ</th>
                <th className="p-3 text-xs font-bold text-slate-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-bold animate-pulse">جاري جلب الرسائل...</td></tr>
              ) : messages.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-bold">لا توجد رسائل</td></tr>
              ) : (
                messages.map(msg => (
                   <tr key={msg.id} className={`border-b border-slate-50 transition-colors cursor-pointer ${msg.status !== 'جديد' ? "hover:bg-slate-50/50" : "bg-blue-50/30 hover:bg-blue-50/50 font-bold"}`} onClick={() => openMessage(msg)}>
                     <td className="p-3">
                       {msg.status === 'جديد' && <div className="w-2.5 h-2.5 bg-primary-blue rounded-full mx-auto" />}
                     </td>
                     <td className="p-3 text-sm text-slate-800 flex items-center gap-2"><User size={14} className="text-slate-400" /> {msg.name}</td>
                     <td className="p-3 text-xs text-slate-600 font-sans">{msg.contact}</td>
                     <td className="p-3 text-xs text-slate-600 max-w-xs truncate">{msg.content}</td>
                     <td className="p-3 text-xs text-slate-500 font-sans">{new Date(msg.date).toLocaleDateString('ar-YE')}</td>
                     <td className="p-3" onClick={(e) => e.stopPropagation()}>
                       <div className="flex items-center justify-center gap-1">
                         <button onClick={() => openMessage(msg)} className="p-1.5 text-primary-blue hover:bg-blue-50 rounded-lg transition-colors" title="عرض"><Eye size={15} /></button>
                         <button onClick={() => deleteMessage(msg.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="حذف"><Trash2 size={15} /></button>
                       </div>
                     </td>
                   </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* View Message Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Mail size={20} className="text-primary-blue" /> رسالة</h3>
              <button onClick={() => setViewModal(null)} className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-800">{viewModal.name}</p>
                  <p className="text-xs text-slate-500 font-sans">{viewModal.contact}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1"><Clock size={10} /> {new Date(viewModal.date).toLocaleString('ar-YE')}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{viewModal.content}</p>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setViewModal(null)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">إغلاق</button>
              <button onClick={() => deleteMessage(viewModal.id)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 flex items-center justify-center gap-2">
                <Trash2 size={16} /> حذف الرسالة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

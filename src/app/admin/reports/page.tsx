"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertTriangle, CheckCircle2, Trash2, Search, Filter, Clock, User, Phone, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function AdminReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");

  const reports = useLiveQuery(() => db.reports.toArray()) || [];

  const filteredReports = reports.filter(r => {
    const matchSearch = !searchQuery || r.provider_name.includes(searchQuery) || r.content.includes(searchQuery);
    const matchStatus = statusFilter === "الكل" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('reports').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      await db.reports.update(id, { status: newStatus });
    } catch (err) {
      alert("حدث خطأ أثناء تحديث الحالة");
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm("هل أنت متأكد من حذف هذا البلاغ؟")) return;
    try {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw error;
      await db.reports.delete(id);
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">بلاغات التصحيح</h1>
          <p className="text-slate-500 text-sm font-bold">إدارة بلاغات المستخدمين حول أخطاء البيانات</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في البلاغات..." 
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 shadow-sm"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm focus:outline-none"
          >
            <option value="الكل">كل الحالات</option>
            <option value="جديد">جديد</option>
            <option value="تمت المراجعة">تمت المراجعة</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 font-bold bg-white rounded-2xl border border-slate-100">
            لا توجد بلاغات مطابقة لبحثك
          </div>
        ) : filteredReports.map((report) => (
          <GlassCard key={report.id} className="p-5 flex flex-col gap-4 border-slate-100 hover:border-primary-blue/20 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${report.status === 'جديد' ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-500'}`}>
                  {report.status === 'جديد' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{report.provider_name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-0.5">
                    <Clock size={10} /> {new Date(report.date).toLocaleString('ar-YE')}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(report.id)}
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-600 leading-relaxed text-right">
                {report.content}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-4">
                {report.user_contact && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary-blue">
                    <Phone size={12} /> {report.user_contact}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {report.status === 'جديد' ? (
                  <button 
                    onClick={() => handleStatusChange(report.id, 'تمت المراجعة')}
                    className="px-4 py-2 bg-emerald-500 text-white text-[11px] font-bold rounded-lg shadow-sm hover:bg-emerald-600 transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 size={14} /> تم التصحيح
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStatusChange(report.id, 'جديد')}
                    className="px-4 py-2 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    إعادة فتح
                  </button>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

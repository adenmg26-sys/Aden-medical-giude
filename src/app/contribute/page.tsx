"use client";

import React, { useState } from "react";
import { UserPlus, MapPin, Phone, Building2, Send, CheckCircle2, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { adenDistricts } from "@/data/districts";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";

export default function ContributePage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    district: adenDistricts[0],
    phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    try {
      const newProvider = { 
        id: crypto.randomUUID(),
        name: formData.name,
        specialty: formData.specialty,
        district: formData.district,
        phone: formData.phone,
        address: '',
        whatsapp: '',
        type: 'doctors', 
        status: 'قيد المراجعة',
        verified: false,
        updated_at: new Date().toISOString()
      };
      
      await db.providers.add(newProvider as any);
      await db.sync_queue.add({
        table: 'providers',
        action: 'insert',
        data: newProvider,
        timestamp: new Date().toISOString()
      });
      
      const notif = {
        id: crypto.randomUUID(),
        title: 'مساهمة جديدة',
        description: `تم إرسال مساهمة بطبيب/مركز جديد: ${formData.name}`,
        type: 'add',
        read: false,
        date: new Date().toISOString()
      };
      
      await db.notifications.add(notif as any);
      await db.sync_queue.add({
        table: 'notifications',
        action: 'insert',
        data: notif,
        timestamp: new Date().toISOString()
      });
      
      // Trigger background sync immediately
      if (navigator.onLine) {
        window.dispatchEvent(new Event('trigger-sync'));
      }
      
      setSubmitted(true);
    } catch (err) {
      alert("عذراً، فشل إرسال البيانات. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-100/50 animate-bounce">
          <CheckCircle2 size={56} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">شكراً لمساهمتك!</h2>
          <p className="text-slate-500 max-w-xs mx-auto">لقد استلمنا بيانات الطبيب، سيقوم فريق الإدارة بمراجعتها وإضافتها للمرشد قريباً.</p>
        </div>
        <Link 
          href="/"
          className="bg-primary-blue text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary-blue/30 transition-transform active:scale-95"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-10 min-h-screen bg-slate-50/50">
      <div className="bg-gradient-to-l from-primary-red to-rose-600 p-6 pt-10 text-white rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute left-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between mb-6">
          <button onClick={() => window.history.back()} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl transition-colors">
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus size={24} /> مساهمة جديدة
          </h1>
          <p className="text-rose-100 text-sm opacity-90">ساعدنا في إثراء مرشد عدن الطبي ببيانات جديدة</p>
        </div>
      </div>

      <div className="p-4 -mt-4 relative z-20">
        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5 text-right">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <UserPlus size={14} className="text-primary-red"/> اسم الطبيب / المنشأة
              </label>
              <input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/20 transition-all text-right"
                placeholder="مثال: د. أحمد صالح"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Building2 size={14} className="text-primary-red"/> التخصص
              </label>
              <input 
                required
                value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/20 transition-all text-right"
                placeholder="مثال: استشاري قلب"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin size={14} className="text-primary-red"/> المديرية (المنطقة)
              </label>
              <select 
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/20 transition-all text-right"
              >
                {adenDistricts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Phone size={14} className="text-primary-red"/> رقم الهاتف / الواتساب
              </label>
              <input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/20 transition-all font-sans text-right"
                placeholder="77XXXXXXXX"
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary-red text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary-red/20 flex justify-center items-center gap-2 hover:bg-rose-600 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "جاري الإرسال..." : <><Send size={18} /> إرسال البيانات</>}
              </button>
            </div>
          </form>
        </GlassCard>
        
        <p className="text-[10px] text-slate-400 text-center mt-6 leading-relaxed px-4">
          ملاحظة: سيتم مراجعة البيانات من قبل فريق العمل قبل إضافتها رسمياً إلى تطبيق مرشد عدن الطبي لضمان الجودة والدقة.
        </p>
      </div>
    </div>
  );
}

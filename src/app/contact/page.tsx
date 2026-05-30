"use client";

import React, { useState } from "react";
import { ArrowRight, Phone, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // Fetch settings from local DB
  const rawSettings = useLiveQuery(() => db.settings.toArray()) || [];
  const settings = rawSettings.reduce((acc, cur) => {
    acc[cur.key] = cur.value;
    return acc;
  }, {} as Record<string, string>);

  const email = settings.contactEmail || "support@adenmedical.com";
  const phone = settings.contactPhone || "+967 770 000 000";
  const address = settings.address || "عدن، الجمهورية اليمنية";

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    if (honeypot) return; // Anti-spam honeypot

    setLoading(true);
    const messageData = { 
      id: crypto.randomUUID(),
      name: form.name, 
      contact: form.contact, 
      content: form.message,
      status: 'جديد',
      date: new Date().toISOString()
    };

    try {
      // 1. Save to local DB
      await db.messages.add(messageData as any);

      // 2. Queue for sync
      await db.sync_queue.add({
        table: 'messages',
        action: 'insert',
        data: messageData,
        timestamp: new Date().toISOString()
      });

      setSuccess(true);
      setForm({ name: "", contact: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      alert("عذراً، فشل حفظ الرسالة محلياً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-slate-50/50 text-right">
      <div className="bg-gradient-to-l from-primary-blue to-blue-700 p-6 pt-10 text-white rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute left-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between mb-6">
          <Link href="/" className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl transition-colors">
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Phone size={24} /> اتصل بنا
          </h1>
          <p className="text-blue-100 text-sm opacity-90">نحن هنا للإجابة على استفساراتكم واقتراحاتكم</p>
        </div>
      </div>

      <div className="p-4 space-y-6 -mt-4 relative z-20">
        <div className="grid grid-cols-2 gap-4">
          <a href={`mailto:${email}`} className="block">
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-white/60 transition-colors h-full">
              <div className="w-12 h-12 bg-primary-blue/10 rounded-full flex items-center justify-center text-primary-blue">
                <Mail size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">البريد الإلكتروني</h3>
              <p className="text-[10px] text-slate-500 font-sans">{email}</p>
            </GlassCard>
          </a>
          
          <a href={`tel:${phone}`} className="block">
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-white/60 transition-colors h-full">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <Phone size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">اتصال أو واتساب</h3>
              <p className="text-[10px] text-slate-500 font-sans">{phone}</p>
            </GlassCard>
          </a>
        </div>

        <GlassCard className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">تم الإرسال بنجاح!</h3>
                <p className="text-xs text-slate-500 mt-1">شكراً لتواصلك معنا، سنقوم بالرد عليك في أقرب وقت ممكن.</p>
              </div>
              <button onClick={() => setSuccess(false)} className="text-primary-blue text-xs font-bold underline">إرسال رسالة أخرى</button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-4">أرسل لنا رسالة</h2>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">الاسم الكريم</label>
                  <input 
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    required
                    placeholder="أدخل اسمك"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">البريد أو رقم الهاتف</label>
                  <input 
                    type="text" 
                    value={form.contact}
                    onChange={(e) => setForm({...form, contact: e.target.value})}
                    placeholder="للتواصل معك"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">الرسالة</label>
                  <textarea 
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    required
                    placeholder="اكتب استفسارك أو اقتراحك هنا..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 resize-none"
                  ></textarea>
                </div>

                {/* Honeypot field - hidden from users, catches bots */}
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="absolute opacity-0 h-0 w-0 -z-10"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-blue text-white rounded-xl font-bold shadow-lg shadow-primary-blue/20 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "جاري الإرسال..." : "إرسال"} <Send size={16} />
                </button>
              </form>
            </>
          )}
        </GlassCard>
        
        <div className="text-center flex items-center justify-center gap-2 text-xs text-slate-500">
          <MapPin size={14} /> عدن، الجمهورية اليمنية
        </div>
      </div>
    </div>
  );
}

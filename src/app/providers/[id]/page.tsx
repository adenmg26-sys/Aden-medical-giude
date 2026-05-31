"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Share2,
  Navigation,
  AlertTriangle,
  X,
  Send,
  Bookmark,
  BookmarkCheck
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { supabase } from "@/lib/supabase";
import Image from 'next/image';
import { ProviderStatusBadge } from "@/components/ui/ProviderStatusBadge";

export default function ProviderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  // Fetch provider data from local DB
  const provider = useLiveQuery(() => db.providers.get(id), [id]);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isOfflineSubmit, setIsOfflineSubmit] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Check if saved
    const saved = JSON.parse(localStorage.getItem("saved_providers") || "[]");
    if (saved.includes(id)) {
      setIsSaved(true);
    }
  }, [id]);

  const toggleSave = () => {
    const saved = JSON.parse(localStorage.getItem("saved_providers") || "[]");
    if (saved.includes(id)) {
      const newSaved = saved.filter((savedId: string) => savedId !== id);
      localStorage.setItem("saved_providers", JSON.stringify(newSaved));
      setIsSaved(false);
    } else {
      saved.push(id);
      localStorage.setItem("saved_providers", JSON.stringify(saved));
      setIsSaved(true);
    }
  };

  if (!provider) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">عذراً، لم يتم العثور على البيانات</h2>
        <Link href="/" className="text-primary-blue underline">العودة للرئيسية</Link>
      </div>
    );
  }

  const handleReportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const content = formData.get('content') as string;
    const contact = formData.get('contact') as string;

    const reportData = {
      id: crypto.randomUUID(),
      provider_id: id,
      provider_name: provider.name,
      content,
      user_contact: contact,
      status: 'جديد',
      date: new Date().toISOString()
    };

    try {
      // 1. Save to local DB immediately for UI consistency
      await db.reports.add(reportData as any);
      
      // 2. Queue for remote sync
      await db.sync_queue.add({
        table: 'reports',
        action: 'insert',
        data: reportData,
        timestamp: new Date().toISOString()
      });

      // 3. Try to sync immediately if online
      if (navigator.onLine && supabase) {
        window.dispatchEvent(new Event('trigger-sync'));
        setIsOfflineSubmit(false);
      } else {
        setIsOfflineSubmit(true);
      }

      setReportSuccess(true);
      setTimeout(() => {
        setIsReportOpen(false);
        setReportSuccess(false);
      }, 3000);
    } catch (err) {
      alert("عذراً، فشل إرسال التبليغ محلياً.");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `طبيب في مرشد عدن الطبي: ${provider.name}`,
      text: `تعرف على تفاصيل ومواعيد ${provider.name} (${provider.specialty}) عبر مرشد عدن الطبي.`,
      url: url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert("تم نسخ رابط الصفحة بنجاح!");
      }
    } catch (err) {
      // share cancelled or failed silently
    }
  };

  return (
    <div className="pb-10">
      {/* Header / Cover */}
      <div className="relative h-48 bg-gradient-to-br from-primary-blue/20 to-primary-red/10 overflow-hidden">
        {provider.image && <Image src={provider.image} alt="" fill className="object-cover opacity-30" unoptimized={provider.image.startsWith('data:')} />}
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <button 
          onClick={() => window.history.back()}
          className="absolute top-4 right-4 z-10 p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm text-slate-700 hover:bg-white/70 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <button 
          onClick={handleShare}
          className="absolute top-4 left-4 z-10 p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm text-slate-700 hover:bg-white/70 transition-colors"
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Profile Card Overlay */}
      <div className="px-4 -mt-20 relative z-10 space-y-4">
        <GlassCard className="p-6 text-center shadow-xl border-white/60">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-lg mx-auto -mt-16 mb-4 flex items-center justify-center text-4xl border-4 border-white relative overflow-hidden">
             {provider.image ? <Image src={provider.image} alt={provider.name} fill className="object-cover rounded-2xl" unoptimized={provider.image.startsWith('data:')} /> : (provider.specialty.includes("صيدلية") ? "💊" : "👨⚕️")}
           </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-800">{provider.name}</h1>
            {provider.verified && <CheckCircle2 className="text-blue-500 fill-blue-500/10" size={20} />}
          </div>
          <p className="text-primary-red font-bold text-sm mb-4">{provider.specialty}</p>
          
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 border-t border-slate-100 pt-4">
            <div className="flex flex-col items-center gap-1">
              <ProviderStatusBadge provider={provider} className="bg-transparent shadow-none px-0 py-0 text-sm font-bold border-none" />
              <span>الحالة</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-100" />
            <button onClick={toggleSave} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
              <span className={cn("font-bold text-sm", isSaved ? "text-primary-blue" : "text-slate-800")}>
                {isSaved ? <BookmarkCheck size={20} className="fill-primary-blue/20 text-primary-blue" /> : <Bookmark size={20} />}
              </span>
              <span className={isSaved ? "text-primary-blue font-bold" : ""}>{isSaved ? "محفوظ" : "حفظ"}</span>
            </button>
          </div>
        </GlassCard>

        {/* Contact Actions */}
        <div className="grid grid-cols-2 gap-3">
          <a 
            href={`tel:${provider.phone}`}
            className="flex flex-col items-center justify-center p-4 bg-primary-blue text-white rounded-2xl shadow-lg shadow-primary-blue/20 gap-2 transition-transform active:scale-95"
          >
            <Phone size={24} />
            <span className="text-xs font-bold">اتصال</span>
          </a>
          
          {provider.whatsapp ? (
            <a 
               href={`https://wa.me/${provider.whatsapp}`}
               target="_blank"
               className="flex flex-col items-center justify-center p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 gap-2 transition-transform active:scale-95"
            >
              <MessageCircle size={24} />
              <span className="text-xs font-bold">واتساب</span>
            </a>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-200 text-slate-400 rounded-2xl gap-2 cursor-not-allowed">
              <MessageCircle size={24} />
              <span className="text-xs font-bold">واتساب (غير متوفر)</span>
            </div>
          )}
        </div>

        {/* Bio Section */}
        {provider.bio && (
          <GlassCard className="p-4 space-y-2 mt-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">نبذة تعريفية</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {provider.bio}
            </p>
          </GlassCard>
        )}

        {/* Details Sections */}
        <div className="space-y-4 mt-4">
          <GlassCard className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><MapPin size={20}/></div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800 mb-0.5">العنوان</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{provider.district} - {provider.address}</p>
              </div>
              <button 
                onClick={() => {
                  if (provider.map_link) {
                    window.open(provider.map_link, '_blank');
                  } else {
                    const query = encodeURIComponent(`${provider.district} ${provider.address || provider.name}`);
                    window.open(`https://maps.google.com/?q=${query}`, '_blank');
                  }
                }}
                className="p-2 bg-primary-blue/10 text-primary-blue rounded-lg hover:bg-primary-blue/20 transition-colors"
                title="عرض على الخريطة"
              >
                <Navigation size={18}/>
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Clock size={20}/></div>
              <h3 className="text-sm font-bold text-slate-800">مواعيد العمل</h3>
            </div>
            <div className="space-y-3">
              {provider.type === 'doctors' ? (
                provider.shifts?.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0 gap-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{item.day}</span>
                      <span className="font-bold text-slate-700">{item.time}</span>
                    </div>
                    {item.location && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <MapPin size={10} /> {item.location}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col text-xs gap-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ساعات العمل</span>
                    <span className="font-bold text-slate-700">
                      {provider.center_hours?.is24h ? "مفتوح 24 ساعة" : `من ${provider.center_hours?.openTime} إلى ${provider.center_hours?.closeTime}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>


          <button 
            onClick={() => setIsReportOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-4 text-xs font-bold text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors border border-rose-100"
          >
            <AlertTriangle size={16} />
            تبليغ عن معلومة خاطئة أو تحديث للمعلومات
          </button>
        </div>
      </div>

      {/* Report Modal - Conditional Render */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6 bg-white/95">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-800">تحديث البيانات</h3>
              <button onClick={() => setIsReportOpen(false)} className="p-1 bg-slate-100 rounded-full text-slate-500">
                <X size={16} />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-bold text-slate-800">
                  {isOfflineSubmit ? "تم الحفظ بنجاح" : "تم إرسال بلاغك بنجاح"}
                </h4>
                <p className="text-xs text-slate-500">
                  {isOfflineSubmit 
                    ? "أنت غير متصل بالإنترنت حالياً. تم حفظ البلاغ وسيتم إرساله تلقائياً فور توفر اتصال 🕒"
                    : "سيقوم فريقنا بمراجعة المعلومات وتحديثها بأقرب وقت. شكراً لمساهمتك!"}
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4 text-right">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">اسم الطبيب / المركز</label>
                  <input 
                    type="text" 
                    value={provider.name} 
                    disabled
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">المعلومات المراد تصحيحها</label>
                  <textarea 
                    name="content"
                    rows={4}
                    required
                    placeholder="مثال: رقم الهاتف تغير إلى 770000000، أو مواعيد العمل أصبحت من 5 إلى 10..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 resize-none"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">رقم هاتفك (اختياري)</label>
                  <input 
                    name="contact"
                    type="tel" 
                    placeholder="للتواصل معك في حال احتجنا لمعلومات إضافية"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-blue text-white rounded-xl font-bold shadow-lg shadow-primary-blue/20 hover:opacity-90 transition-opacity"
                >
                  إرسال التحديث <Send size={16} />
                </button>
              </form>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}

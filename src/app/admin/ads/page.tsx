"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, Trash2, X, Save, Upload, Eye, EyeOff, GripVertical, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

import Image from "next/image";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";

type Ad = { id: string; title: string; description: string; imageUrl: string; link: string; active: boolean };

export default function AdminAdsPage() {
  const ads = useLiveQuery(() => db.ads.toArray()) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "", link: "", active: true });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ title: "", description: "", imageUrl: "", link: "", active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (ad: Ad) => {
    setEditingId(ad.id);
    setForm({ title: ad.title, description: ad.description, imageUrl: ad.imageUrl, link: ad.link, active: ad.active });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const options = {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: 'image/webp'
        };
        const imageCompression = (await import("browser-image-compression")).default;
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
          setIsUploading(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        console.error("Compression error:", err);
        alert("حدث خطأ أثناء ضغط الصورة");
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!form.title || !supabase || isUploading) return;
    
    const dataToSave = {
      ...form,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingId) {
        await supabase.from('ads').update(dataToSave).eq('id', editingId);
        await db.ads.update(editingId, dataToSave);
      } else {
        const { data } = await supabase.from('ads').insert([dataToSave]).select();
        if (data?.[0]) await db.ads.add(data[0]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert("حدث خطأ أثناء حفظ الإعلان");
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    try {
      await supabase.from('ads').delete().eq('id', id);
      await db.ads.delete(id);
      setDeleteConfirm(null);
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const toggleActive = async (id: string) => {
    if (!supabase) return;
    const ad = await db.ads.get(id);
    if (!ad) return;
    const newStatus = !ad.active;
    try {
      await supabase.from('ads').update({ active: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
      await db.ads.update(id, { active: newStatus });
    } catch (err) {
      alert("حدث خطأ أثناء تحديث الحالة");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-slate-500">إدارة الإعلانات المعروضة في الشريط الإعلاني بالصفحة الرئيسية.</p>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2.5 bg-primary-blue text-white rounded-xl text-sm font-bold shadow-md shadow-primary-blue/20 hover:bg-blue-700">
          <Plus size={16} /> إعلان جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.length === 0 ? (
          <GlassCard className="col-span-full p-8 text-center text-slate-400 font-bold">
            لا توجد إعلانات. أضف إعلانك الأول!
          </GlassCard>
        ) : (
          ads.map(ad => (
            <GlassCard key={ad.id} className={`overflow-hidden ${!ad.active ? "opacity-60" : ""}`}>
              {/* Ad Preview */}
              <div className="h-36 bg-gradient-to-l from-primary-blue/20 to-primary-red/10 flex items-center justify-center relative overflow-hidden">
                {ad.imageUrl ? (
                  <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" unoptimized={ad.imageUrl.startsWith('data:')} />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 gap-1">
                    <ImageIcon size={32} />
                    <span className="text-[10px]">لا توجد صورة</span>
                  </div>
                )}
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${ad.active ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"}`}>
                  {ad.active ? "مفعل" : "مخفي"}
                </span>
              </div>

              {/* Ad Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-slate-800 text-sm">{ad.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{ad.description}</p>
                {ad.link && <p className="text-[10px] text-primary-blue font-sans truncate">{ad.link}</p>}
              </div>

              {/* Actions */}
              <div className="p-3 border-t border-slate-100 flex items-center justify-between">
                <button onClick={() => toggleActive(ad.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${ad.active ? "text-slate-500 hover:bg-slate-50" : "text-emerald-500 hover:bg-emerald-50"}`}>
                  {ad.active ? <><EyeOff size={14} /> إخفاء</> : <><Eye size={14} /> تفعيل</>}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => openEditModal(ad)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل"><Save size={15} /></button>
                  <button onClick={() => setDeleteConfirm(ad.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="حذف"><Trash2 size={15} /></button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? "تعديل الإعلان" : "إعلان جديد"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">عنوان الإعلان *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20" placeholder="مثال: عرض خاص - خصم 50%" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">الوصف</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 resize-none" placeholder="وصف مختصر للإعلان..." />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><Upload size={14} /> صورة الإعلان</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    value={form.imageUrl} 
                    onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/20 font-sans" 
                    placeholder="رابط الصورة أو ارفع من الجهاز..." 
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center shrink-0">
                    <span>اختر ملف...</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1"><ImageIcon size={10} /> القياس الموصى به: <span className="font-bold font-sans">1200 × 400 بكسل</span> (نسبة 3:1 أفقية) للعرض الأمثل في شريط الإعلانات.</p>
                
                {isUploading ? (
                  <div className="w-full h-32 bg-slate-100 rounded-lg mt-2 border border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-xs font-bold">جاري ضغط الصورة...</span>
                  </div>
                ) : form.imageUrl && (
                  <div className="relative w-full h-32 rounded-lg mt-2 border border-slate-200 overflow-hidden">
                    <Image src={form.imageUrl} alt="معاينة" fill className="object-cover" unoptimized={form.imageUrl.startsWith('data:')} />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">رابط الإعلان (اختياري)</label>
                <input type="text" value={form.link} onChange={(e) => setForm({...form, link: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/20 font-sans" placeholder="https://..." />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({...form, active: e.target.checked})} className="w-4 h-4 accent-primary-blue rounded" />
                <span className="text-sm font-bold text-slate-700">مفعل (يظهر في الشريط الإعلاني)</span>
              </label>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">إلغاء</button>
              <button onClick={handleSave} disabled={isUploading} className="flex-1 py-3 bg-primary-blue text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={16} /> {editingId ? "حفظ" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto"><Trash2 size={28} /></div>
            <h3 className="text-lg font-bold text-slate-800">حذف الإعلان</h3>
            <p className="text-sm text-slate-500">هل أنت متأكد من حذف هذا الإعلان؟</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600">حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

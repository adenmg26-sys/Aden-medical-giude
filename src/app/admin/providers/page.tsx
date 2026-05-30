"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, Edit2, Trash2, Search, Filter, X, Save, ShieldCheck, ShieldOff, Eye } from "lucide-react";
import { adenDistricts } from "@/data/districts";
import { ProviderForm, ProviderFormData } from "@/components/admin/ProviderForm";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useAdminContext } from "@/components/admin/AdminContext";

const emptyFormData: ProviderFormData = {
  type: "doctors",
  name: "", specialty: "", district: "دار سعد", address: "", phone: "", whatsapp: "", image: "", mapLink: "", verified: false,
  shifts: [{ day: "", time: "", location: "" }],
  centerHours: { openTime: "", closeTime: "", is24h: false },
  isPremium: false,
  premiumRank: 0,
  showInBanner: false,
  premiumExpiryDate: "",
  bio: ""
};

export default function AdminProvidersPage() {
  const { isStaff } = useAdminContext();
  const [activeTab, setActiveTab] = useState<"doctors" | "centers" | "pending">("doctors");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // Live data from local DB
  const allProviders = useLiveQuery(() => db.providers.toArray()) || [];
  const doctors = allProviders.filter(p => p.type === 'doctors' && p.status === 'مفعل');
  const centers = allProviders.filter(p => p.type === 'centers' && p.status === 'مفعل');
  const pending = allProviders.filter(p => p.status === 'قيد المراجعة');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProviderFormData>(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentList = activeTab === "doctors" ? doctors : activeTab === "centers" ? centers : pending;

  const filteredList = currentList.filter((item) => {
    const matchSearch = !searchQuery || item.name.includes(searchQuery) || item.specialty.includes(searchQuery);
    const matchDistrict = !filterDistrict || item.district === filterDistrict;
    return matchSearch && matchDistrict;
  });

  const loadFormFromItem = (item: any) => {
    setFormData({
      type: item.type || activeTab,
      name: item.name || "",
      specialty: item.specialty || "",
      district: item.district || "دار سعد",
      address: item.address || "",
      phone: item.phone || "",
      whatsapp: item.whatsapp || "",
      image: item.image || "",
      mapLink: item.map_link || "",
      verified: item.verified || false,
      shifts: item.shifts?.length ? [...item.shifts] : [{ day: "", time: "", location: "" }],
      centerHours: item.center_hours || { openTime: "", closeTime: "", is24h: false },
      isPremium: item.is_premium || false,
      premiumRank: item.premium_rank || 0,
      showInBanner: item.show_in_banner || false,
      premiumExpiryDate: item.premium_expiry_date || "",
      bio: item.bio || ""
    });
  };

  const openAddModal = () => { setEditingId(null); setViewOnly(false); setFormData({...emptyFormData, type: activeTab === "pending" ? "doctors" : activeTab}); setIsModalOpen(true); };
  const openViewModal = (item: any) => { setEditingId(item.id); setViewOnly(true); loadFormFromItem(item); setIsModalOpen(true); setIsUploading(false); };
  const openEditModal = (item: any) => { setEditingId(item.id); setViewOnly(false); loadFormFromItem(item); setIsModalOpen(true); setIsUploading(false); };

  const handleSave = async () => {
    if (isUploading) return;
    if (!formData.name) {
      alert("يرجى إدخال الاسم");
      return;
    }
    if (!formData.specialty) {
      alert("يرجى إدخال التخصص");
      return;
    }
    if (!supabase) {
      alert("خطأ في الاتصال بقاعدة البيانات");
      return;
    }
    
    const dataToSave: any = {
      type: formData.type,
      name: formData.name, 
      specialty: formData.specialty, 
      district: formData.district, 
      address: formData.address, 
      phone: formData.phone, 
      whatsapp: formData.whatsapp, 
      image: formData.image, 
      map_link: formData.mapLink,
      verified: formData.verified, 
      status: "مفعل",
      updated_at: new Date().toISOString(),
      is_premium: formData.isPremium || false,
      premium_rank: Number(formData.premiumRank) || 0,
      show_in_banner: formData.showInBanner || false,
      premium_expiry_date: formData.premiumExpiryDate || null,
      bio: formData.bio || ""
    };

    if (formData.type === "doctors") {
      dataToSave.shifts = formData.shifts.filter(s => s.day);
    } else {
      dataToSave.center_hours = formData.centerHours;
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('providers').update(dataToSave).eq('id', editingId);
        if (error) throw error;
        // Update local DB for immediate feedback
        await db.providers.update(editingId, dataToSave);
      } else {
        const { data, error } = await supabase.from('providers').insert([dataToSave]).select();
        if (error) throw error;
        if (data?.[0]) await db.providers.add(data[0]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`حدث خطأ أثناء الحفظ: ${err.message || 'فشل الاتصال'}`);
    }
  };

  const handleDelete = async (id: string) => { 
    if (!supabase) return;
    try {
      const { error } = await supabase.from('providers').delete().eq('id', id);
      if (error) throw error;
      await db.providers.delete(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const toggleVerified = async (id: string) => { 
    if (!supabase) return;
    const item = await db.providers.get(id);
    if (!item) return;
    
    const newStatus = !item.verified;
    try {
      await supabase.from('providers').update({ verified: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
      await db.providers.update(id, { verified: newStatus });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm w-fit overflow-x-auto">
        <button onClick={() => setActiveTab("doctors")} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === "doctors" ? "bg-primary-blue text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>الأطباء ({doctors.length})</button>
        <button onClick={() => setActiveTab("centers")} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === "centers" ? "bg-primary-blue text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>المراكز ({centers.length})</button>
        <button onClick={() => setActiveTab("pending")} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "pending" ? "bg-amber-500 text-white shadow-md" : "text-amber-600 bg-amber-50 hover:bg-amber-100"}`}>
          قيد المراجعة ({pending.length})
          {pending.length > 0 && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={activeTab === "pending" ? "ابحث في المساهمات المعلقة..." : activeTab === "doctors" ? "ابحث عن طبيب..." : "ابحث عن مركز أو صيدلية..."} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 shadow-sm" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold shadow-sm flex-1 sm:flex-none justify-center transition-colors ${showFilter || filterDistrict ? "bg-primary-blue/10 border-primary-blue/30 text-primary-blue" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}><Filter size={16} /> تصفية</button>
          {activeTab !== "pending" && (
            <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2.5 bg-primary-blue text-white rounded-xl text-sm font-bold shadow-md shadow-primary-blue/20 hover:bg-blue-700 flex-1 sm:flex-none justify-center"><Plus size={16} /> إضافة جديد</button>
          )}
        </div>
      </div>

      {showFilter && (
        <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-slate-600">المديرية:</span>
          <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"><option value="">الكل</option>{adenDistricts.map(d => <option key={d} value={d}>{d}</option>)}</select>
          {filterDistrict && <button onClick={() => setFilterDistrict("")} className="text-xs text-rose-500 hover:underline">مسح</button>}
        </div>
      )}

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right whitespace-nowrap">
            <thead><tr className="bg-slate-50 border-b border-slate-100"><th className="p-3 text-xs font-bold text-slate-600">الصورة</th><th className="p-3 text-xs font-bold text-slate-600">الاسم</th><th className="p-3 text-xs font-bold text-slate-600">التخصص</th><th className="p-3 text-xs font-bold text-slate-600">المديرية</th><th className="p-3 text-xs font-bold text-slate-600">الهاتف</th><th className="p-3 text-xs font-bold text-slate-600">موثق</th><th className="p-3 text-xs font-bold text-slate-600">الحالة</th><th className="p-3 text-xs font-bold text-slate-600 text-center">الإجراءات</th></tr></thead>
            <tbody>
              {filteredList.length === 0 ? <tr><td colSpan={8} className="p-8 text-center text-slate-400 font-bold">لا توجد نتائج</td></tr> : filteredList.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                  <td className="p-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg relative overflow-hidden">
                      {item.image ? <Image src={item.image} fill className="object-cover" unoptimized={item.image.startsWith('data:')} alt="" /> : (activeTab === "doctors" ? "👨‍⚕️" : "🏥")}
                    </div>
                  </td>
                  <td className="p-3 text-sm font-bold text-slate-800">{item.name}</td>
                  <td className="p-3 text-xs text-slate-600">{item.specialty}</td>
                  <td className="p-3 text-xs text-slate-600">{item.district}</td>
                  <td className="p-3 text-xs text-slate-600 font-sans">{item.phone}</td>
                  <td className="p-3"><button onClick={() => toggleVerified(item.id)}>{item.verified ? <ShieldCheck size={18} className="text-blue-500" /> : <ShieldOff size={18} className="text-slate-300" />}</button></td>
                  <td className="p-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.status === "مفعل" ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>{item.status}</span></td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openViewModal(item)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="مشاهدة"><Eye size={15} /></button>
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="حذف"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Modal using Shared Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm py-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">{viewOnly ? "عرض البيانات" : editingId ? "تعديل البيانات" : "إضافة جديد"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              <ProviderForm data={formData} onChange={setFormData} viewOnly={viewOnly} hideTypeSelect={viewOnly} onUploadStateChange={setIsUploading} isStaff={isStaff} />
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3 shrink-0 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">{viewOnly ? "إغلاق" : "إلغاء"}</button>
              {!viewOnly && <button onClick={handleSave} disabled={isUploading} className="flex-1 py-3 bg-primary-blue text-white rounded-xl text-sm font-bold shadow-md shadow-primary-blue/20 hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"><Save size={16} /> {editingId ? "حفظ التعديلات" : "إضافة"}</button>}
              {viewOnly && <button onClick={() => setViewOnly(false)} className="flex-1 py-3 bg-primary-blue text-white rounded-xl text-sm font-bold shadow-md shadow-primary-blue/20 hover:bg-blue-700 flex items-center justify-center gap-2"><Edit2 size={16} /> تعديل</button>}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto"><Trash2 size={28} /></div>
            <h3 className="text-lg font-bold text-slate-800">تأكيد الحذف</h3>
            <p className="text-sm text-slate-500">هل أنت متأكد؟ لا يمكن التراجع.</p>
            <div className="flex gap-3"><button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">إلغاء</button><button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600">حذف</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CheckCircle2, XCircle, Eye, ArrowUpRight, X, Save, Trash2, Clock } from "lucide-react";
import { ProviderForm, ProviderFormData } from "@/components/admin/ProviderForm";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function AdminContributionsPage() {
  // Fetch real pending contributions from local DB (synced from Supabase)
  const contributions = useLiveQuery(() => 
    db.providers.where('status').equals('قيد المراجعة').toArray()
  ) || [];

  const [viewModal, setViewModal] = useState<any>(null);

  // Move Modal using unified ProviderForm
  const [moveModal, setMoveModal] = useState<any>(null);
  const [formData, setFormData] = useState<ProviderFormData>({
    type: "doctors", name: "", specialty: "", district: "دار سعد", address: "", phone: "", whatsapp: "", image: "", mapLink: "", verified: false,
    shifts: [{ day: "", time: "", location: "" }],
    centerHours: { openTime: "", closeTime: "", is24h: false },
    bio: ""
  });

  const handleAccept = async (contrib: any) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('providers')
        .update({ status: 'مفعل', updated_at: new Date().toISOString() })
        .eq('id', contrib.id);
      if (error) throw error;
      await db.providers.update(contrib.id, { status: 'مفعل', updated_at: new Date().toISOString() });
    } catch (err) {
      alert("حدث خطأ أثناء قبول المساهمة");
    }
  };

  const handleReject = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('providers').delete().eq('id', id);
      if (error) throw error;
      await db.providers.delete(id);
    } catch (err) {
      alert("حدث خطأ أثناء حذف المساهمة");
    }
  };

  const openMoveModal = (contrib: any) => {
    setFormData({
      type: contrib.type || "doctors",
      name: contrib.name,
      specialty: contrib.specialty,
      district: contrib.district,
      address: contrib.address || "",
      phone: contrib.phone || "",
      whatsapp: contrib.whatsapp || "",
      image: "",
      mapLink: contrib.map_link || "",
      verified: false,
      shifts: contrib.shifts || [{ day: "", time: "", location: "" }],
      centerHours: contrib.center_hours || { openTime: "", closeTime: "", is24h: false },
      bio: contrib.bio || ""
    });
    setMoveModal(contrib);
  };

  const handleMoveConfirm = async () => {
    if (!moveModal || !supabase) return;
    
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
      bio: formData.bio || ""
    };

    if (formData.type === "doctors") {
      dataToSave.shifts = formData.shifts.filter(s => s.day);
    } else {
      dataToSave.center_hours = formData.centerHours;
    }

    try {
      const { error } = await supabase.from('providers')
        .update(dataToSave)
        .eq('id', moveModal.id);
      if (error) throw error;
      await db.providers.update(moveModal.id, dataToSave);
      setMoveModal(null);
    } catch (err) {
      alert("حدث خطأ أثناء حفظ البيانات");
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        مراجعة البيانات المدخلة من قبل المستخدمين لإضافتها إلى المرشد.{" "}
        <span className="font-bold text-primary-blue">({contributions.length} معلقة)</span>
      </p>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-3 text-xs font-bold text-slate-600">النوع</th>
                <th className="p-3 text-xs font-bold text-slate-600">الاسم</th>
                <th className="p-3 text-xs font-bold text-slate-600">التخصص</th>
                <th className="p-3 text-xs font-bold text-slate-600">المنطقة</th>
                <th className="p-3 text-xs font-bold text-slate-600">الهاتف</th>
                <th className="p-3 text-xs font-bold text-slate-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {contributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                    <div className="space-y-2">
                      <CheckCircle2 size={32} className="mx-auto text-emerald-300" />
                      <p>لا توجد مساهمات معلقة حالياً</p>
                      <p className="text-[10px] text-slate-300">المساهمات الجديدة من المستخدمين ستظهر هنا تلقائياً</p>
                    </div>
                  </td>
                </tr>
              ) : (
                contributions.map((cont) => (
                  <tr key={cont.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${cont.type === 'doctors' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {cont.type === 'doctors' ? 'طبيب' : 'مركز'}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-bold text-slate-800">{cont.name}</td>
                    <td className="p-3 text-xs text-slate-600">{cont.specialty}</td>
                    <td className="p-3 text-xs text-slate-600">{cont.district}</td>
                    <td className="p-3 text-xs text-slate-600 font-sans">{cont.phone}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewModal(cont)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="مشاهدة">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openMoveModal(cont)} className="p-1.5 text-primary-blue hover:bg-blue-50 rounded-lg transition-colors" title="تعديل وقبول">
                          <ArrowUpRight size={16} />
                        </button>
                        <button onClick={() => handleAccept(cont)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="قبول مباشر">
                          <CheckCircle2 size={16} />
                        </button>
                        <button onClick={() => handleReject(cont.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="رفض وحذف">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">تفاصيل المساهمة</h3>
              <button onClick={() => setViewModal(null)} className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3 text-right">
              {[
                { l: "النوع", v: viewModal.type === 'doctors' ? 'طبيب' : 'مركز / صيدلية' },
                { l: "الاسم", v: viewModal.name },
                { l: "التخصص", v: viewModal.specialty },
                { l: "المنطقة", v: viewModal.district },
                { l: "الهاتف", v: viewModal.phone || "—" },
                { l: "العنوان", v: viewModal.address || "—" },
              ].map((r, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-bold text-slate-500">{r.l}</span>
                  <span className="text-sm text-slate-800 font-bold">{r.v}</span>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setViewModal(null)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">إغلاق</button>
              <button onClick={() => { setViewModal(null); openMoveModal(viewModal); }} className="flex-1 py-3 bg-primary-blue text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 flex items-center justify-center gap-2">
                <ArrowUpRight size={16} /> تعديل وقبول
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move to Providers Modal using Shared Form */}
      {moveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm py-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">مراجعة وقبول المساهمة</h3>
              <button onClick={() => setMoveModal(null)} className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
                راجع البيانات وأكمل أي حقول ناقصة. سيتم تفعيل هذا {formData.type === "doctors" ? "الطبيب" : "المركز"} في الدليل فوراً بعد الحفظ.
              </div>
              <ProviderForm data={formData} onChange={setFormData} />
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3 shrink-0 bg-white">
              <button onClick={() => setMoveModal(null)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">إلغاء</button>
              <button onClick={handleMoveConfirm} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-600 flex items-center justify-center gap-2">
                <Save size={16} /> قبول وحفظ في الدليل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

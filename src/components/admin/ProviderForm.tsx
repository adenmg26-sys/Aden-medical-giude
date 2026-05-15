"use client";

import React from "react";
import { Upload } from "lucide-react";
import { adenDistricts } from "@/data/districts";
import { WorkShift, CenterHours } from "@/data/workingHours";
import { DoctorShiftsForm, CenterHoursForm } from "@/components/admin/WorkingHoursForm";
import { specialtyGroups } from "@/data/specialties";

export type ProviderFormData = {
  type: "doctors" | "centers";
  name: string;
  specialty: string;
  district: string;
  address: string;
  phone: string;
  whatsapp: string;
  image: string;
  verified: boolean;
  shifts: WorkShift[];
  centerHours: CenterHours;
};

type ProviderFormProps = {
  data: ProviderFormData;
  onChange: (data: ProviderFormData) => void;
  viewOnly?: boolean;
  hideTypeSelect?: boolean;
};

export function ProviderForm({ data, onChange, viewOnly = false, hideTypeSelect = false }: ProviderFormProps) {
  const updateField = (field: keyof ProviderFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // For now, convert to base64 for preview. 
    // In production, you should upload to Supabase Storage.
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField("image", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const allSpecialties = specialtyGroups.flatMap(g => g.specialties);

  return (
    <div className="space-y-4">
      {!hideTypeSelect && (
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">النوع</label>
          <select 
            value={data.type} 
            disabled={viewOnly}
            onChange={(e) => updateField("type", e.target.value as "doctors" | "centers")}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:opacity-60"
          >
            <option value="doctors">طبيب</option>
            <option value="centers">مركز / صيدلية</option>
          </select>
        </div>
      )}

      {/* Image Upload */}
      <div className="flex items-center gap-4">
        <div className="relative group w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 shrink-0 overflow-hidden">
          {data.image ? (
            <img src={data.image} className="w-full h-full object-cover" alt="" />
          ) : (
            <Upload size={24} className="text-slate-400" />
          )}
          {!viewOnly && (
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-slate-700">صورة {data.type === "doctors" ? "الطبيب" : "المركز"}</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="رابط الصورة أو اختر ملفاً..." 
              value={data.image?.startsWith('data:') ? 'صورة مرفوعة' : data.image} 
              disabled={viewOnly}
              onChange={(e) => updateField("image", e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/20 font-sans disabled:opacity-60" 
            />
            {!viewOnly && (
              <label className="flex items-center justify-center px-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload size={14} className="text-slate-500" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Basic Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">الاسم *</label>
          <input 
            type="text" 
            value={data.name} 
            disabled={viewOnly}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:opacity-60" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">التخصص *</label>
          {data.type === "doctors" ? (
            <select 
              value={data.specialty} 
              disabled={viewOnly}
              onChange={(e) => updateField("specialty", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:opacity-60"
            >
              <option value="">اختر التخصص</option>
              {allSpecialties.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          ) : (
            <input 
              type="text" 
              value={data.specialty} 
              disabled={viewOnly}
              onChange={(e) => updateField("specialty", e.target.value)}
              placeholder="مثال: مستشفى عام، صيدلية"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:opacity-60" 
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">المديرية</label>
          <select 
            value={data.district} 
            disabled={viewOnly}
            onChange={(e) => updateField("district", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:opacity-60"
          >
            {adenDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">العنوان التفصيلي</label>
          <input 
            type="text" 
            value={data.address} 
            disabled={viewOnly}
            onChange={(e) => updateField("address", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:opacity-60" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">رقم الهاتف</label>
          <input 
            type="text" 
            value={data.phone} 
            disabled={viewOnly}
            onChange={(e) => updateField("phone", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 font-sans disabled:opacity-60" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">واتساب</label>
          <input 
            type="text" 
            value={data.whatsapp} 
            disabled={viewOnly}
            onChange={(e) => updateField("whatsapp", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 font-sans disabled:opacity-60" 
          />
        </div>
      </div>

      {/* Working Hours */}
      {data.type === "doctors" ? (
        viewOnly ? (
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
             <h4 className="text-sm font-bold text-slate-800">أوقات الدوام</h4>
             <div className="space-y-2">
               {data.shifts.map((shift, idx) => (
                 <div key={idx} className="bg-white p-2 rounded text-xs text-slate-600 border border-slate-100">
                   <span className="font-bold">{shift.day}</span> | {shift.time} | {shift.location}
                 </div>
               ))}
             </div>
          </div>
        ) : (
          <DoctorShiftsForm shifts={data.shifts} onChange={(s) => updateField("shifts", s)} />
        )
      ) : (
        viewOnly ? (
           <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
             <h4 className="text-sm font-bold text-slate-800">أوقات العمل</h4>
             <div className="bg-white p-2 rounded text-xs text-slate-600 border border-slate-100">
               {data.centerHours.is24h ? "مداوم 24 ساعة" : `من ${data.centerHours.openTime} إلى ${data.centerHours.closeTime}`}
             </div>
           </div>
        ) : (
          <CenterHoursForm hours={data.centerHours} onChange={(h) => updateField("centerHours", h)} />
        )
      )}

      {/* Verified Status */}
      <label className={`flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 ${viewOnly ? 'opacity-60' : 'cursor-pointer'}`}>
        <input 
          type="checkbox" 
          checked={data.verified} 
          disabled={viewOnly}
          onChange={(e) => updateField("verified", e.target.checked)} 
          className="w-4 h-4 accent-primary-blue rounded disabled:opacity-60" 
        />
        <div>
          <span className="text-sm font-bold text-slate-800">موثق</span>
          <p className="text-[10px] text-slate-500">سيظهر علامة التوثيق بجانب الاسم.</p>
        </div>
      </label>
    </div>
  );
}

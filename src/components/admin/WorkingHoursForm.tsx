"use client";

import React from "react";
import { Clock, MapPin, Plus, X } from "lucide-react";
import { DAYS_OPTIONS, WorkShift, CenterHours } from "@/data/workingHours";

// ---- Doctor Working Hours ----
export function DoctorShiftsForm({ shifts, onChange }: { shifts: WorkShift[]; onChange: (s: WorkShift[]) => void }) {
  const addShift = () => onChange([...shifts, { day: "", time: "", location: "" }]);
  const removeShift = (idx: number) => onChange(shifts.filter((_, i) => i !== idx));
  const updateShift = (idx: number, field: keyof WorkShift, value: string) => {
    onChange(shifts.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Clock size={16} className="text-amber-500" /> أوقات الدوام</h4>
        <button onClick={addShift} type="button" className="text-xs text-primary-blue font-bold hover:underline flex items-center gap-1"><Plus size={14} /> إضافة فترة</button>
      </div>
      <div className="space-y-3">
        {shifts.map((shift, idx) => (
          <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold">الفترة {idx + 1}</span>
              {shifts.length > 1 && <button onClick={() => removeShift(idx)} className="text-rose-400 hover:text-rose-500"><X size={14} /></button>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold">اليوم / الأيام</label>
                <select value={shift.day} onChange={(e) => updateShift(idx, "day", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/20">
                  <option value="">اختر اليوم</option>
                  {DAYS_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><MapPin size={10} /> مكان الدوام</label>
                <input type="text" placeholder="مثال: مستشفى عدن، عيادة خاصة..." value={shift.location} onChange={(e) => updateShift(idx, "location", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/20" />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[10px] text-slate-500 font-bold">الوقت (من - إلى)</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold pointer-events-none">من</span>
                  <input type="time" value={shift.time.split(' - ')[0] || ""} onChange={(e) => updateShift(idx, "time", `${e.target.value} - ${shift.time.split(' - ')[1] || ''}`)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/20" />
                </div>
                <div className="relative">
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold pointer-events-none">إلى</span>
                  <input type="time" value={shift.time.split(' - ')[1] || ""} onChange={(e) => updateShift(idx, "time", `${shift.time.split(' - ')[0] || ''} - ${e.target.value}`)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Center Working Hours ----
export function CenterHoursForm({ hours, onChange }: { hours: CenterHours; onChange: (h: CenterHours) => void }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Clock size={16} className="text-amber-500" /> أوقات العمل</h4>
      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={hours.is24h} onChange={(e) => onChange({ ...hours, is24h: e.target.checked })} className="w-4 h-4 accent-primary-blue rounded" />
          <span className="text-sm font-bold text-slate-700">مداوم 24 ساعة على مدار اليوم</span>
        </label>
        {!hours.is24h && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">وقت الفتح</label>
              <input type="time" value={hours.openTime} onChange={(e) => onChange({ ...hours, openTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">وقت الإغلاق</label>
              <input type="time" value={hours.closeTime} onChange={(e) => onChange({ ...hours, closeTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

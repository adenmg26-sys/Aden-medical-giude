"use client";

import React from "react";
import { Phone, AlertTriangle, Droplet, Flame, ShieldAlert } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const emergencyGroups = [
  {
    title: "أرقام الطوارئ العامة",
    items: [
      { id: 1, name: "العمليات المشتركة", number: "190", icon: <ShieldAlert className="text-white" size={24} />, color: "bg-primary-blue", shadow: "shadow-primary-blue/30" },
      { id: 2, name: "شرطة النجدة", number: "199", icon: <ShieldAlert className="text-white" size={24} />, color: "bg-blue-600", shadow: "shadow-blue-600/30" },
      { id: 3, name: "الدفاع المدني", number: "191", icon: <Flame className="text-white" size={24} />, color: "bg-orange-500", shadow: "shadow-orange-500/30" },
      { id: 4, name: "الإسعاف المركزي", number: "195", icon: <AlertTriangle className="text-white" size={24} />, color: "bg-rose-600", shadow: "shadow-rose-600/30" },
    ]
  },
  {
    title: "المستشفيات الكبرى (طوارئ 24 ساعة)",
    items: [
      { id: 5, name: "مستشفى الجمهورية التعليمي", number: "02-234567", icon: <Droplet className="text-white" size={24} />, color: "bg-red-700", shadow: "shadow-red-700/30" },
      { id: 6, name: "مستشفى الصداقة التعليمي", number: "02-382901", icon: <Phone className="text-white" size={24} />, color: "bg-emerald-600", shadow: "shadow-emerald-600/30" },
      { id: 7, name: "مستشفى الوالي", number: "02-348222", icon: <Phone className="text-white" size={24} />, color: "bg-emerald-600", shadow: "shadow-emerald-600/30" },
      { id: 8, name: "مستشفى النقيب", number: "02-354333", icon: <Phone className="text-white" size={24} />, color: "bg-emerald-600", shadow: "shadow-emerald-600/30" },
      { id: 9, name: "المستشفى الألماني الحديث", number: "02-342999", icon: <Phone className="text-white" size={24} />, color: "bg-emerald-600", shadow: "shadow-emerald-600/30" },
      { id: 10, name: "مستشفى السلام", number: "02-385000", icon: <Phone className="text-white" size={24} />, color: "bg-emerald-600", shadow: "shadow-emerald-600/30" },
      { id: 11, name: "المستشفى الأمريكي الحديث", number: "02-332000", icon: <Phone className="text-white" size={24} />, color: "bg-emerald-600", shadow: "shadow-emerald-600/30" },
      { id: 12, name: "مستشفى الريادة", number: "02-390444", icon: <Phone className="text-white" size={24} />, color: "bg-emerald-600", shadow: "shadow-emerald-600/30" },
      { id: 13, name: "مستشفى عدن الخيري", number: "02-299333", icon: <Phone className="text-white" size={24} />, color: "bg-emerald-600", shadow: "shadow-emerald-600/30" },
    ]
  },
  {
    title: "مراكز الأكسجين",
    items: [
      { id: 14, name: "مركز بلقيس للأكسجين", number: "770000000", icon: <Droplet className="text-white" size={24} />, color: "bg-cyan-500", shadow: "shadow-cyan-500/30" },
      { id: 15, name: "مصنع المنصورة للأكسجين", number: "770000001", icon: <Droplet className="text-white" size={24} />, color: "bg-cyan-500", shadow: "shadow-cyan-500/30" },
    ]
  },
  {
    title: "صيدليات المناوبة (24 ساعة)",
    items: [
      { id: 16, name: "صيدلية المجتمع", number: "02-237493", icon: <Phone className="text-white" size={24} />, color: "bg-indigo-500", shadow: "shadow-indigo-500/30" },
      { id: 17, name: "صيدلية تو فارما - عدن", number: "02-252011", icon: <Phone className="text-white" size={24} />, color: "bg-indigo-500", shadow: "shadow-indigo-500/30" },
      { id: 18, name: "صيدلية أم القرى", number: "بحث", icon: <Phone className="text-white" size={24} />, color: "bg-indigo-500", shadow: "shadow-indigo-500/30" },
      { id: 19, name: "صيدلية الميدان (Al-Maidan)", number: "بحث", icon: <Phone className="text-white" size={24} />, color: "bg-indigo-500", shadow: "shadow-indigo-500/30" },
      { id: 20, name: "صيدلية السكنية", number: "بحث", icon: <Phone className="text-white" size={24} />, color: "bg-indigo-500", shadow: "shadow-indigo-500/30" },
    ]
  }
];

export default function EmergencyPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6 mt-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 mb-4 shadow-sm">
          <Phone size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">أرقام الطوارئ</h1>
        <p className="text-sm text-slate-500 mt-2">اتصل مباشرة بجهات الاختصاص في حالات الطوارئ</p>
      </div>

      <div className="space-y-8">
        {emergencyGroups.map((group, idx) => (
          <div key={idx} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-rose-100 pb-2 inline-block">{group.title}</h2>
            <div className="grid gap-4">
              {group.items.map((contact) => (
                <GlassCard key={contact.id} className="p-4 flex items-center justify-between border-rose-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${contact.color} flex items-center justify-center shadow-lg ${contact.shadow}`}>
                      {contact.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{contact.name}</h3>
                      <p className="text-slate-500 font-sans mt-0.5 font-medium text-sm text-left dir-ltr">{contact.number}</p>
                    </div>
                  </div>
                  {contact.number !== "بحث" && (
                    <a 
                      href={`tel:${contact.number}`}
                      className="bg-emerald-100 text-emerald-700 p-3 rounded-xl hover:bg-emerald-200 transition-colors"
                    >
                      <Phone size={20} />
                    </a>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <h3 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
          <AlertTriangle size={18} /> ملاحظة هامة
        </h3>
        <p className="text-sm text-amber-700 leading-relaxed">
          هذه الأرقام مخصصة للحالات الطارئة والحرجة فقط. يرجى عدم الاتصال بها إلا عند الحاجة الماسة لضمان سرعة استجابة الجهات المختصة لمن هم في أمس الحاجة.
        </p>
      </div>
    </div>
  );
}

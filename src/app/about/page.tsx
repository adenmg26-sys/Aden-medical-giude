import React from "react";
import { ArrowRight, Info, ShieldCheck, HeartPulse, Users } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="pb-20 min-h-screen bg-slate-50/50">
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
            <Info size={24} /> من نحن
          </h1>
          <p className="text-blue-100 text-sm opacity-90">تعرف أكثر على منصة مرشد عدن الطبي</p>
        </div>
      </div>

      <div className="p-4 space-y-6 -mt-4 relative z-20">
        <GlassCard className="p-6 space-y-4">
          <div className="w-16 h-16 bg-primary-blue/10 rounded-2xl flex items-center justify-center text-primary-blue mx-auto mb-2">
            <HeartPulse size={32} />
          </div>
          <h2 className="text-lg font-bold text-center text-slate-800">رسالتنا</h2>
          <p className="text-sm text-slate-600 leading-relaxed text-center">
            نسعى في "مرشد عدن الطبي" إلى توفير منصة رقمية متكاملة وسهلة الاستخدام تجمع كافة الأطباء، والمراكز الطبية، والصيدليات في مدينة عدن. هدفنا هو تسهيل وصول المريض إلى الرعاية الصحية المناسبة في الوقت المناسب.
          </p>
        </GlassCard>

        <div className="grid grid-cols-2 gap-4">
          <GlassCard className="p-4 text-center space-y-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">مجتمع صحي</h3>
            <p className="text-[10px] text-slate-500">نربط المرضى بمقدمي الرعاية الموثوقين.</p>
          </GlassCard>
          
          <GlassCard className="p-4 text-center space-y-2">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">معلومات موثقة</h3>
            <p className="text-[10px] text-slate-500">نحرص على دقة البيانات وتحديثها باستمرار.</p>
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">لماذا مرشد عدن الطبي؟</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-blue mt-1.5" />
              <span>البحث السريع عن التخصصات والمراكز القريبة.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-blue mt-1.5" />
              <span>معرفة أوقات الدوام وأماكن تواجد الأطباء بدقة.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-blue mt-1.5" />
              <span>إمكانية حفظ الأطباء للرجوع إليهم بدون إنترنت.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-blue mt-1.5" />
              <span>تسهيل التواصل عبر الاتصال المباشر أو الواتساب.</span>
            </li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

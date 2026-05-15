import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

export default function PrivacyPage() {
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
            <ShieldCheck size={24} /> سياسة الخصوصية
          </h1>
          <p className="text-blue-100 text-sm opacity-90">تعرف على كيفية حماية بياناتك وخصوصيتك</p>
        </div>
      </div>

      <div className="p-4 space-y-6 -mt-4 relative z-20">
        <GlassCard className="p-6 space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-blue" />
              جمع المعلومات
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              تطبيق مرشد عدن الطبي مصمم ليكون تصفحه متاحاً للجميع دون الحاجة إلى إنشاء حساب أو تسجيل الدخول. نحن لا نقوم بجمع أي بيانات شخصية حساسة عن الزوار.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-blue" />
              استخدام التخزين المحلي (LocalStorage)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              نستخدم ميزة التخزين المحلي في متصفحك لحفظ قائمة الأطباء المفضلين لديك لتتمكن من الوصول إليهم حتى في حال عدم توفر اتصال بالإنترنت (أوفلاين). هذه البيانات تبقى في جهازك ولا تُرسل لأي خوادم خارجية.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-blue" />
              بيانات الأطباء والمراكز
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              كافة البيانات الطبية المعروضة في التطبيق هي بيانات عامة (عناوين، أرقام هواتف، مواعيد) يتم جمعها لتسهيل وصول المرضى للخدمات الصحية. في حال كان هناك خطأ في البيانات أو رغبة في الإزالة، يمكن التواصل معنا عبر صفحة "اتصل بنا".
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-blue" />
              أمن المعلومات
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              نتخذ كافة الإجراءات التقنية المعقولة لضمان بقاء التطبيق آمناً للاستخدام، ونضمن خلو التطبيق من أي برمجيات تتبع خبيثة.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400">آخر تحديث: {new Date().toLocaleDateString('ar-YE')}</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

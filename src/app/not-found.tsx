"use client";

import Link from "next/link";
import { WifiOff, Home, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useState, useEffect } from "react";

export default function NotFound() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-xl ${isOffline ? 'bg-amber-100 text-amber-600 shadow-amber-100/50' : 'bg-blue-100 text-primary-blue shadow-blue-100/50'}`}>
          {isOffline ? <WifiOff size={40} /> : <span className="text-4xl">🔍</span>}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">
            {isOffline ? "الصفحة غير متوفرة بدون إنترنت" : "الصفحة غير موجودة"}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            {isOffline 
              ? "هذه الصفحة لم يتم تحميلها مسبقاً ولا يمكن عرضها بدون اتصال بالإنترنت. جرّب فتح الصفحة الرئيسية حيث تتوفر البيانات المحملة."
              : "عذراً، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها."
            }
          </p>
        </div>

        {isOffline && (
          <GlassCard className="p-4 text-right">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm">💡</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">نصيحة</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  للاستفادة الكاملة من وضع بدون إنترنت، افتح الصفحات التي تحتاجها مرة واحدة وأنت متصل بالإنترنت وسيتم حفظها تلقائياً.
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/"
            className="bg-primary-blue text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary-blue/20 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            <Home size={18} /> الصفحة الرئيسية
          </Link>
          <button
            onClick={() => window.history.back()}
            className="text-slate-500 text-sm font-bold flex items-center justify-center gap-1 hover:text-primary-blue transition-colors py-2"
          >
            <ArrowRight size={14} /> العودة للصفحة السابقة
          </button>
        </div>
      </div>
    </div>
  );
}

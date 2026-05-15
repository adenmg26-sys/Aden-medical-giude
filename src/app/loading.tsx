import React from "react";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50">
      <div className="relative mb-6 animate-pulse">
        <div className="absolute inset-0 bg-primary-blue/20 blur-xl rounded-full"></div>
        <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center relative z-10 border border-white shadow-xl p-3">
          <Image src="/icon.png" alt="مرشد عدن الطبي" fill className="object-contain p-3" priority />
        </div>
      </div>
      <h2 className="text-xl font-bold text-slate-800 animate-pulse">جاري التحميل...</h2>
    </div>
  );
}

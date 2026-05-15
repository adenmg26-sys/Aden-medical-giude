"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MapPin, BookmarkMinus } from "lucide-react";

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  
  // Use Dexie live query to fetch the saved providers directly from IndexedDB
  const allSavedProviders = useLiveQuery(
    () => db.providers.where('id').anyOf(savedIds).toArray(),
    [savedIds]
  ) || [];

  useEffect(() => {
    // Read from localStorage only on client
    const saved = JSON.parse(localStorage.getItem("saved_providers") || "[]");
    setSavedIds(saved);
  }, []);

  const removeSaved = (idToRemove: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the provider page
    const newSaved = savedIds.filter(id => id !== idToRemove);
    setSavedIds(newSaved);
    localStorage.setItem("saved_providers", JSON.stringify(newSaved));
  };

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-800">المحفوظات</h1>
        <p className="text-sm text-slate-500">قائمة الأطباء والمراكز التي قمت بحفظها للرجوع إليها لاحقاً</p>
      </div>

      <div className="space-y-3">
        {allSavedProviders.length > 0 ? (
          allSavedProviders.map((provider) => (
            <Link href={`/providers/${provider.id}`} key={provider.id}>
              <GlassCard className="p-4 hover:bg-white/60 transition-all cursor-pointer border-white/50 shadow-md hover:shadow-lg group mb-3 relative">
                <button 
                  onClick={(e) => removeSaved(provider.id, e)}
                  className="absolute top-4 left-4 p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-colors z-10"
                  title="إزالة من المحفوظات"
                >
                  <BookmarkMinus size={16} />
                </button>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                     <div className="w-12 h-12 bg-slate-100 group-hover:bg-primary-blue/5 transition-colors rounded-xl flex items-center justify-center text-xl shadow-inner">
                        {provider.type === "centers" ? "🏥" : "👨‍⚕️"}
                     </div>
                     <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-base">{provider.name}</h3>
                        {provider.verified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[6px] text-white shadow-sm shadow-blue-500/50">✓</div>}
                      </div>
                      <p className="text-primary-red text-[11px] font-bold mt-0.5 opacity-80">{provider.specialty}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md"><MapPin size={10} className="text-slate-400"/> {provider.district}</span>
                      </div>
                     </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))
        ) : (
          <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <BookmarkMinus size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">لا توجد محفوظات</h3>
            <p className="text-sm text-slate-500 mt-2">انقر على أيقونة الحفظ في صفحة الطبيب لإضافته هنا حتى بدون إنترنت.</p>
            <Link href="/providers" className="inline-block mt-6 px-6 py-2 bg-primary-blue text-white text-sm font-bold rounded-xl shadow-md">
              تصفح الأطباء
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

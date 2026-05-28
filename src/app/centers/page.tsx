"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, MapPin, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from 'next/image';

const centerSubcategories = [
  "الكل",
  "مركز طبي",
  "مستوصف",
  "مستشفى",
  "عيادة",
  "صيدلية",
  "مركز علاج طبيعي",
  "مختبر",
  "مركز أشعة"
];

export default function CentersPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");

  const activeCenters = useLiveQuery(() => 
    db.providers.where('status').equals('مفعل').toArray()
  ) || [];

  const centers = activeCenters.filter(p => p.type === 'centers');

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.includes(searchQuery) || (center.specialty && center.specialty.includes(searchQuery));
    const matchesCategory = activeCategory === "الكل" || (center as any).center_subcategory === activeCategory || (center.specialty && center.specialty.includes(activeCategory));
    return matchesSearch && matchesCategory;
  });

  const handleProviderClick = (id: string | number) => {
    router.push(`/providers/${id}`);
  };

  return (
    <div className="pb-24 pt-6 space-y-6">
      <div className="px-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-white/60 backdrop-blur-md rounded-xl text-slate-600 hover:bg-white shadow-sm transition-all border border-slate-100">
            <ChevronLeft size={20} className="rotate-180" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">المراكز الطبية</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 shadow-sm"
            placeholder="ابحث عن مركز طبي، مستشفى، صيدلية..."
          />
        </div>
      </div>

      <div className="px-4 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2">
          {centerSubcategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm",
                activeCategory === cat 
                  ? "bg-primary-blue text-white shadow-primary-blue/20" 
                  : "bg-white/80 text-slate-600 hover:bg-slate-50 border border-slate-100"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 grid gap-3">
        {filteredCenters.map((provider) => (
          <GlassCard
            key={provider.id}
            className="p-4 cursor-pointer hover:bg-white/40 transition-colors"
            onClick={() => handleProviderClick(provider.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                 <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl shadow-inner relative overflow-hidden">
                     {provider.image ? <Image src={provider.image} alt={provider.name} fill className="object-cover" unoptimized={provider.image.startsWith('data:')} /> : '🏥'}
                  </div>
                 <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-base">{provider.name}</h3>
                    {provider.verified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[6px] text-white shadow-sm shadow-blue-500/50">✓</div>}
                  </div>
                  <p className="text-primary-red text-xs font-bold mt-0.5">{provider.specialty}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md"><MapPin size={10} className="text-slate-400"/> {provider.district}</span>
                  </div>
                 </div>
              </div>
            </div>
          </GlassCard>
        ))}

        {filteredCenters.length === 0 && (
          <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-2xl">
               🏥
             </div>
             <h3 className="text-lg font-bold text-slate-800">لا توجد مراكز مطابقة</h3>
             <p className="text-sm text-slate-500 mt-2">جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, MapPin, Star, Search, Filter } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { specialtyGroups } from "@/data/specialties";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Perform live search query on local database
  const filteredProviders = useLiveQuery(async () => {
    if (!searchQuery.trim()) return [];
    
    // Dexie query: search by name, district, or specialty
    const q = searchQuery.toLowerCase();
    const results = await db.providers
      .filter(p => 
        p.status === 'مفعل' && (
          p.name.toLowerCase().includes(q) || 
          p.district.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q)
        )
      )
      .toArray();

    // Sort: premium first (by premium_rank), then normal
    return results.sort((a, b) => {
      const aPremium = a.is_premium === true || (a.is_premium as unknown as string) === 'true';
      const bPremium = b.is_premium === true || (b.is_premium as unknown as string) === 'true';
      if (aPremium && !bPremium) return -1;
      if (!aPremium && bPremium) return 1;
      if (aPremium && bPremium) {
        return (a.premium_rank || 0) - (b.premium_rank || 0);
      }
      return 0;
    });
  }, [searchQuery]) || [];

  const filteredSpecialties = specialtyGroups.flatMap(g => g.specialties).filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-10 min-h-screen bg-slate-50/50">
      <div className="bg-gradient-to-l from-primary-blue to-blue-700 p-6 pt-10 text-white rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute left-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl transition-colors">
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl font-bold">نتائج البحث</h1>
          <p className="text-blue-100 text-sm opacity-90">ابحث عن تخصص، طبيب، أو صيدلية...</p>
        </div>
      </div>

      <div className="p-4 space-y-6 -mt-4 relative z-20">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pr-10 pl-3 py-3.5 border border-white/60 shadow-lg shadow-slate-200/50 rounded-2xl bg-white/80 backdrop-blur-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 transition-all text-sm"
            placeholder="ابحث هنا..."
          />
        </div>

        {searchQuery.trim() === "" ? (
          <div className="text-center py-12 px-4">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">اكتب للبحث</h3>
              <p className="text-sm text-slate-500 mt-2">يمكنك البحث عن اسم العيادة، التخصص، أو المنطقة.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Specialties Matches */}
            {filteredSpecialties.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-slate-800 mb-3">التخصصات المطابقة</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {filteredSpecialties.map((spec) => (
                    <Link href={`/providers/category/${spec.id}`} key={spec.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                      <div className="w-14 h-14 bg-white/70 backdrop-blur-md border border-glass-border rounded-2xl flex items-center justify-center text-2xl shadow-sm hover:scale-105 transition-transform cursor-pointer text-primary-blue">
                        {spec.icon}
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 text-center leading-tight">{spec.name}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Providers Matches */}
            <section>
              <h2 className="text-sm font-bold text-slate-800 mb-3">الأطباء والمراكز المطابقة</h2>
              <div className="space-y-3">
                {filteredProviders.length > 0 ? (
                  filteredProviders.map((provider) => {
                    const isPremium = provider.is_premium === true || (provider.is_premium as unknown as string) === 'true';
                    return (
                      <Link href={`/providers/${provider.id}`} key={provider.id}>
                        <GlassCard className={cn(
                          "p-4 hover:bg-white/50 transition-all cursor-pointer border shadow-md hover:shadow-lg group",
                          isPremium ? "border-blue-500/30 neon-glow-blue bg-blue-50/5 relative overflow-hidden" : "border-white/50"
                        )}>
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                               <div className="w-12 h-12 bg-slate-100 group-hover:bg-primary-blue/5 transition-colors rounded-xl flex items-center justify-center text-xl shadow-inner shrink-0 relative overflow-hidden">
                                  {provider.image ? (
                                    <Image src={provider.image} alt={provider.name} fill className="object-cover" unoptimized={provider.image.startsWith('data:')} />
                                  ) : (
                                    provider.type === "centers" ? "🏥" : "👨‍⚕️"
                                  )}
                               </div>
                               <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-bold text-slate-800 text-base">{provider.name}</h3>
                                  {provider.verified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[6px] text-white shadow-sm shadow-blue-500/50">✓</div>}
                                  {isPremium && (
                                    <span className="bg-amber-500/20 text-amber-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-amber-500/10">مميز ⭐</span>
                                  )}
                                </div>
                                <p className="text-primary-red text-[11px] font-bold mt-0.5 opacity-80">{provider.specialty}</p>
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-medium">
                                  <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md"><MapPin size={10} className="text-slate-400"/> {provider.district}</span>
                                </div>
                               </div>
                            </div>
                            <div className={cn(
                              "text-[9px] px-2.5 py-1 rounded-full font-bold shadow-sm shrink-0",
                              provider.status === "open" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"
                            )}>
                              {provider.status === "open" ? "متاح الآن" : "مغلق"}
                            </div>
                          </div>
                        </GlassCard>
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    لا يوجد أطباء أو مراكز مطابقة.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
      <SearchContent />
    </Suspense>
  );
}

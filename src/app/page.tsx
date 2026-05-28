"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  Star, 
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { specialtyGroups } from "@/data/specialties";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

import LastSyncIndicator from "@/components/ui/LastSyncIndicator";
import SkeletonCard from "@/components/ui/SkeletonCard";

import Image from "next/image";

export default function Home() {
  const router = useRouter();
  
  // Live queries from IndexedDB - Only show verified/active providers
  const activeProviders = useLiveQuery(() => db.providers.where('status').equals('مفعل').toArray()) || [];
  const doctors = activeProviders.filter(p => p.type === 'doctors').slice(0, 5);
  const centers = activeProviders.filter(p => p.type === 'centers').slice(0, 5);
  const dbAds = useLiveQuery(() => db.ads.filter(ad => ad.active === true || (ad.active as unknown as string) === 'true' || (ad.active as unknown as number) === 1).toArray()) || [];
  const ads = dbAds.length > 0 ? dbAds.map(ad => ({
    id: ad.id,
    title: ad.title,
    desc: ad.description,
    imageUrl: ad.imageUrl,
    link: ad.link,
    btn: "التفاصيل",
    bg: "from-slate-900 to-slate-800",
    text: "text-white"
  })) : [];

  const [randomSpecialties, setRandomSpecialties] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 1. Shuffle all specialties
    const allSpecs = specialtyGroups.flatMap(g => g.specialties);
    const shuffled = [...allSpecs].sort(() => 0.5 - Math.random());
    setRandomSpecialties(shuffled.slice(0, 8)); // Show 8 random specialties

    // 2. Rotate ads every 5 seconds if there's more than 1 ad
    let timer: NodeJS.Timeout;
    if (ads.length > 1) {
      timer = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [ads.length]);

  const handleProviderClick = (id: string | number) => {
    router.push(`/providers/${id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const nextAd = () => setCurrentAdIndex((prev) => (prev + 1) % ads.length);
  const prevAd = () => setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length);

  const currentAd = ads[currentAdIndex];

  return (
    <div className="pb-6 space-y-6 overflow-hidden">
      {/* 1. Top Ad Banner */}
      {ads.length > 0 && currentAd && (
        <section className="px-4 pt-4">
          <Link href={currentAd.link || "#"} className="block group">
            <GlassCard className={cn(`bg-gradient-to-r ${currentAd.bg} border-none ${currentAd.text} relative overflow-hidden h-36 flex items-center transition-all duration-500 shadow-xl shadow-slate-200`)}>
              {/* Image Background */}
              {currentAd.imageUrl && (
                <div className="absolute inset-0 z-0">
                   <Image src={currentAd.imageUrl} alt={currentAd.title} fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-900/90" />
                </div>
              )}
              
              <div className="relative z-10 w-full flex justify-between items-center px-6">
                <div className="space-y-1.5 max-w-[70%]">
                  <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md border border-white/20">إعلان ممول</span>
                  <h3 className="text-lg font-bold leading-tight">{currentAd.title}</h3>
                  <p className="text-xs opacity-90 line-clamp-2">{currentAd.desc}</p>
                </div>
              </div>
              
              {/* Navigation Arrows */}
              {ads.length > 1 && (
                <>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
                    <button onClick={(e) => { e.preventDefault(); nextAd(); }} className="bg-black/20 hover:bg-black/40 p-1.5 rounded-full backdrop-blur-sm transition-colors text-white border border-white/10">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
                    <button onClick={(e) => { e.preventDefault(); prevAd(); }} className="bg-black/20 hover:bg-black/40 p-1.5 rounded-full backdrop-blur-sm transition-colors text-white border border-white/10">
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                </>
              )}
            </GlassCard>
          </Link>
        </section>
      )}

      {/* 2. Search Section */}
      <section className="px-4">
        <form onSubmit={handleSearch} className="relative">
          <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:opacity-80">
            <Search className="h-5 w-5 text-slate-400" />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pr-10 pl-3 py-3.5 border border-glass-border rounded-2xl bg-white/60 backdrop-blur-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 shadow-sm transition-all text-sm"
            placeholder="ابحث عن طبيب، صيدلية، تخصص..."
          />
        </form>
      </section>

      {/* 3. Specialties Bar */}
      <section className="space-y-3">
        <div className="px-4 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800">التخصصات الطبية</h2>
          <Link href="/providers" className="text-xs text-primary-blue font-bold flex items-center">عرض الكل <ChevronLeft size={14}/></Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-4">
          {randomSpecialties.map((spec: any) => (
            <Link href={`/providers/category/${spec.id}`} key={spec.id} className="flex flex-col items-center gap-2 min-w-[70px]">
              <div className="w-14 h-14 bg-white/70 backdrop-blur-md border border-glass-border rounded-2xl flex items-center justify-center text-2xl shadow-sm hover:scale-105 transition-transform cursor-pointer">
                {spec.icon}
              </div>
              <span className="text-[11px] font-bold text-slate-600 text-center leading-tight">{spec.name}</span>
            </Link>
          ))}
          {/* Skeleton while loading */}
          {randomSpecialties.length === 0 && Array.from({length: 5}).map((_, i) => (
             <div key={i} className="flex flex-col items-center gap-2 min-w-[70px] animate-pulse">
               <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
               <div className="w-12 h-2 bg-slate-200 rounded-full mt-1"></div>
             </div>
          ))}
        </div>
      </section>

      {/* 4. Doctors Suggestions Section */}
      <section className="px-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800">الأطباء المقترحون</h2>
        </div>
        
        <div className="grid gap-3">
          {doctors.map((provider) => (
            <GlassCard
              key={provider.id}
              className="p-4 cursor-pointer hover:bg-white/40 transition-colors"
              onClick={() => handleProviderClick(provider.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl relative overflow-hidden">
                       {provider.image ? <Image src={provider.image} alt={provider.name} fill className="object-cover" unoptimized={provider.image.startsWith('data:')} /> : '👨‍⚕️'}
                    </div>
                   <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-base">{provider.name}</h3>
                      {provider.verified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[6px] text-white">✓</div>}
                    </div>
                    <p className="text-primary-red text-xs font-medium mt-0.5">{provider.specialty}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {provider.district}</span>
                    </div>
                   </div>
                </div>
              </div>
            </GlassCard>
          ))}
          
          {doctors.length === 0 && (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}
        </div>
      </section>

      {/* 5. Centers Section */}
      <section className="px-4 space-y-4">

        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800">المراكز الطبية</h2>
          <Link href="/centers" className="text-xs text-primary-blue font-bold flex items-center">عرض الكل <ChevronLeft size={14}/></Link>
        </div>
        
        <div className="grid gap-3">
          {centers.map((provider) => (
            <GlassCard
              key={provider.id}
              className="p-4 cursor-pointer hover:bg-white/40 transition-colors"
              onClick={() => handleProviderClick(provider.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl relative overflow-hidden">
                       {provider.image ? <Image src={provider.image} alt={provider.name} fill className="object-cover" unoptimized={provider.image.startsWith('data:')} /> : '🏥'}
                    </div>
                   <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-base">{provider.name}</h3>
                      {provider.verified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[6px] text-white">✓</div>}
                    </div>
                    <p className="text-primary-red text-xs font-medium mt-0.5">{provider.specialty}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {provider.district}</span>
                    </div>
                   </div>
                </div>
              </div>
            </GlassCard>
          ))}
          
          {centers.length === 0 && (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}
        </div>
      </section>

      <LastSyncIndicator />
    </div>
  );
}

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
  
  // Sort function to prioritize premium listings by rank
  const sortProviders = (list: any[]) => {
    return [...list].sort((a, b) => {
      const aPremium = a.is_premium === true || (a.is_premium as unknown as string) === 'true';
      const bPremium = b.is_premium === true || (b.is_premium as unknown as string) === 'true';
      if (aPremium && !bPremium) return -1;
      if (!aPremium && bPremium) return 1;
      if (aPremium && bPremium) {
        return (a.premium_rank || 0) - (b.premium_rank || 0);
      }
      return 0;
    });
  };

  const getMixedProviders = (list: any[]) => {
    const sorted = sortProviders(list);
    const premium = sorted.filter(p => p.is_premium === true || (p.is_premium as unknown as string) === 'true');
    const normal = sorted.filter(p => !(p.is_premium === true || (p.is_premium as unknown as string) === 'true'));
    
    // Mix: Show up to 3 premium, but always leave at least 2 slots for normal if they exist.
    // So total 5 items: if 3 premium -> 2 normal. if 5 premium -> still 3 premium and 2 normal.
    const selectedPremium = premium.slice(0, 3);
    const selectedNormal = normal.slice(0, Math.max(2, 5 - selectedPremium.length));
    
    // Combine and append (premium first)
    return [...selectedPremium, ...selectedNormal];
  };

  const doctors = getMixedProviders(activeProviders.filter(p => p.type === 'doctors'));
  const centers = getMixedProviders(activeProviders.filter(p => p.type === 'centers'));
  
  const dbAds = useLiveQuery(() => db.ads.filter(ad => ad.active === true || (ad.active as unknown as string) === 'true' || (ad.active as unknown as number) === 1).toArray()) || [];
  
  // Filter active providers that should be displayed in the banner and sort them by rank
  const bannerProviders = activeProviders
    .filter(p => p.show_in_banner === true || (p.show_in_banner as unknown as string) === 'true')
    .sort((a, b) => (a.premium_rank || 0) - (b.premium_rank || 0));

  // Merge ads and premium doctors/centers using Periodic Injection logic (2 ads, then 1 premium doctor)
  const mergedBannerItems = React.useMemo(() => {
    const merged: any[] = [];
    let adIndex = 0;
    let provIndex = 0;

    const formattedAds = dbAds.map(ad => ({
      type: "ad" as const,
      id: ad.id,
      title: ad.title,
      desc: ad.description,
      imageUrl: ad.imageUrl,
      link: ad.link,
      bg: "from-slate-900 to-slate-800",
      text: "text-white"
    }));

    const formattedProviders = bannerProviders.map(p => ({
      type: "premium" as const,
      id: p.id,
      name: p.name,
      specialty: p.specialty,
      district: p.district,
      imageUrl: p.image,
      link: `/providers/${p.id}`
    }));

    while (adIndex < formattedAds.length || provIndex < formattedProviders.length) {
      // 1. Inject up to 2 commercial ads
      for (let i = 0; i < 2 && adIndex < formattedAds.length; i++) {
        merged.push(formattedAds[adIndex]);
        adIndex++;
      }
      // 2. Inject 1 premium provider card
      if (provIndex < formattedProviders.length) {
        merged.push(formattedProviders[provIndex]);
        provIndex++;
      }
    }

    if (merged.length === 0 && formattedProviders.length > 0) {
      return formattedProviders;
    }

    return merged;
  }, [dbAds, bannerProviders]);

  const [randomSpecialties, setRandomSpecialties] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 1. Shuffle all specialties
    const allSpecs = specialtyGroups.flatMap(g => g.specialties);
    const shuffled = [...allSpecs].sort(() => 0.5 - Math.random());
    setRandomSpecialties(shuffled.slice(0, 8)); // Show 8 random specialties

    // 2. Rotate ads/premium cards every 5 seconds if there's more than 1 item
    let timer: NodeJS.Timeout;
    if (mergedBannerItems.length > 1) {
      timer = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % mergedBannerItems.length);
      }, 5000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mergedBannerItems.length]);

  const handleProviderClick = (id: string | number) => {
    router.push(`/providers/${id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const nextAd = () => setCurrentAdIndex((prev) => (prev + 1) % mergedBannerItems.length);
  const prevAd = () => setCurrentAdIndex((prev) => (prev - 1 + mergedBannerItems.length) % mergedBannerItems.length);

  const currentItem = mergedBannerItems[currentAdIndex];

  return (
    <div className="pb-6 space-y-6 overflow-hidden">
      {/* 1. Top Smart Ad & Premium Banner */}
      {mergedBannerItems.length > 0 && currentItem && (
        <section className="px-4 pt-4">
          {currentItem.type === "ad" ? (
            // Commercial Ad Template
            <Link href={currentItem.link || "#"} className="block group">
              <GlassCard className={cn(`bg-gradient-to-r ${currentItem.bg} border-none ${currentItem.text} relative overflow-hidden h-36 flex items-center transition-all duration-500 shadow-xl shadow-slate-200`)}>
                {currentItem.imageUrl && (
                  <div className="absolute inset-0 z-0">
                     <Image src={currentItem.imageUrl} alt={currentItem.title} fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-900/90" />
                  </div>
                )}
                
                <div className="relative z-10 w-full flex justify-between items-center px-6">
                  <div className="space-y-1.5 max-w-[70%]">
                    <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md border border-white/20">إعلان ممول</span>
                    <h3 className="text-lg font-bold leading-tight">{currentItem.title}</h3>
                    <p className="text-xs opacity-90 line-clamp-2">{currentItem.desc}</p>
                  </div>
                </div>
                
                {mergedBannerItems.length > 1 && (
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
          ) : (
            // Premium Listing Antigravity Card Template
            <Link href={currentItem.link} className="block group animate-float">
              <GlassCard className="relative overflow-hidden h-36 flex items-center transition-all duration-500 bg-white/30 backdrop-blur-xl border border-blue-500/30 neon-glow-blue shadow-xl shadow-blue-100">
                <div className="absolute inset-0 z-0 opacity-20 bg-gradient-to-tr from-primary-blue via-blue-400 to-indigo-600 mix-blend-overlay"></div>
                
                <div className="relative z-10 w-full flex items-center justify-between px-6">
                  <div className="flex items-center gap-4 max-w-[75%]">
                    <div className="w-16 h-16 rounded-2xl bg-white/40 border border-white/40 shadow-inner flex items-center justify-center text-2xl relative overflow-hidden shrink-0">
                      {currentItem.imageUrl ? (
                        <Image 
                          src={currentItem.imageUrl} 
                          alt={currentItem.name} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                          unoptimized={currentItem.imageUrl.startsWith('data:')}
                        />
                      ) : '👨‍⚕️'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500/20 text-amber-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-md border border-amber-500/20 animate-pulse">مشترك مميز ⭐</span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-800 leading-tight group-hover:text-primary-blue transition-colors">{currentItem.name}</h3>
                      <p className="text-xs text-primary-red font-bold leading-tight">{currentItem.specialty}</p>
                      <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <MapPin size={10} className="text-slate-400" /> {currentItem.district}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 shrink-0">
                    <span className="bg-primary-blue text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md shadow-primary-blue/20 group-hover:bg-blue-700 transition-colors flex items-center gap-0.5">
                      تفاصيل <ChevronLeft size={14} />
                    </span>
                  </div>
                </div>

                {mergedBannerItems.length > 1 && (
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
          )}
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
              className={cn(
                "p-4 cursor-pointer hover:bg-white/50 transition-all border border-transparent shadow-sm",
                (provider.is_premium === true || (provider.is_premium as unknown as string) === 'true') && "border-blue-500/30 neon-glow-blue bg-blue-50/5 relative overflow-hidden"
              )}
              onClick={() => handleProviderClick(provider.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl relative overflow-hidden shrink-0">
                       {provider.image ? <Image src={provider.image} alt={provider.name} fill className="object-cover" unoptimized={provider.image.startsWith('data:')} /> : '👨‍⚕️'}
                    </div>
                   <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-base">{provider.name}</h3>
                      {provider.verified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[6px] text-white">✓</div>}
                      {(provider.is_premium === true || (provider.is_premium as unknown as string) === 'true') && (
                        <span className="bg-amber-500/20 text-amber-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-amber-500/10">مميز ⭐</span>
                      )}
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
              className={cn(
                "p-4 cursor-pointer hover:bg-white/50 transition-all border border-transparent shadow-sm",
                (provider.is_premium === true || (provider.is_premium as unknown as string) === 'true') && "border-blue-500/30 neon-glow-blue bg-blue-50/5 relative overflow-hidden"
              )}
              onClick={() => handleProviderClick(provider.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl relative overflow-hidden shrink-0">
                       {provider.image ? <Image src={provider.image} alt={provider.name} fill className="object-cover" unoptimized={provider.image.startsWith('data:')} /> : '🏥'}
                    </div>
                   <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-base">{provider.name}</h3>
                      {provider.verified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[6px] text-white">✓</div>}
                      {(provider.is_premium === true || (provider.is_premium as unknown as string) === 'true') && (
                        <span className="bg-amber-500/20 text-amber-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-amber-500/10">مميز ⭐</span>
                      )}
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

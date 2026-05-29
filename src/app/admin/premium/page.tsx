"use client";

import React, { useState } from "react";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { useLiveQuery } from "dexie-react-hooks";
import { isPremiumActive, isPremiumExpiringSoon } from "@/lib/premium";
import { Search, Star, Clock, AlertTriangle, ArrowRight, XCircle, Settings, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";

export default function PremiumDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  
  // Modal state
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    isPremium: false,
    premiumRank: 0,
    showInBanner: false,
    premiumExpiryDate: ""
  });

  const providers = useLiveQuery(() => db.providers.toArray()) || [];
  
  // Filter for ALL providers that have is_premium = true (or had it), regardless of expiry
  // Wait, if they are expired they still have is_premium = true, just expiry date is past.
  const premiumProviders = providers.filter(p => p.is_premium === true || (p.is_premium as unknown as string) === 'true');

  const filtered = premiumProviders.filter(p => {
    // 1. Text Search
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.specialty.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 2. Status Filter
    const active = isPremiumActive(p);
    const expiring = isPremiumExpiringSoon(p);
    
    if (statusFilter === 'active' && (!active || expiring)) return false;
    if (statusFilter === 'expiring' && !expiring) return false;
    if (statusFilter === 'expired' && active) return false;
    
    return true;
  }).sort((a, b) => {
    // Sort by active first, then by rank, then by remaining time
    const aActive = isPremiumActive(a);
    const bActive = isPremiumActive(b);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return (a.premium_rank || 0) - (b.premium_rank || 0);
  });

  const activeCount = premiumProviders.filter(p => isPremiumActive(p) && !isPremiumExpiringSoon(p)).length;
  const expiringSoonCount = premiumProviders.filter(p => isPremiumExpiringSoon(p)).length;
  const expiredCount = premiumProviders.length - activeCount - expiringSoonCount;

  // Handle Edit Click
  const handleEditClick = (provider: any) => {
    setFormData({
      isPremium: provider.is_premium === true || (provider.is_premium as unknown as string) === 'true',
      premiumRank: provider.premium_rank || 0,
      showInBanner: provider.show_in_banner === true || (provider.show_in_banner as unknown as string) === 'true',
      premiumExpiryDate: provider.premium_expiry_date || ""
    });
    setEditingProvider(provider);
  };

  const handleSave = async () => {
    if (!editingProvider) return;
    setIsSaving(true);
    try {
      const dataToUpdate: any = {
        is_premium: formData.isPremium,
        premium_rank: Number(formData.premiumRank),
        show_in_banner: formData.showInBanner,
        premium_expiry_date: formData.premiumExpiryDate || null,
        updated_at: new Date().toISOString()
      };

      if (navigator.onLine && supabase) {
        const { error } = await supabase.from('providers').update(dataToUpdate).eq('id', editingProvider.id);
        if (error) throw error;
      }
      
      // Update local db
      await db.providers.update(editingProvider.id, dataToUpdate);
      setEditingProvider(null);
    } catch (err: any) {
      alert(`حدث خطأ أثناء الحفظ: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const setDuration = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    setFormData({ ...formData, premiumExpiryDate: date.toISOString() });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Star className="text-amber-500 fill-amber-500/20" size={28} /> 
            إدارة الاشتراكات المميزة
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            متابعة وإدارة الأطباء والمراكز المشتركين في الباقة المميزة
          </p>
        </div>
      </div>

      {/* Stats Cards / Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => setStatusFilter('all')}
          className={cn(
            "bg-white p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center transition-all",
            statusFilter === 'all' ? "border-primary-blue ring-2 ring-primary-blue/20" : "border-slate-200 hover:border-primary-blue/50"
          )}
        >
          <span className={cn("text-3xl font-bold", statusFilter === 'all' ? "text-primary-blue" : "text-slate-600")}>{premiumProviders.length}</span>
          <span className="text-xs font-bold text-slate-500 mt-1">الكل</span>
        </button>
        
        <button 
          onClick={() => setStatusFilter('active')}
          className={cn(
            "bg-emerald-50 p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden transition-all",
            statusFilter === 'active' ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-emerald-100 hover:border-emerald-300"
          )}
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
          <span className="text-3xl font-bold text-emerald-600">{activeCount}</span>
          <span className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">ساري <Star size={12}/></span>
        </button>

        <button 
          onClick={() => setStatusFilter('expiring')}
          className={cn(
            "bg-amber-50 p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden transition-all",
            statusFilter === 'expiring' ? "border-amber-500 ring-2 ring-amber-500/30" : "border-amber-100 hover:border-amber-300"
          )}
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
          <span className="text-3xl font-bold text-amber-600">{expiringSoonCount}</span>
          <span className="text-xs font-bold text-amber-700 mt-1 flex items-center gap-1">ينتهي قريباً <AlertTriangle size={12}/></span>
        </button>

        <button 
          onClick={() => setStatusFilter('expired')}
          className={cn(
            "bg-rose-50 p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden transition-all",
            statusFilter === 'expired' ? "border-rose-500 ring-2 ring-rose-500/30" : "border-rose-100 hover:border-rose-300"
          )}
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl" />
          <span className="text-3xl font-bold text-rose-600">{expiredCount}</span>
          <span className="text-xs font-bold text-rose-700 mt-1 flex items-center gap-1">منتهي <XCircle size={12}/></span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="ابحث عن مشترك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="px-4 py-3 font-bold">المشترك</th>
                <th className="px-4 py-3 font-bold">النوع</th>
                <th className="px-4 py-3 font-bold">ترتيب الأولوية</th>
                <th className="px-4 py-3 font-bold">حالة الاشتراك</th>
                <th className="px-4 py-3 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(provider => {
                const active = isPremiumActive(provider);
                const expiring = isPremiumExpiringSoon(provider);
                
                return (
                  <tr key={provider.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800 text-sm">{provider.name}</div>
                      <div className="text-[10px] text-slate-500">{provider.specialty}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                        {provider.type === 'doctors' ? 'طبيب' : 'مركز'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                        {provider.premium_rank || 0}
                        {provider.show_in_banner && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-2">البانر</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {active ? (
                        expiring ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-max border border-amber-200">
                            <AlertTriangle size={14} className="animate-pulse" /> ينتهي قريباً
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-max border border-emerald-200">
                            <Clock size={14} /> ساري المفعول
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md w-max border border-rose-200">
                          <XCircle size={14} /> منتهي الصلاحية
                        </div>
                      )}
                      {provider.premium_expiry_date && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          ينتهي: {new Date(provider.premium_expiry_date).toLocaleDateString('ar-YE')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleEditClick(provider)}
                        className="text-primary-blue hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 w-full mx-auto transition-colors border border-transparent hover:border-blue-100"
                      >
                        <Settings size={14} /> إعدادات الاشتراك
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                    لا يوجد مشتركين مطابقين للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Settings Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 bg-white shadow-2xl relative">
            <button 
              onClick={() => setEditingProvider(null)}
              className="absolute top-4 left-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="mb-6 pr-8 text-right">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500/20" size={24} /> 
                إعدادات الاشتراك
              </h2>
              <p className="text-sm font-bold text-primary-blue mt-1">{editingProvider.name}</p>
            </div>

            <div className="space-y-4 text-right">
              {/* Premium Toggle */}
              <div className="flex items-center gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                <input 
                  type="checkbox" 
                  id="modal-is-premium"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({...formData, isPremium: e.target.checked})}
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 border-amber-300"
                />
                <label htmlFor="modal-is-premium" className="font-bold text-slate-800 flex-1 cursor-pointer select-none">
                  تفعيل الاشتراك المميز (Premium)
                </label>
              </div>

              {formData.isPremium && (
                <div className="space-y-4 p-4 border border-amber-200 bg-amber-50/20 rounded-xl">
                  {/* Rank & Banner */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">ترتيب الأولوية</label>
                      <input 
                        type="number" 
                        value={formData.premiumRank}
                        onChange={(e) => setFormData({...formData, premiumRank: parseInt(e.target.value) || 0})}
                        className="w-full p-2.5 bg-white border border-amber-200 rounded-lg text-sm text-center font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                    
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center justify-center gap-2 p-2.5 border border-amber-200 rounded-lg cursor-pointer bg-white hover:bg-amber-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.showInBanner}
                          onChange={(e) => setFormData({...formData, showInBanner: e.target.checked})}
                          className="text-amber-500 rounded focus:ring-amber-500 border-amber-300"
                        />
                        <span className="text-xs font-bold text-slate-700 select-none">ظهور في البانر</span>
                      </label>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">تاريخ انتهاء الصلاحية</label>
                    <input 
                      type="date"
                      value={formData.premiumExpiryDate ? formData.premiumExpiryDate.split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, premiumExpiryDate: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                      className="w-full p-2.5 bg-white border border-amber-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                    
                    {/* Quick Duration Setters */}
                    <div className="flex gap-1.5 justify-end mt-2 overflow-x-auto pb-1 scrollbar-hide">
                      <button onClick={() => setDuration(1)} className="px-2 py-1 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 whitespace-nowrap">+ شهر</button>
                      <button onClick={() => setDuration(3)} className="px-2 py-1 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 whitespace-nowrap">+ 3 أشهر</button>
                      <button onClick={() => setDuration(6)} className="px-2 py-1 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 whitespace-nowrap">+ 6 أشهر</button>
                      <button onClick={() => setDuration(12)} className="px-2 py-1 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 whitespace-nowrap">+ سنة</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 bg-primary-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? "جاري الحفظ..." : <><Save size={18} /> حفظ الإعدادات</>}
              </button>
              <button 
                onClick={() => setEditingProvider(null)}
                className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

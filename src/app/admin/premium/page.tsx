"use client";

import React, { useState } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { isPremiumActive, isPremiumExpiringSoon } from "@/lib/premium";
import { Search, Star, Clock, AlertTriangle, ArrowRight, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function PremiumDashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const providers = useLiveQuery(() => db.providers.toArray()) || [];
  
  // Filter for ALL providers that have is_premium = true, regardless of expiry
  const premiumProviders = providers.filter(p => p.is_premium === true || (p.is_premium as unknown as string) === 'true');

  const filtered = premiumProviders.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    // Sort by active first, then by rank, then by remaining time
    const aActive = isPremiumActive(a);
    const bActive = isPremiumActive(b);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return (a.premium_rank || 0) - (b.premium_rank || 0);
  });

  const activeCount = premiumProviders.filter(p => isPremiumActive(p)).length;
  const expiringSoonCount = premiumProviders.filter(p => isPremiumExpiringSoon(p)).length;
  const expiredCount = premiumProviders.length - activeCount;

  return (
    <div className="space-y-6">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-primary-blue">{premiumProviders.length}</span>
          <span className="text-xs font-bold text-slate-500 mt-1">إجمالي المشتركين</span>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
          <span className="text-3xl font-bold text-emerald-600">{activeCount}</span>
          <span className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">اشتراك ساري <Star size={12}/></span>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
          <span className="text-3xl font-bold text-amber-600">{expiringSoonCount}</span>
          <span className="text-xs font-bold text-amber-700 mt-1 flex items-center gap-1">ينتهي قريباً <AlertTriangle size={12}/></span>
        </div>
        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl" />
          <span className="text-3xl font-bold text-rose-600">{expiredCount}</span>
          <span className="text-xs font-bold text-rose-700 mt-1 flex items-center gap-1">منتهي <XCircle size={12}/></span>
        </div>
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
                <th className="px-4 py-3 font-bold">الإجراءات</th>
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
                    <td className="px-4 py-3">
                      <Link 
                        href={`/admin/providers?edit=${provider.id}`}
                        className="text-primary-blue hover:text-blue-700 text-xs font-bold flex items-center gap-1 w-max"
                      >
                        تعديل الاشتراك <ArrowRight size={14} />
                      </Link>
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
    </div>
  );
}

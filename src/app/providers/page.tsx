"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { specialtyGroups } from "@/data/specialties";
import Link from "next/link";

export default function ProvidersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = specialtyGroups.map(group => ({
    ...group,
    specialties: group.specialties.filter(spec => 
      spec.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.specialties.length > 0);

  return (
    <div className="p-4 space-y-8">
      <div className="space-y-1 mt-4">
        <h1 className="text-2xl font-bold text-slate-800">تخصصات الأطباء</h1>
        <p className="text-sm text-slate-500">دليل التخصصات الطبية الشامل في عدن</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pr-10 pl-3 py-3.5 border border-glass-border rounded-2xl bg-white/60 backdrop-blur-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 sm:text-sm"
          placeholder="ابحث عن تخصص معين..."
        />
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center text-slate-500 py-10">
          لا يوجد تخصص مطابق لبحثك.
        </div>
      ) : (
        filteredGroups.map((group) => (
          <section key={group.type} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-primary-blue">{group.title}</h2>
              <div className="flex-1 h-[1px] bg-slate-200/50"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {group.specialties.map((spec) => (
                <Link href={`/providers/category/${spec.id}`} key={spec.id}>
                  <GlassCard className="p-4 flex flex-col items-center gap-3 text-center hover:bg-primary-blue/5 transition-all cursor-pointer group border-slate-100/50 h-full">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform p-1">
                      {spec.icon}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 leading-tight flex items-center justify-center">
                      {spec.name}
                    </span>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

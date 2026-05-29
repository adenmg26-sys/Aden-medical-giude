"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { isCurrentlyOpen } from "@/lib/status";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface ProviderStatusBadgeProps {
  provider: any;
  className?: string;
  showOfflineAsStatus?: boolean;
}

export function ProviderStatusBadge({ provider, className, showOfflineAsStatus = true }: ProviderStatusBadgeProps) {
  const isOnline = useNetworkStatus();
  
  if (!isOnline && showOfflineAsStatus) {
    return (
      <div className={cn(
        "text-[9px] px-2.5 py-1 rounded-full font-bold shadow-sm",
        "bg-slate-100 text-slate-500 border border-slate-200",
        className
      )}>
        أنت غير متصل
      </div>
    );
  }

  const isOpen = isCurrentlyOpen(provider);
  
  return (
    <div className={cn(
      "text-[9px] px-2.5 py-1 rounded-full font-bold shadow-sm text-center",
      isOpen 
        ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
        : "bg-rose-100 text-rose-700 border border-rose-200",
      className
    )}>
      {isOpen ? "متاح الآن" : "مغلق"}
    </div>
  );
}

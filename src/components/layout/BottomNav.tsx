"use client";

import React from "react";
import { Home, Stethoscope, Phone, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-glass-bg/90 backdrop-blur-xl border-t border-glass-border pb-safe">
      <div className="flex items-center justify-around max-w-screen-md mx-auto p-2">
        <NavItem href="/" icon={<Home size={24} />} label="الرئيسية" active={pathname === "/"} activeColor="text-primary-blue bg-primary-blue/10" inactiveColor="text-slate-400" />
        <NavItem href="/providers" icon={<Stethoscope size={24} />} label="الأطباء" active={pathname === "/providers"} activeColor="text-emerald-500 bg-emerald-50" inactiveColor="text-emerald-400/60" />
        <NavItem href="/centers" icon={<span className="text-xl leading-none block">🏥</span>} label="المراكز" active={pathname === "/centers"} activeColor="text-indigo-500 bg-indigo-50" inactiveColor="text-indigo-400/60" />
        <NavItem href="/emergency" icon={<Phone size={24} />} label="الطوارئ" active={pathname === "/emergency"} activeColor="text-primary-red bg-primary-red/10" inactiveColor="text-primary-red/60" isEmergency />
        <NavItem href="/saved" icon={<Bookmark size={24} />} label="المحفوظات" active={pathname === "/saved"} activeColor="text-amber-500 bg-amber-50" inactiveColor="text-amber-400/60" />
      </div>
    </nav>
  );
}

function NavItem({ href, icon, label, active, isEmergency, activeColor, inactiveColor }: { href: string; icon: React.ReactNode; label: string; active?: boolean; isEmergency?: boolean; activeColor?: string; inactiveColor?: string }) {
  return (
    <Link href={href} className={cn("flex flex-col items-center gap-1 p-2 transition-all duration-300", active ? (activeColor || "text-primary-blue") : (inactiveColor || "text-slate-400 hover:text-slate-600"))}>
      <div className={cn(
        "relative p-2 rounded-xl transition-all duration-300",
        active && (activeColor ? activeColor.split(' ')[1] : "bg-primary-blue/10"),
        !active && "hover:bg-slate-50"
      )}>
        {icon}
      </div>
      <span className={cn("text-[10px] font-bold transition-all", active ? "scale-110" : "")}>{label}</span>
    </Link>
  );
}

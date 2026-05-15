"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Stethoscope, 
  FileText, 
  AlertTriangle, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Mail,
  Megaphone,
  Settings,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/admin", label: "لمحة عامة", icon: <LayoutDashboard size={20} /> },
    { href: "/admin/providers", label: "الأطباء والمراكز", icon: <Stethoscope size={20} /> },
    { href: "/admin/contributions", label: "المساهمات الجديدة", icon: <FileText size={20} /> },
    { href: "/admin/reports", label: "التبليغات", icon: <AlertTriangle size={20} /> },
    { href: "/admin/messages", label: "الرسائل", icon: <Mail size={20} /> },
    { href: "/admin/ads", label: "الإعلانات", icon: <Megaphone size={20} /> },
    { href: "/admin/activity", label: "سجل النشاط", icon: <Activity size={20} /> },
    { href: "/admin/settings", label: "الإعدادات", icon: <Settings size={20} /> },
  ];

  const sidebarContent = (
    <>
      <div className={cn("border-b border-slate-100 flex items-center", collapsed ? "justify-center p-4" : "justify-between p-6")}>
        {!collapsed && (
          <div className="text-center flex-1">
            <h2 className="text-lg font-bold text-primary-blue leading-tight">بوابة الإدارة</h2>
            <p className="text-[10px] text-slate-500 font-sans">مرشد عدن الطبي</p>
          </div>
        )}
        <button 
          onClick={onToggle}
          className="hidden md:flex p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
        >
          {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className={cn("flex-1 overflow-y-auto space-y-1", collapsed ? "p-2" : "p-4")}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? link.label : undefined}
              className={cn(
                "flex items-center rounded-xl font-bold transition-all",
                collapsed ? "justify-center p-3" : "gap-3 p-3.5",
                isActive 
                  ? "bg-primary-blue text-white shadow-md shadow-primary-blue/20" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {link.icon}
              {!collapsed && <span className="text-sm">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t border-slate-100", collapsed ? "p-2" : "p-4")}>
        <Link 
          href="/admin/login"
          onClick={async () => { 
            localStorage.removeItem("admin_auth"); 
            localStorage.removeItem("admin_user_email");
            localStorage.removeItem("admin_user_id");
            // Sign out from Supabase
            const { supabase } = await import("@/lib/supabase");
            if (supabase) await supabase.auth.signOut();
          }}
          title={collapsed ? "تسجيل الخروج" : undefined}
          className={cn(
            "flex items-center rounded-xl font-bold text-rose-500 hover:bg-rose-50 transition-colors w-full",
            collapsed ? "justify-center p-3" : "gap-3 p-3.5"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm">تسجيل الخروج</span>}
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-primary-blue text-white rounded-full shadow-xl shadow-primary-blue/30"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Sidebar (always full width) */}
      <aside className={cn(
        "md:hidden fixed top-0 bottom-0 right-0 z-40 w-64 bg-white border-l border-slate-200 transition-transform duration-300 flex flex-col",
        mobileOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar (collapsible) */}
      <aside className={cn(
        "hidden md:flex fixed top-0 bottom-0 right-0 z-40 bg-white border-l border-slate-200 transition-all duration-300 flex-col",
        collapsed ? "w-[72px]" : "w-64"
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}

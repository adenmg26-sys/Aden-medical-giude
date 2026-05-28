"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminProvider } from "@/components/admin/AdminContext";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkAuth = async () => {
      // First check localStorage for quick response
      const localAuth = localStorage.getItem("admin_auth") === "true";
      
      if (!localAuth && pathname !== "/admin/login") {
        router.replace("/admin/login");
        return;
      }

      // Then verify with Supabase if available
      if (supabase && localAuth) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session && pathname !== "/admin/login") {
            // Session expired, clear localStorage
            localStorage.removeItem("admin_auth");
            localStorage.removeItem("admin_user_email");
            localStorage.removeItem("admin_user_id");
            router.replace("/admin/login");
            return;
          }
        } catch (e) {
          // If Supabase check fails, fall back to localStorage
        }
      }

      setIsAuthenticated(localAuth);
    };

    checkAuth();
  }, [pathname, router]);

  if (!isClient) return null;

  const isLogin = pathname === "/admin/login";
  if (isLogin) return <>{children}</>;

  if (!isAuthenticated) return null;

  return (
    <AdminProvider>
      <div className="min-h-screen bg-slate-50 flex" dir="rtl">
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? "md:mr-[72px]" : "md:mr-64"}`}>
          <AdminHeader />
          <main className="p-4 md:p-6 flex-1 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}

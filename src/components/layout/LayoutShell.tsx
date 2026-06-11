"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSync } from "@/hooks/useSync";
import { useVisitTracker } from "@/hooks/useVisitTracker";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { AlertTriangle, Clock, WifiOff, Bell } from "lucide-react";
import { requestNotificationPermission, onMessageListener } from "@/lib/firebase";
import dynamic from "next/dynamic";
import { toast, Toaster } from "react-hot-toast";

const WelcomeModal = dynamic(() => import("@/components/ui/WelcomeModal").then(mod => mod.WelcomeModal), {
  ssr: false
});

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [isOffline, setIsOffline] = useState(false);
  
  // Trigger background sync with Supabase
  useSync();
  
  // Track visits
  useVisitTracker();

  // Request notifications (runs once)
  useEffect(() => {
    // Only ask for permissions if we are not in admin, to not annoy admins
    if (!isAdmin) {
      // We use a combination of a delayed timer and user interaction.
      // Many mobile browsers block permission requests unless triggered by a user gesture.
      let permissionRequested = false;

      const triggerPermissionRequest = () => {
        if (permissionRequested) return;
        permissionRequested = true;
        
        requestNotificationPermission();
        
        document.removeEventListener('click', triggerPermissionRequest);
        document.removeEventListener('touchstart', triggerPermissionRequest);
      };

      // Delay requesting a bit, but also listen for user interaction
      const timer = setTimeout(() => {
        triggerPermissionRequest();
      }, 8000);

      document.addEventListener('click', triggerPermissionRequest);
      document.addEventListener('touchstart', triggerPermissionRequest);
      const listenForMessages = async () => {
        try {
          const payload: any = await onMessageListener();
          if (payload?.notification) {
            toast.custom((t) => (
              <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-primary-blue" />
                      </div>
                    </div>
                    <div className="mr-3 flex-1">
                      <p className="text-sm font-bold text-slate-900 font-arabic">{payload.notification.title}</p>
                      <p className="mt-1 text-xs text-slate-500 font-arabic">{payload.notification.body}</p>
                    </div>
                  </div>
                </div>
              </div>
            ), { duration: 5000, position: 'top-center' });
            
            // Re-register listener for the next message
            listenForMessages();
          }
        } catch (err) {
          console.error("Error listening for messages", err);
        }
      };
      
      listenForMessages();
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', triggerPermissionRequest);
        document.removeEventListener('touchstart', triggerPermissionRequest);
      };
    }
  }, [isAdmin]);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  // Check Maintenance Mode
  const maintenanceMode = useLiveQuery(async () => {
    const setting = await db.settings.get('maintenanceMode');
    return setting?.value === true || setting?.value === 'true';
  }, []);

  if (maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-100/50">
          <AlertTriangle size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800 font-arabic">عذراً، الموقع في صيانة مؤقتة</h1>
          <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
            نقوم حالياً بتحديث البيانات لتحسين تجربتكم. سنعود للعمل قريباً جداً.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
          <Clock size={12} /> قريباً سنعود
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      {!isAdmin && <Header />}
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-center py-2 px-4 text-xs font-bold flex items-center justify-center gap-2 z-50">
          <WifiOff size={14} /> أنت غير متصل بالإنترنت — البيانات المحفوظة متاحة
        </div>
      )}
      <main className={isAdmin ? "flex-1 w-full relative" : "flex-1 pb-20 max-w-screen-md mx-auto w-full relative"}>
        {children}
      </main>
      {!isAdmin && <BottomNav />}
      {!isAdmin && <WelcomeModal />}
    </>
  );
}


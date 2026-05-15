"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, FileText, AlertTriangle, MessageSquare, Plus, Edit2, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { supabase } from "@/lib/supabase";

export function AdminHeader() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Real notifications from IndexedDB (synced with Supabase)
  const notifications = useLiveQuery(() => 
    db.notifications.orderBy('date').reverse().toArray()
  ) || [];
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (pathname) {
      case "/admin": return "لمحة عامة";
      case "/admin/providers": return "إدارة الأطباء والمراكز";
      case "/admin/contributions": return "المساهمات الجديدة";
      case "/admin/reports": return "التبليغات";
      case "/admin/messages": return "الرسائل";
      case "/admin/ads": return "الإعلانات";
      case "/admin/settings": return "الإعدادات";
      case "/admin/activity": return "سجل النشاط";
      default: return "بوابة الإدارة";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    // Optimistic UI update locally
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0 || !supabase) return;

    await db.notifications.where('id').anyOf(unreadIds).modify({ read: true });
    
    // Update in Supabase
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "contribution": return <FileText size={16} className="text-emerald-500" />;
      case "report": return <AlertTriangle size={16} className="text-amber-500" />;
      case "message": return <MessageSquare size={16} className="text-primary-blue" />;
      default: return <Bell size={16} className="text-slate-500" />;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-slate-800">{getPageTitle()}</h1>
        
        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-12 left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-sm">الإشعارات</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] text-primary-blue font-bold hover:underline">
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold">لا توجد إشعارات</div>
                ) : (
                  notifications.map(notif => {
                    const href = notif.type === "contribution" ? "/admin/contributions" : notif.type === "report" ? "/admin/reports" : "/admin/messages";
                    return (
                      <Link 
                        key={notif.id} 
                        href={href}
                        onClick={() => setShowNotifications(false)}
                        className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50/20' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notif.read ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="space-y-1">
                          <p className={`text-xs ${!notif.read ? 'font-bold text-slate-800' : 'text-slate-700'}`}>{notif.title}</p>
                          <p className="text-[10px] text-slate-500">{notif.description}</p>
                          <p className="text-[9px] text-slate-400 font-sans">{new Date(notif.date).toLocaleString('ar-YE')}</p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <Link href="/admin/activity" onClick={() => setShowNotifications(false)} className="text-xs font-bold text-primary-blue hover:underline">
                  عرض سجل النشاط الكامل
                </Link>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 pl-4 border-r border-slate-200">
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-slate-800">المدير</p>
              <p className="text-[10px] text-slate-500">Admin</p>
            </div>
            <div className="w-10 h-10 bg-primary-blue text-white rounded-full flex items-center justify-center font-bold shadow-md">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

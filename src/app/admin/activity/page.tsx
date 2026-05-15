"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Clock, Plus, Edit2, Trash2, ShieldCheck, ArrowUpRight, CheckCircle2, AlertTriangle, User } from "lucide-react";

import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

type ActionType = "add" | "edit" | "delete" | "verify" | "move" | "resolve" | "message";

export default function AdminActivityPage() {
  const providers = useLiveQuery(() => db.providers.orderBy('updated_at').reverse().limit(20).toArray()) || [];
  const reports = useLiveQuery(() => db.reports.orderBy('date').reverse().limit(20).toArray()) || [];
  const messages = useLiveQuery(() => db.messages.orderBy('date').reverse().limit(20).toArray()) || [];

  const activities = React.useMemo(() => {
    const list: { id: string; user: string; action: string; target: string; time: string; date: string; rawDate: number }[] = [];
    providers.forEach(p => {
      if (p.updated_at) {
        list.push({
          id: p.id + '-p',
          user: 'النظام',
          action: p.status === 'مفعل' ? 'verify' : 'add',
          target: p.name,
          time: new Date(p.updated_at).toLocaleString('ar-YE'),
          date: p.updated_at,
          rawDate: new Date(p.updated_at).getTime()
        });
      }
    });
    reports.forEach(r => {
      list.push({
        id: r.id + '-r',
        user: r.user_contact || 'مجهول',
        action: 'resolve',
        target: r.provider_name || 'طبيب',
        time: new Date(r.date).toLocaleString('ar-YE'),
        date: r.date,
        rawDate: new Date(r.date).getTime()
      });
    });
    messages.forEach(m => {
      list.push({
        id: m.id + '-m',
        user: m.name,
        action: 'message',
        target: 'رسالة جديدة',
        time: new Date(m.date).toLocaleString('ar-YE'),
        date: m.date,
        rawDate: new Date(m.date).getTime()
      });
    });
    return list.sort((a, b) => b.rawDate - a.rawDate).slice(0, 30);
  }, [providers, reports, messages]);

  const getActionDetails = (action: ActionType) => {
    switch (action) {
      case "add": return { icon: <Plus size={16} className="text-emerald-500" />, text: "إضافة", bg: "bg-emerald-50" };
      case "edit": return { icon: <Edit2 size={16} className="text-blue-500" />, text: "تعديل", bg: "bg-blue-50" };
      case "delete": return { icon: <Trash2 size={16} className="text-rose-500" />, text: "حذف", bg: "bg-rose-50" };
      case "verify": return { icon: <ShieldCheck size={16} className="text-primary-blue" />, text: "نشر/تفعيل", bg: "bg-primary-blue/10" };
      case "move": return { icon: <ArrowUpRight size={16} className="text-emerald-500" />, text: "نقل للدليل", bg: "bg-emerald-50" };
      case "resolve": return { icon: <AlertTriangle size={16} className="text-amber-500" />, text: "بلاغ تصحيح", bg: "bg-amber-50" };
      case "message": return { icon: <CheckCircle2 size={16} className="text-purple-500" />, text: "رسالة اتصال", bg: "bg-purple-50" };
      default: return { icon: <AlertTriangle size={16} className="text-slate-500" />, text: "إجراء", bg: "bg-slate-50" };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-slate-500">متابعة جميع الإجراءات التي تمت داخل لوحة التحكم.</p>
      </div>

      <GlassCard className="overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold">لا يوجد نشاط مسجل بعد</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((activity) => {
              const details = getActionDetails(activity.action as ActionType);
              return (
                <div key={activity.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  
                  {/* Activity Info */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${details.bg}`}>
                      {details.icon}
                    </div>
                    <div>
                      <p className="text-sm text-slate-800">
                        <span className="font-bold">{details.text}</span> <span className="text-primary-blue font-bold">{activity.target}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] text-slate-500 flex items-center gap-1"><User size={10} /> بواسطة: {activity.user}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 font-sans"><Clock size={10} /> {activity.time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Date Badge */}
                  <div className="sm:text-left self-start sm:self-center">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 rounded-md text-[10px] text-slate-500 font-sans font-bold">
                      {activity.date}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

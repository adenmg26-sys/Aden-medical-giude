"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Settings, Globe, Palette, Save, CheckCircle2, Phone, Mail, Shield, Bell, Info, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { useAdminContext } from "@/components/admin/AdminContext";

export default function AdminSettingsPage() {
  const { isStaff } = useAdminContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState({
    siteName: "مرشد عدن الطبي",
    siteNameEn: "Aden Medical Guide",
    contactEmail: "support@adenmedical.com",
    contactPhone: "+967 770 000 000",
    contactWhatsapp: "+967 770 000 000",
    address: "عدن، الجمهورية اليمنية",
    version: "1.0.0",
    maintenanceMode: false,
    enableContributions: true,
    enableReports: true,
    aboutText: "الدليل الطبي الأذكى والأول في مدينة عدن، يعمل بدون إنترنت ويوفر كافة المعلومات الطبية التي تحتاجها."
  });

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase.from('settings').select('*');
        if (data && data.length > 0) {
          const mapped = data.reduce((acc: any, curr: any) => {
            let val = curr.value;
            if (val === 'true') val = true;
            if (val === 'false') val = false;
            acc[curr.key] = val;
            return acc;
          }, {});
          setSettings(prev => ({ ...prev, ...mapped }));
          
          const dbData = data.map(d => {
            let val = d.value;
            if (val === 'true') val = true;
            if (val === 'false') val = false;
            return { key: d.key, value: val };
          });
          await db.settings.bulkPut(dbData);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfiles = async () => {
      if (!supabase) return;
      setLoadingProfiles(true);
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('email');
        if (data) setProfiles(data);
      } catch (err) {
        console.error("Error fetching profiles:", err);
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchSettings();
    fetchProfiles();
  }, []);

  const handleToggleRole = async (profileId: string, currentRole: string) => {
    if (!supabase) return;
    const newRole = currentRole === 'admin' ? 'staff' : 'admin';
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profileId);
      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role: newRole } : p));
    } catch (err) {
      alert("حدث خطأ أثناء تغيير الصلاحية");
    }
  };

  const handleSave = async () => {
    if (!supabase) return;
    setSaving(true);
    try {
      const allowedKeys = ['maintenanceMode', 'contactEmail', 'contactPhone', 'contactWhatsapp', 'address'];
      const updates = Object.entries(settings)
        .filter(([key]) => allowedKeys.includes(key))
        .map(([key, value]) => ({
          key,
          value: String(value),
          updated_at: new Date().toISOString()
        }));

      const { error } = await supabase.from('settings').upsert(updates);
      if (error) throw error;

      const dbUpdates = updates.map(u => {
        let val: any = u.value;
        if (val === 'true') val = true;
        if (val === 'false') val = false;
        return { key: u.key, value: val };
      });
      await db.settings.bulkPut(dbUpdates);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">جاري تحميل الإعدادات...</div>;

  return (
    <div className="space-y-6 max-w-4xl text-right">
      {isStaff && (
        <div className="p-4 bg-amber-50 text-amber-600 rounded-xl flex gap-3 items-start border border-amber-200">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-bold">بصفتك موظف (Staff), لا تملك الصلاحية لتعديل الإعدادات الأساسية أو إدارة صلاحيات المستخدمين. يمكنك استعراض الإعدادات الحالية فقط.</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">تحكم في إعدادات الموقع والمعلومات الأساسية.</p>
        {!isStaff && (
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-blue/20 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : saved ? <><CheckCircle2 size={18} /> تم الحفظ</> : <><Save size={18} /> حفظ التغييرات</>}
        </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-5 flex flex-col justify-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3"><Globe size={20} className="text-primary-blue" /> حالة التطبيق</h2>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Clock size={16} className="text-amber-500" /> وضع الصيانة</h4>
              <p className="text-[10px] text-slate-500">عند التفعيل، سيظهر تنبيه صيانة للزوار العاديين.</p>
            </div>
            <button 
              onClick={() => !isStaff && setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
              disabled={isStaff}
              className={`w-12 h-6 rounded-full transition-all relative disabled:opacity-60 ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-1' : 'left-7'}`} />
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3"><Settings size={20} className="text-amber-500" /> بيانات التواصل</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">البريد الإلكتروني</label>
              <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({...settings, contactEmail: e.target.value})} disabled={isStaff}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 font-sans text-left disabled:opacity-60" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">رقم الهاتف</label>
              <input type="text" value={settings.contactPhone} onChange={(e) => setSettings({...settings, contactPhone: e.target.value})} disabled={isStaff}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 font-sans text-left disabled:opacity-60" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">رقم واتساب للدعم</label>
            <input type="text" value={settings.contactWhatsapp} onChange={(e) => setSettings({...settings, contactWhatsapp: e.target.value})} disabled={isStaff}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 font-sans text-left disabled:opacity-60" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">العنوان</label>
            <input type="text" value={settings.address} onChange={(e) => setSettings({...settings, address: e.target.value})} disabled={isStaff}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:opacity-60" />
          </div>
        </GlassCard>
      </div>

      {!isStaff && (
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 text-slate-800">
          <Shield size={22} className="text-primary-blue" />
          <h2 className="text-xl font-bold">إدارة الموظفين والصلاحيات</h2>
        </div>
        
        <GlassCard className="overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-600">المستخدم</th>
                <th className="p-4 text-xs font-bold text-slate-600">الصلاحية الحالية</th>
                <th className="p-4 text-xs font-bold text-slate-600 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {loadingProfiles ? (
                <tr><td colSpan={3} className="p-8 text-center text-slate-400">جاري تحميل القائمة...</td></tr>
              ) : profiles.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-slate-400">لا يوجد موظفون مسجلون حالياً</td></tr>
              ) : (
                profiles.map(profile => (
                  <tr key={profile.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{profile.email}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{profile.id}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${profile.role === 'admin' ? 'bg-primary-blue/10 text-primary-blue' : 'bg-slate-100 text-slate-500'}`}>
                        {profile.role === 'admin' ? 'مدير (Admin)' : 'موظف (Staff)'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggleRole(profile.id, profile.role)}
                        className="text-xs font-bold text-primary-blue hover:underline"
                      >
                        تغيير إلى {profile.role === 'admin' ? 'موظف' : 'مدير'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </GlassCard>
        <p className="text-[10px] text-slate-400">ملاحظة: يتم إنشاء الحسابات الجديدة عبر لوحة تحكم Supabase مباشرة، وتظهر هنا تلقائياً لتعيين الصلاحيات.</p>
      </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login")) {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        // Save auth state
        localStorage.setItem("admin_auth", "true");
        localStorage.setItem("admin_user_email", data.user?.email || "");
        localStorage.setItem("admin_user_id", data.user?.id || "");
        router.push("/admin");
      }
    } catch (err: any) {
      setError("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/10 to-primary-red/5"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-blue/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-primary-red/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center space-y-2">
          <div className="w-20 h-20 bg-white shadow-xl shadow-primary-blue/20 rounded-3xl mx-auto flex items-center justify-center border border-white mb-4">
            <ShieldCheck size={40} className="text-primary-blue" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">بوابة الإدارة</h1>
          <p className="text-slate-500 text-sm">مرشد عدن الطبي</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Mail size={14} className="text-primary-blue" /> البريد الإلكتروني
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 transition-all font-sans text-left"
                placeholder="admin@amg.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Lock size={14} className="text-primary-blue" /> كلمة المرور
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 transition-all font-sans text-left"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl text-xs text-center font-bold flex items-center justify-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary-blue text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-blue/20 flex justify-center items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>تسجيل الدخول <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </GlassCard>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-primary-blue transition-colors inline-flex items-center gap-1">
            <ArrowRight size={14} /> العودة للموقع
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { Zap, WifiOff, X, ArrowLeft, Download } from 'lucide-react';
import { GlassCard } from './GlassCard';

import Image from 'next/image';

export const WelcomeModal = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      // If we've already shown the welcome screen and we get this, show PWA prompt
      if (localStorage.getItem('has_visited_amg') && !localStorage.getItem('pwa_prompt_dismissed')) {
        setShowPwaPrompt(true);
      }
    };
    
    // Check if it was already fired before React hydrated
    if ((window as any).deferredPrompt && localStorage.getItem('has_visited_amg') && !localStorage.getItem('pwa_prompt_dismissed')) {
      setShowPwaPrompt(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('has_visited_amg');
    if (!hasVisited) {
      setShowWelcome(true);
    } else {
      // Check for PWA if they already visited but didn't dismiss PWA prompt
      const pwaDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!pwaDismissed && !window.matchMedia('(display-mode: standalone)').matches && (window as any).deferredPrompt) {
        const timer = setTimeout(() => setShowPwaPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleStart = () => {
    setShowWelcome(false);
    localStorage.setItem('has_visited_amg', 'true');
    
    // Trigger PWA prompt 5 seconds after closing welcome
    setTimeout(() => {
      const pwaDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!pwaDismissed && !window.matchMedia('(display-mode: standalone)').matches) {
        setShowPwaPrompt(true);
      }
    }, 5000);
  };

  const handleDismissPwa = () => {
    setShowPwaPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setShowPwaPrompt(false);
        localStorage.setItem('pwa_prompt_dismissed', 'true');
      }
      (window as any).deferredPrompt = null;
    } else {
      alert("للتثبيت، يرجى النقر على قائمة المتصفح (ثلاث نقاط) واختيار 'إضافة إلى الشاشة الرئيسية' (Add to Home screen).");
      setShowPwaPrompt(false);
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }
  };

  return (
    <>
      {/* Welcome Screen Overlay */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
          <GlassCard className="w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl border-white/40">
            {/* Logo area */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary-blue/30 blur-xl rounded-full"></div>
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center relative z-10 border border-white/20 shadow-lg p-2 overflow-hidden">
                <Image src="/logo.png" alt="مرشد عدن الطبي" fill className="object-contain p-2" />
              </div>
            </div>

            <h1 className="text-2xl font-black text-slate-800 mb-2 leading-tight">مرحباً بك في <br/> <span className="text-primary-blue">مرشد عدن الطبي</span></h1>
            <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">دليلك الصحي الأول في محافظة عدن..<br/> رفيقك في كل الظروف.</p>
            
            <div className="w-full space-y-4 mb-8 text-right">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                  <Zap size={20} className="fill-amber-500/20"/>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">سرعة استجابة فائقة</h3>
                  <p className="text-xs text-slate-500 mt-0.5">بفضل تقنية المزامنة المحلية السريعة.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                  <WifiOff size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">يعمل بدون إنترنت</h3>
                  <p className="text-xs text-slate-500 mt-0.5">بكفاءة عالية حتى عند ضعف الإنترنت أو انقطاعه.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleStart}
              className="w-full py-4 bg-gradient-to-r from-primary-blue to-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-blue/30 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              ابدأ رحلتك الآن <ArrowLeft size={18} />
            </button>
          </GlassCard>
        </div>
      )}

      {/* PWA Install Prompt */}
      {showPwaPrompt && (
        <div className="fixed bottom-20 left-4 right-4 z-[90] max-w-sm mx-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
          <GlassCard className="p-4 shadow-2xl border-primary-blue/20 bg-white/95">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-blue/10 rounded-2xl flex items-center justify-center text-primary-blue shrink-0">
                <Download size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm">تثبيت التطبيق على هاتفك</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1 mb-3">احصل على وصول أسرع واستخدم التطبيق كلياً بدون إنترنت عبر تثبيته على الشاشة الرئيسية.</p>
                <div className="flex gap-2">
                  <button onClick={handleInstallClick} className="flex-1 bg-primary-blue text-white py-2 rounded-xl text-xs font-bold shadow-md shadow-primary-blue/20 hover:bg-blue-700 transition-colors">
                    تثبيت الآن
                  </button>
                  <button onClick={handleDismissPwa} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
                    ربما لاحقاً
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
};

"use client";

import React, { useState } from "react";
import { PlusCircle, Menu, X, Info, Phone, ShieldCheck, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-glass-bg/80 backdrop-blur-xl border-b border-glass-border px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-screen-md mx-auto">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 bg-primary-blue/10 rounded-full text-primary-blue hover:bg-primary-blue/20 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-primary-blue leading-tight">مرشد عدن الطبي</h1>
            <p className="text-[10px] text-slate-500 font-sans">Aden Medical Guide</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/contribute" className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-red/10 rounded-full text-primary-red hover:bg-primary-red/20 transition-all">
              <PlusCircle size={18} />
              <span className="text-xs font-bold">مساهمة</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out transform",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-primary-blue">القائمة الرئيسية</h2>
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 text-slate-700 transition-colors font-bold"
            >
              <Home className="text-slate-400" size={22} /> الرئيسية
            </Link>
            <Link 
              href="/about" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 text-slate-700 transition-colors font-bold"
            >
              <Info className="text-slate-400" size={22} /> من نحن
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 text-slate-700 transition-colors font-bold"
            >
              <Phone className="text-slate-400" size={22} /> اتصل بنا
            </Link>
            <Link 
              href="/privacy" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 text-slate-700 transition-colors font-bold"
            >
              <ShieldCheck className="text-slate-400" size={22} /> سياسة الخصوصية
            </Link>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500 font-bold">مرشد عدن الطبي © 2026</p>
            <p className="text-[10px] text-slate-400">الإصدار 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import React, { createContext, useContext } from 'react';
import { useAdmin } from '@/hooks/useAdmin';

type AdminContextType = ReturnType<typeof useAdmin>;

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const adminState = useAdmin();
  return <AdminContext.Provider value={adminState}>{children}</AdminContext.Provider>;
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
}

"use client";

import React, { useEffect, useState } from 'react';

const LastSyncIndicator = () => {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    const syncTime = localStorage.getItem('last_sync_timestamp');
    if (syncTime) {
      const date = new Date(syncTime);
      setLastUpdate(date.toLocaleDateString('ar-YE', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }));
    }
  }, []);

  if (!lastUpdate) return null;

  return (
    <div className="text-center py-4 opacity-70">
      <p className="text-[10px] text-slate-500 font-bold backdrop-blur-sm bg-white/50 inline-block px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
        آخر تحديث لبيانات عدن: {lastUpdate}
      </p>
    </div>
  );
};

export default LastSyncIndicator;

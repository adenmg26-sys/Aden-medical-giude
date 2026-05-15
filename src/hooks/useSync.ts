"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { db, Provider, Ad, Report, Message } from '@/lib/db';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!navigator.onLine) return;

    const syncData = async () => {
      if (!supabase) return;

      setIsSyncing(true);
      setError(null);

      try {
        // 1. Sync Providers (The most important)
        try {
          const lastProv = await db.providers.orderBy('updated_at').reverse().first();
          const { data: newProv, error: e1 } = await supabase
            .from('providers')
            .select('*')
            .gt('updated_at', lastProv?.updated_at || '2000-01-01T00:00:00.000Z');
          
          if (!e1 && newProv?.length) {
            await db.providers.bulkPut(newProv);
          }
        } catch (e) { /* skip */ }

        // 2. Sync Ads
        try {
          const lastAd = await db.ads.orderBy('updated_at').reverse().first();
          const { data: newAds, error: e2 } = await supabase
            .from('ads')
            .select('*')
            .gt('updated_at', lastAd?.updated_at || '2000-01-01T00:00:00.000Z');
          
          if (!e2 && newAds?.length) {
            await db.ads.bulkPut(newAds);
          }
        } catch (e) { /* skip */ }

        // 3. Sync Reports
        try {
          const { data: allReports, error: e3 } = await supabase.from('reports').select('*');
          if (!e3 && allReports) {
            await db.reports.clear();
            if (allReports.length > 0) await db.reports.bulkPut(allReports);
          }
        } catch (e) { /* skip */ }

        // 3.5 Sync Messages
        try {
          const { data: allMsgs, error: eM } = await supabase.from('messages').select('*');
          if (!eM && allMsgs) {
            await db.messages.clear();
            if (allMsgs.length > 0) await db.messages.bulkPut(allMsgs);
          }
        } catch (e) { /* skip */ }

        // 4. Sync Notifications
        try {
          const { data: allNotifs, error: e4 } = await supabase.from('notifications').select('*');
          if (!e4 && allNotifs) {
            await db.notifications.clear();
            if (allNotifs.length > 0) await db.notifications.bulkPut(allNotifs);
          }
        } catch (e) { /* skip */ }

        setLastSyncTime(new Date());
        localStorage.setItem('last_sync_timestamp', new Date().toISOString());
      } catch (err: any) {
        setError('Sync failed');
      } finally {
        setIsSyncing(false);
      }
    };

    // Delay sync slightly to not block initial render
    const timer = setTimeout(syncData, 1500);
    return () => clearTimeout(timer);
  }, []);

  return { isSyncing, lastSyncTime, error };
}

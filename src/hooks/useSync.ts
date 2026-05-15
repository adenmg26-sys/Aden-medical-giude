import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { db, Provider, Ad, Report, Message, SyncAction } from '@/lib/db';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processQueue = useCallback(async () => {
    if (!supabase || !navigator.onLine) return;

    const queue = await db.sync_queue.toArray();
    if (queue.length === 0) return;

    for (const item of queue) {
      try {
        let success = false;
        if (item.action === 'insert') {
          const { error } = await supabase.from(item.table).insert([item.data]);
          if (!error) success = true;
        } else if (item.action === 'update') {
          const { error } = await supabase.from(item.table).update(item.data).eq('id', item.data.id);
          if (!error) success = true;
        } else if (item.action === 'delete') {
          const { error } = await supabase.from(item.table).delete().eq('id', item.data.id);
          if (!error) success = true;
        }

        if (success) {
          await db.sync_queue.delete(item.id!);
        }
      } catch (e) {
        console.error("Failed to sync item", item, e);
      }
    }
  }, []);

  const syncData = useCallback(async () => {
    if (!supabase || !navigator.onLine) return;

    setIsSyncing(true);
    setError(null);

    try {
      // 0. Process any pending actions first
      await processQueue();

      // 1. Sync Providers
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

      // 3. Sync Notifications
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
  }, [processQueue]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initial sync
    const timer = setTimeout(syncData, 1500);

    // Sync when coming back online
    const handleOnline = () => {
      syncData();
    };
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
    };
  }, [syncData]);

  return { isSyncing, lastSyncTime, error, syncData };
}

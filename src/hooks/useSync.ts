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
      // 0. Process any pending actions first in background
      await processQueue();

      // Detect if this is the first sync (IndexedDB is empty)
      const providerCount = await db.providers.count();
      const isFirstSync = providerCount === 0;

      // 1. Sync Providers
      try {
        if (isFirstSync) {
          // FULL SYNC: Load ALL providers on first visit
          const { data: allProv, error: e1 } = await supabase
            .from('providers')
            .select('*');
          
          if (!e1 && allProv?.length) {
            // Use read-write transaction to make DB write atomic & trigger only one UI re-render
            await db.transaction('rw', db.providers, async () => {
              await db.providers.clear();
              await db.providers.bulkPut(allProv);
            });
          }
        } else {
          // INCREMENTAL SYNC: Only fetch updated records
          const lastProv = await db.providers.orderBy('updated_at').reverse().first();
          const { data: newProv, error: e1 } = await supabase
            .from('providers')
            .select('*')
            .gt('updated_at', lastProv?.updated_at || '2000-01-01T00:00:00.000Z');
          
          if (!e1 && newProv?.length) {
            await db.providers.bulkPut(newProv);
          }
        }
      } catch (e) { /* skip */ }

      // 2. Sync Ads
      try {
        if (isFirstSync) {
          const { data: allAds, error: e2 } = await supabase
            .from('ads')
            .select('*');
          
          if (!e2 && allAds?.length) {
            // Atomic transaction for ads
            await db.transaction('rw', db.ads, async () => {
              await db.ads.clear();
              await db.ads.bulkPut(allAds);
            });
          }
        } else {
          const lastAd = await db.ads.orderBy('updated_at').reverse().first();
          const { data: newAds, error: e2 } = await supabase
            .from('ads')
            .select('*')
            .gt('updated_at', lastAd?.updated_at || '2000-01-01T00:00:00.000Z');
          
          if (!e2 && newAds?.length) {
            await db.ads.bulkPut(newAds);
          }
        }
      } catch (e) { /* skip */ }

      // 3. Sync Notifications
      try {
        const { data: allNotifs, error: e4 } = await supabase.from('notifications').select('*');
        if (!e4 && allNotifs) {
          await db.transaction('rw', db.notifications, async () => {
            await db.notifications.clear();
            if (allNotifs.length > 0) await db.notifications.bulkPut(allNotifs);
          });
        }
      } catch (e) { /* skip */ }

      // 4. Sync Messages (for admin)
      try {
        const { data: allMsgs, error: e5 } = await supabase.from('messages').select('*');
        if (!e5 && allMsgs) {
          await db.transaction('rw', db.messages, async () => {
            await db.messages.clear();
            if (allMsgs.length > 0) await db.messages.bulkPut(allMsgs);
          });
        }
      } catch (e) { /* skip */ }

      // 5. Sync Reports (for admin)
      try {
        const { data: allReports, error: e6 } = await supabase.from('reports').select('*');
        if (!e6 && allReports) {
          await db.transaction('rw', db.reports, async () => {
            await db.reports.clear();
            if (allReports.length > 0) await db.reports.bulkPut(allReports);
          });
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
    
    let idleHandle: any;
    let timer: NodeJS.Timeout;

    const startSync = () => {
      // Use requestIdleCallback to perform data loading when the main UI thread is completely idle
      if ('requestIdleCallback' in window) {
        idleHandle = (window as any).requestIdleCallback(() => {
          // 2.5 seconds delay inside idle callback to ensure the page has completely settled
          timer = setTimeout(syncData, 2500);
        }, { timeout: 12000 }); // Must run within 12 seconds max
      } else {
        // Fallback for Safari/browsers without idle callback support
        timer = setTimeout(syncData, 4500); // 4.5 seconds delay
      }
    };

    // Schedule sync after document is fully loaded
    if (document.readyState === 'complete') {
      startSync();
    } else {
      window.addEventListener('load', startSync);
    }

    // Sync when coming back online
    const handleOnline = () => {
      syncData();
    };
    window.addEventListener('online', handleOnline);

    return () => {
      if (idleHandle && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleHandle);
      }
      clearTimeout(timer);
      window.removeEventListener('load', startSync);
      window.removeEventListener('online', handleOnline);
    };
  }, [syncData]);

  return { isSyncing, lastSyncTime, error, syncData };
}

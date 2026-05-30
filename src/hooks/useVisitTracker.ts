import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useVisitTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      if (typeof window === 'undefined' || !supabase) return;

      const now = Date.now();
      const lastVisitTimeStr = localStorage.getItem('last_visit_time');
      const lastVisitTime = lastVisitTimeStr ? parseInt(lastVisitTimeStr, 10) : 0;
      
      // Check if 30 minutes (1800000 ms) have passed since the last visit
      if (now - lastVisitTime < 30 * 60 * 1000) {
        return; // Too soon to count as a new visit
      }
      
      // Generate a simple anonymous visitor ID if none exists
      let visitorId = localStorage.getItem('visitor_id');
      if (!visitorId) {
        visitorId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        localStorage.setItem('visitor_id', visitorId);
      }

      try {
        const { error } = await supabase.from('visits').insert([
          { visitor_id: visitorId }
        ]);
        
        if (!error) {
          localStorage.setItem('last_visit_time', now.toString());
          console.log("Visit tracked successfully.");
        } else {
          console.error("Failed to track visit in Supabase:", error);
        }
      } catch (e) {
        console.error("Exception failed to track visit:", e);
      }
    };

    // Run after a short delay so it doesn't block critical rendering
    const timer = setTimeout(trackVisit, 3000);
    return () => clearTimeout(timer);
  }, []);
}

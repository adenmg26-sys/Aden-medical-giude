import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useVisitTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      if (typeof window === 'undefined' || !supabase) return;

      const today = new Date().toISOString().split('T')[0];
      const lastVisit = localStorage.getItem('last_visit_date');
      
      // Generate a simple anonymous visitor ID if none exists
      let visitorId = localStorage.getItem('visitor_id');
      if (!visitorId) {
        visitorId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        localStorage.setItem('visitor_id', visitorId);
      }

      // Only track once per day per visitor
      if (lastVisit !== today) {
        try {
          const { error } = await supabase.from('visits').insert([
            { visitor_id: visitorId }
          ]);
          
          if (!error) {
            localStorage.setItem('last_visit_date', today);
          }
        } catch (e) {
          console.error("Failed to track visit", e);
        }
      }
    };

    // Run after a short delay so it doesn't block critical rendering
    const timer = setTimeout(trackVisit, 3000);
    return () => clearTimeout(timer);
  }, []);
}

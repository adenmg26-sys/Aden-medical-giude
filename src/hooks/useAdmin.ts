import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAdmin() {
  const [role, setRole] = useState<'admin' | 'staff' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const email = localStorage.getItem('admin_user_email');
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', email)
          .single();

        if (data && data.role) {
          setRole(data.role as 'admin' | 'staff');
        } else {
          setRole('staff'); // default
        }
      } catch (err) {
        console.error("Failed to fetch admin role", err);
        setRole('staff');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  return {
    role,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
    loading
  };
}

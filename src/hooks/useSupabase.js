import { useState, useEffect } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/constants';

export const useSupabase = () => {
  const [supabase, setSupabase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSupabase = async () => {
      // تحقق من وجود بيانات Supabase
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY || 
          SUPABASE_URL.includes('your_') || SUPABASE_ANON_KEY.includes('your_')) {
        console.warn('⚠️ Supabase credentials not configured. Using offline mode with mock data.');
        setLoading(false);
        return;
      }

      try {
        const loadSupabase = new Promise((resolve, reject) => {
          if (window.supabase) return resolve(window.supabase);
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/@supabase/supabase-js@2';
          script.async = true;
          script.onload = () => resolve(window.supabase);
          script.onerror = () => reject(new Error('Failed to load Supabase'));
          document.head.appendChild(script);
        });

        const sb = await loadSupabase;
        const client = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setSupabase(client);
        console.log('✅ Supabase connected');
      } catch (err) {
        console.error('❌ Supabase initialization error:', err);
        console.log('📊 Running in offline mode with mock data');
      } finally {
        setLoading(false);
      }
    };

    initSupabase();
  }, []);

  return { supabase, loading };
};

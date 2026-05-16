import { useEffect, useRef } from 'react';

// Saves today's analytics to daily_statistics table in Supabase
// Runs once when analytics are ready, then every 30 minutes
export const useDailyStats = (supabase, analytics) => {
  const lastSaved = useRef(null);

  const saveDailyStats = async () => {
    if (!supabase || !analytics || analytics.rfidCount === undefined) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Don't save more than once every 30 minutes
    if (lastSaved.current && (Date.now() - lastSaved.current) < 30 * 60 * 1000) return;

    try {
      const { error } = await supabase
        .from('daily_statistics')
        .upsert(
          {
            device_id: 'esp32_main_01',
            date: today,
            total_rfid_accesses: analytics.rfidCount || 0,
            total_motion_detections: (analytics.ir1Count || 0) + (analytics.ir2Count || 0),
            avg_soil_moisture: analytics.lastSoilVal || 0,
            avg_light_level: analytics.avgLdr || 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'device_id,date' }
        );

      if (error) {
        console.warn('daily_statistics save error:', error.message);
      } else {
        lastSaved.current = Date.now();
        console.log('✅ daily_statistics updated for', today);
      }
    } catch (err) {
      console.warn('daily_statistics error:', err.message);
    }
  };

  // Save when analytics first load
  useEffect(() => {
    if (analytics && analytics.rfidCount !== undefined) {
      saveDailyStats();
    }
  }, [supabase, analytics?.rfidCount, analytics?.avgLdr, analytics?.lastSoilVal]);

  // Save every 30 minutes
  useEffect(() => {
    const interval = setInterval(saveDailyStats, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [supabase, analytics]);
};

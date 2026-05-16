import { useState, useCallback } from 'react';

export const useNotifications = (supabase) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(async (msg, type = 'info') => {
    // Add to local state
    setNotifications((prev) =>
      [
        { id: Date.now(), msg: String(msg), type, time: new Date() },
        ...prev,
      ].slice(0, 10)
    );

    // Save to Supabase system_alerts
    if (!supabase) return;
    try {
      const severityMap = { error: 'critical', warning: 'high', info: 'info', success: 'low' };
      await supabase.from('system_alerts').insert({
        device_id: 'esp32_main_01',
        alert_type: type.toUpperCase(),
        message: String(msg),
        severity: severityMap[type] || 'info',
        resolved: false,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      // Silently fail — don't break the UI if Supabase is unavailable
      console.warn('system_alerts insert failed:', err.message);
    }
  }, [supabase]);

  return { notifications, addNotification };
};

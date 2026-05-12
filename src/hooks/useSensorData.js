import { useState, useEffect } from 'react';
import { convertSensorReadingsToOldFormat, convertSingleReading } from '../utils/dataAdapter';
import { generateMockData } from '../utils/analytics';

export const useSensorData = (supabase, onCriticalAlert) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!supabase) {
      // لو مافيش Supabase connection، استخدم mock data
      console.log('No Supabase connection, using mock data');
      setData(generateMockData());
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data: initialData, error } = await supabase
          .from('sensor_readings')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);
        
        if (!error && initialData && initialData.length > 0) {
          // تحويل البيانات للبنية القديمة
          const converted = convertSensorReadingsToOldFormat(initialData.reverse());
          setData(converted);
        } else {
          // لو مافيش بيانات في الداتابيز، استخدم mock data
          console.log('No data in database, using mock data');
          setData(generateMockData());
        }
      } catch (e) {
        console.error('Data fetch error:', e);
        // في حالة الخطأ، استخدم mock data
        console.log('Error fetching data, using mock data');
        setData(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const channel = supabase
      .channel('smart-city-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
        (payload) => {
          // تحويل القراءة الجديدة للبنية القديمة
          const convertedNew = convertSingleReading(payload.new);
          setData((prev) => [...prev.slice(-(600 - convertedNew.length)), ...convertedNew]);
          setLastUpdate(new Date());
          
          // معالجة التنبيهات الحرجة
          if (onCriticalAlert) {
            convertedNew.forEach(reading => onCriticalAlert(reading));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [supabase, onCriticalAlert]);

  return { data, loading, lastUpdate };
};

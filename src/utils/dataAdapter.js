// Data Adapter: يحول sensor_readings للبنية القديمة
// بدل ما نعمل view في Supabase، نعمل التحويل في Frontend

export const convertSensorReadingsToOldFormat = (readings) => {
  const converted = [];

  readings.forEach((reading) => {
    const baseData = {
      device_id: reading.device_id,
      created_at: reading.timestamp || reading.created_at,
    };

    // RFID
    if (reading.rfid_uid && reading.rfid_uid !== 'none') {
      converted.push({
        ...baseData,
        id: `${reading.id}_rfid`,
        sensor_type: 'rfid',
        value: reading.rfid_uid,
        rfid_uid: reading.rfid_uid,
        access_granted: reading.access_granted, // نقل حالة الوصول
      });
    }

    // LDR
    if (reading.ldr_value !== null && reading.ldr_value !== undefined) {
      converted.push({
        ...baseData,
        id: `${reading.id}_ldr`,
        sensor_type: 'ldr',
        value: reading.ldr_value,
      });
    }

    // IR1
    if (reading.ir1_motion !== null && reading.ir1_motion !== undefined) {
      converted.push({
        ...baseData,
        id: `${reading.id}_ir1`,
        sensor_type: 'ir1',
        value: reading.ir1_motion ? 1 : 0,
      });
    }

    // IR2
    if (reading.ir2_motion !== null && reading.ir2_motion !== undefined) {
      converted.push({
        ...baseData,
        id: `${reading.id}_ir2`,
        sensor_type: 'ir2',
        value: reading.ir2_motion ? 1 : 0,
      });
    }

    // Soil
    if (reading.soil_moisture !== null && reading.soil_moisture !== undefined) {
      converted.push({
        ...baseData,
        id: `${reading.id}_soil`,
        sensor_type: 'soil',
        value: reading.soil_moisture,
      });
    }

    // Device Status (دايماً online لو في قراءة)
    converted.push({
      ...baseData,
      id: `${reading.id}_status`,
      sensor_type: 'device_status',
      value: '1',
    });
  });

  return converted;
};

// دالة لتحويل قراءة واحدة (للـ realtime)
export const convertSingleReading = (reading) => {
  return convertSensorReadingsToOldFormat([reading]);
};

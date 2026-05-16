import { SENSOR_TYPES, THRESHOLDS } from '../config/constants';

export const processCriticalAlerts = (reading, addNotification) => {
  if (!reading) return;

  // RFID alerts
  if (reading.sensor_type === SENSOR_TYPES.RFID) {
    if (reading.access_granted === false) {
      addNotification(`Security: Unauthorized access attempt — Card ${reading.value || 'Unknown'}`, 'error');
    } else {
      addNotification(`Security: Access authorized — Card ${reading.value || 'Unknown'}`, 'info');
    }
  }

  // Soil moisture alerts
  if (reading.sensor_type === SENSOR_TYPES.SOIL) {
    const moisture = Number(reading.value);
    if (moisture < 20) {
      addNotification(`Critical: Soil moisture critically low (${moisture}%) — Immediate irrigation required`, 'error');
    } else if (moisture < THRESHOLDS.SOIL_DRY) {
      addNotification(`Warning: Soil moisture low (${moisture}%) — Schedule irrigation soon`, 'warning');
    } else if (moisture > 85) {
      addNotification(`Warning: Soil moisture too high (${moisture}%) — Risk of overwatering`, 'warning');
    }
  }

  // Light/LDR alerts
  if (reading.sensor_type === SENSOR_TYPES.LDR) {
    const lux = Number(reading.value);
    if (lux < 100) {
      addNotification(`Warning: Extremely low light detected (${lux} LUX) — Check sensor`, 'warning');
    }
  }

  // Device status alerts
  if (reading.sensor_type === SENSOR_TYPES.DEVICE_STATUS) {
    if (String(reading.value) === '0') {
      addNotification(`Critical: Device offline — Connection lost`, 'error');
    }
  }
};

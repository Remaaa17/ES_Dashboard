import { SENSOR_TYPES } from '../config/constants';

export const processCriticalAlerts = (reading, addNotification) => {
  if (reading.sensor_type === SENSOR_TYPES.RFID) {
    addNotification('Security: Access authorized at city gate', 'info');
  }
};

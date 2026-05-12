// API Configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Chart Colors
export const COLORS = {
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  yellow: '#eab308',
  cyan: '#06b6d4',
};

// Sensor Types
export const SENSOR_TYPES = {
  RFID: 'rfid',
  IR1: 'ir1',
  IR2: 'ir2',
  LDR: 'ldr',
  SOIL: 'soil',
  DEVICE_STATUS: 'device_status',
};

// Thresholds
export const THRESHOLDS = {
  SOIL_DRY: 30,
  SOIL_WET: 70,
  LDR_DARKNESS: 800,
  LDR_THRESHOLD: 1500,
};

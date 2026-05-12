import { SENSOR_TYPES, THRESHOLDS } from '../config/constants';

export const generateMockData = () => {
  return Array.from({ length: 500 }).map((_, i) => ({
    id: i,
    sensor_type: [
      SENSOR_TYPES.LDR,
      SENSOR_TYPES.SOIL,
      SENSOR_TYPES.RFID,
      SENSOR_TYPES.IR1,
      SENSOR_TYPES.IR2,
      SENSOR_TYPES.DEVICE_STATUS,
    ][i % 6],
    value:
      i % 6 === 0
        ? Math.floor(Math.random() * 4000)
        : i % 6 === 5
        ? '1'
        : Math.floor(Math.random() * 100),
    created_at: new Date(Date.now() - (500 - i) * 600000).toISOString(),
    rfid_uid: 'UID-' + (1000 + (i % 5)),
  }));
};

export const calculateAnalytics = (data) => {
  // استخدم البيانات الحقيقية فقط - لو مافيش بيانات، ارجع قيم فاضية
  if (!data || data.length === 0) {
    return {
      rfidHourly: Array.from({length: 24}).map((_, h) => ({ hour: `${h}:00`, count: 0 })),
      rfidCount: 0,
      ir1Count: 0,
      ir2Count: 0,
      avgLdr: 0,
      ldrHistory: [],
      darknessDuration: 0,
      thresholdCrossings: 0,
      dayNightDist: [{ name: 'Day', value: 0 }, { name: 'Night', value: 0 }],
      moistureStatus: 'Unknown',
      lastSoilVal: 0,
      moistureVariability: 0,
      soilHistory: [],
      soilDist: [
        { name: 'Dry', value: 0 },
        { name: 'Optimal', value: 0 },
        { name: 'Wet', value: 0 }
      ],
      uptime: 0,
      lastUID: 'No data',
      rfidLast5: [],
      source: [],
    };
  }

  const source = data;
  const filter = (t) => source.filter((d) => d.sensor_type === t);

  // RFID Analytics
  const rfidLogs = filter(SENSOR_TYPES.RFID);
  const rfidHourly = Array.from({ length: 24 }).map((_, h) => ({
    hour: `${h}:00`,
    count: rfidLogs.filter((d) => new Date(d.created_at).getHours() === h).length,
  }));

  // Motion Analytics
  const ir1 = filter(SENSOR_TYPES.IR1);
  const ir2 = filter(SENSOR_TYPES.IR2);

  // Light Analytics
  const ldrData = filter(SENSOR_TYPES.LDR);
  const avgLdr = Math.round(
    ldrData.reduce((a, b) => a + Number(b.value || 0), 0) / (ldrData.length || 1)
  );
  const ldrHistory = ldrData.slice(-24).map((d) => ({
    time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit' }),
    value: Number(d.value),
  }));
  // عكس المنطق: قراءة عالية = نهار، قراءة منخفضة = ليل
  const darknessSamples = ldrData.filter((d) => Number(d.value) < THRESHOLDS.LDR_DARKNESS).length;
  const darknessDuration = Math.round((darknessSamples / (ldrData.length || 1)) * 24);
  const thresholdCrossings = ldrData.filter(
    (d, i) =>
      i > 0 &&
      ((Number(ldrData[i - 1].value) < THRESHOLDS.LDR_THRESHOLD &&
        Number(d.value) >= THRESHOLDS.LDR_THRESHOLD) ||
        (Number(ldrData[i - 1].value) >= THRESHOLDS.LDR_THRESHOLD &&
          Number(d.value) < THRESHOLDS.LDR_THRESHOLD))
  ).length;
  const dayNightDist = [
    { name: 'Day', value: ldrData.length - darknessSamples },
    { name: 'Night', value: darknessSamples },
  ];

  // Soil Analytics
  const soilData = filter(SENSOR_TYPES.SOIL);
  const lastSoilVal = soilData.length > 0 ? Number(soilData[soilData.length - 1].value || 0) : 50;
  const moistureStatus =
    lastSoilVal < THRESHOLDS.SOIL_DRY ? 'Dry' : lastSoilVal > THRESHOLDS.SOIL_WET ? 'Wet' : 'Optimal';
  const moistureVariability =
    soilData.length > 1
      ? Math.round(
          Math.max(...soilData.map((d) => Number(d.value))) -
            Math.min(...soilData.map((d) => Number(d.value)))
        )
      : 0;
  const soilHistory = soilData.slice(-30).map((d) => {
    const v = Number(d.value);
    return {
      time: new Date(d.created_at).toLocaleTimeString([], { minute: '2-digit' }),
      value: v,
      dry: v < THRESHOLDS.SOIL_DRY ? v : 0,
      optimal: v >= THRESHOLDS.SOIL_DRY && v <= THRESHOLDS.SOIL_WET ? v : 0,
      wet: v > THRESHOLDS.SOIL_WET ? v : 0,
    };
  });
  const soilDist = [
    { name: 'Dry', value: soilData.filter((d) => Number(d.value) < THRESHOLDS.SOIL_DRY).length },
    {
      name: 'Optimal',
      value: soilData.filter(
        (d) => Number(d.value) >= THRESHOLDS.SOIL_DRY && Number(d.value) <= THRESHOLDS.SOIL_WET
      ).length,
    },
    { name: 'Wet', value: soilData.filter((d) => Number(d.value) > THRESHOLDS.SOIL_WET).length },
  ];

  // System Status
  const statusData = filter(SENSOR_TYPES.DEVICE_STATUS);
  const onlineLogs = statusData.filter((d) => String(d.value) === '1').length;
  const uptimePercentage = Math.round((onlineLogs / (statusData.length || 1)) * 100);

  return {
    rfidHourly,
    rfidCount: rfidLogs.length,
    ir1Count: ir1.length,
    ir2Count: ir2.length,
    avgLdr,
    ldrHistory,
    darknessDuration,
    thresholdCrossings,
    dayNightDist,
    moistureStatus,
    lastSoilVal,
    moistureVariability,
    soilHistory,
    soilDist,
    uptime: uptimePercentage || 99.98,
    lastUID:
      rfidLogs.length > 0
        ? String(rfidLogs[rfidLogs.length - 1].value).split('|')[0]
        : 'Scanning...',
    rfidLast5: rfidLogs.slice(-5).reverse(),
    source,
  };
};

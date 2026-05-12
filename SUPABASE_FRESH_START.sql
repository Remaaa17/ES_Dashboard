-- ============================================
-- 🔥 FRESH START - حذف كل حاجة قديمة والبدء من الصفر
-- ============================================
-- ⚠️ تحذير: هذا السكريبت سيحذف كل الجداول والبيانات القديمة!
-- استخدمه بحذر!
-- 
-- ✅ السكريبت محسّن للتشغيل المتكرر (Idempotent)
-- يمكنك تشغيله أكثر من مرة بدون مشاكل
-- ============================================

-- ============================================
-- الخطوة 1: حذف كل الجداول القديمة
-- ============================================

-- حذف الجداول القديمة (كل الاحتمالات)
DROP TABLE IF EXISTS sensor_data CASCADE;
DROP TABLE IF EXISTS sensor_readings_old CASCADE;
DROP TABLE IF EXISTS rfid_logs CASCADE;
DROP TABLE IF EXISTS rfid_access_log_old CASCADE;
DROP TABLE IF EXISTS device_status CASCADE;
DROP TABLE IF EXISTS devices_old CASCADE;
DROP TABLE IF EXISTS sensor_data_backup CASCADE;
DROP TABLE IF EXISTS old_sensor_readings CASCADE;
DROP TABLE IF EXISTS old_rfid_logs CASCADE;

-- حذف أي Views قديمة
DROP VIEW IF EXISTS sensor_data CASCADE;
DROP VIEW IF EXISTS latest_readings CASCADE;
DROP VIEW IF EXISTS today_statistics CASCADE;
DROP VIEW IF EXISTS today_rfid_access CASCADE;
DROP VIEW IF EXISTS old_statistics CASCADE;

-- حذف أي Functions قديمة
DROP FUNCTION IF EXISTS log_rfid_access() CASCADE;
DROP FUNCTION IF EXISTS update_device_last_seen() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_data(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_period_statistics(VARCHAR, TIMESTAMPTZ, TIMESTAMPTZ) CASCADE;

-- ============================================
-- الخطوة 2: إنشاء الجداول الجديدة
-- ============================================

-- حذف الجداول الجديدة لو موجودة (للتأكد)
DROP TABLE IF EXISTS sensor_readings CASCADE;
DROP TABLE IF EXISTS rfid_access_log CASCADE;
DROP TABLE IF EXISTS devices CASCADE;

-- جدول القراءات الرئيسي (Batch Structure)
CREATE TABLE sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- RFID Data
    rfid_uid VARCHAR(20),
    rfid_count INTEGER,
    
    -- Lighting Data
    ldr_value INTEGER,
    ir1_motion BOOLEAN,
    ir2_motion BOOLEAN,
    brightness1 INTEGER,
    brightness2 INTEGER,
    
    -- Soil Data
    soil_moisture DECIMAL(5,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_id ON sensor_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_created_at ON sensor_readings(created_at);

-- جدول سجلات RFID المنفصلة
CREATE TABLE rfid_access_log (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    uid VARCHAR(20) NOT NULL,
    access_granted BOOLEAN DEFAULT true,
    access_number INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfid_log_uid ON rfid_access_log(uid);
CREATE INDEX IF NOT EXISTS idx_rfid_log_timestamp ON rfid_access_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_rfid_log_device ON rfid_access_log(device_id);

-- جدول الأجهزة
CREATE TABLE devices (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) UNIQUE NOT NULL,
    device_name VARCHAR(100),
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة الجهاز الافتراضي
INSERT INTO devices (device_id, device_name, location, status, last_seen)
VALUES ('esp32_main_01', 'ESP32 Main Controller', 'Smart City System', 'active', NOW());

-- ============================================
-- الخطوة 3: إنشاء الـ Triggers
-- ============================================

-- حذف الـ Triggers القديمة لو موجودة
DROP TRIGGER IF EXISTS trigger_log_rfid_access ON sensor_readings;
DROP TRIGGER IF EXISTS trigger_update_device_last_seen ON sensor_readings;

-- Trigger: تسجيل RFID تلقائياً
CREATE OR REPLACE FUNCTION log_rfid_access()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rfid_uid IS NOT NULL AND NEW.rfid_uid != 'none' THEN
        INSERT INTO rfid_access_log (device_id, uid, access_granted, access_number, timestamp)
        VALUES (NEW.device_id, NEW.rfid_uid, true, NEW.rfid_count, NEW.timestamp);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_rfid_access
AFTER INSERT ON sensor_readings
FOR EACH ROW
EXECUTE FUNCTION log_rfid_access();

-- Trigger: تحديث آخر ظهور للجهاز
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE devices
    SET last_seen = NEW.timestamp,
        updated_at = NOW()
    WHERE device_id = NEW.device_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_last_seen
AFTER INSERT ON sensor_readings
FOR EACH ROW
EXECUTE FUNCTION update_device_last_seen();

-- ============================================
-- الخطوة 4: إنشاء الـ Views
-- ============================================

-- آخر قراءة لكل جهاز
CREATE OR REPLACE VIEW latest_readings AS
SELECT DISTINCT ON (device_id)
    device_id,
    timestamp,
    rfid_uid,
    rfid_count,
    ldr_value,
    ir1_motion,
    ir2_motion,
    brightness1,
    brightness2,
    soil_moisture
FROM sensor_readings
ORDER BY device_id, timestamp DESC;

-- إحصائيات اليوم
CREATE OR REPLACE VIEW today_statistics AS
SELECT 
    device_id,
    COUNT(*) as total_readings,
    AVG(ldr_value) as avg_ldr,
    AVG(soil_moisture) as avg_soil_moisture,
    SUM(CASE WHEN ir1_motion THEN 1 ELSE 0 END) as ir1_motion_count,
    SUM(CASE WHEN ir2_motion THEN 1 ELSE 0 END) as ir2_motion_count,
    MAX(rfid_count) as total_rfid_accesses
FROM sensor_readings
WHERE DATE(timestamp) = CURRENT_DATE
GROUP BY device_id;

-- سجلات RFID اليوم
CREATE OR REPLACE VIEW today_rfid_access AS
SELECT *
FROM rfid_access_log
WHERE DATE(timestamp) = CURRENT_DATE
ORDER BY timestamp DESC;

-- ============================================
-- الخطوة 5: إنشاء الـ Functions المساعدة
-- ============================================

-- دالة لحذف البيانات القديمة
CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep INTEGER DEFAULT 30)
RETURNS TABLE(deleted_readings BIGINT, deleted_rfid_logs BIGINT) AS $$
DECLARE
    del_readings BIGINT;
    del_rfid BIGINT;
BEGIN
    DELETE FROM sensor_readings
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    GET DIAGNOSTICS del_readings = ROW_COUNT;
    
    DELETE FROM rfid_access_log
    WHERE timestamp < NOW() - (days_to_keep * 3 || ' days')::INTERVAL;
    GET DIAGNOSTICS del_rfid = ROW_COUNT;
    
    RETURN QUERY SELECT del_readings, del_rfid;
END;
$$ LANGUAGE plpgsql;

-- دالة لحساب إحصائيات فترة زمنية
CREATE OR REPLACE FUNCTION get_period_statistics(
    p_device_id VARCHAR(50),
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS TABLE(
    total_readings BIGINT,
    avg_ldr NUMERIC,
    avg_soil_moisture NUMERIC,
    total_motion_detections BIGINT,
    total_rfid_accesses BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT,
        AVG(ldr_value)::NUMERIC,
        AVG(soil_moisture)::NUMERIC,
        (SUM(CASE WHEN ir1_motion THEN 1 ELSE 0 END) + 
         SUM(CASE WHEN ir2_motion THEN 1 ELSE 0 END))::BIGINT,
        MAX(rfid_count)::BIGINT
    FROM sensor_readings
    WHERE device_id = p_device_id
      AND timestamp BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- الخطوة 6: تفعيل Row Level Security (RLS)
-- ============================================

-- حذف الـ Policies القديمة
DROP POLICY IF EXISTS "Allow all access" ON sensor_readings;
DROP POLICY IF EXISTS "Allow all access" ON rfid_access_log;
DROP POLICY IF EXISTS "Allow all access" ON devices;

ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" 
ON sensor_readings 
FOR ALL 
USING (true) 
WITH CHECK (true);

ALTER TABLE rfid_access_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" 
ON rfid_access_log 
FOR ALL 
USING (true) 
WITH CHECK (true);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" 
ON devices 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ============================================
-- الخطوة 7: إدخال بيانات تجريبية
-- ============================================

-- إدخال 3 قراءات تجريبية
INSERT INTO sensor_readings (
    device_id, rfid_uid, rfid_count, ldr_value, ir1_motion, ir2_motion, 
    brightness1, brightness2, soil_moisture
) VALUES 
    ('esp32_main_01', 'A7CA1EAF', 1, 2500, true, false, 128, 0, 45.5),
    ('esp32_main_01', 'A7CA1EAF', 2, 2300, false, true, 0, 150, 48.2),
    ('esp32_main_01', NULL, 2, 3200, true, true, 200, 200, 42.0);

-- ============================================
-- الخطوة 8: التحقق من النتيجة
-- ============================================

-- عرض الجداول الموجودة
SELECT 
    '📊 Tables Created' as status,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- عرض الـ Views
SELECT 
    '👁️ Views Created' as status,
    table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- عرض الـ Triggers
SELECT 
    '⚡ Triggers Created' as status,
    trigger_name,
    event_object_table as table_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- عرض البيانات التجريبية
SELECT '📝 Sample Data in sensor_readings' as status;
SELECT * FROM sensor_readings ORDER BY timestamp DESC;

SELECT '🔐 RFID Logs (Auto-generated by Trigger)' as status;
SELECT * FROM rfid_access_log ORDER BY timestamp DESC;

SELECT '📈 Today Statistics' as status;
SELECT * FROM today_statistics;

-- ============================================
-- ✅ النتيجة النهائية
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ FRESH START COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables Created:';
    RAISE NOTICE '   - sensor_readings';
    RAISE NOTICE '   - rfid_access_log';
    RAISE NOTICE '   - devices';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Triggers Active:';
    RAISE NOTICE '   - trigger_log_rfid_access';
    RAISE NOTICE '   - trigger_update_device_last_seen';
    RAISE NOTICE '';
    RAISE NOTICE '👁️ Views Available:';
    RAISE NOTICE '   - latest_readings';
    RAISE NOTICE '   - today_statistics';
    RAISE NOTICE '   - today_rfid_access';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next Steps:';
    RAISE NOTICE '   1. Enable Realtime for sensor_readings table';
    RAISE NOTICE '   2. Update .env file with Supabase credentials';
    RAISE NOTICE '   3. Run: npm run dev';
    RAISE NOTICE '   4. Upload ESP32 code';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

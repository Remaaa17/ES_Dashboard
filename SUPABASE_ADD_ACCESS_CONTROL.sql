-- ============================================
-- إضافة Access Control للـ RFID
-- ============================================

-- الخطوة 1: إضافة عمود access_granted في sensor_readings
ALTER TABLE sensor_readings 
ADD COLUMN IF NOT EXISTS access_granted BOOLEAN DEFAULT true;

-- الخطوة 2: تحديث الـ Trigger ليسجل حالة الوصول
CREATE OR REPLACE FUNCTION log_rfid_access()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rfid_uid IS NOT NULL AND NEW.rfid_uid != 'none' THEN
        INSERT INTO rfid_access_log (device_id, uid, access_granted, access_number, timestamp)
        VALUES (
            NEW.device_id, 
            NEW.rfid_uid, 
            COALESCE(NEW.access_granted, true),  -- استخدم القيمة من sensor_readings
            NEW.rfid_count, 
            NEW.timestamp
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- الخطوة 3: تحديث البيانات الموجودة
-- افترض إن الـ UIDs المسجلة حالياً authorized
UPDATE sensor_readings 
SET access_granted = true 
WHERE rfid_uid IS NOT NULL;

-- الخطوة 4: إضافة الـ UIDs المسموح بها في جدول منفصل
CREATE TABLE IF NOT EXISTS authorized_cards (
    id BIGSERIAL PRIMARY KEY,
    uid VARCHAR(20) UNIQUE NOT NULL,
    card_holder VARCHAR(100),
    department VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة الكارت المسموح به
INSERT INTO authorized_cards (uid, card_holder, department, active)
VALUES ('A7CA1EAF', 'Admin User', 'Security', true)
ON CONFLICT (uid) DO NOTHING;

-- الخطوة 5: دالة للتحقق من الكارت
CREATE OR REPLACE FUNCTION is_card_authorized(card_uid VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM authorized_cards 
        WHERE uid = card_uid AND active = true
    );
END;
$$ LANGUAGE plpgsql;

-- الخطوة 6: View لعرض محاولات الدخول المرفوضة
CREATE OR REPLACE VIEW unauthorized_access_attempts AS
SELECT 
    r.id,
    r.device_id,
    r.rfid_uid,
    r.timestamp,
    r.access_granted
FROM sensor_readings r
WHERE r.rfid_uid IS NOT NULL 
  AND r.access_granted = false
ORDER BY r.timestamp DESC;

-- الخطوة 7: View لعرض إحصائيات الأمان
CREATE OR REPLACE VIEW security_statistics AS
SELECT 
    COUNT(*) FILTER (WHERE access_granted = true) as authorized_count,
    COUNT(*) FILTER (WHERE access_granted = false) as unauthorized_count,
    COUNT(DISTINCT rfid_uid) FILTER (WHERE access_granted = false) as unique_unauthorized_cards,
    MAX(timestamp) FILTER (WHERE access_granted = false) as last_unauthorized_attempt
FROM sensor_readings
WHERE rfid_uid IS NOT NULL
  AND DATE(timestamp) = CURRENT_DATE;

-- تفعيل RLS على الجدول الجديد
ALTER TABLE authorized_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON authorized_cards;
CREATE POLICY "Allow all access" 
ON authorized_cards 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ============================================
-- تعليقات
-- ============================================

COMMENT ON COLUMN sensor_readings.access_granted IS 'Whether the RFID card was authorized (true) or denied (false)';
COMMENT ON TABLE authorized_cards IS 'List of authorized RFID cards';
COMMENT ON VIEW unauthorized_access_attempts IS 'All unauthorized access attempts';
COMMENT ON VIEW security_statistics IS 'Daily security statistics';

-- ============================================
-- اختبار
-- ============================================

-- إضافة محاولة دخول مرفوضة للاختبار
INSERT INTO sensor_readings (
    device_id, 
    rfid_uid, 
    rfid_count,
    access_granted,
    ldr_value, 
    ir1_motion, 
    ir2_motion,
    soil_moisture
) VALUES (
    'esp32_main_01',
    'E90FE66E',  -- الكارت المرفوض
    1,
    false,       -- مرفوض
    2500,
    true,
    false,
    45.5
);

-- عرض النتائج
SELECT * FROM unauthorized_access_attempts LIMIT 5;
SELECT * FROM security_statistics;

RAISE NOTICE '✅ Access control added successfully!';
RAISE NOTICE '📝 Authorized card: A7CA1EAF';
RAISE NOTICE '❌ Test unauthorized card: E90FE66E';

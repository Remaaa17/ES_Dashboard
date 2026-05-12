# 🚀 دليل إعداد Supabase للمشروع

## 📋 الخطوات المطلوبة:

### 1️⃣ تنفيذ الـ Schema النهائي
```bash
# في Supabase SQL Editor، نفذ الملف ده فقط:
supabase_final_schema.sql
```

هذا الملف يحتوي على **كل حاجة**:
- ✅ الجداول الأساسية (sensor_readings, rfid_access_log, devices)
- ✅ **Trigger تلقائي** يسجل RFID في rfid_access_log
- ✅ الفيوز (Views) للإحصائيات
- ✅ الدوال (Functions) المساعدة
- ✅ المحفزات (Triggers) التلقائية
- ✅ سياسات الأمان (RLS)
- ✅ بيانات تجريبية للاختبار

---

## 🎯 كيف يعمل النظام؟

### ESP32 → Supabase:
```
ESP32 يبعت قراءة واحدة لـ sensor_readings
     ↓
Trigger تلقائي يسجل RFID في rfid_access_log
     ↓
Dashboard يقرأ من sensor_readings
     ↓
Data Adapter يحول البيانات للبنية القديمة
```

### مثال:
```sql
-- ESP32 يبعت صف واحد:
INSERT INTO sensor_readings VALUES (
  'esp32_main_01', 'A7CA1EAF', 1, 2500, true, false, 45.5
);

-- الـ Trigger تلقائياً يسجل في rfid_access_log:
INSERT INTO rfid_access_log VALUES (
  'esp32_main_01', 'A7CA1EAF', true, 1, NOW()
);

-- الـ Dashboard يحول الصف لـ 7 صفوف في الذاكرة
```

---

## 📊 بنية البيانات الجديدة

### الجدول الجديد (sensor_readings):
```
| id | device_id | rfid_uid | ldr_value | ir1_motion | soil_moisture | timestamp |
|----|-----------|----------|-----------|------------|---------------|-----------|
| 1  | esp32_01  | A7CA1EAF | 2500      | true       | 45.5          | 2024-...  |
```

**صف واحد بدل 7 صفوف = أداء أفضل! 🚀**

### جدول RFID المنفصل (rfid_access_log):
```
| id | device_id | uid      | access_granted | access_number | timestamp |
|----|-----------|----------|----------------|---------------|-----------|
| 1  | esp32_01  | A7CA1EAF | true           | 1             | 2024-...  |
```

**يتم ملؤه تلقائياً عبر Trigger!** ✨

---

## 🔧 الـ Dashboard

الـ Dashboard يستخدم **Data Adapter** في Frontend:
- يقرأ من `sensor_readings`
- يحول البيانات للبنية القديمة في الذاكرة
- الكود القديم يشتغل بدون تعديل!

**ملف:** `src/utils/dataAdapter.js`

---

## 🧪 اختبار البيانات

### إدخال بيانات تجريبية:
```sql
INSERT INTO sensor_readings (
    device_id, 
    rfid_uid, 
    rfid_count,
    ldr_value, 
    ir1_motion, 
    ir2_motion,
    brightness1,
    brightness2,
    soil_moisture
) VALUES (
    'esp32_main_01',
    'A7CA1EAF',
    1,
    2500,
    true,
    false,
    128,
    0,
    45.5
);
```

### التحقق من تسجيل RFID تلقائياً:
```sql
-- شوف آخر 5 سجلات RFID
SELECT * FROM rfid_access_log 
ORDER BY timestamp DESC 
LIMIT 5;
```

### قراءة البيانات:
```sql
-- آخر 10 قراءات
SELECT * FROM sensor_readings 
ORDER BY timestamp DESC 
LIMIT 10;

-- إحصائيات اليوم
SELECT * FROM today_statistics;

-- سجلات RFID اليوم
SELECT * FROM today_rfid_access;
```

---

## 📱 تعديل ESP32 Code (مستقبلاً)

بدل ما تبعت 7 requests منفصلة:
```cpp
// ❌ الطريقة القديمة (بطيئة)
supabase.insert("sensor_data", "{sensor_type: 'rfid', value: 'UID1'}");
supabase.insert("sensor_data", "{sensor_type: 'ldr', value: 2500}");
supabase.insert("sensor_data", "{sensor_type: 'ir1', value: 1}");
// ... إلخ
```

ابعت request واحد:
```cpp
// ✅ الطريقة الجديدة (سريعة)
supabase.insert("sensor_readings", "{
  device_id: 'esp32_main_01',
  rfid_uid: 'UID1',
  ldr_value: 2500,
  ir1_motion: true,
  ir2_motion: false,
  soil_moisture: 45.5,
  bin_level: 75
}");
```

---

## 🔐 الأمان (RLS)

السياسات الحالية تسمح بالوصول الكامل للتطوير:
```sql
CREATE POLICY "Allow all access" 
ON sensor_readings 
FOR ALL 
USING (true);
```

**للإنتاج:** عدل السياسات لتقييد الوصول حسب المستخدم.

---

## 🧹 صيانة البيانات

### حذف البيانات الأقدم من 30 يوم:
```sql
SELECT * FROM cleanup_old_data(30);
```

### عرض إحصائيات اليوم:
```sql
SELECT * FROM today_statistics;
```

### آخر قراءة لكل جهاز:
```sql
SELECT * FROM latest_readings;
```

---

## ✅ Checklist

- [ ] نفذت `supabase_final_schema.sql` في Supabase SQL Editor
- [ ] اختبرت إدخال بيانات تجريبية
- [ ] تأكدت إن الـ RFID Trigger شغال (تحقق من rfid_access_log)
- [ ] تأكدت إن الـ Dashboard بيقرأ البيانات صح
- [ ] حطيت الـ Supabase URL و Key في `.env`
- [ ] فعّلت Realtime في Supabase Dashboard للجدول sensor_readings

---

## 🆘 مشاكل شائعة

### المشكلة: Dashboard مش بيعرض بيانات
**الحل:** تأكد إن:
1. نفذت `supabase_final_schema.sql`
2. في بيانات في `sensor_readings`
3. الـ RLS policies مفعلة صح
4. الـ Data Adapter شغال (شوف Console للأخطاء)

### المشكلة: RFID مش بيتسجل في rfid_access_log
**الحل:** 
1. تأكد إن الـ Trigger موجود: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_log_rfid_access';`
2. تأكد إن rfid_uid مش 'none' أو NULL
3. شوف Supabase Logs للأخطاء

### المشكلة: Realtime مش شغال
**الحل:** 
1. فعّل Realtime في Supabase Dashboard → Database → Replication
2. تأكد إن الـ channel name صح: `smart-city-realtime`
3. تأكد إن الـ table name صح: `sensor_readings`

### المشكلة: Performance بطيء
**الحل:**
1. تأكد إن الـ indexes موجودة
2. قلل عدد الصفوف المسترجعة (limit في useSensorData.js)
3. استخدم Views للإحصائيات بدل الاستعلامات المعقدة

---

## 📞 دعم

لو عندك مشكلة، شوف:
- Supabase Logs في Dashboard
- Browser Console للأخطاء
- Network Tab لطلبات API

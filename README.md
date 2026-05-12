# 🏙️ Smart City Dashboard

لوحة تحكم ذكية لمراقبة وإدارة أنظمة المدينة الذكية باستخدام ESP32 و Supabase و React.

![Smart City](https://img.shields.io/badge/Smart-City-blue)
![ESP32](https://img.shields.io/badge/ESP32-IoT-green)
![React](https://img.shields.io/badge/React-18-61dafb)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e)

---

## 🚀 البدء السريع

### 1️⃣ إعداد قاعدة البيانات
```bash
# افتح Supabase SQL Editor ونفذ:
SUPABASE_FRESH_START.sql
```

### 2️⃣ إعداد Dashboard
```bash
# املأ ملف .env
cp .env.example .env

# ثبت المكتبات
npm install

# شغّل المشروع
npm run dev
```

### 3️⃣ رفع كود ESP32
```bash
# افتح SmartSystem_Complete.ino في Arduino IDE
# عدل بيانات WiFi و Supabase
# ارفع الكود على ESP32
```

---

## 📁 هيكل المشروع

```
ES_Dashboard/
├── 📄 START_HERE.md              ← ابدأ من هنا!
├── 📄 SUPABASE_FRESH_START.sql   ← سكريبت قاعدة البيانات
├── 📄 SmartSystem_Complete.ino   ← كود ESP32
├── 📂 src/
│   ├── 📂 components/
│   │   ├── layout/               # Sidebar, Header
│   │   ├── pages/                # صفحات التطبيق
│   │   └── ui/                   # مكونات UI
│   ├── 📂 hooks/                 # Custom Hooks
│   ├── 📂 utils/                 # دوال مساعدة
│   └── 📂 config/                # إعدادات
└── 📄 .env                       # المتغيرات البيئية
```

---

## 🎯 المميزات

### 📊 Dashboard
- ✅ مراقبة حية للسينسورات (Realtime)
- ✅ إحصائيات وتحليلات ذكية
- ✅ تنبيهات تلقائية
- ✅ تصدير التقارير (PDF & CSV)
- ✅ تنبؤات AI باستخدام Google Gemini

### 🔐 أمان RFID
- ✅ تسجيل الدخول التلقائي
- ✅ سجل كامل للوصول
- ✅ تنبيهات فورية

### 💡 إضاءة ذكية
- ✅ تحكم تلقائي حسب الإضاءة
- ✅ كشف الحركة (IR)
- ✅ PWM للتحكم في السطوع

### 🌱 مراقبة التربة
- ✅ قياس الرطوبة
- ✅ تنبيهات الري
- ✅ إحصائيات تاريخية

### 🗑️ إدارة النفايات
- ✅ قياس مستوى الامتلاء
- ✅ تنبيهات الفيضان
- ✅ تحسين مسارات الجمع

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **React 18** - مكتبة UI
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Recharts** - Charts & Graphs
- **Lucide Icons** - Icons

### Backend
- **Supabase** - Database & Realtime
- **PostgreSQL** - Database Engine
- **Row Level Security** - أمان البيانات

### IoT
- **ESP32** - Microcontroller
- **MFRC522** - RFID Reader
- **FreeRTOS** - Real-time OS
- **Non-blocking Code** - أداء محسّن

### AI
- **Google Gemini API** - تنبؤات ذكية

---

## 📊 قاعدة البيانات

### الجداول الرئيسية:

| الجدول | الوصف |
|--------|-------|
| `sensor_readings` | كل قراءات السينسورات (Batch Structure) |
| `rfid_access_log` | سجل RFID (يتم ملؤه تلقائياً) |
| `devices` | معلومات الأجهزة المسجلة |

### المميزات:
- ✅ **Triggers تلقائية** - تسجيل RFID وتحديث الأجهزة
- ✅ **Views محسّنة** - إحصائيات جاهزة
- ✅ **Functions مساعدة** - تنظيف البيانات القديمة
- ✅ **Indexes** - أداء سريع

---

## 🔧 الإعداد التفصيلي

### متطلبات النظام:
- Node.js 16+
- npm أو yarn
- Arduino IDE (للـ ESP32)
- حساب Supabase
- حساب Google AI (للـ Gemini API)

### ملف .env:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_key_here
```

---

## 📖 الدلائل المتاحة

| الملف | الوصف |
|-------|-------|
| `START_HERE.md` | دليل البدء السريع |
| `README_SETUP.md` | دليل التشغيل الكامل |
| `SUPABASE_SETUP_GUIDE.md` | دليل Supabase المفصل |

---

## 🧪 الاختبار

### اختبار قاعدة البيانات:
```sql
-- آخر القراءات
SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 10;

-- سجلات RFID
SELECT * FROM rfid_access_log ORDER BY timestamp DESC LIMIT 10;

-- إحصائيات اليوم
SELECT * FROM today_statistics;
```

### اختبار Dashboard:
```bash
npm run dev
# افتح: http://localhost:5173
```

---

## 🐛 استكشاف الأخطاء

### Dashboard لا يعرض بيانات؟
1. تأكد من تنفيذ `SUPABASE_FRESH_START.sql`
2. تأكد من ملء `.env` بشكل صحيح
3. تأكد من تفعيل Realtime في Supabase

### ESP32 لا يرسل بيانات؟
1. تأكد من اتصال WiFi
2. تأكد من بيانات Supabase في الكود
3. افتح Serial Monitor للأخطاء

### RFID لا يُسجل؟
1. تأكد من وجود الـ Trigger: `trigger_log_rfid_access`
2. تأكد من أن UID ليس 'none' أو NULL
3. شوف Supabase Logs

---

## 📝 الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام التعليمي والتجاري.

---

## 👥 المساهمة

المساهمات مرحب بها! افتح Issue أو Pull Request.

---

## 📞 الدعم

لو عندك مشكلة، شوف:
- الدلائل في المشروع
- Supabase Logs
- Browser Console
- Serial Monitor (ESP32)

---

**🎉 صُنع بـ ❤️ للمدن الذكية**

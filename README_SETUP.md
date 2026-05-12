# 🚀 Smart City Dashboard - دليل التشغيل السريع

## 📦 الملفات المهمة:

### 1. قاعدة البيانات:
- ✅ **`supabase_final_schema.sql`** - الملف الوحيد المطلوب تنفيذه في Supabase

### 2. التطبيق:
- ✅ **`.env`** - ملف المتغيرات البيئية (املأه ببياناتك)
- ✅ **`src/`** - كود التطبيق (منظم في components)

### 3. ESP32:
- ✅ **`SmartSystem_Complete.ino`** - كود ESP32 (جاهز للاستخدام)

---

## ⚡ خطوات التشغيل:

### 1️⃣ إعداد Supabase:
```bash
1. افتح Supabase SQL Editor
2. نفذ محتوى ملف: supabase_final_schema.sql
3. فعّل Realtime للجدول sensor_readings
```

### 2️⃣ إعداد Dashboard:
```bash
# 1. املأ ملف .env
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
VITE_GEMINI_API_KEY=your_gemini_key_here

# 2. ثبت المكتبات
npm install

# 3. شغل المشروع
npm run dev
```

### 3️⃣ رفع كود ESP32:
```bash
1. افتح SmartSystem_Complete.ino في Arduino IDE
2. عدل بيانات WiFi و Supabase
3. ارفع الكود على ESP32
```

---

## 🎯 كيف يعمل النظام؟

```
ESP32 → sensor_readings (Supabase)
         ↓
    Trigger تلقائي
         ↓
    rfid_access_log
         ↓
    Dashboard (React)
```

---

## 📁 هيكل المشروع:

```
ES_Dashboard/
├── src/
│   ├── components/
│   │   ├── layout/          # Sidebar, Header
│   │   ├── pages/           # صفحات التطبيق
│   │   └── ui/              # مكونات UI
│   ├── hooks/               # Custom Hooks
│   ├── utils/               # دوال مساعدة
│   └── config/              # إعدادات
├── supabase_final_schema.sql  # Schema النهائي
├── SmartSystem_Complete.ino   # كود ESP32
├── .env                        # المتغيرات البيئية
└── README_SETUP.md            # هذا الملف
```

---

## 🔍 للمزيد من التفاصيل:

- **SUPABASE_SETUP_GUIDE.md** - دليل Supabase الكامل
- **src/utils/dataAdapter.js** - كيف يتم تحويل البيانات

---

## ✅ تأكد من:

- [ ] Supabase Schema منفذ
- [ ] Realtime مفعّل
- [ ] ملف .env مملوء
- [ ] ESP32 متصل بالـ WiFi
- [ ] Dashboard شغال على http://localhost:5173

---

## 🆘 مشكلة؟

شوف **SUPABASE_SETUP_GUIDE.md** → قسم "مشاكل شائعة"

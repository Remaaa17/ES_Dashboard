-- ============================================
-- 🔥 FORCE RESET - حذف قوي لكل حاجة
-- ============================================
-- استخدم هذا السكريبت لو FRESH_START فشل
-- ============================================

-- الخطوة 1: حذف كل الـ Policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename || ' CASCADE';
    END LOOP;
END $$;

-- الخطوة 2: حذف كل الـ Triggers
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name, event_object_table 
              FROM information_schema.triggers 
              WHERE trigger_schema = 'public') 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON ' || r.event_object_table || ' CASCADE';
    END LOOP;
END $$;

-- الخطوة 3: حذف كل الـ Views
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT table_name 
              FROM information_schema.views 
              WHERE table_schema = 'public') 
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || r.table_name || ' CASCADE';
    END LOOP;
END $$;

-- الخطوة 4: حذف كل الـ Functions
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT routine_name 
              FROM information_schema.routines 
              WHERE routine_schema = 'public' 
                AND routine_type = 'FUNCTION') 
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.routine_name || ' CASCADE';
    END LOOP;
END $$;

-- الخطوة 5: حذف كل الجداول
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename 
              FROM pg_tables 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || r.tablename || ' CASCADE';
    END LOOP;
END $$;

-- الخطوة 6: تأكيد الحذف
SELECT 
    'Tables' as type,
    COUNT(*) as remaining
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'Views' as type,
    COUNT(*) as remaining
FROM information_schema.views
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'Functions' as type,
    COUNT(*) as remaining
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION';

-- ============================================
-- الآن نفذ SUPABASE_FRESH_START.sql
-- ============================================

RAISE NOTICE '✅ Force reset completed!';
RAISE NOTICE '📝 Now run: SUPABASE_FRESH_START.sql';

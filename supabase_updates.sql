-- ====================================================================
-- تحديثات قاعدة بيانات Supabase - مرشد عدن الطبي
-- ====================================================================
-- هذا السكربت يقوم بتحديث الجداول وإضافة الأعمدة والسياسات اللازمة
-- لعمل الميزات الجديدة (مثل السيرة الذاتية، الاشتراكات المميزة، الحذف الناعم)
-- قم بنسخ هذا الكود وتشغيله في محرّر SQL الخاص بـ Supabase (SQL Editor).

-- --------------------------------------------------------------------
-- 1. إضافة حقل النبذة التعريفية (Biography)
-- --------------------------------------------------------------------
ALTER TABLE providers ADD COLUMN IF NOT EXISTS bio TEXT;

-- --------------------------------------------------------------------
-- 2. إضافة حقول الحذف الناعم (Soft Deletes) لدعم المزامنة التفاضلية
-- --------------------------------------------------------------------
ALTER TABLE providers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- --------------------------------------------------------------------
-- 3. إضافة حقول التميز والإعلانات للمزودين (Premium Subscriptions)
-- --------------------------------------------------------------------
ALTER TABLE providers ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS premium_rank INTEGER DEFAULT 0;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS show_in_banner BOOLEAN DEFAULT FALSE;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS premium_expiry_date TIMESTAMP WITH TIME ZONE;

-- --------------------------------------------------------------------
-- 4. إعداد سياسات الحماية ووصول الزوار لجدول الإعدادات (Settings Table Policies)
-- --------------------------------------------------------------------
-- التأكد من أن جدول الإعدادات يسمح بالقراءة العامة لجميع الزوار لضمان تحميل بيانات التواصل ووضع الصيانة
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'settings' AND policyname = 'Allow public select on settings'
    ) THEN
        CREATE POLICY "Allow public select on settings" ON settings
            FOR SELECT USING (true);
    END IF;
END
$$;

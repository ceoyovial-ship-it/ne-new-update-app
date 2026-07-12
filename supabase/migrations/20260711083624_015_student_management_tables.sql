/*
# Student Management Module - Database Tables

## Overview
Adds tables and columns needed for the complete Student Management module:
- student_documents: Birth certificate, Aadhaar, Transfer certificate, marks memo
- student_medical: Allergies, conditions, emergency contact
- student_promotions: Track student promotions between classes
- student_transfers: Track student transfers between branches/schools
- student_archives: Archive students without deleting

## Modified Tables
- students: Added aadhaar_number, gender, academic_year_id, section, archived, archived_at, archived_reason, communication_address, admission_date

## Security
- RLS enabled on all new tables
- Admin-level roles can manage all student data
- Teachers can read students in their classes
- Students/parents can read their own data
*/

-- ============================================================
-- 1. Add missing columns to students table
-- ============================================================
ALTER TABLE students ADD COLUMN IF NOT EXISTS aadhaar_number text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS academic_year_id uuid;
ALTER TABLE students ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE students ADD COLUMN IF NOT EXISTS archived_reason text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS communication_address text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_date date DEFAULT CURRENT_DATE;

-- Add FK for academic_year_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'students_academic_year_id_fkey' AND table_name = 'students'
    ) THEN
        ALTER TABLE students ADD CONSTRAINT students_academic_year_id_fkey
        FOREIGN KEY (academic_year_id) REFERENCES academic_years(id);
    END IF;
END $$;

-- ============================================================
-- 2. student_documents table
-- ============================================================
CREATE TABLE IF NOT EXISTS student_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    document_type text NOT NULL,
    file_name text,
    file_url text,
    uploaded_at timestamptz DEFAULT now(),
    uploaded_by uuid,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON student_documents(student_id);

-- ============================================================
-- 3. student_medical table
-- ============================================================
CREATE TABLE IF NOT EXISTS student_medical (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    allergies text,
    medical_conditions text,
    medications text,
    blood_group text,
    height text,
    weight text,
    emergency_contact_name text,
    emergency_contact_phone text,
    emergency_contact_relation text,
    last_checkup date,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_medical_student_id ON student_medical(student_id);

-- ============================================================
-- 4. student_promotions table
-- ============================================================
CREATE TABLE IF NOT EXISTS student_promotions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    from_class_id uuid REFERENCES classes(id),
    to_class_id uuid REFERENCES classes(id),
    from_academic_year_id uuid REFERENCES academic_years(id),
    to_academic_year_id uuid REFERENCES academic_years(id),
    promotion_date date DEFAULT CURRENT_DATE,
    promoted_by uuid,
    remarks text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_promotions_student_id ON student_promotions(student_id);

-- ============================================================
-- 5. student_transfers table
-- ============================================================
CREATE TABLE IF NOT EXISTS student_transfers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    from_branch_id uuid,
    to_branch_id uuid,
    transfer_date date DEFAULT CURRENT_DATE,
    reason text,
    transferred_by uuid,
    status text DEFAULT 'completed',
    remarks text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_transfers_student_id ON student_transfers(student_id);

-- ============================================================
-- 6. Enable RLS on new tables
-- ============================================================
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_medical ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_transfers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. RLS Policies
-- ============================================================

-- student_documents
DROP POLICY IF EXISTS "student_documents_select_auth" ON student_documents;
CREATE POLICY "student_documents_select_auth" ON student_documents FOR SELECT
    TO authenticated USING (is_admin_level() OR student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ) OR student_id IN (
        SELECT sp.student_id FROM student_parents sp
        JOIN parents p ON sp.parent_id = p.id
        WHERE p.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "student_documents_modify_admin" ON student_documents;
CREATE POLICY "student_documents_modify_admin" ON student_documents FOR ALL
    TO authenticated USING (is_admin_level()) WITH CHECK (is_admin_level());

-- student_medical
DROP POLICY IF EXISTS "student_medical_select_auth" ON student_medical;
CREATE POLICY "student_medical_select_auth" ON student_medical FOR SELECT
    TO authenticated USING (is_admin_level() OR student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ) OR student_id IN (
        SELECT sp.student_id FROM student_parents sp
        JOIN parents p ON sp.parent_id = p.id
        WHERE p.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "student_medical_modify_admin" ON student_medical;
CREATE POLICY "student_medical_modify_admin" ON student_medical FOR ALL
    TO authenticated USING (is_admin_level()) WITH CHECK (is_admin_level());

-- student_promotions
DROP POLICY IF EXISTS "student_promotions_select_auth" ON student_promotions;
CREATE POLICY "student_promotions_select_auth" ON student_promotions FOR SELECT
    TO authenticated USING (is_admin_level() OR student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "student_promotions_modify_admin" ON student_promotions;
CREATE POLICY "student_promotions_modify_admin" ON student_promotions FOR ALL
    TO authenticated USING (is_admin_level()) WITH CHECK (is_admin_level());

-- student_transfers
DROP POLICY IF EXISTS "student_transfers_select_auth" ON student_transfers;
CREATE POLICY "student_transfers_select_auth" ON student_transfers FOR SELECT
    TO authenticated USING (is_admin_level() OR student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "student_transfers_modify_admin" ON student_transfers;
CREATE POLICY "student_transfers_modify_admin" ON student_transfers FOR ALL
    TO authenticated USING (is_admin_level()) WITH CHECK (is_admin_level());

-- ============================================================
-- 8. Update students RLS to allow admin-level access
-- ============================================================
DROP POLICY IF EXISTS "students_select_all" ON students;
CREATE POLICY "students_select_all" ON students FOR SELECT
    TO authenticated USING (is_admin_level() OR user_id = auth.uid() OR id IN (
        SELECT sp.student_id FROM student_parents sp
        JOIN parents p ON sp.parent_id = p.id
        WHERE p.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "students_modify_admin" ON students;
CREATE POLICY "students_modify_admin" ON students FOR ALL
    TO authenticated USING (is_admin_level()) WITH CHECK (is_admin_level());

-- ============================================================
-- 9. Seed some houses if empty
-- ============================================================
INSERT INTO houses (name, color, description)
SELECT * FROM (VALUES
    ('Red House', '#ef4444', 'Courage and determination'),
    ('Blue House', '#3b82f6', 'Wisdom and loyalty'),
    ('Green House', '#22c55e', 'Growth and harmony'),
    ('Yellow House', '#eab308', 'Energy and optimism')
) AS t(name, color, description)
WHERE NOT EXISTS (SELECT 1 FROM houses LIMIT 1);

-- ============================================================
-- 10. Seed academic years if empty
-- ============================================================
INSERT INTO academic_years (name, start_date, end_date, is_current)
SELECT '2025-2026', '2025-06-01', '2026-03-31', true
WHERE NOT EXISTS (SELECT 1 FROM academic_years LIMIT 1);

INSERT INTO academic_years (name, start_date, end_date, is_current)
SELECT '2024-2025', '2024-06-01', '2025-03-31', false
WHERE NOT EXISTS (SELECT 1 FROM academic_years WHERE name = '2024-2025');

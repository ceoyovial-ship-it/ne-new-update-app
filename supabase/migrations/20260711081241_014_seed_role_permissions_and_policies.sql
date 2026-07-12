/*
# Seed role_permissions mapping + RLS policies + helper functions
*/

-- ============================================================
-- Helper functions
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin_level() RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_role(p_role_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role::text = p_role_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_permission(p_permission_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM role_permissions rp
        JOIN roles r ON rp.role_id = r.id
        JOIN permissions p ON rp.permission_id = p.id
        JOIN profiles prof ON prof.role::text = r.name
        WHERE prof.id = auth.uid() AND p.name = p_permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "branches_select_all" ON branches;
CREATE POLICY "branches_select_all" ON branches FOR SELECT
    TO authenticated USING (true);

DROP POLICY IF EXISTS "branches_modify_admin" ON branches;
CREATE POLICY "branches_modify_admin" ON branches FOR ALL
    TO authenticated USING (is_admin_level()) WITH CHECK (is_admin_level());

DROP POLICY IF EXISTS "roles_select_all" ON roles;
CREATE POLICY "roles_select_all" ON roles FOR SELECT
    TO authenticated USING (true);

DROP POLICY IF EXISTS "roles_modify_admin" ON roles;
CREATE POLICY "roles_modify_admin" ON roles FOR ALL
    TO authenticated USING (is_admin_level()) WITH CHECK (is_admin_level());

DROP POLICY IF EXISTS "permissions_select_all" ON permissions;
CREATE POLICY "permissions_select_all" ON permissions FOR SELECT
    TO authenticated USING (true);

DROP POLICY IF EXISTS "permissions_modify_admin" ON permissions;
CREATE POLICY "permissions_modify_admin" ON permissions FOR ALL
    TO authenticated USING (is_admin_level()) WITH CHECK (is_admin_level());

DROP POLICY IF EXISTS "role_permissions_select_all" ON role_permissions;
CREATE POLICY "role_permissions_select_all" ON role_permissions FOR SELECT
    TO authenticated USING (true);

DROP POLICY IF EXISTS "role_permissions_modify_admin" ON role_permissions;
CREATE POLICY "role_permissions_modify_admin" ON role_permissions FOR ALL
    TO authenticated USING (is_admin_level()) WITH CHECK (is_admin_level());

DROP POLICY IF EXISTS "user_roles_select_authorized" ON user_roles;
CREATE POLICY "user_roles_select_authorized" ON user_roles FOR SELECT
    TO authenticated USING (user_id = auth.uid() OR is_admin_level());

DROP POLICY IF EXISTS "user_roles_modify_admin" ON user_roles;
CREATE POLICY "user_roles_modify_admin" ON user_roles FOR ALL
    TO authenticated USING (is_admin_level()) WITH CHECK (is_admin_level());

-- Update profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
    TO authenticated USING (auth.uid() = id OR is_admin_level());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = id OR is_admin_level());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
    TO authenticated USING (auth.uid() = id OR is_admin_level())
    WITH CHECK (auth.uid() = id OR is_admin_level());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_branch_id ON profiles(branch_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);

-- ============================================================
-- Seed: Role-Permissions mapping
-- ============================================================

-- Super Admin: ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Admin: All except super_admin settings
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name != 'settings.super_admin'
ON CONFLICT DO NOTHING;

-- Principal: Academic management only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'principal' AND p.name IN (
    'dashboard.view',
    'users.view', 'students.view', 'students.create', 'students.edit',
    'teachers.view', 'parents.view',
    'classes.view', 'classes.create', 'classes.edit',
    'attendance.view', 'attendance.mark', 'attendance.edit',
    'exams.view', 'exams.create', 'exams.edit',
    'marks.view', 'marks.enter', 'marks.edit',
    'homework.view', 'homework.create', 'homework.edit',
    'assignments.view', 'assignments.create', 'assignments.edit',
    'events.view', 'events.manage',
    'announcements.view', 'announcements.manage',
    'reports.view', 'reports.generate',
    'messages.view', 'messages.send'
)
ON CONFLICT DO NOTHING;

-- Teacher
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'teacher' AND p.name IN (
    'dashboard.view',
    'students.view',
    'classes.view',
    'attendance.view', 'attendance.mark',
    'exams.view',
    'marks.view', 'marks.enter',
    'homework.view', 'homework.create', 'homework.edit', 'homework.delete',
    'assignments.view', 'assignments.create', 'assignments.edit',
    'announcements.view', 'announcements.manage',
    'messages.view', 'messages.send'
)
ON CONFLICT DO NOTHING;

-- Student
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'student' AND p.name IN (
    'dashboard.view',
    'attendance.view',
    'exams.view',
    'marks.view',
    'homework.view',
    'assignments.view',
    'fees.view',
    'library.view',
    'transport.view',
    'events.view',
    'announcements.view',
    'messages.view', 'messages.send'
)
ON CONFLICT DO NOTHING;

-- Parent
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'parent' AND p.name IN (
    'dashboard.view',
    'students.view',
    'attendance.view',
    'exams.view',
    'marks.view',
    'homework.view',
    'fees.view',
    'transport.view',
    'events.view',
    'announcements.view',
    'messages.view', 'messages.send'
)
ON CONFLICT DO NOTHING;

-- Accountant
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'accountant' AND p.name IN (
    'dashboard.view',
    'students.view',
    'fees.view', 'fees.create', 'fees.edit', 'fees.collect', 'fees.reports',
    'reports.view', 'reports.generate'
)
ON CONFLICT DO NOTHING;

-- Receptionist
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'receptionist' AND p.name IN (
    'dashboard.view',
    'students.view', 'students.create', 'students.edit',
    'admissions.view', 'admissions.manage',
    'visitors.view', 'visitors.manage',
    'announcements.view',
    'messages.view', 'messages.send'
)
ON CONFLICT DO NOTHING;

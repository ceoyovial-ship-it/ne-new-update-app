/*
# Seed branches and roles
*/

INSERT INTO branches (name, code, address, city, state, is_active)
VALUES
    ('Main Campus', 'MAIN', '123 Education Road', 'Mumbai', 'Maharashtra', true),
    ('North Branch', 'NORTH', '456 North Street', 'Mumbai', 'Maharashtra', true),
    ('South Branch', 'SOUTH', '789 South Avenue', 'Pune', 'Maharashtra', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO roles (name, display_name, description, is_system) VALUES
    ('super_admin', 'Super Admin', 'Full system access with no restrictions', true),
    ('admin', 'Administrator', 'Full school management except super admin settings', true),
    ('principal', 'Principal', 'Academic management and oversight', true),
    ('teacher', 'Teacher', 'Manage assigned classes - attendance, marks, homework', true),
    ('student', 'Student', 'Personal dashboard and academic information', true),
    ('parent', 'Parent', 'View children''s academic progress and information', true),
    ('accountant', 'Accountant', 'Fee management and financial transactions', true),
    ('receptionist', 'Receptionist', 'Admissions and visitor management', true)
ON CONFLICT (name) DO NOTHING;

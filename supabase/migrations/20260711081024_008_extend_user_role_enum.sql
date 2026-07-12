/*
# Extend user_role enum with new roles
*/

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'principal';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accountant';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'receptionist';

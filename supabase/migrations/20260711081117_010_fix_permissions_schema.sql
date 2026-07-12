/*
# Fix permissions table schema - add missing action column
*/

ALTER TABLE permissions ADD COLUMN IF NOT EXISTS action text;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS description text;

-- Add unique constraint on permissions.name if not exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'permissions_name_key' AND conrelid = 'permissions'::regclass
    ) THEN
        ALTER TABLE permissions ADD CONSTRAINT permissions_name_key UNIQUE (name);
    END IF;
END $$;

-- Add unique constraint on roles.name if not exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'roles_name_key' AND conrelid = 'roles'::regclass
    ) THEN
        ALTER TABLE roles ADD CONSTRAINT roles_name_key UNIQUE (name);
    END IF;
END $$;

-- Add updated_at to roles if not exists
ALTER TABLE roles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

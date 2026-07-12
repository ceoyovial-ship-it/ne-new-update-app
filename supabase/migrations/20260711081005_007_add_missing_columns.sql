/*
# Add missing columns to branches and profiles
*/

-- Add missing columns to branches
ALTER TABLE branches ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add missing column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Add unique constraint on branches.code if not exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'branches_code_key' AND conrelid = 'branches'::regclass
    ) THEN
        ALTER TABLE branches ADD CONSTRAINT branches_code_key UNIQUE (code);
    END IF;
END $$;

-- Add FK from profiles.branch_id to branches if not exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'profiles_branch_id_fkey' AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles
        ADD CONSTRAINT profiles_branch_id_fkey
        FOREIGN KEY (branch_id) REFERENCES branches(id);
    END IF;
END $$;

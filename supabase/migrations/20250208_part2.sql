-- Add auth_user_id to user_profiles if it doesn't exist
DO $$ 
DECLARE
    col_exists boolean;
    col_type text;
BEGIN
    -- Check if column exists and get its type
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'auth_user_id'
    ) INTO col_exists;

    IF col_exists THEN
        -- Get the current type
        SELECT data_type INTO col_type
        FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'auth_user_id';

        -- If it's not UUID, alter it
        IF col_type != 'uuid' THEN
            ALTER TABLE user_profiles
            ALTER COLUMN auth_user_id TYPE uuid USING auth_user_id::uuid;
        END IF;
    ELSE
        -- Create the column if it doesn't exist
        ALTER TABLE user_profiles
        ADD COLUMN auth_user_id uuid UNIQUE;
    END IF;
END $$;

-- Create usage_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS usage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    feature_type TEXT NOT NULL,
    credits_used INTEGER NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Add auth_user_id to user_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_profiles' 
                  AND column_name = 'auth_user_id') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN auth_user_id TEXT UNIQUE;
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_history_user_id ON usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_history_created_at ON usage_history(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create or replace function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                  WHERE trigger_name = 'update_user_profiles_updated_at') THEN
        CREATE TRIGGER update_user_profiles_updated_at
        BEFORE UPDATE ON user_profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own usage history" ON usage_history;
DROP POLICY IF EXISTS "Users can insert own usage history" ON usage_history;

-- Create new policies
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth_user_id::text = auth.uid());

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth_user_id::text = auth.uid());

CREATE POLICY "Users can view own usage history"
    ON usage_history FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = usage_history.user_id
        AND user_profiles.auth_user_id::text = auth.uid()
    ));

CREATE POLICY "Users can insert own usage history"
    ON usage_history FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = NEW.user_id
        AND user_profiles.auth_user_id::text = auth.uid()
    ));

-- Create function to handle new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_id text;
BEGIN
    -- Convert UUID to text
    user_id := new.id::text;
    
    -- Check if user already exists
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE auth_user_id = user_id) THEN
        -- If user doesn't exist, create new profile
        INSERT INTO user_profiles (auth_user_id, credits_balance)
        VALUES (user_id, 10)  -- Give 10 free credits to new users
        ON CONFLICT (auth_user_id) DO NOTHING;
    END IF;
    RETURN new;
END;
$$ language plpgsql security definer;

-- Create trigger for new users if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                  WHERE trigger_name = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION handle_new_user();
    END IF;
END $$;

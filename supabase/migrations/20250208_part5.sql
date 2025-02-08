-- Create function to handle new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Insert new user profile with UUID
    INSERT INTO user_profiles (auth_user_id, credits_balance)
    VALUES (new.id, 10)  -- Give 10 free credits to new users
    ON CONFLICT (auth_user_id) DO NOTHING;
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

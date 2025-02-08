-- Create new policies
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth_user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth_user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own usage history"
    ON usage_history FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = usage_history.user_id
        AND user_profiles.auth_user_id = (SELECT auth.uid())
    ));

CREATE POLICY "Users can insert own usage history"
    ON usage_history FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = NEW.user_id
        AND user_profiles.auth_user_id = (SELECT auth.uid())
    ));

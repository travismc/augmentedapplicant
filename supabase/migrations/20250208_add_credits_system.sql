-- Add credits_balance to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS credits_balance INTEGER NOT NULL DEFAULT 0;

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id),
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create usage_history table
CREATE TABLE IF NOT EXISTS usage_history (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id),
    feature_type TEXT NOT NULL CHECK (feature_type IN ('resume', 'cover_letter', 'linkedin')),
    credits_used INTEGER NOT NULL,
    input_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_history_user_id ON usage_history(user_id);

-- Set up RLS for credit_transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON credit_transactions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own transactions" ON credit_transactions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Set up RLS for usage_history
ALTER TABLE usage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON usage_history
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own usage" ON usage_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create function to update credits balance
CREATE OR REPLACE FUNCTION update_credits_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles
    SET credits_balance = credits_balance + NEW.amount
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for credit balance updates
DROP TRIGGER IF EXISTS update_credits_balance_trigger ON credit_transactions;
CREATE TRIGGER update_credits_balance_trigger
    AFTER INSERT ON credit_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_credits_balance();

-- Function to safely increment credits
CREATE OR REPLACE FUNCTION increment_credits(amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_balance integer;
BEGIN
    UPDATE user_profiles
    SET credits_balance = credits_balance + amount
    WHERE user_id = auth.uid()
    RETURNING credits_balance INTO new_balance;
    
    RETURN new_balance;
END;
$$;

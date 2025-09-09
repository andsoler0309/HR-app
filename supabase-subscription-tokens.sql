-- Create subscription_tokens table for secure token-based subscription activation
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.subscription_tokens (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  token text NOT NULL UNIQUE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_subscription_tokens_token ON public.subscription_tokens(token);
CREATE INDEX IF NOT EXISTS idx_subscription_tokens_user_id ON public.subscription_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_tokens_expires_at ON public.subscription_tokens(expires_at);

-- RLS policies for subscription_tokens
ALTER TABLE public.subscription_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tokens (but this table should mainly be accessed server-side)
CREATE POLICY "Users can view own tokens" ON public.subscription_tokens
  FOR SELECT USING (user_id = auth.uid());

-- Only the system should be able to insert/update tokens (no policy for insert/update means only service role can do it)

-- Add helper function to generate secure tokens
CREATE OR REPLACE FUNCTION generate_subscription_token(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_value text;
BEGIN
  -- Generate a secure random token
  token_value := encode(gen_random_bytes(32), 'hex');
  
  -- Insert the token with 1 hour expiration
  INSERT INTO public.subscription_tokens (token, user_id, expires_at)
  VALUES (token_value, p_user_id, now() + interval '1 hour');
  
  RETURN token_value;
END;
$$;

-- Add helper function to clean up expired tokens (run this periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.subscription_tokens 
  WHERE expires_at < now() - interval '1 day'; -- Keep used tokens for 1 day for logging
END;
$$;

-- Add 'pending' status to subscriptions table
-- Run this SQL in your Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;

-- Add the new constraint with 'pending' status
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'cancelled', 'expired', 'pending'));

-- Add mercadopago_subscription_id field if it doesn't exist
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS mercadopago_subscription_id text;

-- Add fields for tracking cancellation
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean default false;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancellation_reason text;

-- Update profiles table to support 'pending' status too
-- The profiles.subscription_status field should also support 'pending'
-- Note: This field is text, so no constraint changes needed, but adding for clarity
COMMENT ON COLUMN public.profiles.subscription_status IS 'Subscription status: free, premium, pending';

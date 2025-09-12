-- =====================================================
-- MIGRATE EXISTING USERS TO PROFILES TABLE
-- Run this script in your Supabase SQL Editor to create profiles
-- for users who registered before the profile creation fix
-- =====================================================

-- First, let's check how many users exist without profiles
SELECT 
  COUNT(*) as total_users_without_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL 
  AND u.deleted_at IS NULL
  AND u.email_confirmed_at IS NOT NULL;

-- Create profiles for all existing authenticated users who don't have a profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  company_name,
  subscription_status,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  -- Extract full_name from raw_user_meta_data, fallback to email prefix if not available
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    SPLIT_PART(u.email, '@', 1)
  ) as full_name,
  -- Extract company_name from raw_user_meta_data, fallback to 'My Company' if not available
  COALESCE(
    u.raw_user_meta_data->>'company_name',
    u.raw_user_meta_data->>'company',
    'My Company'
  ) as company_name,
  'free' as subscription_status,
  COALESCE(u.created_at, NOW()) as created_at,
  NOW() as updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL -- Only insert for users who don't have a profile
  AND u.deleted_at IS NULL -- Only active users
  AND u.email_confirmed_at IS NOT NULL -- Only confirmed users
  AND u.email IS NOT NULL; -- Only users with email

-- Create default subscriptions for users who don't have one
INSERT INTO public.subscriptions (
  user_id,
  plan_type,
  status,
  created_at,
  updated_at
)
SELECT 
  p.id,
  'free' as plan_type,
  'active' as status,
  NOW() as created_at,
  NOW() as updated_at
FROM public.profiles p
LEFT JOIN public.subscriptions s ON p.id = s.user_id
WHERE s.user_id IS NULL;

-- Verify the migration
SELECT 
  'Migration Results' as step,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles_created,
  (SELECT COUNT(*) FROM public.subscriptions) as total_subscriptions_created;

-- Show users and their profiles (first 10 for verification)
SELECT 
  u.email,
  u.created_at as user_created_at,
  p.full_name,
  p.company_name,
  p.subscription_status,
  s.plan_type,
  s.status as subscription_status
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.subscriptions s ON u.id = s.user_id
WHERE u.deleted_at IS NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- This script has:
-- 1. Created profiles for all existing users without profiles
-- 2. Extracted user data from auth.users metadata where available
-- 3. Set default values for missing data
-- 4. Created default 'free' subscriptions for all users
-- 5. Verified the migration results
-- =====================================================

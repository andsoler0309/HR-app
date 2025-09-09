-- =====================================================
-- SUPABASE DATABASE SETUP FOR HR SYSTEM
-- Run these commands in your Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (User profiles)
-- =====================================================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  company_name text,
  avatar_url text,
  profile_picture text,
  subscription_status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- =====================================================
-- 2. DEPARTMENTS TABLE
-- =====================================================
create table public.departments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for departments
alter table public.departments enable row level security;

create policy "Users can manage own company departments" on public.departments
  for all using (company_id = auth.uid());

-- =====================================================
-- 3. EMPLOYEES TABLE
-- =====================================================
create table public.employees (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  document_id text,
  phone text,
  department_id uuid references public.departments(id) on delete set null,
  position text not null,
  employee_type text check (employee_type in ('full-time', 'part-time', 'contract', 'intern')) not null,
  hire_date date not null,
  salary numeric(12,2),
  birthday date,
  is_active boolean default true,
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for employees
alter table public.employees enable row level security;

create policy "Users can manage own company employees" on public.employees
  for all using (company_id = auth.uid());

-- =====================================================
-- 4. TIME-OFF POLICIES TABLE
-- =====================================================
create table public.time_off_policies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text check (type in ('VACATION', 'SICK', 'PERSONAL', 'BEREAVEMENT', 'OTHER')) not null,
  days_per_year integer not null,
  carries_forward boolean default false,
  max_carry_forward integer,
  description text,
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for time-off policies
alter table public.time_off_policies enable row level security;

create policy "Users can manage own company time-off policies" on public.time_off_policies
  for all using (company_id = auth.uid());

-- =====================================================
-- 5. TIME-OFF BALANCES TABLE
-- =====================================================
create table public.time_off_balances (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references public.employees(id) on delete cascade not null,
  policy_id uuid references public.time_off_policies(id) on delete cascade not null,
  year integer not null,
  total_days numeric(5,2) not null,
  used_days numeric(5,2) default 0,
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(employee_id, policy_id, year)
);

-- RLS policies for time-off balances
alter table public.time_off_balances enable row level security;

create policy "Users can manage own company time-off balances" on public.time_off_balances
  for all using (company_id = auth.uid());

-- =====================================================
-- 6. TIME-OFF REQUESTS TABLE
-- =====================================================
create table public.time_off_requests (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references public.employees(id) on delete cascade not null,
  policy_id uuid references public.time_off_policies(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  total_days numeric(5,2) not null,
  reason text not null,
  status text check (status in ('PENDING', 'APPROVED', 'REJECTED')) default 'PENDING',
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for time-off requests
alter table public.time_off_requests enable row level security;

create policy "Users can manage own company time-off requests" on public.time_off_requests
  for all using (company_id = auth.uid());

-- =====================================================
-- 7. DOCUMENT CATEGORIES TABLE
-- =====================================================
create table public.document_categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for document categories
alter table public.document_categories enable row level security;

create policy "Users can manage own company document categories" on public.document_categories
  for all using (company_id = auth.uid());

-- =====================================================
-- 8. DOCUMENT TEMPLATES TABLE
-- =====================================================
create table public.document_templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category_id uuid references public.document_categories(id) on delete set null,
  content text not null,
  requires_signature boolean default false,
  signature_fields jsonb default '[]'::jsonb,
  description text,
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for document templates
alter table public.document_templates enable row level security;

create policy "Users can manage own company document templates" on public.document_templates
  for all using (company_id = auth.uid());

-- =====================================================
-- 9. DOCUMENTS TABLE
-- =====================================================
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category_id uuid references public.document_categories(id) on delete set null,
  employee_id uuid references public.employees(id) on delete set null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  version integer default 1,
  description text,
  requires_signature boolean default false,
  is_signed boolean default false,
  signature_data jsonb,
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for documents
alter table public.documents enable row level security;

create policy "Users can manage own company documents" on public.documents
  for all using (company_id = auth.uid());

-- =====================================================
-- 10. DOCUMENT VERSIONS TABLE
-- =====================================================
create table public.document_versions (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  version_number integer not null,
  file_path text not null,
  file_size bigint,
  changes_description text,
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for document versions
alter table public.document_versions enable row level security;

create policy "Users can manage own company document versions" on public.document_versions
  for all using (company_id = auth.uid());

-- =====================================================
-- 11. ATTENDANCE TABLE
-- =====================================================
create table public.attendance (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references public.employees(id) on delete cascade not null,
  date date not null,
  clock_in timestamp with time zone,
  clock_out timestamp with time zone,
  total_hours numeric(5,2),
  status text check (status in ('present', 'absent', 'late', 'early_leave')) default 'present',
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(employee_id, date)
);

-- RLS policies for attendance
alter table public.attendance enable row level security;

create policy "Users can manage own company attendance" on public.attendance
  for all using (company_id = auth.uid());

-- =====================================================
-- 12. EMPLOYEE PORTAL ACCESS TABLE
-- =====================================================
create table public.employee_portal_access (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references public.employees(id) on delete cascade not null unique,
  access_token text not null unique,
  is_active boolean default true,
  last_login timestamp with time zone,
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for employee portal access
alter table public.employee_portal_access enable row level security;

create policy "Users can manage own company portal access" on public.employee_portal_access
  for all using (company_id = auth.uid());

-- =====================================================
-- 13. PERFORMANCE REVIEWS TABLE (NEW)
-- =====================================================
create table public.performance_reviews (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references public.employees(id) on delete cascade not null,
  reviewer_id uuid references public.employees(id) on delete set null,
  review_period_start date not null,
  review_period_end date not null,
  overall_rating integer check (overall_rating between 1 and 5),
  goals_rating integer check (goals_rating between 1 and 5),
  skills_rating integer check (skills_rating between 1 and 5),
  communication_rating integer check (communication_rating between 1 and 5),
  goals text,
  achievements text,
  areas_for_improvement text,
  manager_comments text,
  employee_comments text,
  status text check (status in ('draft', 'in_progress', 'completed', 'approved')) default 'draft',
  completed_at timestamp with time zone,
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for performance reviews
alter table public.performance_reviews enable row level security;

create policy "Users can manage own company performance reviews" on public.performance_reviews
  for all using (company_id = auth.uid());

-- =====================================================
-- 14. AUDIT LOGS TABLE (NEW)
-- =====================================================
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  details jsonb default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  risk_level text check (risk_level in ('low', 'medium', 'high')) default 'low',
  company_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for performance
create index idx_audit_logs_company_id on public.audit_logs(company_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at);
create index idx_audit_logs_action on public.audit_logs(action);
create index idx_audit_logs_resource_type on public.audit_logs(resource_type);

-- RLS policies for audit logs
alter table public.audit_logs enable row level security;

create policy "Users can view own company audit logs" on public.audit_logs
  for select using (company_id = auth.uid());

create policy "System can insert audit logs" on public.audit_logs
  for insert with check (true);

-- =====================================================
-- 15. SUBSCRIPTIONS TABLE
-- =====================================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  plan_type text check (plan_type in ('free', 'premium')) not null default 'free',
  status text check (status in ('active', 'cancelled', 'expired')) not null default 'active',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  payu_subscription_id text,
  payu_plan_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for subscriptions
alter table public.subscriptions enable row level security;

create policy "Users can view own subscription" on public.subscriptions
  for select using (user_id = auth.uid());

create policy "Users can update own subscription" on public.subscriptions
  for update using (user_id = auth.uid());

create policy "Users can insert own subscription" on public.subscriptions
  for insert with check (user_id = auth.uid());

-- =====================================================
-- 16. STORAGE BUCKETS AND POLICIES
-- =====================================================

-- Create storage bucket for documents
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

-- Storage policies for documents bucket
create policy "Users can upload documents to own company folder" on storage.objects
  for insert with check (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view documents from own company folder" on storage.objects
  for select using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update documents in own company folder" on storage.objects
  for update using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete documents from own company folder" on storage.objects
  for delete using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- 17. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically create subscription on profile creation
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
language plpgsql
as $$
begin
  insert into public.subscriptions (user_id, plan_type, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$;

-- Trigger to create subscription on new profile
create trigger on_auth_user_created_subscription
  after insert on public.profiles
  for each row execute procedure public.handle_new_user();

-- Function to update timestamps
create or replace function public.handle_updated_at()
returns trigger
security definer set search_path = public
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Add updated_at triggers to all relevant tables
create trigger handle_updated_at_profiles before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_departments before update on public.departments for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_employees before update on public.employees for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_time_off_policies before update on public.time_off_policies for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_time_off_balances before update on public.time_off_balances for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_time_off_requests before update on public.time_off_requests for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_document_categories before update on public.document_categories for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_document_templates before update on public.document_templates for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_documents before update on public.documents for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_attendance before update on public.attendance for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_employee_portal_access before update on public.employee_portal_access for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_performance_reviews before update on public.performance_reviews for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_subscriptions before update on public.subscriptions for each row execute procedure public.handle_updated_at();

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your Supabase database is now ready for the HR system.
-- Make sure to:
-- 1. Set up your environment variables in your Next.js app
-- 2. Configure your Supabase client with the correct URL and anon key
-- 3. Test the authentication flow
-- =====================================================

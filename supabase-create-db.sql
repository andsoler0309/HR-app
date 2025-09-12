-- SQL script to create the Supabase public schema tables as of 2025-09-12
-- Note: This script assumes required extensions (uuid-ossp, pgcrypto) and enums are already created.

-- Table: profiles
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    email text UNIQUE NOT NULL,
    full_name text,
    company_name text,
    avatar_url text,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    profile_picture text,
    subscription_status text DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
    subscription_end_date timestamptz,
    CONSTRAINT profiles_email_unique UNIQUE(email)
);

-- Table: departments
CREATE TABLE public.departments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Table: employees
CREATE TYPE status_enum AS ENUM ('FULL_TIME','PART_TIME','CONTRACTOR','TEMPORARY');
CREATE TABLE public.employees (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    document_id text UNIQUE NOT NULL,
    phone text,
    department_id uuid REFERENCES public.departments(id),
    position text NOT NULL,
    hire_date date NOT NULL,
    salary numeric,
    birthday date,
    is_active boolean DEFAULT true,
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    status status_enum DEFAULT 'FULL_TIME'
);

-- Table: time_off_policies
CREATE TABLE public.time_off_policies (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('VACATION','SICK','PERSONAL','BEREAVEMENT','OTHER')),
    days_per_year integer NOT NULL,
    carries_forward boolean DEFAULT false,
    max_carry_forward integer,
    description text,
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Table: time_off_balances
CREATE TABLE public.time_off_balances (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id uuid NOT NULL REFERENCES public.employees(id),
    policy_id uuid NOT NULL REFERENCES public.time_off_policies(id),
    year integer NOT NULL,
    total_days numeric NOT NULL,
    used_days numeric DEFAULT 0,
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    carried_over numeric DEFAULT 0
);

-- Table: time_off_requests
CREATE TABLE public.time_off_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id uuid NOT NULL REFERENCES public.employees(id),
    policy_id uuid NOT NULL REFERENCES public.time_off_policies(id),
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days numeric NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Table: document_categories
CREATE TABLE public.document_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Table: document_templates
CREATE TABLE public.document_templates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    category_id uuid REFERENCES public.document_categories(id),
    content text NOT NULL,
    requires_signature boolean DEFAULT false,
    signature_fields jsonb DEFAULT '[]',
    description text,
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    required_signatures text[]
);

-- Table: documents
CREATE TABLE public.documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    category_id uuid REFERENCES public.document_categories(id),
    employee_id uuid REFERENCES public.employees(id),
    file_url text NOT NULL,
    file_size bigint,
    file_type text,
    version integer DEFAULT 1,
    description text,
    requires_signature boolean DEFAULT false,
    is_signed boolean DEFAULT false,
    signature_data jsonb,
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    status text DEFAULT 'active',
    generated_from_template uuid REFERENCES public.document_templates(id),
    signed_by text[] DEFAULT ARRAY[]::text[],
    signed_at timestamptz,
    signature_status text CHECK (signature_status IN ('pending','signed','rejected'))
);

-- Table: document_versions
CREATE TABLE public.document_versions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id uuid NOT NULL REFERENCES public.documents(id),
    version_number integer NOT NULL,
    file_path text NOT NULL,
    file_size bigint,
    changes_description text,
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now())
);

-- Table: attendance
CREATE TABLE public.attendance (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id uuid NOT NULL REFERENCES public.employees(id),
    date date NOT NULL,
    clock_in timestamptz,
    clock_out timestamptz,
    total_hours numeric,
    status text DEFAULT 'present' CHECK (status IN ('present','absent','late','early_leave')),
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Table: employee_portal_access
CREATE TABLE public.employee_portal_access (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id uuid UNIQUE NOT NULL REFERENCES public.employees(id),
    access_token text UNIQUE NOT NULL,
    is_active boolean DEFAULT true,
    last_login timestamptz,
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    email text UNIQUE NOT NULL
);

-- Table: performance_reviews
CREATE TABLE public.performance_reviews (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id uuid NOT NULL REFERENCES public.employees(id),
    reviewer_id uuid REFERENCES public.employees(id),
    review_period_start date NOT NULL,
    review_period_end date NOT NULL,
    overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
    goals_rating integer CHECK (goals_rating >= 1 AND goals_rating <= 5),
    skills_rating integer CHECK (skills_rating >= 1 AND skills_rating <= 5),
    communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
    goals text,
    achievements text,
    areas_for_improvement text,
    manager_comments text,
    employee_comments text,
    status text DEFAULT 'draft' CHECK (status IN ('draft','in_progress','completed','approved')),
    completed_at timestamptz,
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Table: audit_logs
CREATE TABLE public.audit_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id),
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    details jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    risk_level text DEFAULT 'low' CHECK (risk_level IN ('low','medium','high')),
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT timezone('utc', now())
);

-- Table: subscriptions
CREATE TABLE public.subscriptions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id),
    plan_type text DEFAULT 'free' CHECK (plan_type IN ('free','premium')),
    status text DEFAULT 'active' CHECK (status IN ('active','cancelled','expired','pending')),
    current_period_start timestamptz,
    current_period_end timestamptz,
    payu_subscription_id text,
    payu_plan_id text,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    epayco_customer_id text,
    epayco_subscription_id text,
    epayco_plan_id text,
    cancel_at_period_end boolean DEFAULT false,
    canceled_at timestamptz,
    trial_start timestamptz,
    trial_end timestamptz,
    mercadopago_subscription_id text,
    cancelled_at timestamptz,
    cancellation_reason text
);

-- Table: epayco_payments
CREATE TABLE public.epayco_payments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    epayco_transaction_id text UNIQUE NOT NULL,
    reference_code text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'cop',
    status text NOT NULL CHECK (status IN ('succeeded','pending','failed','canceled','rejected')),
    description text,
    payment_method text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Table: employee_attendance
CREATE TABLE public.employee_attendance (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id uuid NOT NULL REFERENCES public.employees(id),
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    clock_in timestamptz NOT NULL,
    clock_out timestamptz,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Table: employee_portal_requests
CREATE TABLE public.employee_portal_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id uuid NOT NULL REFERENCES public.employees(id),
    company_id uuid NOT NULL REFERENCES public.profiles(id),
    type text NOT NULL CHECK (type IN ('TIME_OFF','DOCUMENT','EXPENSE','OTHER')),
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    data jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Table: subscription_tokens
CREATE TABLE public.subscription_tokens (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    token text UNIQUE NOT NULL,
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    expires_at timestamptz NOT NULL,
    used boolean DEFAULT false,
    used_at timestamptz,
    created_at timestamptz DEFAULT timezone('utc', now())
);

-- Table: user_signatures
CREATE TABLE public.user_signatures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    name varchar NOT NULL,
    signature_data text NOT NULL,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- End of schema

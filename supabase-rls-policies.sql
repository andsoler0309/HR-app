-- SQL script to enable RLS and create example policies for all public tables
-- Adjust the policies as needed for your app's logic and security

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epayco_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_portal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_signatures ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust as needed):

-- Allow users to select their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Allow users to select their own employees (by company_id)
CREATE POLICY "Company can view their employees" ON public.employees
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = company_id);

-- Allow users to update their own employees (by company_id)
CREATE POLICY "Company can update their employees" ON public.employees
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = company_id)
  WITH CHECK ((select auth.uid()) = company_id);

-- Allow users to insert employees for their company
CREATE POLICY "Company can insert employees" ON public.employees
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = company_id);

-- Allow users to select their own documents (by company_id)
CREATE POLICY "Company can view their documents" ON public.documents
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = company_id);

-- Allow users to insert documents for their company
CREATE POLICY "Company can insert documents" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = company_id);

-- Allow users to update their own documents (by company_id)
CREATE POLICY "Company can update their documents" ON public.documents
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = company_id)
  WITH CHECK ((select auth.uid()) = company_id);

-- Allow users to select their own time off requests
CREATE POLICY "Employee can view their time off requests" ON public.time_off_requests
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = company_id);

-- Allow users to insert time off requests for their company
CREATE POLICY "Employee can insert time off requests" ON public.time_off_requests
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = company_id);

-- Allow users to update their own time off requests
CREATE POLICY "Employee can update their time off requests" ON public.time_off_requests
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = company_id)
  WITH CHECK ((select auth.uid()) = company_id);

-- Allow users to select their own audit logs
CREATE POLICY "Company can view their audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = company_id);

-- Allow users to insert audit logs for their company
CREATE POLICY "Company can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = company_id);

-- Allow users to select their own subscriptions
CREATE POLICY "User can view their subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- Allow users to insert their own subscription
CREATE POLICY "User can insert their subscription" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Allow users to update their own subscription
CREATE POLICY "User can update their subscription" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Allow users to select their own user_signatures
CREATE POLICY "User can view their signatures" ON public.user_signatures
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- Allow users to insert their own signature
CREATE POLICY "User can insert their signature" ON public.user_signatures
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Allow users to update their own signature
CREATE POLICY "User can update their signature" ON public.user_signatures
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Add more policies for other tables as needed, following the same pattern.

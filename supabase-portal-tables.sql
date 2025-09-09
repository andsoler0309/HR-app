-- =====================================================
-- TABLA PARA ASISTENCIA DE EMPLEADOS (employee_attendance)
-- =====================================================
CREATE TABLE public.employee_attendance (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  clock_in timestamp with time zone NOT NULL,
  clock_out timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para mejorar performance
CREATE INDEX idx_employee_attendance_employee_id ON public.employee_attendance(employee_id);
CREATE INDEX idx_employee_attendance_company_id ON public.employee_attendance(company_id);
CREATE INDEX idx_employee_attendance_clock_in ON public.employee_attendance(clock_in);

-- RLS policies para employee_attendance
ALTER TABLE public.employee_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own company attendance records" ON public.employee_attendance
  FOR ALL USING (company_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER handle_updated_at_employee_attendance 
  BEFORE UPDATE ON public.employee_attendance 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =====================================================
-- TABLA PARA SOLICITUDES DEL PORTAL DE EMPLEADOS (employee_portal_requests)
-- =====================================================
CREATE TABLE public.employee_portal_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text CHECK (type IN ('TIME_OFF', 'DOCUMENT', 'EXPENSE', 'OTHER')) NOT NULL,
  status text CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para mejorar performance
CREATE INDEX idx_employee_portal_requests_employee_id ON public.employee_portal_requests(employee_id);
CREATE INDEX idx_employee_portal_requests_company_id ON public.employee_portal_requests(company_id);
CREATE INDEX idx_employee_portal_requests_status ON public.employee_portal_requests(status);
CREATE INDEX idx_employee_portal_requests_type ON public.employee_portal_requests(type);

-- RLS policies para employee_portal_requests
ALTER TABLE public.employee_portal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own company portal requests" ON public.employee_portal_requests
  FOR ALL USING (company_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER handle_updated_at_employee_portal_requests 
  BEFORE UPDATE ON public.employee_portal_requests 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
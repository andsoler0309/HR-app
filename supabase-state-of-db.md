# Supabase State of DB (as of 2025-09-12)

## Table: profiles
- id: uuid, PK, FK(auth.users.id)
- email: text, unique
- full_name: text, nullable
- company_name: text, nullable
- avatar_url: text, nullable
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())
- profile_picture: text, nullable
- subscription_status: text, default='free', check=['free','premium'], comment=Subscription status: free, premium, pending
- subscription_end_date: timestamptz, nullable

## Table: departments
- id: uuid, PK, default=uuid_generate_v4()
- name: text
- description: text, nullable
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())

## Table: employees
- id: uuid, PK, default=uuid_generate_v4()
- first_name: text
- last_name: text
- email: text
- document_id: text, unique
- phone: text, nullable
- department_id: uuid, nullable, FK(departments.id)
- position: text
- hire_date: date
- salary: numeric, nullable
- birthday: date, nullable
- is_active: boolean, nullable, default=true
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())
- status: status_enum, default='FULL_TIME', enums=['FULL_TIME','PART_TIME','CONTRACTOR','TEMPORARY']

## Table: time_off_policies
- id: uuid, PK, default=uuid_generate_v4()
- name: text
- type: text, check=['VACATION','SICK','PERSONAL','BEREAVEMENT','OTHER']
- days_per_year: integer
- carries_forward: boolean, nullable, default=false
- max_carry_forward: integer, nullable
- description: text, nullable
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())

## Table: time_off_balances
- id: uuid, PK, default=uuid_generate_v4()
- employee_id: uuid, FK(employees.id)
- policy_id: uuid, FK(time_off_policies.id)
- year: integer
- total_days: numeric
- used_days: numeric, nullable, default=0
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())
- carried_over: numeric, nullable, default=0

## Table: time_off_requests
- id: uuid, PK, default=uuid_generate_v4()
- employee_id: uuid, FK(employees.id)
- policy_id: uuid, FK(time_off_policies.id)
- start_date: date
- end_date: date
- total_days: numeric
- reason: text
- status: text, nullable, default='PENDING', check=['PENDING','APPROVED','REJECTED']
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())

## Table: document_categories
- id: uuid, PK, default=uuid_generate_v4()
- name: text
- description: text, nullable
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())

## Table: document_templates
- id: uuid, PK, default=uuid_generate_v4()
- name: text
- category_id: uuid, nullable, FK(document_categories.id)
- content: text
- requires_signature: boolean, nullable, default=false
- signature_fields: jsonb, nullable, default='[]'
- description: text, nullable
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())
- required_signatures: text[], nullable

## Table: documents
- id: uuid, PK, default=uuid_generate_v4()
- name: text
- category_id: uuid, nullable, FK(document_categories.id)
- employee_id: uuid, nullable, FK(employees.id)
- file_url: text
- file_size: bigint, nullable
- file_type: text, nullable
- version: integer, nullable, default=1
- description: text, nullable
- requires_signature: boolean, nullable, default=false, comment=Indica si el documento requiere firma electrónica
- is_signed: boolean, nullable, default=false
- signature_data: jsonb, nullable
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())
- status: text, default='active'
- generated_from_template: uuid, nullable, FK(document_templates.id), comment=ID de la plantilla desde la cual se generó el documento
- signed_by: text[], nullable, default=ARRAY[]::text[], comment=Array de IDs de usuarios que han firmado el documento
- signed_at: timestamptz, nullable, comment=Fecha y hora cuando se completó la firma
- signature_status: text, check=['pending','signed','rejected'], comment=Estado de la firma: pending, signed, rejected

## Table: document_versions
- id: uuid, PK, default=uuid_generate_v4()
- document_id: uuid, FK(documents.id)
- version_number: integer
- file_path: text
- file_size: bigint, nullable
- changes_description: text, nullable
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())

## Table: attendance
- id: uuid, PK, default=uuid_generate_v4()
- employee_id: uuid, FK(employees.id)
- date: date
- clock_in: timestamptz, nullable
- clock_out: timestamptz, nullable
- total_hours: numeric, nullable
- status: text, nullable, default='present', check=['present','absent','late','early_leave']
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())

## Table: employee_portal_access
- id: uuid, PK, default=uuid_generate_v4()
- employee_id: uuid, unique, FK(employees.id)
- access_token: text, unique
- is_active: boolean, nullable, default=true
- last_login: timestamptz, nullable
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())
- email: text, unique

## Table: performance_reviews
- id: uuid, PK, default=uuid_generate_v4()
- employee_id: uuid, FK(employees.id)
- reviewer_id: uuid, nullable, FK(employees.id)
- review_period_start: date
- review_period_end: date
- overall_rating: integer, nullable, check=1-5
- goals_rating: integer, nullable, check=1-5
- skills_rating: integer, nullable, check=1-5
- communication_rating: integer, nullable, check=1-5
- goals: text, nullable
- achievements: text, nullable
- areas_for_improvement: text, nullable
- manager_comments: text, nullable
- employee_comments: text, nullable
- status: text, nullable, default='draft', check=['draft','in_progress','completed','approved']
- completed_at: timestamptz, nullable
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())

## Table: audit_logs
- id: uuid, PK, default=uuid_generate_v4()
- user_id: uuid, nullable, FK(profiles.id)
- action: text
- resource_type: text
- resource_id: text, nullable
- details: jsonb, nullable, default='{}'
- ip_address: inet, nullable
- user_agent: text, nullable
- risk_level: text, nullable, default='low', check=['low','medium','high']
- company_id: uuid, FK(profiles.id)
- created_at: timestamptz, default=timezone('utc', now())

## Table: subscriptions
- id: uuid, PK, default=uuid_generate_v4()
- user_id: uuid, unique, FK(profiles.id)
- plan_type: text, default='free', check=['free','premium']
- status: text, default='active', check=['active','cancelled','expired','pending']
- current_period_start: timestamptz, nullable
- current_period_end: timestamptz, nullable
- payu_subscription_id: text, nullable
- payu_plan_id: text, nullable
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())
- epayco_customer_id: text, nullable
- epayco_subscription_id: text, nullable
- epayco_plan_id: text, nullable
- cancel_at_period_end: boolean, nullable, default=false
- canceled_at: timestamptz, nullable
- trial_start: timestamptz, nullable
- trial_end: timestamptz, nullable
- mercadopago_subscription_id: text, nullable
- cancelled_at: timestamptz, nullable
- cancellation_reason: text, nullable

## Table: epayco_payments
- id: uuid, PK, default=uuid_generate_v4()
- user_id: uuid, FK(profiles.id)
- epayco_transaction_id: text, unique
- reference_code: text
- amount: integer
- currency: text, default='cop'
- status: text, check=['succeeded','pending','failed','canceled','rejected']
- description: text, nullable
- payment_method: text, nullable
- metadata: jsonb, nullable, default='{}'
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())

## Table: employee_attendance
- id: uuid, PK, default=uuid_generate_v4()
- employee_id: uuid, FK(employees.id)
- company_id: uuid, FK(profiles.id)
- clock_in: timestamptz
- clock_out: timestamptz, nullable
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())

## Table: employee_portal_requests
- id: uuid, PK, default=uuid_generate_v4()
- employee_id: uuid, FK(employees.id)
- company_id: uuid, FK(profiles.id)
- type: text, check=['TIME_OFF','DOCUMENT','EXPENSE','OTHER']
- status: text, nullable, default='PENDING', check=['PENDING','APPROVED','REJECTED']
- data: jsonb, default='{}'
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())

## Table: subscription_tokens
- id: uuid, PK, default=uuid_generate_v4()
- token: text, unique
- user_id: uuid, FK(profiles.id)
- expires_at: timestamptz
- used: boolean, default=false
- used_at: timestamptz, nullable
- created_at: timestamptz, default=timezone('utc', now())

## Table: user_signatures
- id: uuid, PK, default=gen_random_uuid()
- user_id: uuid, FK(auth.users.id)
- name: varchar
- signature_data: text, comment=Base64 encoded signature image data
- created_at: timestamptz, default=timezone('utc', now())
- updated_at: timestamptz, default=timezone('utc', now())
- comment: Stores user saved signatures for document signing

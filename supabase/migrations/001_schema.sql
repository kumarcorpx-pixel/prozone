-- ============================================================
-- YABS PRO Services - Complete Database Schema
-- UAE Government Transaction Services Platform
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  avatar_url text,
  company_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- updated_at trigger function (reused across tables)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. COMPANIES
-- ============================================================
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trade_name text,
  license_number text,
  license_type text CHECK (license_type IN ('Commercial', 'Professional', 'Industrial')),
  license_expiry date,
  legal_form text CHECK (legal_form IN ('LLC', 'FZCO', 'FZE', 'Sole Establishment')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'closed', 'on_hold')),
  emirate text,
  jurisdiction text,
  free_zone text,
  address text,
  po_box text,
  phone text,
  email text,
  website text,
  industry text,
  activities text[],
  capital numeric,
  incorporation_date date,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add FK from profiles.company_id to companies
ALTER TABLE profiles ADD CONSTRAINT profiles_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_admin_all" ON companies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "companies_client_select" ON companies
  FOR SELECT USING (created_by = auth.uid());

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. EMPLOYEES
-- ============================================================
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  designation text,
  department text,
  nationality text,
  visa_status text CHECK (visa_status IN ('valid', 'expired', 'expiring_soon', 'processing', 'cancelled')),
  visa_expiry date,
  emirates_id text,
  emirates_id_expiry date,
  passport_number text,
  passport_expiry date,
  labor_card_number text,
  labor_card_expiry date,
  salary numeric,
  join_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resigned', 'terminated')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employees_admin_all" ON employees
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "employees_client_select" ON employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = employees.company_id
        AND companies.created_by = auth.uid()
    )
  );

CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. SERVICES (catalog)
-- ============================================================
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('licensing', 'visa', 'business_setup', 'document_services', 'accounting', 'other')),
  description text,
  price numeric(10,2),
  estimated_days int,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_select_all" ON services
  FOR SELECT USING (true);

CREATE POLICY "services_admin_manage" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed services
INSERT INTO services (name, category, description, price, estimated_days) VALUES
  ('Trade License - New',          'licensing',         'New trade license registration with DED or free zone authority',              5500.00,  14),
  ('Trade License - Renewal',      'licensing',         'Annual trade license renewal including all government fees',                  3500.00,   7),
  ('Employment Visa - New',        'visa',              'New employment visa processing including entry permit and stamping',          3200.00,  21),
  ('Employment Visa - Renewal',    'visa',              'Employment visa renewal including medical and Emirates ID',                   2500.00,  14),
  ('Family Visa',                  'visa',              'Spouse and dependent visa sponsorship processing',                           4000.00,  30),
  ('Mission Visa',                 'visa',              'Short-term mission/visit visa for business purposes',                        1500.00,   5),
  ('Company Formation - Mainland', 'business_setup',    'Full mainland company formation including MOA, license, and approvals',     15000.00,  21),
  ('Company Formation - Freezone', 'business_setup',    'Free zone company incorporation with license and visa packages',            12000.00,  14),
  ('Emirates ID',                  'visa',              'Emirates ID application or renewal processing',                              500.00,   7),
  ('Document Attestation',         'document_services', 'MOFA and embassy document attestation services',                            1200.00,  10),
  ('Legal Translation',            'document_services', 'Certified Arabic-English legal document translation',                        800.00,   3),
  ('VAT Registration',             'accounting',        'Federal Tax Authority VAT registration and TRN issuance',                   2000.00,   7),
  ('Bookkeeping - Monthly',        'accounting',        'Monthly bookkeeping, bank reconciliation, and financial reporting',          1500.00,  30),
  ('ADNOC Registration',           'other',             'ADNOC supplier registration and ICV certificate processing',                5000.00,  30),
  ('ICV Certification',            'other',             'In-Country Value certification for government contracts',                    4500.00,  21);

-- ============================================================
-- 5. SERVICE REQUESTS
-- ============================================================
CREATE TABLE service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id),
  company_id uuid REFERENCES companies(id),
  service_type text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'under_review', 'completed', 'rejected')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES profiles(id),
  notes text,
  due_date date,
  completed_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_requests_client_select" ON service_requests
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "service_requests_admin_select" ON service_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "service_requests_client_insert" ON service_requests
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "service_requests_admin_update" ON service_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "service_requests_admin_all" ON service_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. REQUEST TIMELINE
-- ============================================================
CREATE TABLE request_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  status text,
  message text NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE request_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "request_timeline_viewable" ON request_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM service_requests sr
      WHERE sr.id = request_timeline.request_id
        AND (sr.client_id = auth.uid()
             OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "request_timeline_admin_insert" ON request_timeline
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 7. DOCUMENTS
-- ============================================================
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  name text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN (
    'trade_license', 'memorandum', 'tenancy_contract', 'visa', 'passport',
    'emirates_id', 'labor_card', 'medical', 'insurance', 'contract', 'noc',
    'bank', 'establishment_card', 'residency_visa', 'photo', 'other'
  )),
  file_url text,
  file_size bigint,
  expiry_date date,
  status text DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'expiring_soon')),
  uploaded_by uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_admin_all" ON documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "documents_client_select" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = documents.company_id
        AND companies.created_by = auth.uid()
    )
  );

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 8. PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES service_requests(id),
  client_id uuid NOT NULL REFERENCES profiles(id),
  amount numeric(10,2) NOT NULL,
  vat_amount numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  method text CHECK (method IN ('bank_transfer', 'card', 'cash', 'online')),
  description text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_client_select" ON payments
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "payments_admin_all" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 9. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 10. SHAREHOLDERS
-- ============================================================
CREATE TABLE shareholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  nationality text,
  share_percentage numeric,
  share_type text,
  emirates_id text,
  passport_number text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shareholders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shareholders_admin_all" ON shareholders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "shareholders_client_select" ON shareholders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = shareholders.company_id
        AND companies.created_by = auth.uid()
    )
  );

CREATE TRIGGER shareholders_updated_at
  BEFORE UPDATE ON shareholders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 11. COMPANY CONTACTS
-- ============================================================
CREATE TABLE company_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  designation text,
  email text,
  phone text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE company_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_contacts_admin_all" ON company_contacts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "company_contacts_client_select" ON company_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_contacts.company_id
        AND companies.created_by = auth.uid()
    )
  );

-- ============================================================
-- 12. TASKS
-- ============================================================
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to uuid REFERENCES profiles(id),
  due_date date,
  completed_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_admin_all" ON tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "tasks_client_select" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM service_requests sr
      WHERE sr.id = tasks.service_request_id
        AND sr.client_id = auth.uid()
    )
  );

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 13. ACTIVITY LOG
-- ============================================================
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  company_id uuid REFERENCES companies(id),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_log_admin_select" ON activity_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "activity_log_client_select" ON activity_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "activity_log_insert" ON activity_log
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 14. WPS DATA
-- ============================================================
CREATE TABLE wps_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  total_employees int DEFAULT 0,
  wps_covered int DEFAULT 0,
  not_covered int DEFAULT 0,
  expired_work_cards int DEFAULT 0,
  compliance_percentage numeric DEFAULT 0,
  total_monthly_salary numeric DEFAULT 0,
  salary_paid numeric DEFAULT 0,
  salary_pending numeric DEFAULT 0,
  average_salary numeric DEFAULT 0,
  male_employees int DEFAULT 0,
  female_employees int DEFAULT 0,
  skilled_workers int DEFAULT 0,
  unskilled_workers int DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE wps_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wps_data_admin_all" ON wps_data
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "wps_data_client_select" ON wps_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = wps_data.company_id
        AND companies.created_by = auth.uid()
    )
  );

-- ============================================================
-- 15. MONTHLY UPLOADS
-- ============================================================
CREATE TABLE monthly_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  month int NOT NULL CHECK (month BETWEEN 1 AND 12),
  year int NOT NULL CHECK (year >= 2020),
  employee_list boolean NOT NULL DEFAULT false,
  wps_report boolean NOT NULL DEFAULT false,
  company_report boolean NOT NULL DEFAULT false,
  gdrfad_report boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, month, year)
);

ALTER TABLE monthly_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monthly_uploads_admin_all" ON monthly_uploads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "monthly_uploads_client_select" ON monthly_uploads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = monthly_uploads.company_id
        AND companies.created_by = auth.uid()
    )
  );

CREATE TRIGGER monthly_uploads_updated_at
  BEFORE UPDATE ON monthly_uploads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE request_timeline;
ALTER PUBLICATION supabase_realtime ADD TABLE companies;
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;

-- ============================================================
-- STORAGE: documents bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload
CREATE POLICY "documents_bucket_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Authenticated users can view
CREATE POLICY "documents_bucket_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

-- Admins can delete
CREATE POLICY "documents_bucket_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

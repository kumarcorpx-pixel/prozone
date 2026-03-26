-- ============================================================================
-- 004_uae_fields.sql — UAE PRO Services Upgrade
-- Extend companies, employees, documents; add visa_process_steps & government_fees
-- ============================================================================

-- ─── Extend companies table ─────────────────────────────────────────────────

ALTER TABLE companies ADD COLUMN IF NOT EXISTS establishment_card_number text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS establishment_card_expiry date;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS immigration_file_number text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS computer_card_number text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS mohre_company_number text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS chamber_commerce_number text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS chamber_commerce_expiry date;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS ejari_tawtheeq_number text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS ejari_tawtheeq_type text; -- 'ejari' or 'tawtheeq' or 'sharjah_municipality'
ALTER TABLE companies ADD COLUMN IF NOT EXISTS ejari_tawtheeq_expiry date;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS lease_expiry date;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS vat_trn text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS corporate_tax_number text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sponsor_name text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sponsor_eid text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS local_service_agent text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS poa_status text DEFAULT 'not_required' CHECK (poa_status IN ('active','expired','not_required'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS visa_quota_total int DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS visa_quota_used int DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS free_zone_authority text;

-- ─── Extend employees table ─────────────────────────────────────────────────

ALTER TABLE employees ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS marital_status text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS religion text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone_uae text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone_home text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS uae_address text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employment_type text DEFAULT 'full-time' CHECK (employment_type IN ('full-time','part-time','freelance'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS visa_type text DEFAULT 'employment' CHECK (visa_type IN ('employment','investor','partner','dependent','mission','visit','golden','maid'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS entry_permit_number text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS entry_permit_expiry date;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS visa_uid text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS visa_file_number text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS mohre_work_permit_number text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_permit_expiry date;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS medical_fitness_date date;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS medical_fitness_result text CHECK (medical_fitness_result IN ('fit','unfit','pending'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_insurance_provider text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_insurance_number text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_insurance_expiry date;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS wps_status text DEFAULT 'active' CHECK (wps_status IN ('active','inactive'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS basic_salary numeric(10,2);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS housing_allowance numeric(10,2);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS transport_allowance numeric(10,2);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS other_allowance numeric(10,2);

-- ─── Extend documents table ─────────────────────────────────────────────────

ALTER TABLE documents ADD COLUMN IF NOT EXISTS issue_date date;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS issuing_authority text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reference_number text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reminder_days int DEFAULT 30;

-- ─── New table: visa_process_steps ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS visa_process_steps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
  step_number int NOT NULL,
  step_name text NOT NULL,
  step_label text NOT NULL,
  status text DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','rejected','on_hold')),
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  gov_reference_number text,
  document_ids uuid[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visa_process_steps ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "admin_full_access_visa_steps" ON visa_process_steps
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Staff: can view/update steps on requests assigned to them
CREATE POLICY "staff_assigned_visa_steps" ON visa_process_steps
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests sr
      JOIN profiles p ON p.id = auth.uid()
      WHERE sr.id = visa_process_steps.request_id
        AND sr.assigned_to = auth.uid()
        AND p.role = 'pro_staff'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_requests sr
      JOIN profiles p ON p.id = auth.uid()
      WHERE sr.id = visa_process_steps.request_id
        AND sr.assigned_to = auth.uid()
        AND p.role = 'pro_staff'
    )
  );

-- Client: read-only on own requests
CREATE POLICY "client_own_visa_steps" ON visa_process_steps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests sr
      WHERE sr.id = visa_process_steps.request_id
        AND sr.client_id = auth.uid()
    )
  );

-- ─── New table: government_fees ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS government_fees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid REFERENCES service_requests(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id),
  employee_id uuid REFERENCES employees(id),
  fee_type text NOT NULL,
  description text,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash','bank_transfer','card','client_account')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('paid_by_yabs','reimbursed','pending_reimbursement','pending')),
  receipt_number text,
  paid_date date,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE government_fees ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "admin_full_access_gov_fees" ON government_fees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Staff: see fees on requests assigned to them
CREATE POLICY "staff_assigned_gov_fees" ON government_fees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests sr
      JOIN profiles p ON p.id = auth.uid()
      WHERE sr.id = government_fees.request_id
        AND sr.assigned_to = auth.uid()
        AND p.role = 'pro_staff'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_requests sr
      JOIN profiles p ON p.id = auth.uid()
      WHERE sr.id = government_fees.request_id
        AND sr.assigned_to = auth.uid()
        AND p.role = 'pro_staff'
    )
  );

-- Client: read-only on own request fees
CREATE POLICY "client_own_gov_fees" ON government_fees
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests sr
      WHERE sr.id = government_fees.request_id
        AND sr.client_id = auth.uid()
    )
  );

-- ─── Enable realtime ────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE visa_process_steps;
ALTER PUBLICATION supabase_realtime ADD TABLE government_fees;

-- Add pro_staff role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('client', 'admin', 'pro_staff'));

-- Request-Document linking table
CREATE TABLE IF NOT EXISTS request_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  file_name text,
  file_url text,
  doc_type text DEFAULT 'general' CHECK (doc_type IN ('required', 'submitted', 'processed', 'final', 'general')),
  notes text,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE request_documents ENABLE ROW LEVEL SECURITY;

-- RLS for request_documents
CREATE POLICY "Admins full access request_documents" ON request_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Staff see assigned request docs" ON request_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM service_requests WHERE id = request_id AND assigned_to = auth.uid())
);
CREATE POLICY "Staff upload to assigned requests" ON request_documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM service_requests WHERE id = request_id AND assigned_to = auth.uid())
);
CREATE POLICY "Clients see own request docs" ON request_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM service_requests WHERE id = request_id AND client_id = auth.uid())
);

-- Request checklist table
CREATE TABLE IF NOT EXISTS request_checklist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid REFERENCES service_requests(id) ON DELETE CASCADE NOT NULL,
  item text NOT NULL,
  is_completed boolean DEFAULT false,
  completed_by uuid REFERENCES profiles(id),
  completed_at timestamptz,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE request_checklist ENABLE ROW LEVEL SECURITY;

-- RLS for request_checklist
CREATE POLICY "Admins full access checklist" ON request_checklist FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Staff see assigned checklists" ON request_checklist FOR SELECT USING (
  EXISTS (SELECT 1 FROM service_requests WHERE id = request_id AND assigned_to = auth.uid())
);
CREATE POLICY "Staff update assigned checklists" ON request_checklist FOR UPDATE USING (
  EXISTS (SELECT 1 FROM service_requests WHERE id = request_id AND assigned_to = auth.uid())
);
CREATE POLICY "Clients see own checklists" ON request_checklist FOR SELECT USING (
  EXISTS (SELECT 1 FROM service_requests WHERE id = request_id AND client_id = auth.uid())
);

-- Add amendment tracking to service_requests
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS amended_by uuid REFERENCES profiles(id);
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS amended_at timestamptz;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS amendment_notes text;

-- Update service_requests RLS to include pro_staff
CREATE POLICY "Staff see assigned requests" ON service_requests FOR SELECT USING (
  assigned_to = auth.uid()
);
CREATE POLICY "Staff update assigned requests" ON service_requests FOR UPDATE USING (
  assigned_to = auth.uid()
);

-- Update request_timeline RLS for pro_staff
CREATE POLICY "Staff add timeline to assigned" ON request_timeline FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM service_requests WHERE id = request_id AND assigned_to = auth.uid())
);
CREATE POLICY "Staff see assigned timelines" ON request_timeline FOR SELECT USING (
  EXISTS (SELECT 1 FROM service_requests WHERE id = request_id AND assigned_to = auth.uid())
);

-- Update documents RLS for pro_staff
CREATE POLICY "Staff see docs for assigned requests" ON documents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM service_requests sr
    WHERE sr.company_id = documents.company_id AND sr.assigned_to = auth.uid()
  )
);

-- Enable realtime on new tables
ALTER PUBLICATION supabase_realtime ADD TABLE request_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE request_checklist;

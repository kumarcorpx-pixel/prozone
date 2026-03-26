CREATE TABLE IF NOT EXISTS checklist_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type text NOT NULL UNIQUE,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read templates" ON checklist_templates FOR SELECT USING (true);
CREATE POLICY "Admins manage templates" ON checklist_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed templates
INSERT INTO checklist_templates (service_type, items) VALUES
('Trade License Renewal', '["Collect current trade license copy","Verify sponsor/owner passport validity","Check Ejari/Tawtheeq is valid","Verify no pending DED violations or fines","Pay DED renewal fees online","Submit renewal application to DED","Pay government fees (DED + Chamber of Commerce)","Collect renewed trade license from DED"]'),
('New Employment Visa', '["Verify company visa quota availability","Collect employee passport copy + photo + degree certificates","Submit work permit application to MOHRE","Receive MOHRE work permit approval","Apply for entry permit through GDRFA","Receive entry permit","Employee enters UAE / change status","Book and complete medical fitness test","Apply for Emirates ID (ICA biometrics)","Submit labor contract on MOHRE portal","Submit passport for visa stamping at GDRFA","Collect Emirates ID and stamped passport"]'),
('Visa Renewal', '["Check visa and Emirates ID expiry dates","Complete medical fitness test","Renew health insurance","Apply for Emirates ID renewal","Submit work permit renewal to MOHRE","Pay renewal fees","Submit passport for visa stamping","Collect stamped passport and new Emirates ID"]'),
('Visa Cancellation', '["Submit cancellation application to MOHRE","Cancel health insurance","Process end-of-service settlement","Submit visa cancellation to GDRFA","Receive cancellation confirmation","Issue exit permit (if required)"]'),
('Company Formation (Mainland)', '["Reserve trade name with DED","Get initial approval from DED","Draft MOA/AOA documents","Notarize MOA at notary public","Sign tenancy contract and register Ejari/Tawtheeq","Submit final license application to DED","Pay license fees","Obtain trade license","Register with Chamber of Commerce","Apply for establishment card and immigration file"]'),
('Company Formation (Free Zone)', '["Submit initial approval to free zone authority","Receive initial approval","Prepare MOA and AOA documents","Confirm share capital deposit","Sign lease agreement with free zone","Submit final license application","Pay license and registration fees","Obtain final trade license from free zone"]'),
('Document Attestation', '["Collect original documents from client","Get translation (if needed)","Submit to MOFA for attestation","Submit to relevant embassy (if needed)","Deliver attested documents to client"]'),
('VAT Return Filing', '["Collect sales and purchase invoices","Prepare VAT return calculation","Client review and approval","Submit VAT return on FTA portal","Confirm payment and save acknowledgment"]');

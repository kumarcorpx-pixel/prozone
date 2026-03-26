-- ============================================================
-- Seed Data: ALBA CLEANING SERVICES L.L.C
-- ============================================================

-- Use a fixed UUID for the ALBA company so we can reference it
DO $$
DECLARE
  alba_id uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN

-- --------------------------------------------------------
-- Company
-- --------------------------------------------------------
INSERT INTO companies (
  id, name, trade_name, license_number, license_type, license_expiry,
  legal_form, status, emirate, jurisdiction, free_zone,
  address, po_box, phone, email, website,
  industry, activities, notes, incorporation_date
) VALUES (
  alba_id,
  'ALBA CLEANING SERVICES L.L.C',
  'ALBA CLEANING SERVICES',
  '1222123',
  'Commercial',
  '2026-08-21',
  'LLC',
  'active',
  'Dubai',
  'DED',
  NULL,
  'Office 308, A38, Port Saeed, Deira, Dubai',
  NULL,
  '+971 52 346 7749',
  'info@albaaservices.com',
  NULL,
  'Cleaning Services',
  ARRAY['Dry Ice Blast Cleaning', 'Carpets & Textiles Mending', 'Building Cleaning Services', 'Tanks & Containers Cleaning Services', 'Horse Equipment Repair'],
  'MOHRE Number: 49301980 | Company EID: 784-1989-4259296-9',
  NULL
);

-- --------------------------------------------------------
-- Primary Contact
-- --------------------------------------------------------
INSERT INTO company_contacts (company_id, name, designation, email, phone, is_primary) VALUES
  (alba_id, 'KRISHNA TADA TADA BALREDDY', 'Owner/Manager', 'info@albaaservices.com', '+971 52 346 7749', true);

-- --------------------------------------------------------
-- Employees (29 total - representative sample with realistic data)
-- --------------------------------------------------------
INSERT INTO employees (company_id, full_name, nationality, designation, visa_status, visa_expiry, emirates_id, emirates_id_expiry, passport_number, passport_expiry, labor_card_number, labor_card_expiry, salary, join_date, status) VALUES
  (alba_id, 'KRISHNA TADA TADA BALREDDY',   'Indian',      'General Manager',    'valid',         '2027-03-15', '784-1989-4259296-9', '2027-03-15', 'T2849563',  '2029-06-20', 'LC-2024-001', '2026-08-21', 15000, '2019-03-10', 'active'),
  (alba_id, 'MOHAMMED ASHRAF KHAN',          'Pakistani',   'Supervisor',         'valid',         '2026-11-22', '784-1991-7834521-3', '2026-11-22', 'AB1234567', '2028-09-14', 'LC-2024-002', '2026-08-21', 5500,  '2020-06-15', 'active'),
  (alba_id, 'RAMESH KUMAR SINGH',            'Indian',      'Cleaner',            'valid',         '2027-01-10', '784-1985-6712345-1', '2027-01-10', 'K9876543',  '2029-03-22', 'LC-2024-003', '2026-08-21', 2500,  '2021-01-20', 'active'),
  (alba_id, 'SURESH BAHADUR THAPA',          'Nepali',      'Cleaner',            'valid',         '2026-09-18', '784-1990-5543219-7', '2026-09-18', 'NP4567890', '2028-12-01', 'LC-2024-004', '2026-08-21', 2500,  '2021-04-05', 'active'),
  (alba_id, 'AJAY PRAKASH YADAV',            'Indian',      'Cleaner',            'valid',         '2027-02-28', '784-1988-3321098-5', '2027-02-28', 'L6543210',  '2029-07-15', 'LC-2024-005', '2026-08-21', 2500,  '2021-07-12', 'active'),
  (alba_id, 'ARJUN BABU TAMANG',             'Nepali',      'Cleaner',            'valid',         '2026-12-05', '784-1992-8876543-2', '2026-12-05', 'NP7654321', '2028-10-30', 'LC-2024-006', '2026-08-21', 2500,  '2021-09-01', 'active'),
  (alba_id, 'MANOJ KUMAR MANDAL',            'Indian',      'Cleaner',            'valid',         '2026-10-14', '784-1987-2209876-8', '2026-10-14', 'J3456789',  '2029-01-18', 'LC-2024-007', '2026-08-21', 2500,  '2022-01-10', 'active'),
  (alba_id, 'RAJU MIAH SARDER',              'Bangladeshi', 'Cleaner',            'valid',         '2027-04-20', '784-1993-1145678-4', '2027-04-20', 'BD8765432', '2030-05-10', 'LC-2024-008', '2026-08-21', 2500,  '2022-03-25', 'active'),
  (alba_id, 'VIKRAM SINGH RAJPUT',           'Indian',      'Heavy Equipment Op', 'valid',         '2026-11-30', '784-1986-9934567-6', '2026-11-30', 'M2345678',  '2028-08-22', 'LC-2024-009', '2026-08-21', 3500,  '2022-05-18', 'active'),
  (alba_id, 'DINESH PRASAD CHAUDHARY',       'Nepali',      'Cleaner',            'expiring_soon', '2026-06-15', '784-1994-4478901-0', '2026-06-15', 'NP1234567', '2029-11-05', 'LC-2024-010', '2026-08-21', 2500,  '2022-08-01', 'active'),
  (alba_id, 'SANJAY KUMAR THAKUR',           'Indian',      'Cleaner',            'valid',         '2027-05-10', '784-1989-5567890-3', '2027-05-10', 'H7890123',  '2030-02-28', 'LC-2024-011', '2026-08-21', 2500,  '2022-10-15', 'active'),
  (alba_id, 'BISHNU PRASAD KHATRI',          'Nepali',      'Cleaner',            'valid',         '2026-08-28', '784-1991-6656789-9', '2026-08-28', 'NP2345678', '2029-04-12', 'LC-2024-012', '2026-08-21', 2500,  '2023-01-08', 'active'),
  (alba_id, 'KAMAL HOSSAIN MOLLAH',          'Bangladeshi', 'Cleaner',            'valid',         '2027-01-25', '784-1990-7745678-1', '2027-01-25', 'BD3456789', '2028-07-19', 'LC-2024-013', '2026-08-21', 2500,  '2023-03-20', 'active'),
  (alba_id, 'PRAKASH BAHADUR GURUNG',        'Nepali',      'Dry Ice Technician', 'valid',         '2027-03-08', '784-1988-8834567-7', '2027-03-08', 'NP3456789', '2030-01-25', 'LC-2024-014', '2026-08-21', 3000,  '2023-05-10', 'active'),
  (alba_id, 'ANIL KUMAR PASWAN',             'Indian',      'Cleaner',            'valid',         '2026-12-20', '784-1992-9923456-5', '2026-12-20', 'P8901234',  '2029-09-08', 'LC-2024-015', '2026-08-21', 2500,  '2023-06-28', 'active'),
  (alba_id, 'NABIN SHRESTHA',                'Nepali',      'Cleaner',            'valid',         '2027-02-14', '784-1993-1012345-2', '2027-02-14', 'NP4567891', '2028-11-16', 'LC-2024-016', '2026-08-21', 2500,  '2023-08-15', 'active'),
  (alba_id, 'MD RAFIQUL ISLAM',              'Bangladeshi', 'Cleaner',            'valid',         '2026-10-30', '784-1987-2101234-8', '2026-10-30', 'BD4567890', '2029-06-03', 'LC-2024-017', '2026-08-21', 2500,  '2023-09-22', 'active'),
  (alba_id, 'DEEPAK RAJ BHATT',              'Nepali',      'Cleaner',            'valid',         '2027-04-05', '784-1994-3290123-4', '2027-04-05', 'NP5678901', '2030-03-14', 'LC-2024-018', '2026-08-21', 2500,  '2023-11-01', 'active'),
  (alba_id, 'ROHIT KUMAR MAHATO',            'Indian',      'Cleaner',            'valid',         '2027-01-18', '784-1986-4389012-0', '2027-01-18', 'N5678901',  '2029-08-20', 'LC-2024-019', '2026-08-21', 2500,  '2024-01-10', 'active'),
  (alba_id, 'SANTOSH KUMAR RAI',             'Nepali',      'Cleaner',            'valid',         '2026-11-08', '784-1991-5478901-6', '2026-11-08', 'NP6789012', '2028-12-28', 'LC-2024-020', '2026-08-21', 2500,  '2024-02-18', 'active'),
  (alba_id, 'FARUK AHMED MIAH',              'Bangladeshi', 'Cleaner',            'valid',         '2027-05-22', '784-1989-6567890-3', '2027-05-22', 'BD5678901', '2030-04-10', 'LC-2024-021', '2026-08-21', 2500,  '2024-03-25', 'active'),
  (alba_id, 'GOVINDA PRASAD POKHAREL',       'Nepali',      'Cleaner',            'valid',         '2026-09-30', '784-1990-7656789-9', '2026-09-30', 'NP7890123', '2029-02-15', 'LC-2024-022', '2026-08-21', 2500,  '2024-05-08', 'active'),
  (alba_id, 'RAJESH KUMAR CHAUHAN',          'Indian',      'Cleaner',            'expiring_soon', '2026-05-20', '784-1988-8745678-1', '2026-05-20', 'R1234567',  '2029-10-05', 'LC-2024-023', '2026-08-21', 2500,  '2024-06-12', 'active'),
  (alba_id, 'KUMAR BAHADUR LIMBU',           'Nepali',      'Cleaner',            'valid',         '2027-02-01', '784-1992-9834567-7', '2027-02-01', 'NP8901234', '2030-06-18', 'LC-2024-024', '2026-08-21', 2500,  '2024-07-20', 'active'),
  (alba_id, 'IMRAN HOSSAIN',                 'Bangladeshi', 'Cleaner',            'valid',         '2026-12-12', '784-1993-0923456-5', '2026-12-12', 'BD6789012', '2028-09-25', 'LC-2024-025', '2026-08-21', 2500,  '2024-08-30', 'active'),
  (alba_id, 'PRADEEP KUMAR YADAV',           'Indian',      'Cleaner',            'valid',         '2027-03-28', '784-1987-1012345-2', '2027-03-28', 'Q2345678',  '2029-12-10', 'LC-2024-026', '2026-08-21', 2500,  '2024-10-05', 'active'),
  (alba_id, 'DIPENDRA GURUNG',               'Nepali',      'Cleaner',            'processing',    NULL,         NULL,                  NULL,         'NP9012345', '2030-07-22', NULL,          NULL,          2500,  '2025-01-15', 'active'),
  (alba_id, 'SHAKIL AHMED',                  'Bangladeshi', 'Cleaner',            'processing',    NULL,         NULL,                  NULL,         'BD7890123', '2029-05-30', NULL,          NULL,          2500,  '2025-02-01', 'active'),
  (alba_id, 'HARI BAHADUR MAGAR',            'Nepali',      'Cleaner',            'valid',         '2027-06-10', '784-1994-2201234-8', '2027-06-10', 'NP0123456', '2030-08-15', 'LC-2024-029', '2026-08-21', 2500,  '2025-03-01', 'active');

-- --------------------------------------------------------
-- Company Documents
-- --------------------------------------------------------
INSERT INTO documents (company_id, name, document_type, expiry_date, status, notes) VALUES
  (alba_id, 'Trade License - 1222123',            'trade_license',      '2026-08-21', 'valid',   'DED Commercial License No. 1222123'),
  (alba_id, 'Memorandum of Association',           'memorandum',         NULL,         'valid',   'MOA Document No. 12800438'),
  (alba_id, 'Ejari - Tenancy Contract',            'tenancy_contract',   '2026-08-17', 'valid',   'Office 308, A38, Port Saeed, Deira, Dubai'),
  (alba_id, 'MOHRE Establishment Card',            'establishment_card', '2026-08-21', 'valid',   'MOHRE No. 49301980');

-- --------------------------------------------------------
-- Shareholder
-- --------------------------------------------------------
INSERT INTO shareholders (company_id, name, nationality, share_percentage, share_type, is_active) VALUES
  (alba_id, 'KRISHNA TADA TADA BALREDDY', 'Indian', 100, 'Owner', true);

-- --------------------------------------------------------
-- WPS Data
-- --------------------------------------------------------
INSERT INTO wps_data (
  company_id, total_employees, wps_covered, not_covered, expired_work_cards,
  compliance_percentage, total_monthly_salary, salary_paid, salary_pending,
  average_salary, male_employees, female_employees, skilled_workers, unskilled_workers
) VALUES (
  alba_id, 29, 27, 2, 0,
  93.10, 82000, 80000, 2000,
  2827.59, 29, 0, 3, 26
);

-- --------------------------------------------------------
-- Monthly Uploads (current year tracking)
-- --------------------------------------------------------
INSERT INTO monthly_uploads (company_id, month, year, employee_list, wps_report, company_report, gdrfad_report) VALUES
  (alba_id, 1, 2026, true, true, true, true),
  (alba_id, 2, 2026, true, true, true, false),
  (alba_id, 3, 2026, true, false, false, false);

END $$;

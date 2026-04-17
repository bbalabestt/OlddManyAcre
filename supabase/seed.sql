-- ============================================================
-- Widing Platform — Seed Data
-- Run after 001_initial_schema.sql to populate dev/staging DB
-- ============================================================

-- ── BRANCHES ──────────────────────────────────────────────────────────────────
INSERT INTO branches (id, name, address_detail, province, branch_type, contact_info, total_capacity, number_of_floors, operating_hours, google_maps_link) VALUES
  ('branch-bkk-sukhumvit', 'สาขาสุขุมวิท (กรุงเทพ)',   '123/45 ซ.สุขุมวิท 21',  'กรุงเทพมหานคร', 'Owned',    '02-xxx-xxxx', '500 sq m',  3, 'จ–ศ 08:00–20:00 · ส–อา 09:00–18:00', NULL),
  ('branch-bkk-nawamin',   'สาขานวมินทร์ (กรุงเทพ)',    '88/12 ถ.นวมินทร์',       'กรุงเทพมหานคร', 'Owned',    '02-xxx-xxxy', '800 sq m',  4, 'จ–ศ 08:00–20:00 · ส–อา 09:00–18:00', NULL),
  ('branch-bkk-bangna',    'สาขาบางนา (กรุงเทพ)',       '200 ถ.บางนา-ตราด กม.3',  'กรุงเทพมหานคร', 'Partner',  '02-xxx-xxxz', '1200 sq m', 2, 'จ–ศ 08:00–18:00',                    NULL),
  ('branch-bkk-ratchada',  'สาขารัชดา (กรุงเทพ)',       '55 ถ.รัชดาภิเษก',        'กรุงเทพมหานคร', 'Franchise','02-xxx-xxxw', '300 sq m',  2, 'จ–ศ 09:00–19:00 · ส 09:00–15:00',  NULL)
ON CONFLICT (id) DO NOTHING;

-- ── CLIENTS ───────────────────────────────────────────────────────────────────
INSERT INTO clients (id, name, phone, status, origin_location_type, line_id, joined_date) VALUES
  ('client-001', 'สมชาย จันทร์ดี',   '081-234-5678', 'Active',          'Condo', '@somchai',    '2025-01-15'),
  ('client-002', 'นัตตาพร สุขใจ',    '082-345-6789', 'Active',          'Home',  '@natt',       '2025-02-20'),
  ('client-003', 'วันชัย ประดิษฐ์',   '083-456-7890', 'Active',          'Home',  '@wanchai',    '2025-03-10'),
  ('client-004', 'ศิริวรรณ แก้วกล้า', '084-567-8901', 'AwaitingRenewal', 'Condo', '@siriwan',    '2025-04-05'),
  ('client-005', 'ปัทชรา มุ่งคาม',    '085-678-9012', 'Active',          'Home',  '@patchara',   '2025-05-12'),
  ('client-006', 'วิชัย รักดี',       '086-789-0123', 'Churned',         'Home',   NULL,          '2024-11-01')
ON CONFLICT (id) DO NOTHING;

-- ── UNITS ─────────────────────────────────────────────────────────────────────
INSERT INTO units (id, branch_id, branch_name, unit_identifier, unit_type, floor, zone, status, monthly_rate, current_client_id, current_client_name, billing_cycle_end_date) VALUES
  -- สุขุมวิท ชั้น 1 Zone A — Document Boxes
  ('unit-box-a001', 'branch-bkk-sukhumvit', 'สาขาสุขุมวิท (กรุงเทพ)', 'BOX-A-001', 'DocumentBox', 1, 'A', 'Available', 150,   NULL,         NULL,              NULL),
  ('unit-box-a002', 'branch-bkk-sukhumvit', 'สาขาสุขุมวิท (กรุงเทพ)', 'BOX-A-002', 'DocumentBox', 1, 'A', 'Occupied',  150,   'client-001', 'สมชาย จันทร์ดี', '2026-06-01'),
  ('unit-box-a003', 'branch-bkk-sukhumvit', 'สาขาสุขุมวิท (กรุงเทพ)', 'BOX-A-003', 'DocumentBox', 1, 'A', 'Occupied',  150,   'client-003', 'วันชัย ประดิษฐ์', '2026-07-01'),
  ('unit-box-a004', 'branch-bkk-sukhumvit', 'สาขาสุขุมวิท (กรุงเทพ)', 'BOX-A-004', 'DocumentBox', 1, 'A', 'Available', 150,   NULL,         NULL,              NULL),
  ('unit-box-a005', 'branch-bkk-sukhumvit', 'สาขาสุขุมวิท (กรุงเทพ)', 'BOX-A-005', 'DocumentBox', 1, 'A', 'AwaitingRenewal', 150, 'client-004', 'ศิริวรรณ แก้วกล้า', '2026-04-30'),
  -- สุขุมวิท ชั้น 1 Zone B — Storage Spaces
  ('unit-spc-b001', 'branch-bkk-sukhumvit', 'สาขาสุขุมวิท (กรุงเทพ)', 'SPC-B-001', 'StorageSpace', 1, 'B', 'Available',  3200,  NULL,         NULL,              NULL),
  ('unit-spc-b002', 'branch-bkk-sukhumvit', 'สาขาสุขุมวิท (กรุงเทพ)', 'SPC-B-002', 'StorageSpace', 1, 'B', 'Occupied',   7200,  'client-001', 'สมชาย จันทร์ดี', '2026-05-15'),
  ('unit-spc-b003', 'branch-bkk-sukhumvit', 'สาขาสุขุมวิท (กรุงเทพ)', 'SPC-B-003', 'StorageSpace', 1, 'B', 'Reserved',   3200,  'client-002', 'นัตตาพร สุขใจ',  '2026-05-20'),
  -- สุขุมวิท ชั้น 2 Zone C
  ('unit-spc-c001', 'branch-bkk-sukhumvit', 'สาขาสุขุมวิท (กรุงเทพ)', 'SPC-C-001', 'StorageSpace', 2, 'C', 'Maintenance',12800, NULL,         NULL,              NULL),
  ('unit-spc-c002', 'branch-bkk-sukhumvit', 'สาขาสุขุมวิท (กรุงเทพ)', 'SPC-C-002', 'StorageSpace', 2, 'C', 'Available',  7200,  NULL,         NULL,              NULL),
  -- นวมินทร์
  ('unit-nwm-b001', 'branch-bkk-nawamin',   'สาขานวมินทร์ (กรุงเทพ)',  'SPC-B-001', 'StorageSpace', 1, 'B', 'Occupied',   4800,  'client-005', 'ปัทชรา มุ่งคาม', '2026-05-10'),
  ('unit-nwm-a001', 'branch-bkk-nawamin',   'สาขานวมินทร์ (กรุงเทพ)',  'BOX-A-001', 'DocumentBox',  1, 'A', 'Available',  150,   NULL,         NULL,              NULL)
ON CONFLICT (id) DO NOTHING;

-- Update StorageSpace dimensions
UPDATE units SET width_m=2, length_m=2, total_sqm=4   WHERE id='unit-spc-b001';
UPDATE units SET width_m=3, length_m=3, total_sqm=9   WHERE id='unit-spc-b002';
UPDATE units SET width_m=2, length_m=2, total_sqm=4   WHERE id='unit-spc-b003';
UPDATE units SET width_m=4, length_m=4, total_sqm=16  WHERE id='unit-spc-c001';
UPDATE units SET width_m=3, length_m=3, total_sqm=9   WHERE id='unit-spc-c002';
UPDATE units SET width_m=2, length_m=3, total_sqm=6   WHERE id='unit-nwm-b001';

-- ── ORDERS ────────────────────────────────────────────────────────────────────
INSERT INTO orders (id, service_type, storage_sub_type, status, client_id, client_name, client_phone, service_address, items_description, service_date, payment_cycle, monthly_rate, branch_id, branch_name, unit_id, unit_identifier) VALUES
  ('ord-001', 'Storage', 'StorageSpace', 'Active',   'client-001', 'สมชาย จันทร์ดี',   '081-234-5678', '123 ซ.สุขุมวิท 21', 'เฟอร์นิเจอร์ชุดห้องนั่งเล่น', '2026-02-15', 'Monthly', 7200,  'branch-bkk-sukhumvit', 'สาขาสุขุมวิท', 'unit-spc-b002', 'SPC-B-002'),
  ('ord-002', 'Storage', 'DocumentBox',  'Active',   'client-003', 'วันชัย ประดิษฐ์',   '083-456-7890', '55 ถ.นวมินทร์',     'กล่องเอกสารบริษัท 5 กล่อง',    '2026-03-10', 'Monthly', 150,   'branch-bkk-sukhumvit', 'สาขาสุขุมวิท', 'unit-box-a003', 'BOX-A-003'),
  ('ord-003', 'Storage', 'StorageSpace', 'Confirmed','client-002', 'นัตตาพร สุขใจ',    '082-345-6789', '88 ถ.สุขาภิบาล 5',  'ของจิปาถะ กล่อง 20 ใบ',       '2026-04-20', 'Monthly', 3200,  'branch-bkk-sukhumvit', 'สาขาสุขุมวิท', 'unit-spc-b003', 'SPC-B-003'),
  ('ord-004', 'Storage', 'StorageSpace', 'Active',   'client-005', 'ปัทชรา มุ่งคาม',    '085-678-9012', '200 ถ.นวมินทร์',    'อุปกรณ์กีฬา',                  '2026-03-05', 'Monthly', 4800,  'branch-bkk-nawamin',   'สาขานวมินทร์', 'unit-nwm-b001', 'SPC-B-001'),
  ('ord-005', 'Delivery','PickupAndStore','Pending',  NULL,         'วิภาวดี รัตนมาลา',  '089-000-1111', '30/5 ถ.รัชดา ลาดพร้าว', 'เครื่องใช้ไฟฟ้าต่างๆ',       '2026-04-25', 'Monthly', 6400,  NULL,                   NULL,           NULL,            NULL),
  ('ord-006', 'Storage', 'DocumentBox',  'Draft',    NULL,         'ประยุทธ สุขสม',     '090-111-2222', '10 ซ.อ่อนนุช',      'เอกสารกฎหมาย 10 กล่อง',       '2026-04-28', 'Annual',  1500,  NULL,                   NULL,           NULL,            NULL)
ON CONFLICT (id) DO NOTHING;

-- ── ALLOCATED SPACES (LEGACY) ─────────────────────────────────────────────────
INSERT INTO allocated_spaces (id, client_id, client_name, branch_id, branch_name, used_space_sqm, status, allocation_date, current_billing_cycle_end_date, internal_unit_identifier) VALUES
  ('alloc-001', 'client-001', 'สมชาย จันทร์ดี',   'branch-bkk-sukhumvit', 'สาขาสุขุมวิท', 9,  'Occupied',        '2026-02-15', '2026-05-15', 'SPC-B-002'),
  ('alloc-002', 'client-002', 'นัตตาพร สุขใจ',    'branch-bkk-sukhumvit', 'สาขาสุขุมวิท', 4,  'Reserved',        '2026-04-20', '2026-05-20', 'SPC-B-003'),
  ('alloc-003', 'client-004', 'ศิริวรรณ แก้วกล้า', 'branch-bkk-sukhumvit', 'สาขาสุขุมวิท', 4,  'AwaitingRenewal', '2026-01-05', '2026-04-30', 'BOX-A-005'),
  ('alloc-004', 'client-005', 'ปัทชรา มุ่งคาม',    'branch-bkk-nawamin',   'สาขานวมินทร์', 6,  'Occupied',        '2026-03-05', '2026-05-10', 'SPC-B-001'),
  ('alloc-005', 'client-006', 'วิชัย รักดี',       'branch-bkk-sukhumvit', 'สาขาสุขุมวิท', 12, 'Released',        '2025-06-01', NULL,         'SPC-C-OLD')
ON CONFLICT (id) DO NOTHING;

-- ── TRANSACTIONS ──────────────────────────────────────────────────────────────
INSERT INTO transactions (id, client_id, client_name, date, type, amount, method, status, description, related_allocation_id, related_branch_id, invoice_status, receipt_status) VALUES
  ('txn-001', 'client-001', 'สมชาย จันทร์ดี',   '2026-02-15', 'FullAmount',    7200,  'BankTransfer', 'Completed', 'เดือนแรก SPC-B-002',       'alloc-001', 'branch-bkk-sukhumvit', 'Sent',    'Sent'),
  ('txn-002', 'client-001', 'สมชาย จันทร์ดี',   '2026-03-15', 'Subscription',  7200,  'BankTransfer', 'Completed', 'เดือนที่ 2 SPC-B-002',     'alloc-001', 'branch-bkk-sukhumvit', 'Sent',    'Sent'),
  ('txn-003', 'client-001', 'สมชาย จันทร์ดี',   '2026-04-15', 'Subscription',  7200,  'BankTransfer', 'Completed', 'เดือนที่ 3 SPC-B-002',     'alloc-001', 'branch-bkk-sukhumvit', 'Created', 'NotYet'),
  ('txn-004', 'client-002', 'นัตตาพร สุขใจ',    '2026-04-20', 'FullAmount',    3200,  'Online',       'Completed', 'เดือนแรก SPC-B-003',       'alloc-002', 'branch-bkk-sukhumvit', 'Sent',    'Sent'),
  ('txn-005', 'client-005', 'ปัทชรา มุ่งคาม',    '2026-03-05', 'FullAmount',    4800,  'Cash',         'Completed', 'เดือนแรก SPC-B-001 (นวมินทร์)', 'alloc-004', 'branch-bkk-nawamin', 'NotYet', 'NotYet'),
  ('txn-006', 'client-004', 'ศิริวรรณ แก้วกล้า', '2026-04-30', 'Subscription',  150,   'BankTransfer', 'Pending',   'ต่ออายุ BOX-A-005',        'alloc-003', 'branch-bkk-sukhumvit', 'NotYet', 'NotYet')
ON CONFLICT (id) DO NOTHING;

-- ── PLATFORM ACTIVITIES ───────────────────────────────────────────────────────
INSERT INTO platform_activities (id, timestamp, type, action, description, entity_id, entity_name, details_link) VALUES
  ('act-001', NOW() - INTERVAL '2 days',  'Unit',        'Created',       'สร้างยูนิต SPC-B-002 ที่สาขาสุขุมวิท',          'unit-spc-b002', 'SPC-B-002',       '/units/unit-spc-b002'),
  ('act-002', NOW() - INTERVAL '2 days',  'Order',       'Created',       'สร้าง Order ORD-001 สำหรับ สมชาย จันทร์ดี',     'ord-001',       'ORD-001',         '/orders/ord-001'),
  ('act-003', NOW() - INTERVAL '1 day',   'Unit',        'StatusChanged', 'SPC-B-002 เปลี่ยนสถานะ Available → Occupied',    'unit-spc-b002', 'SPC-B-002',       '/units/unit-spc-b002'),
  ('act-004', NOW() - INTERVAL '12 hours','Transaction', 'Created',       'บันทึก Transaction ฿7,200 สมชาย จันทร์ดี',      'txn-003',       'Transaction',     '/transactions/txn-003'),
  ('act-005', NOW() - INTERVAL '3 hours', 'Order',       'Created',       'สร้าง Order ORD-005 (Delivery) วิภาวดี รัตนมาลา','ord-005',      'ORD-005 Delivery','/orders/ord-005'),
  ('act-006', NOW() - INTERVAL '30 minutes','Client',    'Created',       'เพิ่มลูกค้าใหม่: ประยุทธ สุขสม',               NULL,            'ประยุทธ สุขสม',   '/clients')
ON CONFLICT (id) DO NOTHING;

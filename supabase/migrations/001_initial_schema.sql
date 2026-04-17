-- ============================================================
-- Widing Platform — Unified Schema
-- Covers: Legacy (branches, clients, bookings, allocations, transactions)
--       + New (units, orders)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── BRANCHES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branches (
  id                      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name                    TEXT NOT NULL,
  address_detail          TEXT,
  province                TEXT,
  district                TEXT,
  sub_district            TEXT,
  postcode                TEXT,
  contact_info            TEXT NOT NULL DEFAULT '',
  total_capacity          TEXT NOT NULL DEFAULT '0 sq m',
  occupied_capacity       TEXT,
  available_spaces        INTEGER,
  remaining_bulk_capacity TEXT,
  ceiling_height_meters   DECIMAL(5,2),
  number_of_floors        INTEGER DEFAULT 1,
  branch_type             TEXT NOT NULL CHECK (branch_type IN ('Owned','Partner','Franchise')),
  branch_owner            TEXT,
  operating_hours         TEXT,
  google_maps_link        TEXT,
  payout_day_of_month     INTEGER,
  commission_rate_percent DECIMAL(5,2),
  commission_notes        TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CLIENTS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id                      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name                    TEXT NOT NULL,
  name_en                 TEXT,
  nickname                TEXT,
  email                   TEXT,
  phone                   TEXT NOT NULL,
  phone_alt               TEXT,
  joined_date             DATE NOT NULL DEFAULT CURRENT_DATE,
  status                  TEXT NOT NULL DEFAULT 'Prospect'
                            CHECK (status IN ('Prospect','Active','Churned','ReturnCompleted')),
  line_id                 TEXT,
  facebook                TEXT,
  instagram               TEXT,
  other_social            TEXT,
  origin_location_type    TEXT NOT NULL DEFAULT 'Home'
                            CHECK (origin_location_type IN ('Home','Condo')),
  origin_street_address   TEXT,
  origin_floor            TEXT,
  has_elevator            BOOLEAN,
  origin_province         TEXT,
  origin_district         TEXT,
  origin_sub_district     TEXT,
  origin_postcode         TEXT,
  preferred_payment_cycle TEXT CHECK (preferred_payment_cycle IN ('Monthly','Annual')),
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── UNITS (NEW — replaces legacy spaces) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS units (
  id                      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  branch_id               TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  branch_name             TEXT NOT NULL,
  unit_identifier         TEXT NOT NULL,
  unit_type               TEXT NOT NULL CHECK (unit_type IN ('DocumentBox','StorageSpace')),
  floor                   INTEGER NOT NULL DEFAULT 1,
  zone                    TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'Available'
                            CHECK (status IN ('Available','Occupied','Reserved','Maintenance','AwaitingRenewal')),
  -- StorageSpace fields
  width_m                 DECIMAL(6,2),
  length_m                DECIMAL(6,2),
  total_sqm               DECIMAL(8,2),
  -- DocumentBox field
  box_capacity            INTEGER,
  -- Billing
  monthly_rate            DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_client_id       TEXT REFERENCES clients(id) ON DELETE SET NULL,
  current_client_name     TEXT,
  current_order_id        TEXT,
  billing_cycle_end_date  DATE,
  -- Floor plan 2D positioning
  floor_plan_x            INTEGER,
  floor_plan_y            INTEGER,
  floor_plan_w            INTEGER,
  floor_plan_h            INTEGER,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (branch_id, unit_identifier)
);

-- ── ORDERS (NEW — unified storage + delivery orders) ──────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  service_type        TEXT NOT NULL CHECK (service_type IN ('Storage','Delivery')),
  storage_sub_type    TEXT CHECK (storage_sub_type IN ('DocumentBox','StorageSpace')),
  delivery_sub_type   TEXT CHECK (delivery_sub_type IN ('PickupAndStore','ReturnDelivery','MovingService')),
  status              TEXT NOT NULL DEFAULT 'Draft'
                        CHECK (status IN ('Draft','Pending','Confirmed','Active','AwaitingReturn','Completed','Cancelled')),
  -- Customer
  client_id           TEXT REFERENCES clients(id) ON DELETE SET NULL,
  client_name         TEXT NOT NULL,
  client_phone        TEXT NOT NULL,
  client_email        TEXT,
  client_line_id      TEXT,
  client_facebook     TEXT,
  -- Service address
  service_address     TEXT NOT NULL,
  service_floor       TEXT,
  has_elevator        BOOLEAN,
  -- Items
  items_description   TEXT NOT NULL,
  item_categories     TEXT[],
  -- Duration & quantity
  service_date        DATE NOT NULL,
  storage_duration    TEXT,
  storage_end_date    DATE,
  quantity            INTEGER,
  quantity_unit       TEXT CHECK (quantity_unit IN ('กล่อง','ตร.ม.','ชิ้น')),
  -- Payment
  payment_cycle       TEXT CHECK (payment_cycle IN ('Monthly','Annual')),
  monthly_rate        DECIMAL(10,2),
  first_month_total   DECIMAL(10,2),
  commission_rate     DECIMAL(5,2),
  -- Assignment
  branch_id           TEXT REFERENCES branches(id) ON DELETE SET NULL,
  branch_name         TEXT,
  unit_id             TEXT REFERENCES units(id) ON DELETE SET NULL,
  unit_identifier     TEXT,
  -- e-Contract
  e_contract_status   TEXT CHECK (e_contract_status IN ('Draft','Sent','Signed')),
  -- Staff
  sale_staff_id       TEXT,
  sale_staff_name     TEXT,
  staff_notes         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── BOOKINGS (LEGACY) ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  branch_id                       TEXT REFERENCES branches(id) ON DELETE SET NULL,
  branch_name                     TEXT,
  client_id                       TEXT REFERENCES clients(id) ON DELETE SET NULL,
  client_name                     TEXT,
  driver_name                     TEXT NOT NULL DEFAULT '',
  vehicle_info                    TEXT,
  booking_type                    TEXT NOT NULL CHECK (booking_type IN ('Pick-up','Return')),
  start_time                      TIMESTAMPTZ NOT NULL,
  end_time                        TIMESTAMPTZ NOT NULL,
  status                          TEXT NOT NULL DEFAULT 'Pending'
                                    CHECK (status IN ('Pending','Processing','Pre-confirmed','Confirmed','InTransit','AwaitingAllocation','Completed','Cancelled')),
  is_adding_to_existing_storage   BOOLEAN DEFAULT FALSE,
  linked_allocation_id            TEXT,
  desired_width_sqm               DECIMAL(6,2),
  desired_length_sqm              DECIMAL(6,2),
  has_docking_area                BOOLEAN,
  has_car_parking_fee             BOOLEAN,
  has_elevator                    BOOLEAN,
  has_big_furniture               BOOLEAN,
  big_furniture_max_width_cm      INTEGER,
  big_furniture_max_height_cm     INTEGER,
  needs_wrapping                  BOOLEAN,
  disassembly_option              TEXT CHECK (disassembly_option IN ('none','all','specific')),
  number_of_items_to_disassemble  INTEGER,
  customer_self_delivery          BOOLEAN DEFAULT FALSE,
  customer_notes                  TEXT,
  staff_notes                     TEXT,
  origin_floor                    TEXT,
  origin_phone_number             TEXT,
  origin_available_time_slots     TEXT,
  origin_google_maps_link         TEXT,
  destination_street_address      TEXT,
  destination_floor               TEXT,
  destination_province            TEXT,
  destination_district            TEXT,
  destination_sub_district        TEXT,
  destination_postcode            TEXT,
  destination_phone_number        TEXT,
  destination_available_time_slots TEXT,
  destination_google_maps_link    TEXT,
  suggested_internal_unit_identifier TEXT,
  selected_allocation_id          TEXT,
  chosen_delivery_option_id       TEXT,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ALLOCATED_SPACES / FLEXIBLE ALLOCATIONS (LEGACY) ─────────────────────────
CREATE TABLE IF NOT EXISTS allocated_spaces (
  id                              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id                       TEXT REFERENCES clients(id) ON DELETE SET NULL,
  client_name                     TEXT NOT NULL,
  branch_id                       TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  branch_name                     TEXT NOT NULL,
  used_space_sqm                  DECIMAL(8,2) NOT NULL,
  status                          TEXT NOT NULL DEFAULT 'Occupied'
                                    CHECK (status IN ('Occupied','Reserved','AwaitingExtensionPayment','Released','AwaitingRenewal')),
  allocation_date                 DATE NOT NULL DEFAULT CURRENT_DATE,
  notes                           TEXT,
  internal_unit_identifier        TEXT,
  related_booking_id              TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  requested_extended_space_sqm    DECIMAL(8,2),
  additional_fee_for_extension    DECIMAL(10,2),
  extension_request_date          DATE,
  release_date                    DATE,
  current_billing_cycle_end_date  DATE,
  months_extended                 INTEGER DEFAULT 0,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TRANSACTIONS (LEGACY) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  booking_id            TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  client_id             TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name           TEXT,
  date                  DATE NOT NULL DEFAULT CURRENT_DATE,
  type                  TEXT NOT NULL
                          CHECK (type IN ('FullAmount','Subscription','Refund','DeliveryOnly','Other','ExtensionFee')),
  amount                DECIMAL(12,2) NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'THB',
  method                TEXT CHECK (method IN ('Cash','CreditCard','BankTransfer','Online','Other')),
  status                TEXT NOT NULL DEFAULT 'Pending'
                          CHECK (status IN ('Pending','Completed','Failed','Cancelled')),
  description           TEXT,
  related_space_id      TEXT,
  related_allocation_id TEXT REFERENCES allocated_spaces(id) ON DELETE SET NULL,
  related_branch_id     TEXT REFERENCES branches(id) ON DELETE SET NULL,
  invoice_status        TEXT NOT NULL DEFAULT 'NotYet'
                          CHECK (invoice_status IN ('NotYet','Created','Sent')),
  receipt_status        TEXT NOT NULL DEFAULT 'NotYet'
                          CHECK (receipt_status IN ('NotYet','Created','Sent')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PLATFORM_ACTIVITIES (AUDIT LOG) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_activities (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type         TEXT NOT NULL
                 CHECK (type IN ('Booking','Client','Branch','Transaction','Allocation','Unit','Order','User','System')),
  action       TEXT NOT NULL
                 CHECK (action IN ('Created','Updated','Deleted','StatusChanged','LoggedIn','LoggedOut')),
  description  TEXT NOT NULL,
  entity_id    TEXT,
  entity_name  TEXT,
  user_id      TEXT,
  user_name    TEXT,
  details_link TEXT
);

-- ── DELIVERY OPTIONS (LEGACY) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_options (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  booking_id        TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider_name     TEXT NOT NULL,
  other_provider_name TEXT,
  estimated_cost    DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'THB',
  pic_phone_number  TEXT,
  is_recommended    BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── UPDATED_AT TRIGGER ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER branches_updated_at    BEFORE UPDATE ON branches    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  CREATE TRIGGER clients_updated_at     BEFORE UPDATE ON clients     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  CREATE TRIGGER units_updated_at       BEFORE UPDATE ON units       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  CREATE TRIGGER orders_updated_at      BEFORE UPDATE ON orders      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  CREATE TRIGGER allocations_updated_at BEFORE UPDATE ON allocated_spaces FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── INDEXES ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_units_branch_id    ON units(branch_id);
CREATE INDEX IF NOT EXISTS idx_units_status       ON units(status);
CREATE INDEX IF NOT EXISTS idx_units_type         ON units(unit_type);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_client_id   ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_unit_id     ON orders(unit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status    ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp   ON platform_activities(timestamp DESC);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
ALTER TABLE branches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE units             ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocated_spaces  ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_options  ENABLE ROW LEVEL SECURITY;

-- Back office: service role bypasses RLS; anon key reads all (adjust per your auth strategy)
CREATE POLICY "Allow all for authenticated" ON branches          FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON clients           FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON units             FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON orders            FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON bookings          FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON allocated_spaces  FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON transactions      FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON platform_activities FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON delivery_options  FOR ALL USING (true);

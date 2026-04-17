/**
 * Widing Platform — Supabase Database Types
 * Auto-generated shape matching 001_initial_schema.sql
 * Snake_case columns map 1:1 to camelCase TypeScript via the db/ helpers.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      branches: {
        Row: BranchRow;
        Insert: Omit<BranchRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<BranchRow, 'id'>>;
        Relationships: [];
      };
      clients: {
        Row: ClientRow;
        Insert: Omit<ClientRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<ClientRow, 'id'>>;
        Relationships: [];
      };
      units: {
        Row: UnitRow;
        Insert: Omit<UnitRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<UnitRow, 'id'>>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: Omit<OrderRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<OrderRow, 'id'>>;
        Relationships: [];
      };
      bookings: {
        Row: BookingRow;
        Insert: Omit<BookingRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<BookingRow, 'id'>>;
        Relationships: [];
      };
      allocated_spaces: {
        Row: AllocatedSpaceRow;
        Insert: Omit<AllocatedSpaceRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<AllocatedSpaceRow, 'id'>>;
        Relationships: [];
      };
      transactions: {
        Row: TransactionRow;
        Insert: Omit<TransactionRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<TransactionRow, 'id'>>;
        Relationships: [];
      };
      platform_activities: {
        Row: ActivityRow;
        Insert: Omit<ActivityRow, 'id'> & { id?: string };
        Update: Partial<Omit<ActivityRow, 'id'>>;
        Relationships: [];
      };
      delivery_options: {
        Row: DeliveryOptionRow;
        Insert: Omit<DeliveryOptionRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<DeliveryOptionRow, 'id'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ── Row types (snake_case = Postgres column names) ────────────────────────────

export interface BranchRow {
  id: string;
  name: string;
  address_detail: string | null;
  province: string | null;
  district: string | null;
  sub_district: string | null;
  postcode: string | null;
  contact_info: string;
  total_capacity: string;
  occupied_capacity: string | null;
  available_spaces: number | null;
  remaining_bulk_capacity: string | null;
  ceiling_height_meters: number | null;
  number_of_floors: number | null;
  branch_type: 'Owned' | 'Partner' | 'Franchise';
  branch_owner: string | null;
  operating_hours: string | null;
  google_maps_link: string | null;
  payout_day_of_month: number | null;
  commission_rate_percent: number | null;
  commission_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientRow {
  id: string;
  name: string;
  name_en: string | null;
  nickname: string | null;
  email: string | null;
  phone: string;
  phone_alt: string | null;
  joined_date: string;
  status: 'Prospect' | 'Active' | 'Churned' | 'ReturnCompleted';
  line_id: string | null;
  facebook: string | null;
  instagram: string | null;
  other_social: string | null;
  origin_location_type: 'Home' | 'Condo';
  origin_street_address: string | null;
  origin_floor: string | null;
  has_elevator: boolean | null;
  origin_province: string | null;
  origin_district: string | null;
  origin_sub_district: string | null;
  origin_postcode: string | null;
  preferred_payment_cycle: 'Monthly' | 'Annual' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnitRow {
  id: string;
  branch_id: string;
  branch_name: string;
  unit_identifier: string;
  unit_type: 'DocumentBox' | 'StorageSpace';
  floor: number;
  zone: string;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | 'AwaitingRenewal';
  width_m: number | null;
  length_m: number | null;
  total_sqm: number | null;
  box_capacity: number | null;
  monthly_rate: number;
  current_client_id: string | null;
  current_client_name: string | null;
  current_order_id: string | null;
  billing_cycle_end_date: string | null;
  floor_plan_x: number | null;
  floor_plan_y: number | null;
  floor_plan_w: number | null;
  floor_plan_h: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  service_type: 'Storage' | 'Delivery';
  storage_sub_type: 'DocumentBox' | 'StorageSpace' | null;
  delivery_sub_type: 'PickupAndStore' | 'ReturnDelivery' | 'MovingService' | null;
  status: 'Draft' | 'Pending' | 'Confirmed' | 'Active' | 'AwaitingReturn' | 'Completed' | 'Cancelled';
  client_id: string | null;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  client_line_id: string | null;
  client_facebook: string | null;
  service_address: string;
  service_floor: string | null;
  has_elevator: boolean | null;
  items_description: string;
  item_categories: string[] | null;
  service_date: string;
  storage_duration: string | null;
  storage_end_date: string | null;
  quantity: number | null;
  quantity_unit: 'กล่อง' | 'ตร.ม.' | 'ชิ้น' | null;
  payment_cycle: 'Monthly' | 'Annual' | null;
  monthly_rate: number | null;
  first_month_total: number | null;
  commission_rate: number | null;
  branch_id: string | null;
  branch_name: string | null;
  unit_id: string | null;
  unit_identifier: string | null;
  e_contract_status: 'Draft' | 'Sent' | 'Signed' | null;
  sale_staff_id: string | null;
  sale_staff_name: string | null;
  staff_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingRow {
  id: string;
  branch_id: string | null;
  branch_name: string | null;
  client_id: string | null;
  client_name: string | null;
  driver_name: string;
  vehicle_info: string | null;
  booking_type: 'Pick-up' | 'Return';
  start_time: string;
  end_time: string;
  status: 'Pending' | 'Processing' | 'Pre-confirmed' | 'Confirmed' | 'InTransit' | 'AwaitingAllocation' | 'Completed' | 'Cancelled';
  is_adding_to_existing_storage: boolean | null;
  linked_allocation_id: string | null;
  desired_width_sqm: number | null;
  desired_length_sqm: number | null;
  has_docking_area: boolean | null;
  has_car_parking_fee: boolean | null;
  has_elevator: boolean | null;
  has_big_furniture: boolean | null;
  big_furniture_max_width_cm: number | null;
  big_furniture_max_height_cm: number | null;
  needs_wrapping: boolean | null;
  disassembly_option: 'none' | 'all' | 'specific' | null;
  number_of_items_to_disassemble: number | null;
  customer_self_delivery: boolean | null;
  customer_notes: string | null;
  staff_notes: string | null;
  origin_floor: string | null;
  origin_phone_number: string | null;
  origin_available_time_slots: string | null;
  origin_google_maps_link: string | null;
  destination_street_address: string | null;
  destination_floor: string | null;
  destination_province: string | null;
  destination_district: string | null;
  destination_sub_district: string | null;
  destination_postcode: string | null;
  destination_phone_number: string | null;
  destination_available_time_slots: string | null;
  destination_google_maps_link: string | null;
  suggested_internal_unit_identifier: string | null;
  selected_allocation_id: string | null;
  chosen_delivery_option_id: string | null;
  created_at: string;
}

export interface AllocatedSpaceRow {
  id: string;
  client_id: string | null;
  client_name: string;
  branch_id: string;
  branch_name: string;
  used_space_sqm: number;
  status: 'Occupied' | 'Reserved' | 'AwaitingExtensionPayment' | 'Released' | 'AwaitingRenewal';
  allocation_date: string;
  notes: string | null;
  internal_unit_identifier: string | null;
  related_booking_id: string | null;
  requested_extended_space_sqm: number | null;
  additional_fee_for_extension: number | null;
  extension_request_date: string | null;
  release_date: string | null;
  current_billing_cycle_end_date: string | null;
  months_extended: number | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionRow {
  id: string;
  booking_id: string | null;
  client_id: string;
  client_name: string | null;
  date: string;
  type: 'FullAmount' | 'Subscription' | 'Refund' | 'DeliveryOnly' | 'Other' | 'ExtensionFee';
  amount: number;
  currency: string;
  method: 'Cash' | 'CreditCard' | 'BankTransfer' | 'Online' | 'Other' | null;
  status: 'Pending' | 'Completed' | 'Failed' | 'Cancelled';
  description: string | null;
  related_space_id: string | null;
  related_allocation_id: string | null;
  related_branch_id: string | null;
  invoice_status: 'NotYet' | 'Created' | 'Sent';
  receipt_status: 'NotYet' | 'Created' | 'Sent';
  created_at: string;
}

export interface ActivityRow {
  id: string;
  timestamp: string;
  type: 'Booking' | 'Client' | 'Branch' | 'Transaction' | 'Allocation' | 'Unit' | 'Order' | 'User' | 'System';
  action: 'Created' | 'Updated' | 'Deleted' | 'StatusChanged' | 'LoggedIn' | 'LoggedOut';
  description: string;
  entity_id: string | null;
  entity_name: string | null;
  user_id: string | null;
  user_name: string | null;
  details_link: string | null;
}

export interface DeliveryOptionRow {
  id: string;
  booking_id: string;
  provider_name: string;
  other_provider_name: string | null;
  estimated_cost: number;
  currency: string;
  pic_phone_number: string | null;
  is_recommended: boolean | null;
  created_at: string;
}

import { supabase } from '../supabase';
import type { BranchRow } from '../supabase-types';
import type { Branch } from '@/types';

export function rowToBranch(r: BranchRow): Branch {
  return {
    id:                     r.id,
    name:                   r.name,
    addressDetail:          r.address_detail ?? undefined,
    province:               r.province ?? undefined,
    district:               r.district ?? undefined,
    subDistrict:            r.sub_district ?? undefined,
    postcode:               r.postcode ?? undefined,
    contactInfo:            r.contact_info,
    totalCapacity:          r.total_capacity,
    occupiedCapacity:       r.occupied_capacity ?? undefined,
    availableSpaces:        r.available_spaces ?? undefined,
    remainingBulkCapacity:  r.remaining_bulk_capacity ?? undefined,
    ceilingHeightMeters:    r.ceiling_height_meters ?? undefined,
    numberOfFloors:         r.number_of_floors ?? undefined,
    branchType:             r.branch_type,
    branchOwner:            r.branch_owner ?? undefined,
    operatingHours:         r.operating_hours ?? undefined,
    googleMapsLink:         r.google_maps_link ?? undefined,
    payoutDayOfMonth:       r.payout_day_of_month ?? undefined,
    commissionRatePercent:  r.commission_rate_percent ?? undefined,
    commissionNotes:        r.commission_notes ?? undefined,
  };
}

export async function getBranches(): Promise<Branch[]> {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('name');
  if (error) throw new Error(`getBranches: ${error.message}`);
  return (data ?? []).map(rowToBranch);
}

export async function getBranchById(id: string): Promise<Branch | null> {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return rowToBranch(data);
}

export async function createBranch(
  data: Omit<Branch, 'id' | 'occupiedCapacity' | 'remainingBulkCapacity' | 'availableSpaces'>
): Promise<Branch> {
  const insert: Omit<BranchRow, 'id' | 'created_at' | 'updated_at'> = {
    name:                     data.name,
    address_detail:           data.addressDetail ?? null,
    province:                 data.province ?? null,
    district:                 data.district ?? null,
    sub_district:             data.subDistrict ?? null,
    postcode:                 data.postcode ?? null,
    contact_info:             data.contactInfo,
    total_capacity:           data.totalCapacity,
    occupied_capacity:        null,
    available_spaces:         null,
    remaining_bulk_capacity:  null,
    ceiling_height_meters:    data.ceilingHeightMeters ?? null,
    number_of_floors:         data.numberOfFloors ?? null,
    branch_type:              data.branchType,
    branch_owner:             data.branchOwner ?? null,
    operating_hours:          data.operatingHours ?? null,
    google_maps_link:         data.googleMapsLink ?? null,
    payout_day_of_month:      data.payoutDayOfMonth ?? null,
    commission_rate_percent:  data.commissionRatePercent ?? null,
    commission_notes:         data.commissionNotes ?? null,
  };
  const { data: row, error } = await supabase
    .from('branches')
    .insert(insert)
    .select()
    .single();
  if (error) throw new Error(`createBranch: ${error.message}`);
  return rowToBranch(row);
}

export async function updateBranch(
  id: string,
  updates: Partial<Branch>
): Promise<Branch | null> {
  const partial: Partial<BranchRow> = {};
  if (updates.name !== undefined)                   partial.name = updates.name;
  if (updates.addressDetail !== undefined)          partial.address_detail = updates.addressDetail;
  if (updates.totalCapacity !== undefined)          partial.total_capacity = updates.totalCapacity;
  if (updates.operatingHours !== undefined)         partial.operating_hours = updates.operatingHours;
  if (updates.commissionRatePercent !== undefined)  partial.commission_rate_percent = updates.commissionRatePercent;
  if (updates.payoutDayOfMonth !== undefined)       partial.payout_day_of_month = updates.payoutDayOfMonth;
  if (updates.branchType !== undefined)             partial.branch_type = updates.branchType;
  const { data, error } = await supabase
    .from('branches')
    .update(partial)
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return rowToBranch(data);
}

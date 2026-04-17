import { supabase } from '../supabase';
import type { AllocatedSpaceRow } from '../supabase-types';
import type { AllocatedBulkSpace, AllocatedBulkSpaceStatus } from '@/types';

export function rowToAllocation(r: AllocatedSpaceRow): AllocatedBulkSpace {
  return {
    id:                           r.id,
    clientId:                     r.client_id ?? undefined,
    clientName:                   r.client_name,
    branchId:                     r.branch_id,
    branchName:                   r.branch_name,
    usedSpaceSqm:                 r.used_space_sqm,
    status:                       r.status,
    allocationDate:               r.allocation_date,
    notes:                        r.notes ?? undefined,
    internalUnitIdentifier:       r.internal_unit_identifier ?? undefined,
    relatedBookingId:             r.related_booking_id ?? undefined,
    requestedExtendedSpaceSqm:    r.requested_extended_space_sqm ?? undefined,
    additionalFeeForExtension:    r.additional_fee_for_extension ?? undefined,
    extensionRequestDate:         r.extension_request_date ?? undefined,
    releaseDate:                  r.release_date ?? undefined,
    currentBillingCycleEndDate:   r.current_billing_cycle_end_date ?? undefined,
    monthsExtended:               r.months_extended ?? undefined,
  };
}

export async function getAllocations(
  statuses?: AllocatedBulkSpaceStatus[]
): Promise<AllocatedBulkSpace[]> {
  let query = supabase
    .from('allocated_spaces')
    .select('*')
    .order('allocation_date', { ascending: false });
  if (statuses?.length) query = query.in('status', statuses);
  const { data, error } = await query;
  if (error) throw new Error(`getAllocations: ${error.message}`);
  return (data ?? []).map(rowToAllocation);
}

export async function getAllocationById(id: string): Promise<AllocatedBulkSpace | null> {
  const { data, error } = await supabase
    .from('allocated_spaces')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return rowToAllocation(data);
}

export async function getAllocationsByClient(
  clientId: string,
  statuses?: AllocatedBulkSpaceStatus[]
): Promise<AllocatedBulkSpace[]> {
  let query = supabase
    .from('allocated_spaces')
    .select('*')
    .eq('client_id', clientId);
  if (statuses?.length) query = query.in('status', statuses);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []).map(rowToAllocation);
}

export async function createAllocation(
  data: Omit<AllocatedBulkSpace, 'id'>
): Promise<AllocatedBulkSpace> {
  const insert: Omit<AllocatedSpaceRow, 'id' | 'created_at' | 'updated_at'> = {
    client_id:                      data.clientId ?? null,
    client_name:                    data.clientName,
    branch_id:                      data.branchId,
    branch_name:                    data.branchName,
    used_space_sqm:                 data.usedSpaceSqm,
    status:                         data.status,
    allocation_date:                data.allocationDate,
    notes:                          data.notes ?? null,
    internal_unit_identifier:       data.internalUnitIdentifier ?? null,
    related_booking_id:             data.relatedBookingId ?? null,
    requested_extended_space_sqm:   data.requestedExtendedSpaceSqm ?? null,
    additional_fee_for_extension:   data.additionalFeeForExtension ?? null,
    extension_request_date:         data.extensionRequestDate ?? null,
    release_date:                   data.releaseDate ?? null,
    current_billing_cycle_end_date: data.currentBillingCycleEndDate ?? null,
    months_extended:                data.monthsExtended ?? 0,
  };
  const { data: row, error } = await supabase
    .from('allocated_spaces')
    .insert(insert)
    .select()
    .single();
  if (error) throw new Error(`createAllocation: ${error.message}`);
  return rowToAllocation(row);
}

export async function updateAllocationStatus(
  id: string,
  status: AllocatedBulkSpaceStatus
): Promise<AllocatedBulkSpace | null> {
  const { data, error } = await supabase
    .from('allocated_spaces')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return rowToAllocation(data);
}

export async function renewAllocation(
  id: string,
  months: number,
  newEndDate: string
): Promise<AllocatedBulkSpace | null> {
  const { data: current } = await supabase
    .from('allocated_spaces')
    .select('months_extended')
    .eq('id', id)
    .single();
  const { data, error } = await supabase
    .from('allocated_spaces')
    .update({
      status: 'Occupied',
      current_billing_cycle_end_date: newEndDate,
      months_extended: (current?.months_extended ?? 0) + months,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return rowToAllocation(data);
}

export async function releaseAllocation(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('allocated_spaces')
    .update({ status: 'Released', release_date: new Date().toISOString().split('T')[0] })
    .eq('id', id);
  return !error;
}

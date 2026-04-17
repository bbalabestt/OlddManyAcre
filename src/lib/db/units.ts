import { supabase, createServerClient } from '../supabase';
import type { UnitRow } from '../supabase-types';
import type { Unit } from '@/types';

// ── Row → TypeScript camelCase mapper ─────────────────────────────────────────
export function rowToUnit(r: UnitRow): Unit {
  return {
    id:                   r.id,
    branchId:             r.branch_id,
    branchName:           r.branch_name,
    unitIdentifier:       r.unit_identifier,
    unitType:             r.unit_type,
    floor:                r.floor,
    zone:                 r.zone,
    status:               r.status,
    widthM:               r.width_m ?? undefined,
    lengthM:              r.length_m ?? undefined,
    totalSqm:             r.total_sqm ?? undefined,
    boxCapacity:          r.box_capacity ?? undefined,
    monthlyRate:          r.monthly_rate,
    currentClientId:      r.current_client_id ?? undefined,
    currentClientName:    r.current_client_name ?? undefined,
    currentOrderId:       r.current_order_id ?? undefined,
    billingCycleEndDate:  r.billing_cycle_end_date ?? undefined,
    floorPlanX:           r.floor_plan_x ?? undefined,
    floorPlanY:           r.floor_plan_y ?? undefined,
    floorPlanW:           r.floor_plan_w ?? undefined,
    floorPlanH:           r.floor_plan_h ?? undefined,
    notes:                r.notes ?? undefined,
    createdAt:            r.created_at,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Fetch all units, optionally filtered by branchId */
export async function getUnits(branchId?: string): Promise<Unit[]> {
  let query = supabase.from('units').select('*').order('unit_identifier');
  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) throw new Error(`getUnits: ${error.message}`);
  return (data ?? []).map(rowToUnit);
}

/** Fetch a single unit by ID */
export async function getUnitById(id: string): Promise<Unit | null> {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return rowToUnit(data);
}

/** Fetch units by type, optionally filtered by branchId */
export async function getUnitsByType(
  unitType: Unit['unitType'],
  branchId?: string
): Promise<Unit[]> {
  let query = supabase.from('units').select('*').eq('unit_type', unitType);
  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) throw new Error(`getUnitsByType: ${error.message}`);
  return (data ?? []).map(rowToUnit);
}

/** Create a new unit */
export async function createUnit(
  data: Omit<Unit, 'id' | 'createdAt'>
): Promise<Unit> {
  const insert: Omit<UnitRow, 'id' | 'created_at' | 'updated_at'> = {
    branch_id:              data.branchId,
    branch_name:            data.branchName,
    unit_identifier:        data.unitIdentifier,
    unit_type:              data.unitType,
    floor:                  data.floor,
    zone:                   data.zone,
    status:                 data.status,
    width_m:                data.widthM ?? null,
    length_m:               data.lengthM ?? null,
    total_sqm:              data.totalSqm ?? null,
    box_capacity:           data.boxCapacity ?? null,
    monthly_rate:           data.monthlyRate,
    current_client_id:      data.currentClientId ?? null,
    current_client_name:    data.currentClientName ?? null,
    current_order_id:       data.currentOrderId ?? null,
    billing_cycle_end_date: data.billingCycleEndDate ?? null,
    floor_plan_x:           data.floorPlanX ?? null,
    floor_plan_y:           data.floorPlanY ?? null,
    floor_plan_w:           data.floorPlanW ?? null,
    floor_plan_h:           data.floorPlanH ?? null,
    notes:                  data.notes ?? null,
  };
  const { data: row, error } = await supabase
    .from('units')
    .insert(insert)
    .select()
    .single();
  if (error) throw new Error(`createUnit: ${error.message}`);
  return rowToUnit(row);
}

/** Update unit status */
export async function updateUnitStatus(
  id: string,
  status: Unit['status']
): Promise<Unit | null> {
  const { data, error } = await supabase
    .from('units')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return rowToUnit(data);
}

/** Assign a client to a unit (mark Occupied) */
export async function assignClientToUnit(
  unitId: string,
  clientId: string,
  clientName: string,
  orderId: string,
  billingCycleEndDate?: string
): Promise<Unit | null> {
  const { data, error } = await supabase
    .from('units')
    .update({
      status:                 'Occupied',
      current_client_id:      clientId,
      current_client_name:    clientName,
      current_order_id:       orderId,
      billing_cycle_end_date: billingCycleEndDate ?? null,
    })
    .eq('id', unitId)
    .select()
    .single();
  if (error) return null;
  return rowToUnit(data);
}

/** Release a unit (mark Available, clear client) */
export async function releaseUnit(unitId: string): Promise<Unit | null> {
  const { data, error } = await supabase
    .from('units')
    .update({
      status:                 'Available',
      current_client_id:      null,
      current_client_name:    null,
      current_order_id:       null,
      billing_cycle_end_date: null,
    })
    .eq('id', unitId)
    .select()
    .single();
  if (error) return null;
  return rowToUnit(data);
}

import { supabase } from '../supabase';
import type { ClientRow } from '../supabase-types';
import type { Client } from '@/types';

// ── Row → TypeScript mapper ───────────────────────────────────────────────────
export function rowToClient(r: ClientRow): Client {
  return {
    id:                   r.id,
    name:                 r.name,
    nameEn:               r.name_en ?? undefined,
    nickname:             r.nickname ?? undefined,
    email:                r.email ?? undefined,
    phone:                r.phone,
    phoneAlt:             r.phone_alt ?? undefined,
    joinedDate:           r.joined_date,
    status:               r.status,
    lineId:               r.line_id ?? undefined,
    facebook:             r.facebook ?? undefined,
    instagram:            r.instagram ?? undefined,
    otherSocial:          r.other_social ?? undefined,
    originLocationType:   r.origin_location_type,
    originStreetAddress:  r.origin_street_address ?? undefined,
    originFloor:          r.origin_floor ?? undefined,
    hasElevator:          r.has_elevator ?? undefined,
    originProvince:       r.origin_province ?? undefined,
    originDistrict:       r.origin_district ?? undefined,
    originSubDistrict:    r.origin_sub_district ?? undefined,
    originPostcode:       r.origin_postcode ?? undefined,
    preferredPaymentCycle: r.preferred_payment_cycle ?? undefined,
    notes:                r.notes ?? undefined,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Fetch all clients */
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');
  if (error) throw new Error(`getClients: ${error.message}`);
  return (data ?? []).map(rowToClient);
}

/** Fetch single client by ID */
export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return rowToClient(data);
}

/** Count clients by status */
export async function countClientsByStatus(
  status: Client['status']
): Promise<number> {
  const { count, error } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('status', status);
  if (error) return 0;
  return count ?? 0;
}

/** Create a new client */
export async function createClient(
  data: Omit<Client, 'id' | 'joinedDate' | 'status'>
): Promise<Client> {
  const insert: Omit<ClientRow, 'id' | 'created_at' | 'updated_at'> = {
    name:                  data.name,
    name_en:               data.nameEn ?? null,
    nickname:              data.nickname ?? null,
    email:                 data.email ?? null,
    phone:                 data.phone,
    phone_alt:             data.phoneAlt ?? null,
    joined_date:           new Date().toISOString().split('T')[0],
    status:                'Prospect',
    line_id:               data.lineId ?? null,
    facebook:              data.facebook ?? null,
    instagram:             data.instagram ?? null,
    other_social:          data.otherSocial ?? null,
    origin_location_type:  data.originLocationType,
    origin_street_address: data.originStreetAddress ?? null,
    origin_floor:          data.originFloor ?? null,
    has_elevator:          data.hasElevator ?? null,
    origin_province:       data.originProvince ?? null,
    origin_district:       data.originDistrict ?? null,
    origin_sub_district:   data.originSubDistrict ?? null,
    origin_postcode:       data.originPostcode ?? null,
    preferred_payment_cycle: data.preferredPaymentCycle ?? null,
    notes:                 data.notes ?? null,
  };
  const { data: row, error } = await supabase
    .from('clients')
    .insert(insert)
    .select()
    .single();
  if (error) throw new Error(`createClient: ${error.message}`);
  return rowToClient(row);
}

/** Update client status */
export async function updateClientStatus(
  id: string,
  status: Client['status']
): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return rowToClient(data);
}

/** Search clients by name or phone */
export async function searchClients(query: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%,line_id.ilike.%${query}%`)
    .order('name')
    .limit(20);
  if (error) return [];
  return (data ?? []).map(rowToClient);
}

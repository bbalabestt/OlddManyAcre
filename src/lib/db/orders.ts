import { supabase } from '../supabase';
import type { OrderRow } from '../supabase-types';
import type { Order } from '@/types';

// ── Row → TypeScript mapper ───────────────────────────────────────────────────
export function rowToOrder(r: OrderRow): Order {
  return {
    id:               r.id,
    serviceType:      r.service_type,
    storageSubType:   r.storage_sub_type ?? undefined,
    deliverySubType:  r.delivery_sub_type ?? undefined,
    status:           r.status,
    clientId:         r.client_id ?? undefined,
    clientName:       r.client_name,
    clientPhone:      r.client_phone,
    clientEmail:      r.client_email ?? undefined,
    clientLineId:     r.client_line_id ?? undefined,
    clientFacebook:   r.client_facebook ?? undefined,
    serviceAddress:   r.service_address,
    serviceFloor:     r.service_floor ?? undefined,
    hasElevator:      r.has_elevator ?? undefined,
    itemsDescription: r.items_description,
    itemCategories:   r.item_categories ?? undefined,
    serviceDate:      r.service_date,
    storageDuration:  r.storage_duration ?? undefined,
    storageEndDate:   r.storage_end_date ?? undefined,
    quantity:         r.quantity ?? undefined,
    quantityUnit:     r.quantity_unit ?? undefined,
    paymentCycle:     r.payment_cycle ?? undefined,
    monthlyRate:      r.monthly_rate ?? undefined,
    firstMonthTotal:  r.first_month_total ?? undefined,
    commissionRate:   r.commission_rate ?? undefined,
    branchId:         r.branch_id ?? undefined,
    branchName:       r.branch_name ?? undefined,
    unitId:           r.unit_id ?? undefined,
    unitIdentifier:   r.unit_identifier ?? undefined,
    eContractStatus:  r.e_contract_status ?? undefined,
    saleStaffId:      r.sale_staff_id ?? undefined,
    saleStaffName:    r.sale_staff_name ?? undefined,
    staffNotes:       r.staff_notes ?? undefined,
    createdAt:        r.created_at,
    updatedAt:        r.updated_at ?? undefined,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Fetch all orders, optionally filtered by serviceType */
export async function getOrders(serviceType?: Order['serviceType']): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (serviceType) query = query.eq('service_type', serviceType);
  const { data, error } = await query;
  if (error) throw new Error(`getOrders: ${error.message}`);
  return (data ?? []).map(rowToOrder);
}

/** Fetch a single order by ID */
export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return rowToOrder(data);
}

/** Fetch orders for a client */
export async function getOrdersByClient(clientId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`getOrdersByClient: ${error.message}`);
  return (data ?? []).map(rowToOrder);
}

/** Create a new order */
export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const insert: Omit<OrderRow, 'id' | 'created_at' | 'updated_at'> = {
    service_type:       data.serviceType,
    storage_sub_type:   data.storageSubType ?? null,
    delivery_sub_type:  data.deliverySubType ?? null,
    status:             data.status,
    client_id:          data.clientId ?? null,
    client_name:        data.clientName,
    client_phone:       data.clientPhone,
    client_email:       data.clientEmail ?? null,
    client_line_id:     data.clientLineId ?? null,
    client_facebook:    data.clientFacebook ?? null,
    service_address:    data.serviceAddress,
    service_floor:      data.serviceFloor ?? null,
    has_elevator:       data.hasElevator ?? null,
    items_description:  data.itemsDescription,
    item_categories:    data.itemCategories ?? null,
    service_date:       data.serviceDate,
    storage_duration:   data.storageDuration ?? null,
    storage_end_date:   data.storageEndDate ?? null,
    quantity:           data.quantity ?? null,
    quantity_unit:      data.quantityUnit ?? null,
    payment_cycle:      data.paymentCycle ?? null,
    monthly_rate:       data.monthlyRate ?? null,
    first_month_total:  data.firstMonthTotal ?? null,
    commission_rate:    data.commissionRate ?? null,
    branch_id:          data.branchId ?? null,
    branch_name:        data.branchName ?? null,
    unit_id:            data.unitId ?? null,
    unit_identifier:    data.unitIdentifier ?? null,
    e_contract_status:  data.eContractStatus ?? null,
    sale_staff_id:      data.saleStaffId ?? null,
    sale_staff_name:    data.saleStaffName ?? null,
    staff_notes:        data.staffNotes ?? null,
  };
  const { data: row, error } = await supabase
    .from('orders')
    .insert(insert)
    .select()
    .single();
  if (error) throw new Error(`createOrder: ${error.message}`);
  return rowToOrder(row);
}

/** Update order status */
export async function updateOrderStatus(
  id: string,
  status: Order['status']
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return rowToOrder(data);
}

/** Assign a unit to an order */
export async function assignUnitToOrder(
  orderId: string,
  unitId: string,
  unitIdentifier: string,
  branchId: string,
  branchName: string
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update({ unit_id: unitId, unit_identifier: unitIdentifier, branch_id: branchId, branch_name: branchName, status: 'Confirmed' })
    .eq('id', orderId)
    .select()
    .single();
  if (error) return null;
  return rowToOrder(data);
}

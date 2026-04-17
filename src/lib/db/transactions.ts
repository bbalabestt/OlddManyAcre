import { supabase } from '../supabase';
import type { TransactionRow } from '../supabase-types';
import type { Transaction } from '@/types';

export function rowToTransaction(r: TransactionRow): Transaction {
  return {
    id:                   r.id,
    bookingId:            r.booking_id ?? undefined,
    clientId:             r.client_id,
    clientName:           r.client_name ?? undefined,
    date:                 r.date,
    type:                 r.type,
    amount:               r.amount,
    currency:             r.currency as 'THB',
    method:               r.method ?? undefined,
    status:               r.status,
    description:          r.description ?? undefined,
    relatedSpaceId:       r.related_space_id ?? undefined,
    relatedAllocationId:  r.related_allocation_id ?? undefined,
    relatedBranchId:      r.related_branch_id ?? undefined,
    invoiceStatus:        r.invoice_status,
    receiptStatus:        r.receipt_status,
  };
}

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw new Error(`getTransactions: ${error.message}`);
  return (data ?? []).map(rowToTransaction);
}

export async function getTransactionsByClient(clientId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false });
  if (error) return [];
  return (data ?? []).map(rowToTransaction);
}

export async function getThisMonthIncome(): Promise<number> {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('status', 'Completed')
    .gte('date', from)
    .lte('date', to);
  if (error) return 0;
  return (data ?? []).reduce((sum, r) => sum + r.amount, 0);
}

export async function createTransaction(
  data: Omit<Transaction, 'id' | 'clientName' | 'currency' | 'invoiceStatus' | 'receiptStatus'>
): Promise<Transaction> {
  const insert: Omit<TransactionRow, 'id' | 'created_at'> = {
    booking_id:            data.bookingId ?? null,
    client_id:             data.clientId,
    client_name:           null,
    date:                  data.date,
    type:                  data.type,
    amount:                data.amount,
    currency:              'THB',
    method:                data.method ?? null,
    status:                data.status,
    description:           data.description ?? null,
    related_space_id:      data.relatedSpaceId ?? null,
    related_allocation_id: data.relatedAllocationId ?? null,
    related_branch_id:     data.relatedBranchId ?? null,
    invoice_status:        'NotYet',
    receipt_status:        'NotYet',
  };
  const { data: row, error } = await supabase
    .from('transactions')
    .insert(insert)
    .select()
    .single();
  if (error) throw new Error(`createTransaction: ${error.message}`);
  return rowToTransaction(row);
}

export async function updateDocumentStatus(
  id: string,
  docType: 'invoice' | 'receipt',
  status: 'Created' | 'Sent'
): Promise<Transaction | null> {
  const update = docType === 'invoice'
    ? { invoice_status: status }
    : { receipt_status: status };
  const { data, error } = await supabase
    .from('transactions')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return rowToTransaction(data);
}

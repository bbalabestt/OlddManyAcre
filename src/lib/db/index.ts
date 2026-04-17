/**
 * Widing Platform — Unified Database Layer
 *
 * Import from here instead of individual files:
 *   import { getUnits, createOrder, getClients } from '@/lib/db';
 */

// Units (new)
export * from './units';

// Orders (new)
export * from './orders';

// Legacy entities
export * from './branches';
export * from './clients';
export * from './bookings';
export * from './allocations';
export * from './transactions';

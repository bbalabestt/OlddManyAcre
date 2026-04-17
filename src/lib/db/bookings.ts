import { supabase } from '../supabase';
import type { BookingRow } from '../supabase-types';
import type { Booking, BookingStatus } from '@/types';

export function rowToBooking(r: BookingRow): Booking {
  return {
    id:                             r.id,
    branchId:                       r.branch_id ?? '',
    branchName:                     r.branch_name ?? undefined,
    clientId:                       r.client_id ?? undefined,
    clientName:                     r.client_name ?? undefined,
    driverName:                     r.driver_name,
    vehicleInfo:                    r.vehicle_info ?? undefined,
    bookingType:                    r.booking_type,
    startTime:                      r.start_time,
    endTime:                        r.end_time,
    status:                         r.status,
    isAddingToExistingStorage:      r.is_adding_to_existing_storage ?? undefined,
    linkedAllocationId:             r.linked_allocation_id ?? undefined,
    desiredWidthSqm:                r.desired_width_sqm ?? undefined,
    desiredLengthSqm:               r.desired_length_sqm ?? undefined,
    hasDockingArea:                 r.has_docking_area ?? undefined,
    hasCarParkingFee:               r.has_car_parking_fee ?? undefined,
    hasElevator:                    r.has_elevator ?? undefined,
    hasBigFurniture:                r.has_big_furniture ?? undefined,
    bigFurnitureMaxWidthCm:         r.big_furniture_max_width_cm ?? undefined,
    bigFurnitureMaxHeightCm:        r.big_furniture_max_height_cm ?? undefined,
    needsWrapping:                  r.needs_wrapping ?? undefined,
    disassemblyOption:              r.disassembly_option ?? undefined,
    numberOfItemsToDisassemble:     r.number_of_items_to_disassemble ?? undefined,
    customerSelfDelivery:           r.customer_self_delivery ?? undefined,
    customerNotes:                  r.customer_notes ?? undefined,
    staffNotes:                     r.staff_notes ?? undefined,
    originFloor:                    r.origin_floor ?? undefined,
    originPhoneNumber:              r.origin_phone_number ?? undefined,
    originAvailableTimeSlots:       r.origin_available_time_slots ?? undefined,
    originGoogleMapsLink:           r.origin_google_maps_link ?? undefined,
    destinationStreetAddress:       r.destination_street_address ?? undefined,
    destinationFloor:               r.destination_floor ?? undefined,
    destinationProvince:            r.destination_province ?? undefined,
    destinationDistrict:            r.destination_district ?? undefined,
    destinationSubDistrict:         r.destination_sub_district ?? undefined,
    destinationPostcode:            r.destination_postcode ?? undefined,
    destinationPhoneNumber:         r.destination_phone_number ?? undefined,
    destinationAvailableTimeSlots:  r.destination_available_time_slots ?? undefined,
    destinationGoogleMapsLink:      r.destination_google_maps_link ?? undefined,
    suggestedInternalUnitIdentifier: r.suggested_internal_unit_identifier ?? undefined,
    selectedAllocationId:           r.selected_allocation_id ?? undefined,
    chosenDeliveryOptionId:         r.chosen_delivery_option_id ?? undefined,
    createdAt:                      r.created_at,
  };
}

export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('start_time', { ascending: false });
  if (error) throw new Error(`getBookings: ${error.message}`);
  return (data ?? []).map(rowToBooking);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return rowToBooking(data);
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  chosenDeliveryOptionId?: string
): Promise<Booking | null> {
  const update: Partial<BookingRow> = { status };
  if (chosenDeliveryOptionId) update.chosen_delivery_option_id = chosenDeliveryOptionId;
  const { data, error } = await supabase
    .from('bookings')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return rowToBooking(data);
}

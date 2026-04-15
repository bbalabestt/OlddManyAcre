
import type { Branch, Space, Client, AllocatedBulkSpace, ClientStatus, BookingStatus, BookingType, DeliveryOption, VehicleAssignmentData, Transaction, TransactionType, PlatformActivity, PlatformActivityType, AllocatedBulkSpaceStatus, Order, OrderStatus, ServiceType, Unit, UnitType, PaymentCycle } from '@/types';
import { formatISO, subDays, addDays, subHours, addHours, parseISO, isBefore, addMonths as dateFnsAddMonths, startOfMonth, endOfMonth, isWithinInterval, isEqual, format, differenceInCalendarDays } from 'date-fns';

export let mockBranches: Branch[] = [
  {
    id: 'branch-bkk-sukhumvit',
    name: 'Widing Sukhumvit Micro-Hub',
    addressDetail: '10 Sukhumvit Soi 11, Wattana',
    subDistrict: 'Pathum Wan', // Using Pathum Wan for simplicity from existing data
    district: 'Pathum Wan',
    province: 'Bangkok',
    postcode: '10330',
    contactInfo: '02-123-4567 / sukhumvit@widing.com',
    totalCapacity: '80 sq m',
    occupiedCapacity: '0 sq m', // Will be recalculated
    remainingBulkCapacity: '80 sq m', // Will be recalculated
    ceilingHeightMeters: 2.8,
    numberOfFloors: 1,
    branchType: 'Owned',
    operatingHours: 'Mon-Sat: 9 AM - 6 PM',
    googleMapsLink: 'https://maps.google.com/?q=Widing+Sukhumvit+Micro-Hub+Bangkok'
  },
  {
    id: 'branch-nb-pakkret',
    name: 'Nonthaburi Express Pods (Partner)',
    addressDetail: '25 Chaeng Wattana Rd, Pak Kret',
    subDistrict: 'Pak Kret',
    district: 'Pak Kret',
    province: 'Nonthaburi',
    postcode: '11120',
    contactInfo: '02-987-6543 / nonthaburi.partner@widing.com',
    totalCapacity: '100 sq m',
    occupiedCapacity: '0 sq m', // Will be recalculated
    remainingBulkCapacity: '100 sq m', // Will be recalculated
    ceilingHeightMeters: 3.0,
    numberOfFloors: 1,
    branchType: 'Partner',
    branchOwner: 'Thai Storage Partners Co.',
    operatingHours: 'Mon-Sun: 8 AM - 7 PM',
    payoutDayOfMonth: 10,
    commissionRatePercent: 12,
    commissionNotes: "12% commission on net storage revenue.",
    googleMapsLink: 'https://maps.google.com/?q=Nonthaburi+Express+Pods'
  },
  {
    id: 'branch-cnx-nimman',
    name: 'Chiang Mai Nimman Lockers (Franchise)',
    addressDetail: '30 Nimmanhaemin Rd, Suthep',
    subDistrict: 'Suthep',
    district: 'Mueang Chiang Mai',
    province: 'Chiang Mai',
    postcode: '50200',
    contactInfo: '053-111-2222 / chiangmai.franchise@widing.com',
    totalCapacity: '60 sq m',
    occupiedCapacity: '0 sq m', // Will be recalculated
    remainingBulkCapacity: '60 sq m', // Will be recalculated
    ceilingHeightMeters: 2.5,
    branchType: 'Franchise',
    branchOwner: 'Lanna Storage Solutions Ltd.',
    operatingHours: 'Mon-Fri: 10 AM - 5 PM',
    payoutDayOfMonth: 20,
    commissionRatePercent: 8,
    commissionNotes: "8% flat commission on storage fees.",
    googleMapsLink: 'https://maps.google.com/?q=Chiang+Mai+Nimman+Lockers'
  },
  {
    id: 'branch-bkk-sathorn',
    name: 'Widing Sathorn Compact',
    addressDetail: '55 Sathorn Tai Rd, Yan Nawa',
    subDistrict: 'Wachiraphayaban', // Using existing for simplicity
    district: 'Dusit',
    province: 'Bangkok',
    postcode: '10300',
    contactInfo: '02-333-7777 / sathorn@widing.com',
    totalCapacity: '90 sq m',
    occupiedCapacity: '0 sq m', // Will be recalculated
    remainingBulkCapacity: '90 sq m', // Will be recalculated
    ceilingHeightMeters: 3.1,
    numberOfFloors: 1,
    branchType: 'Owned',
    operatingHours: 'Mon-Fri: 9 AM - 6 PM, Sat: 9 AM - 1 PM',
    googleMapsLink: 'https://maps.google.com/?q=Widing+Sathorn+Compact+Bangkok'
  },
];

// Legacy mockSpaces - not used by flexible allocation system anymore
export const mockSpaces: Space[] = [
  { id: 'space-legacy-1', branchId: 'branch-bkk-sukhumvit', spaceIdentifier: 'OLD-A01', dimensions: '1m x 1m', status: 'Maintenance', monthlyRate: 700 },
];

export let mockClients: Client[] = [
  {
    id: 'client-1', name: 'Alice Wonderland', email: 'alice.w@example.com', phone: '081-111-1111',
    joinedDate: subDays(new Date(), 180).toISOString(),
    status: 'Active',
    originLocationType: 'Home',
    originStreetAddress: '1 Wonder Way, The Gardens Estate',
    originFloor: '3',
    originSubDistrict: 'Pak Kret',
    originDistrict: 'Pak Kret',
    originProvince: 'Nonthaburi',
    originPostcode: '11120',
  },
  {
    id: 'client-2', name: 'Bob The Builder Inc.', email: 'bob.builder@construct.co', phone: '082-222-2222',
    joinedDate: subDays(new Date(), 400).toISOString(),
    status: 'Active',
    originLocationType: 'Condo',
    originStreetAddress: '2 Build It Rd, Construct Tower, Unit 10A',
    originFloor: '10',
    originSubDistrict: 'Dusit',
    district: 'Dusit',
    province: 'Bangkok',
    originPostcode: '10300',
  },
  {
    id: 'client-3', name: 'Charlie Brown', email: 'charlie.b@peanuts.com', phone: '083-333-3333',
    joinedDate: subDays(new Date(), 60).toISOString(),
    status: 'Active',
    originLocationType: 'Home',
    originStreetAddress: '3 Peanuts Ave, Snoopyville',
    originFloor: 'Ground',
    originSubDistrict: 'Suan Yai',
    district: 'Mueang Nonthaburi',
    province: 'Nonthaburi',
    originPostcode: '11000',
  },
  {
    id: 'client-4', name: 'Diana Prince', email: 'diana.p@them.org', phone: '084-444-4444',
    joinedDate: subDays(new Date(), 10).toISOString(),
    status: 'Prospect',
    originLocationType: 'Home',
    originStreetAddress: '4 Amazon Trail, Paradise Island',
    originSubDistrict: 'Wat Ratchabophit',
    district: 'Phra Nakhon',
    province: 'Bangkok',
    originPostcode: '10200',
  },
   {
    id: 'client-5', name: 'Edward Nygma', email: 'e.nygma@riddles.net', phone: '085-555-5555',
    joinedDate: subDays(new Date(), 700).toISOString(),
    status: 'Churned',
    originLocationType: 'Condo',
    originStreetAddress: '5 Puzzle Pl, Enigma Condo, Apt 5B',
    originSubDistrict: 'Bang Talat',
    district: 'Pak Kret',
    province: 'Nonthaburi',
    originPostcode: '11120',
  },
  {
    id: 'client-6', name: 'Fiona Gallagher', email: 'fiona.g@southside.io', phone: '086-666-6666',
    joinedDate: subDays(new Date(), 300).toISOString(),
    status: 'ReturnCompleted',
    originLocationType: 'Home',
    originStreetAddress: '6 Shameless St, The Alibi District',
    originFloor: '2',
    originSubDistrict: 'San Chaopho Suea',
    district: 'Phra Nakhon',
    province: 'Bangkok',
    originPostcode: '10200',
  },
];


export let mockAllocatedBulkSpaces: AllocatedBulkSpace[] = [
  {
    id: 'alloc-1',
    clientId: 'client-1', clientName: 'Alice Wonderland',
    branchId: 'branch-bkk-sukhumvit', branchName: 'Widing Sukhumvit Micro-Hub',
    usedSpaceSqm: 20, status: 'Occupied', allocationDate: subDays(new Date(), 150).toISOString(),
    internalUnitIdentifier: 'SKV-A01-A05', currentBillingCycleEndDate: dateFnsAddMonths(subDays(new Date(), 150), 6).toISOString(),
  },
  {
    id: 'alloc-2',
    clientId: 'client-2', clientName: 'Bob The Builder Inc.',
    branchId: 'branch-nb-pakkret', branchName: 'Nonthaburi Express Pods (Partner)',
    usedSpaceSqm: 15, status: 'Occupied', allocationDate: subDays(new Date(), 300).toISOString(),
    internalUnitIdentifier: 'NB-P01-P03', currentBillingCycleEndDate: dateFnsAddMonths(subDays(new Date(), 300), 12).toISOString(),
  },
  {
    id: 'alloc-3',
    clientId: 'client-3', clientName: 'Charlie Brown',
    branchId: 'branch-cnx-nimman', branchName: 'Chiang Mai Nimman Lockers (Franchise)',
    usedSpaceSqm: 10, status: 'Reserved', allocationDate: subDays(new Date(), 30).toISOString(),
    internalUnitIdentifier: 'CNX-L01', currentBillingCycleEndDate: dateFnsAddMonths(subDays(new Date(), 30), 1).toISOString(),
  },
  {
    id: 'alloc-4', // Was for Edward, now for Diana
    clientId: 'client-4', clientName: 'Diana Prince',
    branchId: 'branch-bkk-sathorn', branchName: 'Widing Sathorn Compact',
    usedSpaceSqm: 18, status: 'Occupied', allocationDate: subDays(new Date(), 50).toISOString(),
    notes: 'Items for Themyscira artifacts.',
    internalUnitIdentifier: 'STN-C10-C12', currentBillingCycleEndDate: dateFnsAddMonths(subDays(new Date(), 50), 3).toISOString(),
  },
  {
    id: 'alloc-5', // Was another Alice, keep it
    clientId: 'client-1', clientName: 'Alice Wonderland',
    branchId: 'branch-nb-pakkret', branchName: 'Nonthaburi Express Pods (Partner)',
    usedSpaceSqm: 12, status: 'Occupied', allocationDate: subDays(new Date(), 20).toISOString(),
    internalUnitIdentifier: 'NB-P04', currentBillingCycleEndDate: dateFnsAddMonths(subDays(new Date(), 20), 2).toISOString(),
  },
  {
    id: 'alloc-system-reserved-1',
    clientName: 'System Reserved - Upcoming',
    branchId: 'branch-bkk-sukhumvit', branchName: 'Widing Sukhumvit Micro-Hub',
    usedSpaceSqm: 5, status: 'Reserved', allocationDate: subDays(new Date(), 5).toISOString(),
    notes: 'Reserved for high-priority incoming booking.',
    internalUnitIdentifier: 'SKV-SYS01',
  },
  {
    id: 'alloc-awaiting-ext-1',
    clientId: 'client-2', clientName: 'Bob The Builder Inc.',
    branchId: 'branch-cnx-nimman', branchName: 'Chiang Mai Nimman Lockers (Franchise)',
    usedSpaceSqm: 8, status: 'AwaitingExtensionPayment', allocationDate: subDays(new Date(), 75).toISOString(),
    requestedExtendedSpaceSqm: 12, additionalFeeForExtension: 700 * 12, // 1 month for 12sqm
    extensionRequestDate: subDays(new Date(), 2).toISOString(),
    extensionCheckoutSent: { type: 'gateway', sentAt: subDays(new Date(), 1).toISOString() },
    currentBillingCycleEndDate: dateFnsAddMonths(subDays(new Date(), 75), 3).toISOString(), // Original end date
  },
  {
    id: 'alloc-awaiting-renewal-1',
    clientId: 'client-3', clientName: 'Charlie Brown',
    branchId: 'branch-bkk-sathorn', branchName: 'Widing Sathorn Compact',
    usedSpaceSqm: 10, status: 'AwaitingRenewal', allocationDate: subDays(addDays(new Date(), 2), 30).toISOString(), // Ends in 2 days
    internalUnitIdentifier: 'STN-R01', currentBillingCycleEndDate: addDays(new Date(), 2).toISOString(),
  },
  {
    id: 'alloc-released-1',
    clientId: 'client-5', clientName: 'Edward Nygma',
    branchId: 'branch-bkk-sukhumvit', branchName: 'Widing Sukhumvit Micro-Hub',
    usedSpaceSqm: 10, status: 'Released', allocationDate: subDays(new Date(), 200).toISOString(),
    releaseDate: subDays(new Date(), 20).toISOString(),
    notes: 'Client cleared out all items.'
  },
   // New allocation for testing time extension payment confirmation
  {
    id: 'alloc-time-ext-payment',
    clientId: 'client-1', clientName: 'Alice Wonderland',
    branchId: 'branch-bkk-sathorn', branchName: 'Widing Sathorn Compact',
    usedSpaceSqm: 10, status: 'AwaitingExtensionPayment', allocationDate: subDays(new Date(), 40).toISOString(),
    monthsExtended: 2, additionalFeeForExtension: 10 * 700 * 2, // 2 months for 10sqm
    extensionRequestDate: subDays(new Date(), 3).toISOString(),
    currentBillingCycleEndDate: subDays(new Date(), 10).toISOString(), // Original end date was in past
  },
];


export let mockBookings: Booking[] = [
  {
    id: 'booking-up-pending-1',
    branchId: 'branch-bkk-sukhumvit', branchName: 'Widing Sukhumvit Micro-Hub',
    clientId: 'client-1', clientName: 'Alice Wonderland',
    driverName: '', bookingType: 'Pick-up',
    startTime: addDays(new Date(), 5).toISOString(), endTime: dateFnsAddMonths(addDays(new Date(), 5), 3).toISOString(),
    status: 'Pending', staffNotes: 'Awaiting delivery plan for Alice. Needs 3 months storage.',
    desiredWidthSqm: 2, desiredLengthSqm: 3, // 6 sqm
    suggestedInternalUnitIdentifier: 'SKV-U01-U06', createdAt: subDays(new Date(), 1).toISOString(),
    thumbnailImageUrl: 'https://placehold.co/100x75.png', originFloor: '3',
    originPhoneNumber: '081-111-1111', originAvailableTimeSlots: 'Mon-Fri 10am-4pm',
    items: [{type: "box_large", quantity: 5}, {type: "sofa", quantity: 1}], itemImageNames: ["alice_pickup_1.jpg", "alice_pickup_2.jpg"],
    disassemblyOption: 'specific', numberOfItemsToDisassemble: 1, customerSelfDelivery: false,
  },
  {
    id: 'booking-up-pending-2',
    branchId: 'branch-nb-pakkret', branchName: 'Nonthaburi Express Pods (Partner)',
    clientId: 'client-2', clientName: 'Bob The Builder Inc.',
    driverName: '', bookingType: 'Pick-up',
    startTime: addDays(new Date(), 8).toISOString(), endTime: dateFnsAddMonths(addDays(new Date(), 8), 1).toISOString(),
    status: 'Pending', staffNotes: 'Bob needs a pickup, plan required. Short term 1 month. Needs wrapping and disassembly for large tools.',
    desiredWidthSqm: 1, desiredLengthSqm: 2, // 2 sqm
    suggestedInternalUnitIdentifier: 'NB-U01-U02', createdAt: subDays(new Date(), 2).toISOString(),
    needsWrapping: true, disassemblyOption: 'all', originFloor: '10',
    originPhoneNumber: '082-222-2222', originAvailableTimeSlots: 'Anytime with 2hr notice',
    items: [{type: "appliance_large", quantity: 2}, {type: "sports_equipment", quantity: 3}], itemImageNames: ["tool_chest.jpg", "ladder_set.png"],
    customerSelfDelivery: false,
  },
  {
    id: 'booking-up-processing-1',
    branchId: 'branch-bkk-sukhumvit', branchName: 'Widing Sukhumvit Micro-Hub',
    clientId: 'client-3', clientName: 'Charlie Brown',
    driverName: '', bookingType: 'Pick-up',
    startTime: addDays(new Date(), 6).toISOString(), endTime: dateFnsAddMonths(addDays(new Date(), 6), 6).toISOString(),
    status: 'Processing', staffNotes: 'Client will deliver. Awaiting booking team review. 6 months storage.',
    desiredWidthSqm: 1.5, desiredLengthSqm: 2, // 3 sqm
    suggestedInternalUnitIdentifier: 'SKV-U07-U09', createdAt: subDays(new Date(), 1).toISOString(),
    chosenDeliveryOptionId: undefined, // No option needed if self-delivery
    hasBigFurniture: true, bigFurnitureMaxWidthCm: 200, bigFurnitureMaxHeightCm: 100, originFloor: 'Ground',
    originPhoneNumber: '083-333-3333', itemImageNames: ["charlie_pickup.png"], customerSelfDelivery: true,
  },
  {
    id: 'booking-up-processing-2',
    branchId: 'branch-cnx-nimman', branchName: 'Chiang Mai Nimman Lockers (Franchise)', // Changed branch
    clientId: 'client-4', clientName: 'Diana Prince',
    driverName: '', bookingType: 'Return',
    startTime: addDays(new Date(), 10).toISOString(), endTime: addHours(addDays(new Date(), 10), 2).toISOString(),
    status: 'Processing', selectedAllocationId: 'alloc-4', // Diana's allocation is now alloc-4 at Sathorn, but this is a return from CNX, so needs a CNX alloc
    // Let's assume Diana also has an older allocation at CNX for this return for consistency
    // If alloc-4 was at Sathorn, this booking's branchId must be Sathorn.
    // For this example, I'll create a hypothetical alloc-diana-cnx for the return.
    // OR, change selectedAllocationId to alloc-3 (Charlie Brown's at CNX for test) or create alloc for Diana at CNX
    // Let's point it to alloc-3 to simplify, implying this booking is for Charlie's return from CNX handled by Diana as a proxy.
    // Or, more realistically, this booking should reference an allocation for Diana at CNX.
    // To make it consistent with alloc-4 (Diana's actual alloc at Sathorn), this booking's branchId should be 'branch-bkk-sathorn'
    // For now, let's assume alloc-3 (Charlie's at CNX) is being returned, and Diana is the contact.
    // Update: Let's keep it as alloc-4 (Diana) and change this booking's branch to Sathorn.
    // On second thought, selectedAllocationId should dictate the branch, so this booking will use branchId from alloc-4.
    // The UI for staff booking form now auto-selects branch based on allocation for returns.
    // So, if selectedAllocationId is alloc-4 (at Sathorn), branchId here will become branch-bkk-sathorn
    branchId: 'branch-bkk-sathorn', branchName: 'Widing Sathorn Compact',
    staffNotes: 'Return for Diana, delivery options submitted. Destination is different from origin.',
    createdAt: subDays(new Date(), 3).toISOString(), chosenDeliveryOptionId: 'delopt-proc-2-a',
    destinationSameAsOrigin: false, destinationStreetAddress: "12 Pantheon Ave", destinationFloor: "5th Floor, Apt 501",
    destinationSubDistrict: "Rong Mueang", destinationDistrict: "Pathum Wan", destinationProvince: "Bangkok", destinationPostcode: "10330",
    destinationPhoneNumber: '084-444-4444', destinationAvailableTimeSlots: 'Weekends only, prefer afternoon',
    destinationGoogleMapsLink: 'https://maps.google.com/?q=Diana+Prince+New+Destination',
    disassemblyOption: 'none', customerSelfDelivery: false,
  },
  {
    id: 'booking-up-preconfirmed-1',
    branchId: 'branch-nb-pakkret', branchName: 'Nonthaburi Express Pods (Partner)',
    clientId: 'client-1', clientName: 'Alice Wonderland',
    driverName: '', bookingType: 'Pick-up',
    startTime: addDays(new Date(), 7).toISOString(), endTime: dateFnsAddMonths(addDays(new Date(), 7), 2).toISOString(),
    status: 'Pre-confirmed', chosenDeliveryOptionId: 'delopt-proc-1-b',
    staffNotes: 'Delivery option selected, awaiting payment for 2 months.',
    desiredWidthSqm: 2, desiredLengthSqm: 2.5, // 5 sqm
    suggestedInternalUnitIdentifier: 'NB-U03-U07', createdAt: subDays(new Date(), 1).toISOString(),
    checkoutPageSent: {type: 'gateway', sentAt: subHours(new Date(), 2).toISOString()}, itemImageNames: ["alice_stuff.jpg"],
    originFloor: '3', originPhoneNumber: '081-111-1111',
  },
  {
    id: 'booking-up-preconfirmed-2',
    branchId: 'branch-bkk-sukhumvit', branchName: 'Widing Sukhumvit Micro-Hub', // client-2 Alice's alloc-1 is at sukhumvit
    clientId: 'client-1', clientName: 'Alice Wonderland', // Changed to Alice who has alloc-1
    driverName: '', bookingType: 'Return',
    startTime: addDays(new Date(), 12).toISOString(), endTime: addHours(addDays(new Date(), 12), 2).toISOString(),
    status: 'Pre-confirmed', selectedAllocationId: 'alloc-1', chosenDeliveryOptionId: 'delopt-proc-2-b',
    staffNotes: 'Return payment pending for Alice. Destination same as client origin.', createdAt: subDays(new Date(), 2).toISOString(),
    destinationSameAsOrigin: true, destinationFloor: '3', destinationPhoneNumber: '081-111-1111',
  },
  {
    id: 'booking-up-confirmed-1',
    branchId: 'branch-bkk-sukhumvit', branchName: 'Widing Sukhumvit Micro-Hub',
    clientId: 'client-1', clientName: 'Alice Wonderland',
    driverName: 'Driver Dan', vehicleInfo: 'ABC 123 - Blue Truck', bookingType: 'Pick-up',
    startTime: addDays(new Date(), 14).toISOString(), endTime: dateFnsAddMonths(addDays(new Date(), 14), 1).toISOString(),
    status: 'Confirmed', staffNotes: 'Fragile items, handle with care. Confirmed for next week.',
    desiredWidthSqm: 2, desiredLengthSqm: 2, // 4 sqm
    suggestedInternalUnitIdentifier: 'SKV-U10-U13', createdAt: subDays(new Date(), 3).toISOString(),
    thumbnailImageUrl: 'https://placehold.co/100x75.png', itemImageNames: ["fragile_box.jpg"], originFloor: '3', originPhoneNumber: '081-111-1111',
  },
  {
    id: 'booking-today-confirmed-1',
    branchId: 'branch-bkk-sukhumvit', branchName: 'Widing Sukhumvit Micro-Hub',
    clientId: 'client-1', // Changed to a known client
    clientName: 'Alice Wonderland',
    driverName: 'Driver Confirmed Today', bookingType: 'Pick-up',
    startTime: new Date().toISOString(), endTime: dateFnsAddMonths(new Date(), 2).toISOString(),
    status: 'Confirmed', staffNotes: 'Ready for transit today.',
    desiredWidthSqm: 1, desiredLengthSqm: 1, // 1 sqm
    suggestedInternalUnitIdentifier: 'SKV-U14', createdAt: subHours(new Date(), 2).toISOString(),
    itemImageNames: ["jetson_box.jpg"], originPhoneNumber: '081-111-1111', originAvailableTimeSlots: '10am - 12pm only',
  },
  {
    id: 'booking-today-confirmed-2',
    branchId: 'branch-bkk-sathorn', branchName: 'Widing Sathorn Compact', // Matches alloc-4
    clientId: 'client-4', clientName: 'Diana Prince',
    driverName: 'Driver Diana', bookingType: 'Return',
    startTime: new Date().toISOString(), endTime: addHours(new Date(), 2).toISOString(),
    selectedAllocationId: 'alloc-4', // Diana's allocation at Sathorn
    status: 'Confirmed', staffNotes: 'Return confirmed for today. Custom destination address given.',
    createdAt: subHours(new Date(), 3).toISOString(),
    destinationSameAsOrigin: false, destinationStreetAddress: "1 Amazon Way, Olympus Tower", destinationFloor: "100",
    destinationProvince: "Bangkok", destinationDistrict: "Phra Nakhon", destinationSubDistrict: "San Chaopho Suea", destinationPostcode: "10200",
    destinationPhoneNumber: "084-567-8900",
  },
  {
    id: 'booking-today-intransit-1',
    branchId: 'branch-bkk-sukhumvit', branchName: 'Widing Sukhumvit Micro-Hub',
    clientId: 'client-2', clientName: 'Bob The Builder Inc.',
    driverName: 'Driver In Transit Now', vehicleInfo: 'XYZ 789 - Yellow Truck', bookingType: 'Pick-up',
    startTime: new Date().toISOString(), endTime: dateFnsAddMonths(new Date(), 1).toISOString(),
    status: 'InTransit', staffNotes: 'Currently on the way. Client requested no elevator access for pickup, expect stairs.',
    desiredWidthSqm: 2.5, desiredLengthSqm: 3.5, // 8.75 sqm
    suggestedInternalUnitIdentifier: 'SKV-U15-U23', createdAt: subHours(new Date(), 1).toISOString(),
    hasElevator: false, itemImageNames: ["bob_construction_tools.jpg"], originFloor: '10', originPhoneNumber: '082-222-2222',
  },
  {
    id: 'booking-today-awaitingalloc-1',
    branchId: 'branch-nb-pakkret', branchName: 'Nonthaburi Express Pods (Partner)',
    clientId: 'client-3', clientName: 'Charlie Brown',
    driverName: 'Driver Delivered', vehicleInfo: 'DOG 001 - Red Baron Transporter', bookingType: 'Pick-up',
    startTime: new Date().toISOString(), endTime: dateFnsAddMonths(new Date(), 1).toISOString(),
    status: 'AwaitingAllocation', staffNotes: 'Items at warehouse, need space allocation. Docking area used.',
    desiredWidthSqm: 1.5, desiredLengthSqm: 1.5, // 2.25 sqm
    suggestedInternalUnitIdentifier: 'NB-U08-U10', createdAt: subHours(new Date(), 0.5).toISOString(),
    hasDockingArea: true, itemImageNames: ["snoopy_house.jpg"], originFloor: 'Ground', originPhoneNumber: '083-333-3333',
  },
  {
    id: 'booking-completed-1',
    branchId: 'branch-bkk-sukhumvit', branchName: 'Widing Sukhumvit Micro-Hub',
    clientId: 'client-1', clientName: 'Alice Wonderland',
    driverName: 'Client Alice (Self-Move)', bookingType: 'Return',
    selectedAllocationId: 'alloc-1', // Alice's alloc-1 is at sukhumvit
    startTime: subDays(new Date(), 10).toISOString(), endTime: addHours(subDays(new Date(), 10), 2).toISOString(),
    status: 'Completed', destinationSameAsOrigin: true, createdAt: subDays(new Date(), 15).toISOString(),
    customerSelfDelivery: true, destinationFloor: '3', destinationPhoneNumber: '081-111-1111',
  },
  {
    id: 'booking-cancelled-idle-1',
    branchId: 'branch-cnx-nimman', branchName: 'Chiang Mai Nimman Lockers (Franchise)',
    clientId: 'client-5', clientName: 'Edward Nygma',
    driverName: '', bookingType: 'Pick-up',
    startTime: addDays(new Date(), 10).toISOString(), endTime: dateFnsAddMonths(addDays(new Date(), 10), 1).toISOString(),
    status: 'Pending', staffNotes: 'This booking should become idle.',
    desiredWidthSqm: 1, desiredLengthSqm: 1.5, // 1.5 sqm
    suggestedInternalUnitIdentifier: 'CNX-U13-U14', createdAt: subDays(new Date(), 8).toISOString(),
    itemImageNames: ["riddles_box.jpg"],
  },
  {
    id: 'booking-pickup-add-existing-1',
    branchId: 'branch-bkk-sukhumvit', branchName: 'Widing Sukhumvit Micro-Hub', // Matches alloc-1 branch
    clientId: 'client-1', clientName: 'Alice Wonderland',
    bookingType: 'Pick-up', isAddingToExistingStorage: true, linkedAllocationId: 'alloc-1', // Alice's existing at Sukhumvit
    startTime: addDays(new Date(), 4).toISOString(), endTime: addHours(addDays(new Date(), 4), 2).toISOString(),
    status: 'Pending', staffNotes: 'Alice wants to add more items to her existing storage (alloc-1). Needs delivery planning.',
    items: [{type: "box_medium", quantity: 3}, {type: "chair", quantity: 1}], itemImageNames: ["alice_additional_items.jpg"],
    originPhoneNumber: '081-111-1111', originAvailableTimeSlots: 'Mon-Fri 10am-4pm',
    createdAt: subDays(new Date(), 0.5).toISOString(), originFloor: '3',
    disassemblyOption: 'none', customerSelfDelivery: false,
  },
];

// Delivery Options - Assume these are fine as they link to booking IDs
export let mockDeliveryOptions: DeliveryOption[] = [
  {
    id: 'delopt-proc-1-a', bookingId: 'booking-up-processing-1', providerName: 'Self-Delivery (Customer)', estimatedCost: 0,
    vehicleAssignments: [{ vehicleType: 'Customer Own', quantity: 1, numberOfDrivers: 1, numberOfAssistants: 0 }],
    createdAt: subDays(new Date(), 1).toISOString(), currency: 'THB',
  },
  {
    id: 'delopt-proc-1-b', bookingId: 'booking-up-preconfirmed-1', providerName: 'Makesend', estimatedCost: 750,
    vehicleAssignments: [{ vehicleType: 'Van', quantity: 1, numberOfDrivers: 1, numberOfAssistants: 1 }],
    createdAt: subDays(new Date(), 2).toISOString(), currency: 'THB', picPhoneNumber: '090-123-4567',
  },
  {
    id: 'delopt-proc-2-a', bookingId: 'booking-up-processing-2', providerName: 'Lalamove', estimatedCost: 1200,
    vehicleAssignments: [{ vehicleType: 'Small Truck (4-wheel)', quantity: 1, numberOfDrivers: 1, numberOfAssistants: 1 }],
    createdAt: subDays(new Date(), 3).toISOString(), currency: 'THB', picPhoneNumber: '091-987-6543',
  },
   {
    id: 'delopt-proc-2-b', bookingId: 'booking-up-preconfirmed-2', providerName: 'Makesend', estimatedCost: 600,
    vehicleAssignments: [{ vehicleType: 'Motorcycle', quantity: 2, numberOfDrivers: 2, numberOfAssistants: 0 }],
    createdAt: subDays(new Date(), 2).toISOString(), currency: 'THB', picPhoneNumber: '092-111-2222',
  },
];

// Transactions - Update relatedBranchId if needed
export let mockTransactions: Transaction[] = [
  { id: 'txn-1', bookingId: 'booking-up-preconfirmed-1', clientId: 'client-1', clientName: 'Alice Wonderland', date: subDays(new Date(), 1).toISOString(), type: 'FullAmount', amount: 3500, currency: 'THB', method: 'Online', status: 'Pending', description: 'Storage & delivery for Alice', relatedBranchId: 'branch-nb-pakkret', invoiceStatus: 'NotYet', receiptStatus: 'NotYet'},
  { id: 'txn-2', bookingId: 'booking-up-preconfirmed-2', clientId: 'client-1', clientName: 'Alice Wonderland', date: subDays(new Date(), 2).toISOString(), type: 'DeliveryOnly', amount: 600, currency: 'THB', method: 'CreditCard', status: 'Pending', description: 'Return delivery for Alice', relatedBranchId: 'branch-bkk-sukhumvit', invoiceStatus: 'Created', receiptStatus: 'NotYet'},
  { id: 'txn-3', clientId: 'client-3', clientName: 'Charlie Brown', date: subDays(new Date(), 7).toISOString(), type: 'Subscription', amount: 1500, currency: 'THB', method: 'BankTransfer', status: 'Completed', description: 'Monthly storage fee for Charlie', relatedAllocationId: 'alloc-3', relatedBranchId: 'branch-cnx-nimman', invoiceStatus: 'Sent', receiptStatus: 'Sent'},
  { id: 'txn-4', clientId: 'client-2', clientName: 'Bob The Builder Inc.', date: subDays(new Date(), 3).toISOString(), type: 'ExtensionFee', amount: (700*12), currency: 'THB', method: 'Online', status: 'Pending', description: 'Extension fee for alloc alloc-awaiting-ext-1. New total space: 12 SQ.M.', relatedAllocationId: 'alloc-awaiting-ext-1', relatedBranchId: 'branch-cnx-nimman', invoiceStatus: 'NotYet', receiptStatus: 'NotYet'},
  { id: 'txn-5', clientId: 'client-1', clientName: 'Alice Wonderland', date: subDays(new Date(), 3).toISOString(), type: 'ExtensionFee', amount: (10 * 700 * 2), currency: 'THB', method: 'Online', status: 'Pending', description: 'Fee for 2-month time extension for allocation alloc-time-ext-payment. Current space: 10.00 SQ.M.', relatedAllocationId: 'alloc-time-ext-payment', relatedBranchId: 'branch-bkk-sathorn', invoiceStatus: 'NotYet', receiptStatus: 'NotYet'},

];


// Function to recalculate branch capacities
function recalculateBranchCapacities() {
  mockBranches.forEach(branch => {
    const relevantAllocations = mockAllocatedBulkSpaces.filter(
      alloc => alloc.branchId === branch.id && 
               (alloc.status === 'Occupied' || alloc.status === 'Reserved' || alloc.status === 'AwaitingExtensionPayment' || alloc.status === 'AwaitingRenewal')
    );
    const occupiedSqm = relevantAllocations.reduce((sum, alloc) => sum + alloc.usedSpaceSqm, 0);
    const totalSqm = parseFloat(branch.totalCapacity.split(" ")[0]);

    branch.occupiedCapacity = `${occupiedSqm.toFixed(1)} sq m`;
    branch.remainingBulkCapacity = `${(totalSqm - occupiedSqm).toFixed(1)} sq m`;
  });
}

// Call recalculation after all mock data is defined and potentially adjusted
recalculateBranchCapacities();


// Helper functions for getBranchById, getClientById, addBranch, updateBranch etc. should remain the same
// unless they need to handle new fields from Client or Branch types specifically.

export const getSpacesForBranch = (branchId: string): Space[] => {
  return mockSpaces.filter(space => space.branchId === branchId);
}

export const getBranchById = (branchId: string | undefined): Branch | undefined => {
  if (!branchId) return undefined;
  return mockBranches.find(branch => branch.id === branchId);
}

export const addBranch = (branchData: Omit<Branch, 'id' | 'occupiedCapacity' | 'remainingBulkCapacity' | 'availableSpaces'>): Branch => {
  const totalSqm = parseFloat(branchData.totalCapacity.split(" ")[0]) || 0;
  const newBranch: Branch = {
    id: `branch-${Date.now()}`,
    name: branchData.name,
    addressDetail: branchData.addressDetail,
    province: branchData.province,
    district: branchData.district,
    subDistrict: branchData.subDistrict,
    postcode: branchData.postcode,
    contactInfo: branchData.contactInfo,
    totalCapacity: `${totalSqm} sq m`,
    occupiedCapacity: "0 sq m",
    remainingBulkCapacity: `${totalSqm} sq m`,
    ceilingHeightMeters: branchData.ceilingHeightMeters,
    numberOfFloors: branchData.numberOfFloors,
    branchType: branchData.branchType,
    branchOwner: branchData.branchOwner,
    operatingHours: branchData.operatingHours,
    googleMapsLink: branchData.googleMapsLink,
    payoutDayOfMonth: branchData.payoutDayOfMonth,
    commissionRatePercent: branchData.commissionRatePercent,
    commissionNotes: branchData.commissionNotes,
  };
  mockBranches.push(newBranch);
  mockPlatformActivities.unshift({
    id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Branch', action: 'Created',
    description: `New branch added: ${newBranch.name}.`, entityId: newBranch.id, entityName: newBranch.name, detailsLink: `/branches/${newBranch.id}`
  });
  recalculateBranchCapacities();
  return newBranch;
};

export const updateBranch = (branchId: string, updatedData: Partial<Omit<Branch, 'id'>>): Branch | undefined => {
  const branchIndex = mockBranches.findIndex(b => b.id === branchId);
  if (branchIndex !== -1) {
    const currentBranch = mockBranches[branchIndex];
    const newTotalCapacityString = updatedData.totalCapacity || currentBranch.totalCapacity;
    const newTotalSqm = parseFloat(newTotalCapacityString.split(" ")[0]) || 0;

    mockBranches[branchIndex] = {
      ...currentBranch,
      ...updatedData,
      totalCapacity: `${newTotalSqm} sq m`, // Ensure it's always string with "sq m"
    };
    
    // Occupied capacity doesn't change directly here, but remaining does based on new total
    const occupiedNum = currentBranch.occupiedCapacity ? parseFloat(currentBranch.occupiedCapacity.split(" ")[0]) : 0;
    mockBranches[branchIndex].remainingBulkCapacity = `${Math.max(0, newTotalSqm - occupiedNum).toFixed(1)} sq m`;

    mockPlatformActivities.unshift({
      id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Branch', action: 'Updated',
      description: `Branch details updated for: ${mockBranches[branchIndex].name}.`, entityId: branchId, entityName: mockBranches[branchIndex].name, detailsLink: `/branches/${branchId}`
    });
    recalculateBranchCapacities(); // Recalculate all in case occupied changed elsewhere for this branch
    return mockBranches[branchIndex];
  }
  return undefined;
};


export const getClientById = (clientId: string | undefined): Client | undefined => {
  if (!clientId) return undefined;
  return mockClients.find(client => client.id === clientId);
}

export const addClient = (clientData: Omit<Client, 'id' | 'joinedDate' | 'status'>): Client => {
  const newClient: Client = {
    id: `client-${Date.now()}`,
    joinedDate: new Date().toISOString(),
    status: 'Prospect',
    name: clientData.name,
    email: clientData.email,
    phone: clientData.phone,
    originLocationType: clientData.originLocationType,
    originStreetAddress: clientData.originStreetAddress,
    originFloor: clientData.originFloor,
    originProvince: clientData.originProvince,
    originDistrict: clientData.district,
    originSubDistrict: clientData.subDistrict,
    originPostcode: clientData.originPostcode,
  };
  mockClients.unshift(newClient);
   mockPlatformActivities.unshift({
    id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Client', action: 'Created',
    description: `New client profile created: ${newClient.name}.`, entityId: newClient.id, entityName: newClient.name, detailsLink: `/clients`
  });
  return newClient;
};


export const getTransactionById = (transactionId: string | undefined): Transaction | undefined => {
  if (!transactionId) return undefined;
  return mockTransactions.find(transaction => transaction.id === transactionId);
}

export const getTransactionsForClient = (clientId: string): Transaction[] => {
  return mockTransactions.filter(transaction => transaction.clientId === clientId).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
}

export const addTransaction = (transactionData: Omit<Transaction, 'id' | 'clientName' | 'currency' | 'invoiceStatus' | 'receiptStatus'>): Transaction => {
  const client = getClientById(transactionData.clientId);
  const newTransaction: Transaction = {
    ...transactionData,
    id: `txn-${Date.now()}`,
    clientName: client?.name || 'Unknown Client',
    currency: 'THB',
    invoiceStatus: 'NotYet',
    receiptStatus: 'NotYet',
  };
  mockTransactions.unshift(newTransaction);
   mockPlatformActivities.unshift({
    id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Transaction', action: 'Created',
    description: `New transaction of ${newTransaction.amount} THB for ${newTransaction.clientName}.`, entityId: newTransaction.id, entityName: newTransaction.clientName, detailsLink: `/transactions/${newTransaction.id}`
  });
  return newTransaction;
};

export const updateTransactionDocumentStatus = (transactionId: string, documentType: 'invoice' | 'receipt', newStatus: 'Created' | 'Sent'): Transaction | undefined => {
  const index = mockTransactions.findIndex(t => t.id === transactionId);
  if (index !== -1) {
    const transaction = mockTransactions[index];
    if (documentType === 'invoice') {
      transaction.invoiceStatus = newStatus;
    } else {
      transaction.receiptStatus = newStatus;
    }
    mockPlatformActivities.unshift({
      id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Transaction', action: 'Updated',
      description: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} status for txn ${transactionId.substring(0,6)} for ${transaction.clientName} updated to ${newStatus}.`, entityId: transactionId, entityName: transaction.clientName, detailsLink: `/transactions/${transactionId}`
    });
    return transaction;
  }
  return undefined;
};

export const getThisMonthIncome = (): number => {
  const now = new Date();
  const firstDayOfMonth = startOfMonth(now);
  const lastDayOfMonth = endOfMonth(now);

  return mockTransactions
    .filter(tx => {
      const txDate = parseISO(tx.date);
      return tx.status === 'Completed' && isWithinInterval(txDate, { start: firstDayOfMonth, end: lastDayOfMonth });
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
};


export const getAllocatedBulkSpaces = (): AllocatedBulkSpace[] => {
  return mockAllocatedBulkSpaces.sort((a, b) => new Date(b.allocationDate).getTime() - new Date(a.allocationDate).getTime());
}

export const getAllocatedBulkSpacesForClient = (clientId: string, statuses: AllocatedBulkSpaceStatus[] = ['Occupied', 'Reserved', 'AwaitingExtensionPayment', 'AwaitingRenewal']): AllocatedBulkSpace[] => {
  return mockAllocatedBulkSpaces.filter(a => a.clientId === clientId && statuses.includes(a.status));
}


export const addAllocatedBulkSpace = (
  allocation: Omit<AllocatedBulkSpace, 'id' | 'allocationDate' | 'clientName' | 'branchName' | 'status'> & { clientId?: string; status?: AllocatedBulkSpaceStatus, relatedBookingId?: string, allocatedSpaceImageNames?: string[], internalUnitIdentifier?: string, additionalFeeForExtension?: number, currentBillingCycleEndDate?: string }
): AllocatedBulkSpace => {
  const branch = getBranchById(allocation.branchId);
  let clientName: string;
  let currentStatus: AllocatedBulkSpaceStatus;
  let effectiveClientId: string | undefined = allocation.clientId;
  let notes = allocation.notes || "";
  let fee = allocation.additionalFeeForExtension;
  let extensionDate = undefined;
  let billingEndDate = allocation.currentBillingCycleEndDate;

  if (!effectiveClientId || effectiveClientId === "") {
    clientName = "System Reserved";
    currentStatus = 'Reserved';
    notes = allocation.notes || "System Reserved - Pending Client Assignment";
    effectiveClientId = undefined;
    fee = undefined;
  } else {
    const client = getClientById(effectiveClientId);
    clientName = client?.name || 'Unknown Client';
    if (fee && fee > 0) {
        currentStatus = 'AwaitingExtensionPayment';
        notes = allocation.notes || `Initial allocation for ${clientName}. Awaiting payment for ฿${fee.toFixed(2)}.`;
        extensionDate = formatISO(new Date());
    } else {
        currentStatus = 'Occupied';
        notes = allocation.notes || `Direct allocation for ${clientName}.`;
    }
  }

  const relatedBooking = allocation.relatedBookingId ? getBookingById(allocation.relatedBookingId) : undefined;
  if(relatedBooking && relatedBooking.bookingType === 'Pick-up' && !billingEndDate && !relatedBooking.isAddingToExistingStorage) {
    billingEndDate = relatedBooking.endTime;
  }


  const newAllocation: AllocatedBulkSpace = {
    ...allocation,
    id: `alloc-${Date.now()}`,
    allocationDate: formatISO(new Date()),
    clientId: effectiveClientId,
    clientName: clientName,
    branchName: branch?.name || 'Unknown Branch',
    status: currentStatus,
    notes: notes,
    additionalFeeForExtension: fee,
    extensionRequestDate: extensionDate,
    relatedBookingId: allocation.relatedBookingId,
    allocatedSpaceImageNames: allocation.allocatedSpaceImageNames || [],
    internalUnitIdentifier: allocation.internalUnitIdentifier,
    currentBillingCycleEndDate: billingEndDate,
  };
  mockAllocatedBulkSpaces.unshift(newAllocation);

  if (newAllocation.clientId && newAllocation.status === 'AwaitingExtensionPayment' && newAllocation.additionalFeeForExtension && newAllocation.additionalFeeForExtension > 0) {
    addTransaction({
        clientId: newAllocation.clientId,
        date: new Date().toISOString(),
        type: 'FullAmount',
        amount: newAllocation.additionalFeeForExtension,
        method: 'Online',
        status: 'Pending',
        description: `Initial storage fee for allocation ${newAllocation.id.substring(0,8)} at ${newAllocation.branchName}.`,
        relatedAllocationId: newAllocation.id,
        relatedBranchId: newAllocation.branchId,
    });
  }
  recalculateBranchCapacities();
  mockPlatformActivities.unshift({
    id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Allocation', action: 'Created',
    description: `New flexible allocation for ${newAllocation.clientName} at ${newAllocation.branchName} (${newAllocation.usedSpaceSqm} SQ.M). Status: ${newAllocation.status}.`, entityId: newAllocation.id, entityName: newAllocation.clientName, detailsLink: `/flexible-allocations`
  });

  return newAllocation;
}

export const updateAllocatedBulkSpace = (id: string, updates: Partial<Omit<AllocatedBulkSpace, 'id' | 'clientId' | 'clientName' | 'branchId' | 'branchName' | 'allocationDate' | 'relatedBookingId' | 'allocatedSpaceImageNames' | 'requestedExtendedSpaceSqm' | 'additionalFeeForExtension' | 'extensionRequestDate' | 'extensionCheckoutSent' | 'releaseDate'>>): AllocatedBulkSpace | undefined => {
  const index = mockAllocatedBulkSpaces.findIndex(a => a.id === id);
  if (index !== -1) {
    const currentAllocation = mockAllocatedBulkSpaces[index];
    let updatedFields = "";
    if (updates.usedSpaceSqm !== undefined && updates.usedSpaceSqm !== currentAllocation.usedSpaceSqm) updatedFields += `Space: ${updates.usedSpaceSqm}SQM. `;
    if (updates.status !== undefined && updates.status !== currentAllocation.status) updatedFields += `Status: ${updates.status}. `;
    if (updates.notes !== undefined && updates.notes !== currentAllocation.notes) updatedFields += `Notes updated. `;
    if (updates.internalUnitIdentifier !== undefined && updates.internalUnitIdentifier !== currentAllocation.internalUnitIdentifier) updatedFields += `Unit IDs: ${updates.internalUnitIdentifier}. `;


    mockAllocatedBulkSpaces[index] = { ...currentAllocation, ...updates };
    recalculateBranchCapacities();
    mockPlatformActivities.unshift({
      id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Allocation', action: 'Updated',
      description: `Allocation for ${mockAllocatedBulkSpaces[index].clientName} updated. ${updatedFields || 'Details changed.'}`, entityId: id, entityName: mockAllocatedBulkSpaces[index].clientName, detailsLink: `/flexible-allocations`
    });
    return mockAllocatedBulkSpaces[index];
  }
  return undefined;
}

export const releaseAllocatedBulkSpace = (id: string): boolean => {
  const index = mockAllocatedBulkSpaces.findIndex(a => a.id === id);
  if (index !== -1) {
    const oldStatus = mockAllocatedBulkSpaces[index].status;
    mockAllocatedBulkSpaces[index].status = 'Released';
    mockAllocatedBulkSpaces[index].releaseDate = formatISO(new Date());
    recalculateBranchCapacities();
    mockPlatformActivities.unshift({
      id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Allocation', action: 'StatusChanged',
      description: `Allocation ${id.substring(0,6)} for ${mockAllocatedBulkSpaces[index].clientName} changed from ${oldStatus} to Released.`, entityId: id, entityName: mockAllocatedBulkSpaces[index].clientName, detailsLink: `/flexible-allocations`
    });
    return true;
  }
  return false;
}

export const requestSpaceExtension = (allocationId: string, newTotalSpaceSqm: number, additionalFee: number): AllocatedBulkSpace | undefined => {
  const index = mockAllocatedBulkSpaces.findIndex(a => a.id === allocationId);
  if (index !== -1 && (mockAllocatedBulkSpaces[index].status === 'Occupied' || mockAllocatedBulkSpaces[index].status === 'Reserved')) {
    mockAllocatedBulkSpaces[index].status = 'AwaitingExtensionPayment';
    mockAllocatedBulkSpaces[index].requestedExtendedSpaceSqm = newTotalSpaceSqm;
    mockAllocatedBulkSpaces[index].additionalFeeForExtension = additionalFee;
    mockAllocatedBulkSpaces[index].extensionRequestDate = formatISO(new Date());
    mockAllocatedBulkSpaces[index].extensionCheckoutSent = undefined;
    mockAllocatedBulkSpaces[index].monthsExtended = undefined;


    mockPlatformActivities.unshift({
      id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Allocation', action: 'Updated',
      description: `Space extension requested for alloc ${allocationId.substring(0,6)} (${mockAllocatedBulkSpaces[index].clientName}). New Space: ${newTotalSpaceSqm} SQ.M, Fee: ฿${additionalFee.toFixed(2)}.`, entityId: allocationId, entityName: mockAllocatedBulkSpaces[index].clientName, detailsLink: `/flexible-allocations`
    });
    addTransaction({
        clientId: mockAllocatedBulkSpaces[index].clientId!,
        date: new Date().toISOString(),
        type: 'ExtensionFee',
        amount: additionalFee,
        method: 'Online',
        status: 'Pending',
        description: `Extension fee for allocation ${allocationId.substring(0,8)}. New total space: ${newTotalSpaceSqm} SQ.M.`,
        relatedAllocationId: allocationId,
        relatedBranchId: mockAllocatedBulkSpaces[index].branchId,
    });
    recalculateBranchCapacities();
    return mockAllocatedBulkSpaces[index];
  }
  return undefined;
};

export const requestTimeExtension = (allocationId: string, numberOfMonths: number, additionalFee: number): AllocatedBulkSpace | undefined => {
  const index = mockAllocatedBulkSpaces.findIndex(a => a.id === allocationId);
  if (index !== -1 && (mockAllocatedBulkSpaces[index].status === 'Occupied' || mockAllocatedBulkSpaces[index].status === 'Reserved')) {
    mockAllocatedBulkSpaces[index].status = 'AwaitingExtensionPayment';
    mockAllocatedBulkSpaces[index].additionalFeeForExtension = additionalFee;
    mockAllocatedBulkSpaces[index].extensionRequestDate = formatISO(new Date());
    mockAllocatedBulkSpaces[index].monthsExtended = numberOfMonths;
    mockAllocatedBulkSpaces[index].requestedExtendedSpaceSqm = undefined; // Clear this for time extension
    mockAllocatedBulkSpaces[index].extensionCheckoutSent = undefined;

    mockPlatformActivities.unshift({
      id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Allocation', action: 'Updated',
      description: `Time extension requested for alloc ${allocationId.substring(0,6)} (${mockAllocatedBulkSpaces[index].clientName}). Months: ${numberOfMonths}, Fee: ฿${additionalFee.toFixed(2)}.`, entityId: allocationId, entityName: mockAllocatedBulkSpaces[index].clientName, detailsLink: `/flexible-allocations`
    });
    addTransaction({
        clientId: mockAllocatedBulkSpaces[index].clientId!,
        date: new Date().toISOString(),
        type: 'ExtensionFee',
        amount: additionalFee,
        method: 'Online',
        status: 'Pending',
        description: `Fee for ${numberOfMonths}-month time extension for allocation ${allocationId.substring(0,8)}. Current space: ${mockAllocatedBulkSpaces[index].usedSpaceSqm.toFixed(2)} SQ.M.`,
        relatedAllocationId: allocationId,
        relatedBranchId: mockAllocatedBulkSpaces[index].branchId,
    });
    recalculateBranchCapacities(); // Status change affects occupied count
    return mockAllocatedBulkSpaces[index];
  }
  return undefined;
};


export const markExtensionCheckoutSent = (allocationId: string, checkoutType: 'gateway' | 'manual'): AllocatedBulkSpace | undefined => {
  const index = mockAllocatedBulkSpaces.findIndex(a => a.id === allocationId);
  if (index !== -1) {
    mockAllocatedBulkSpaces[index].extensionCheckoutSent = { type: checkoutType, sentAt: formatISO(new Date()) };
     mockPlatformActivities.unshift({
      id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Allocation', action: 'Updated',
      description: `Extension checkout (${checkoutType}) sent for alloc ${allocationId.substring(0,6)} (${mockAllocatedBulkSpaces[index].clientName}).`, entityId: allocationId, entityName: mockAllocatedBulkSpaces[index].clientName, detailsLink: `/flexible-allocations`
    });
    return mockAllocatedBulkSpaces[index];
  }
  return undefined;
};


export const getAllocatedBulkSpaceById = (id: string | undefined): AllocatedBulkSpace | undefined => {
  if (!id) return undefined;
  return mockAllocatedBulkSpaces.find(a => a.id === id);
};


export const getSpacesForClient = (clientId: string): Space[] => {
  return mockSpaces.filter(space => space.clientId === clientId && (space.status === 'Occupied' || space.status === 'Reserved'));
};

export const countClientsByStatus = (status: ClientStatus): number => {
  return mockClients.filter(client => client.status === status).length;
};


export const addBooking = (
  bookingData: Omit<Booking, 'id' | 'clientName' | 'branchName' | 'driverName' | 'vehicleInfo' | 'status' | 'createdAt' | 'thumbnailImageUrl' | 'checkoutPageSent'> &
  { startTime: Date, endTime?: Date }
): Booking => {
  const client = getClientById(bookingData.clientId);
  let branch = getBranchById(bookingData.branchId);

  // If it's a return, the branch should be derived from the selected allocation
  if (bookingData.bookingType === 'Return' && bookingData.selectedAllocationId) {
    const allocation = getAllocatedBulkSpaceById(bookingData.selectedAllocationId);
    if (allocation) {
      branch = getBranchById(allocation.branchId);
      // Ensure bookingData.branchId is updated if different
      if (branch && bookingData.branchId !== branch.id) {
        bookingData.branchId = branch.id;
      }
    }
  }


  let effectiveEndTime: Date;
  if (bookingData.bookingType === 'Return') {
    effectiveEndTime = addHours(bookingData.startTime, 2);
  } else if (bookingData.bookingType === 'Pick-up' && bookingData.isAddingToExistingStorage) {
    effectiveEndTime = addHours(bookingData.startTime, 2);
  }
   else if (bookingData.endTime) {
    effectiveEndTime = bookingData.endTime;
  } else {
    console.error("End time is crucial for Pick-up (New Storage) bookings. Falling back to 1 month from start.");
    effectiveEndTime = dateFnsAddMonths(bookingData.startTime, 1);
  }

  let suggestedIdentifier: string | undefined = undefined;
  let staffNotesWithSuggestion = bookingData.staffNotes || "";

  if (bookingData.bookingType === 'Pick-up' && !bookingData.isAddingToExistingStorage && bookingData.desiredWidthSqm && bookingData.desiredLengthSqm && bookingData.desiredWidthSqm > 0 && bookingData.desiredLengthSqm > 0) {
    const estimatedUnits = Math.ceil(bookingData.desiredWidthSqm * bookingData.desiredLengthSqm);
    if (estimatedUnits > 0) {
      const branchAllocations = mockAllocatedBulkSpaces.filter(a => a.branchId === bookingData.branchId && a.internalUnitIdentifier);
      let maxUnitNum = 0;
      branchAllocations.forEach(alloc => {
        if (alloc.internalUnitIdentifier) {
          const matches = alloc.internalUnitIdentifier.match(/U(\d+)(-U(\d+))?/);
          if (matches) {
            const lastNum = matches[3] ? parseInt(matches[3], 10) : parseInt(matches[1], 10);
            if (!isNaN(lastNum) && lastNum > maxUnitNum) {
              maxUnitNum = lastNum;
            }
          }
        }
      });
      const startNum = maxUnitNum + 1;
      const endNum = startNum + estimatedUnits - 1;
      suggestedIdentifier = estimatedUnits === 1
        ? `U${String(startNum).padStart(2, '0')}`
        : `U${String(startNum).padStart(2, '0')}-U${String(endNum).padStart(2, '0')}`;

      const suggestionText = `(Suggested units: ${suggestedIdentifier} based on ${bookingData.desiredWidthSqm}x${bookingData.desiredLengthSqm}m request.)`;
      staffNotesWithSuggestion = staffNotesWithSuggestion ? `${staffNotesWithSuggestion}\n${suggestionText}` : suggestionText;
    }
  }


  const newBooking: Booking = {
    id: `booking-${Date.now()}`,
    clientId: bookingData.clientId,
    branchId: bookingData.branchId,
    clientName: client?.name || 'Unknown Client',
    branchName: branch?.name || 'Unknown Branch',
    bookingType: bookingData.bookingType,
    startTime: bookingData.startTime.toISOString(),
    endTime: effectiveEndTime.toISOString(),
    chosenDeliveryOptionId: bookingData.chosenDeliveryOptionId,

    isAddingToExistingStorage: bookingData.bookingType === 'Pick-up' ? bookingData.isAddingToExistingStorage : undefined,
    linkedAllocationId: bookingData.bookingType === 'Pick-up' && bookingData.isAddingToExistingStorage ? bookingData.linkedAllocationId : undefined,

    desiredWidthSqm: bookingData.bookingType === 'Pick-up' && !bookingData.isAddingToExistingStorage ? bookingData.desiredWidthSqm : undefined,
    desiredLengthSqm: bookingData.bookingType === 'Pick-up' && !bookingData.isAddingToExistingStorage ? bookingData.desiredLengthSqm : undefined,
    items: bookingData.bookingType === 'Pick-up' ? bookingData.items || [] : undefined,
    itemImageNames: bookingData.bookingType === 'Pick-up' ? bookingData.itemImageNames || [] : undefined,

    selectedAllocationId: bookingData.bookingType === 'Return' ? bookingData.selectedAllocationId : undefined,
    suggestedInternalUnitIdentifier: suggestedIdentifier,

    hasDockingArea: bookingData.hasDockingArea,
    hasCarParkingFee: bookingData.hasCarParkingFee,
    hasElevator: bookingData.hasElevator,
    hasBigFurniture: bookingData.hasBigFurniture,
    bigFurnitureMaxWidthCm: bookingData.hasBigFurniture ? bookingData.bigFurnitureMaxWidthCm : undefined,
    bigFurnitureMaxHeightCm: bookingData.hasBigFurniture ? bookingData.bigFurnitureMaxHeightCm : undefined,
    needsWrapping: bookingData.needsWrapping,

    disassemblyOption: bookingData.disassemblyOption,
    numberOfItemsToDisassemble: bookingData.disassemblyOption === 'specific' ? bookingData.numberOfItemsToDisassemble : undefined,

    customerSelfDelivery: bookingData.customerSelfDelivery,

    customerNotes: bookingData.customerNotes,
    staffNotes: staffNotesWithSuggestion,

    originFloor: bookingData.originFloor,
    originPhoneNumber: bookingData.originPhoneNumber,
    originAvailableTimeSlots: bookingData.originAvailableTimeSlots,
    originGoogleMapsLink: bookingData.originGoogleMapsLink,

    destinationSameAsOrigin: bookingData.destinationSameAsOrigin,
    destinationStreetAddress: bookingData.destinationStreetAddress,
    destinationFloor: bookingData.destinationFloor,
    destinationProvince: bookingData.destinationProvince,
    destinationDistrict: bookingData.destinationDistrict,
    destinationSubDistrict: bookingData.destinationSubDistrict,
    destinationPostcode: bookingData.destinationPostcode,
    destinationPhoneNumber: bookingData.destinationPhoneNumber,
    destinationAvailableTimeSlots: bookingData.destinationAvailableTimeSlots,
    destinationGoogleMapsLink: bookingData.destinationGoogleMapsLink,

    driverName: '',
    vehicleInfo: undefined,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    checkoutPageSent: undefined,
  };
  mockBookings.unshift(newBooking);
  mockPlatformActivities.unshift({
    id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Booking', action: 'Created',
    description: `New ${newBooking.bookingType} booking for ${newBooking.clientName} at ${newBooking.branchName}.`, entityId: newBooking.id, entityName: newBooking.clientName, detailsLink: `/bookings`
  });
  return newBooking;
};


export const getBookingById = (bookingId: string | undefined): Booking | undefined => {
  if (!bookingId) return undefined;
  return mockBookings.find(b => b.id === bookingId);
}

export const updateBookingStatus = (bookingId: string, newStatus: BookingStatus, chosenDeliveryOptionId?: string): Booking | undefined => {
  const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
  if (bookingIndex !== -1) {
    const oldStatus = mockBookings[bookingIndex].status;
    mockBookings[bookingIndex].status = newStatus;
    if (chosenDeliveryOptionId) {
        mockBookings[bookingIndex].chosenDeliveryOptionId = chosenDeliveryOptionId;
    }
    if (oldStatus !== newStatus) {
      mockPlatformActivities.unshift({
        id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Booking', action: 'StatusChanged',
        description: `Booking ${bookingId.substring(0,6)} for ${mockBookings[bookingIndex].clientName} status changed from ${oldStatus} to ${newStatus}.`, entityId: bookingId, entityName: mockBookings[bookingIndex].clientName, detailsLink: `/bookings`
      });
    }
    return mockBookings[bookingIndex];
  }
  return undefined;
};

export const updateBookingCheckoutSent = (bookingId: string, type: 'gateway' | 'manual'): Booking | undefined => {
  const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
  if (bookingIndex !== -1) {
    mockBookings[bookingIndex].checkoutPageSent = { type, sentAt: new Date().toISOString() };
    mockPlatformActivities.unshift({
      id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Booking', action: 'Updated',
      description: `Checkout page (${type}) sent for booking ${bookingId.substring(0,6)} (${mockBookings[bookingIndex].clientName}).`, entityId: bookingId, entityName: mockBookings[bookingIndex].clientName, detailsLink: `/bookings`
    });
    return mockBookings[bookingIndex];
  }
  return undefined;
}

export const getDeliveryOptionsForBooking = (bookingId: string): DeliveryOption[] => {
  return mockDeliveryOptions.filter(opt => opt.bookingId === bookingId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getDeliveryOptionById = (optionId: string | undefined): DeliveryOption | undefined => {
  if (!optionId) return undefined;
  return mockDeliveryOptions.find(opt => opt.id === optionId);
};

export const addDeliveryOption = (optionData: Omit<DeliveryOption, 'id' | 'createdAt' | 'currency'>): DeliveryOption => {
  const newOption: DeliveryOption = {
    ...optionData,
    id: `delopt-${Date.now()}`,
    currency: 'THB',
    createdAt: new Date().toISOString(),
  };
  mockDeliveryOptions.push(newOption);

  const booking = getBookingById(optionData.bookingId);
  if (booking && booking.status === 'Pending' && !booking.customerSelfDelivery) { // Don't change status if self-delivery
    updateBookingStatus(optionData.bookingId, 'Processing');
  }
  mockPlatformActivities.unshift({
    id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'DeliveryOption', action: 'Created',
    description: `New delivery option by ${newOption.providerName} added for booking ${optionData.bookingId.substring(0,6)}.`, entityId: newOption.id, entityName: `Booking ${optionData.bookingId.substring(0,6)}`, detailsLink: `/delivery-summary/${optionData.bookingId}`
  });
  return newOption;
};

export const deleteDeliveryOption = (optionId: string, bookingId: string): boolean => {
  const initialLength = mockDeliveryOptions.length;
  mockDeliveryOptions = mockDeliveryOptions.filter(opt => opt.id !== optionId);

  if (mockDeliveryOptions.length < initialLength) {
    const remainingOptions = getDeliveryOptionsForBooking(bookingId);
    if (remainingOptions.length === 0) {
      const booking = getBookingById(bookingId);
      if (booking && booking.status === 'Processing' && !booking.customerSelfDelivery) {
        updateBookingStatus(bookingId, 'Pending');
      }
    }
     mockPlatformActivities.unshift({
      id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'DeliveryOption', action: 'Deleted',
      description: `Delivery option ${optionId.substring(0,6)} removed for booking ${bookingId.substring(0,6)}.`, entityId: optionId, entityName: `Booking ${bookingId.substring(0,6)}`, detailsLink: `/delivery-summary/${bookingId}`
    });
    return true;
  }
  return false;
};

export const confirmExtensionPayment = (allocationId: string): AllocatedBulkSpace | undefined => {
  const index = mockAllocatedBulkSpaces.findIndex(a => a.id === allocationId && a.status === 'AwaitingExtensionPayment');
  if (index !== -1) {
    const allocation = mockAllocatedBulkSpaces[index];
    allocation.status = 'Occupied';

    const transactionIndex = mockTransactions.findIndex(
      tx => tx.relatedAllocationId === allocationId && tx.status === 'Pending' && tx.type === 'ExtensionFee' && tx.amount === allocation.additionalFeeForExtension
    );
    if (transactionIndex !== -1) {
      mockTransactions[transactionIndex].status = 'Completed';
      mockTransactions[transactionIndex].invoiceStatus = 'Created';
      mockTransactions[transactionIndex].receiptStatus = 'Created';
       mockPlatformActivities.unshift({
        id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Transaction', action: 'StatusChanged',
        description: `Transaction ${mockTransactions[transactionIndex].id.substring(0,6)} for ${mockTransactions[transactionIndex].clientName} marked Completed for extension payment.`, entityId: mockTransactions[transactionIndex].id, entityName: mockTransactions[transactionIndex].clientName, detailsLink: `/transactions/${mockTransactions[transactionIndex].id}`
      });
    }

    if (allocation.monthsExtended && allocation.currentBillingCycleEndDate && !allocation.requestedExtendedSpaceSqm) {
        allocation.currentBillingCycleEndDate = dateFnsAddMonths(parseISO(allocation.currentBillingCycleEndDate), allocation.monthsExtended).toISOString();
    }
    else if (allocation.requestedExtendedSpaceSqm) {
      allocation.usedSpaceSqm = allocation.requestedExtendedSpaceSqm;
    }

    allocation.requestedExtendedSpaceSqm = undefined;
    allocation.additionalFeeForExtension = undefined;
    allocation.extensionRequestDate = undefined;
    allocation.extensionCheckoutSent = undefined;
    allocation.monthsExtended = undefined;
    recalculateBranchCapacities();

    mockPlatformActivities.unshift({
      id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Allocation', action: 'StatusChanged',
      description: `Extension payment confirmed for alloc ${allocationId.substring(0,6)} (${allocation.clientName}). Status: Occupied.`, entityId: allocationId, entityName: allocation.clientName, detailsLink: `/flexible-allocations`
    });
    return allocation;
  }
  return undefined;
};

export const processAllocationRenewal = (allocationId: string, monthsToRenew: number = 1): AllocatedBulkSpace | undefined => {
  const index = mockAllocatedBulkSpaces.findIndex(a => a.id === allocationId && a.status === 'AwaitingRenewal');
  if (index !== -1) {
    const allocation = mockAllocatedBulkSpaces[index];
    allocation.status = 'Occupied';
    allocation.currentBillingCycleEndDate = dateFnsAddMonths(parseISO(allocation.currentBillingCycleEndDate!), monthsToRenew).toISOString();
    allocation.monthsExtended = (allocation.monthsExtended || 0) + monthsToRenew;

    allocation.requestedExtendedSpaceSqm = undefined;
    allocation.additionalFeeForExtension = undefined;
    allocation.extensionRequestDate = undefined;
    allocation.extensionCheckoutSent = undefined;

    const renewalFee = allocation.usedSpaceSqm * 700 * monthsToRenew;
    addTransaction({
      clientId: allocation.clientId!,
      date: new Date().toISOString(),
      type: 'Subscription',
      amount: renewalFee,
      method: 'SystemAuto',
      status: 'Completed',
      description: `${monthsToRenew}-month storage renewal for allocation ${allocationId.substring(0,8)}.`,
      relatedAllocationId: allocationId,
      relatedBranchId: allocation.branchId,
    });
    recalculateBranchCapacities();

    mockPlatformActivities.unshift({
      id: `activity-${Date.now()}`, timestamp: new Date().toISOString(), type: 'Allocation', action: 'Updated',
      description: `Allocation ${allocationId.substring(0,6)} for ${allocation.clientName} renewed for ${monthsToRenew} month(s). New end date: ${format(parseISO(allocation.currentBillingCycleEndDate!), "PP")}.`, entityId: allocationId, entityName: allocation.clientName, detailsLink: `/flexible-allocations`
    });
    return allocation;
  }
  return undefined;
};

export let mockPlatformActivities: PlatformActivity[] = [
  { id: 'act-1', timestamp: subHours(new Date(),1).toISOString(), type: 'Booking', action: 'Created', description: 'New booking for Alice Wonderland at Downtown Storage Hub.', entityId: 'booking-up-pending-1', entityName: 'Alice Wonderland', detailsLink: '/bookings' },
  { id: 'act-2', timestamp: subHours(new Date(),2).toISOString(), type: 'Client', action: 'Updated', description: 'Client Bob The Builder Inc. updated contact info.', entityId: 'client-2', entityName: 'Bob The Builder Inc.', detailsLink: '/clients'},
  { id: 'act-3', timestamp: subHours(new Date(),3).toISOString(), type: 'Branch', action: 'StatusChanged', description: 'Uptown Secure Units changed operating hours.', entityId: 'branch-nb-pakkret', entityName: 'Uptown Secure Units', detailsLink: '/branches/branch-nb-pakkret'},
  { id: 'act-4', timestamp: subDays(new Date(),1).toISOString(), type: 'Transaction', action: 'Completed', description: 'Transaction txn-3 (Charlie Brown, ฿1500.00) completed.', entityId: 'txn-3', entityName: 'Charlie Brown', detailsLink: '/transactions/txn-3'},
  { id: 'act-5', timestamp: subDays(new Date(),2).toISOString(), type: 'Allocation', action: 'Created', description: 'New allocation (20 SQ.M) for Alice Wonderland at Widing Sukhumvit Micro-Hub.', entityId: 'alloc-1', entityName: 'Alice Wonderland', detailsLink: '/flexible-allocations'},
];


// Initial recalculation after all data has been set up
recalculateBranchCapacities();

export const getPlatformActivities = (): PlatformActivity[] => {
  return mockPlatformActivities;
};

// ─── Units (DocumentBox + StorageSpace per branch) ───────────────────────────

export let mockUnits: Unit[] = [
  // Zone A — Document Boxes (Sukhumvit)
  { id:'unit-box-a01', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'BOX-A-001', unitType:'DocumentBox', floor:1, zone:'A', status:'Occupied', boxCapacity:1, monthlyRate:150, currentClientId:'client-1', currentClientName:'Alice Wonderland', currentOrderId:'ord-001', billingCycleEndDate:addDays(new Date(),75).toISOString(), floorPlanX:0,floorPlanY:0,floorPlanW:1,floorPlanH:1, createdAt:subDays(new Date(),90).toISOString() },
  { id:'unit-box-a02', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'BOX-A-002', unitType:'DocumentBox', floor:1, zone:'A', status:'Occupied', boxCapacity:1, monthlyRate:150, currentClientId:'client-2', currentClientName:'Bob The Builder Inc.', billingCycleEndDate:addDays(new Date(),45).toISOString(), floorPlanX:1,floorPlanY:0,floorPlanW:1,floorPlanH:1, createdAt:subDays(new Date(),60).toISOString() },
  { id:'unit-box-a03', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'BOX-A-003', unitType:'DocumentBox', floor:1, zone:'A', status:'Available', boxCapacity:1, monthlyRate:150, floorPlanX:2,floorPlanY:0,floorPlanW:1,floorPlanH:1, createdAt:subDays(new Date(),60).toISOString() },
  { id:'unit-box-a04', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'BOX-A-004', unitType:'DocumentBox', floor:1, zone:'A', status:'Available', boxCapacity:1, monthlyRate:150, floorPlanX:3,floorPlanY:0,floorPlanW:1,floorPlanH:1, createdAt:subDays(new Date(),60).toISOString() },
  { id:'unit-box-a05', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'BOX-A-005', unitType:'DocumentBox', floor:1, zone:'A', status:'Occupied', boxCapacity:1, monthlyRate:150, currentClientId:'client-3', currentClientName:'Charlie Brown', floorPlanX:0,floorPlanY:1,floorPlanW:1,floorPlanH:1, createdAt:subDays(new Date(),30).toISOString() },
  { id:'unit-box-a06', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'BOX-A-006', unitType:'DocumentBox', floor:1, zone:'A', status:'Reserved', boxCapacity:1, monthlyRate:150, currentClientName:'Diana Prince', floorPlanX:1,floorPlanY:1,floorPlanW:1,floorPlanH:1, createdAt:subDays(new Date(),30).toISOString() },
  // Zone B — Small Storage Spaces 2×2m (Sukhumvit)
  { id:'unit-spc-b01', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'SPC-B-001', unitType:'StorageSpace', floor:1, zone:'B', status:'Occupied', widthM:2, lengthM:2, totalSqm:4, monthlyRate:3200, currentClientId:'client-1', currentClientName:'Alice Wonderland', currentOrderId:'ord-002', billingCycleEndDate:addDays(new Date(),30).toISOString(), floorPlanX:0,floorPlanY:0,floorPlanW:2,floorPlanH:2, createdAt:subDays(new Date(),120).toISOString() },
  { id:'unit-spc-b02', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'SPC-B-002', unitType:'StorageSpace', floor:1, zone:'B', status:'Reserved', widthM:2, lengthM:2, totalSqm:4, monthlyRate:3200, currentClientName:'Bob The Builder Inc.', floorPlanX:2,floorPlanY:0,floorPlanW:2,floorPlanH:2, createdAt:subDays(new Date(),120).toISOString() },
  { id:'unit-spc-b03', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'SPC-B-003', unitType:'StorageSpace', floor:1, zone:'B', status:'Available', widthM:2, lengthM:2, totalSqm:4, monthlyRate:3200, floorPlanX:4,floorPlanY:0,floorPlanW:2,floorPlanH:2, createdAt:subDays(new Date(),120).toISOString() },
  // Zone C — Medium Storage Spaces 3×3m (Sukhumvit)
  { id:'unit-spc-c01', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'SPC-C-001', unitType:'StorageSpace', floor:1, zone:'C', status:'AwaitingRenewal' as any, widthM:3, lengthM:3, totalSqm:9, monthlyRate:7200, currentClientId:'client-4', currentClientName:'Diana Prince', billingCycleEndDate:addDays(new Date(),5).toISOString(), floorPlanX:0,floorPlanY:0,floorPlanW:3,floorPlanH:3, createdAt:subDays(new Date(),180).toISOString() },
  { id:'unit-spc-c02', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'SPC-C-002', unitType:'StorageSpace', floor:1, zone:'C', status:'Occupied', widthM:3, lengthM:3, totalSqm:9, monthlyRate:7200, currentClientId:'client-5', currentClientName:'Edward Nygma', floorPlanX:3,floorPlanY:0,floorPlanW:3,floorPlanH:3, createdAt:subDays(new Date(),90).toISOString() },
  // Zone D — Large Storage Spaces 4×4m (Sukhumvit)
  { id:'unit-spc-d01', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'SPC-D-001', unitType:'StorageSpace', floor:2, zone:'D', status:'Occupied', widthM:4, lengthM:4, totalSqm:16, monthlyRate:12800, currentClientId:'client-2', currentClientName:'Bob The Builder Inc.', floorPlanX:0,floorPlanY:0,floorPlanW:4,floorPlanH:4, createdAt:subDays(new Date(),200).toISOString() },
  { id:'unit-spc-d02', branchId:'branch-bkk-sukhumvit', branchName:'Widing Sukhumvit', unitIdentifier:'SPC-D-002', unitType:'StorageSpace', floor:2, zone:'D', status:'Maintenance', widthM:4, lengthM:4, totalSqm:16, monthlyRate:12800, notes:'ซ่อมพื้น คาดว่าเสร็จ 20 Apr 2026', floorPlanX:4,floorPlanY:0,floorPlanW:4,floorPlanH:4, createdAt:subDays(new Date(),200).toISOString() },
];

export const getUnits = (branchId?: string): Unit[] => {
  if (branchId) return mockUnits.filter(u => u.branchId === branchId);
  return mockUnits;
};

export const getUnitsByType = (unitType: UnitType, branchId?: string): Unit[] => {
  return getUnits(branchId).filter(u => u.unitType === unitType);
};

// ─── Orders (unified Storage + Delivery) ─────────────────────────────────────

export let mockOrders: Order[] = [
  {
    id: 'ord-001',
    serviceType: 'Storage',
    storageSubType: 'DocumentBox',
    status: 'Active',
    clientId: 'client-1',
    clientName: 'Alice Wonderland',
    clientPhone: '081-234-5678',
    clientEmail: 'alice@example.com',
    clientLineId: '@alice_w',
    serviceAddress: '123 Sukhumvit Soi 4, Wattana, Bangkok',
    serviceFloor: '5',
    hasElevator: true,
    itemsDescription: 'กล่องเอกสาร บัญชี ปี 2020-2024',
    itemCategories: ['เอกสาร'],
    serviceDate: subDays(new Date(), 30).toISOString(),
    storageDuration: '12 เดือน',
    storageEndDate: addDays(new Date(), 335).toISOString(),
    quantity: 10,
    quantityUnit: 'กล่อง',
    paymentCycle: 'Monthly',
    monthlyRate: 1500,
    firstMonthTotal: 1850,
    branchId: 'branch-bkk-sukhumvit',
    branchName: 'Widing Sukhumvit',
    unitId: 'unit-box-a01',
    unitIdentifier: 'BOX-A-001',
    eContractStatus: 'Signed',
    saleStaffName: 'สมชาย วงษ์',
    createdAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: 'ord-002',
    serviceType: 'Storage',
    storageSubType: 'StorageSpace',
    status: 'Active',
    clientId: 'client-1',
    clientName: 'Alice Wonderland',
    clientPhone: '081-234-5678',
    clientEmail: 'alice@example.com',
    serviceAddress: '123 Sukhumvit Soi 4, Wattana, Bangkok',
    serviceFloor: '5',
    hasElevator: true,
    itemsDescription: 'เฟอร์นิเจอร์ โซฟา ตู้เสื้อผ้า เตียง',
    itemCategories: ['เฟอร์นิเจอร์'],
    serviceDate: subDays(new Date(), 45).toISOString(),
    storageDuration: '6 เดือน',
    storageEndDate: addDays(new Date(), 135).toISOString(),
    quantity: 4,
    quantityUnit: 'ตร.ม.',
    paymentCycle: 'Monthly',
    monthlyRate: 3200,
    firstMonthTotal: 3550,
    branchId: 'branch-bkk-sukhumvit',
    branchName: 'Widing Sukhumvit',
    unitId: 'unit-spc-b01',
    unitIdentifier: 'SPC-B-001',
    eContractStatus: 'Signed',
    saleStaffName: 'สมชาย วงษ์',
    createdAt: subDays(new Date(), 45).toISOString(),
  },
  {
    id: 'ord-003',
    serviceType: 'Delivery',
    deliverySubType: 'PickupAndStore',
    status: 'Pending',
    clientName: 'วันชัย ประดิษฐ์',
    clientPhone: '089-765-4321',
    clientEmail: 'wanchai@email.com',
    clientLineId: '@wanchai_p',
    serviceAddress: '55 Sathorn Rd, Sathorn, Bangkok',
    serviceFloor: '8',
    hasElevator: true,
    itemsDescription: 'เฟอร์นิเจอร์สำนักงาน โต๊ะ เก้าอี้ ชั้นวางของ',
    itemCategories: ['เฟอร์นิเจอร์', 'อิเล็กทรอนิกส์'],
    serviceDate: addDays(new Date(), 3).toISOString(),
    storageDuration: '3 เดือน',
    quantity: 12,
    quantityUnit: 'ตร.ม.',
    paymentCycle: 'Monthly',
    monthlyRate: 9600,
    branchId: 'branch-bkk-sukhumvit',
    branchName: 'Widing Sukhumvit',
    eContractStatus: 'Draft',
    saleStaffName: 'นัตตาพร ดี',
    createdAt: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 'ord-004',
    serviceType: 'Storage',
    storageSubType: 'DocumentBox',
    status: 'Active',
    clientId: 'client-2',
    clientName: 'Bob The Builder Inc.',
    clientPhone: '02-555-1234',
    clientEmail: 'info@bobbuilder.com',
    serviceAddress: '88 Silom Rd, Bang Rak, Bangkok',
    serviceFloor: '1',
    hasElevator: false,
    itemsDescription: 'เอกสารสัญญา ใบเสร็จ บัญชี 2018-2025 จำนวน 80 กล่อง',
    itemCategories: ['เอกสาร'],
    serviceDate: subDays(new Date(), 90).toISOString(),
    storageDuration: '12 เดือน',
    storageEndDate: addDays(new Date(), 275).toISOString(),
    quantity: 80,
    quantityUnit: 'กล่อง',
    paymentCycle: 'Annual',
    monthlyRate: 12000,
    firstMonthTotal: 129600,
    branchId: 'branch-bkk-sukhumvit',
    branchName: 'Widing Sukhumvit',
    unitId: 'unit-box-a02',
    unitIdentifier: 'BOX-A-002',
    eContractStatus: 'Signed',
    saleStaffName: 'สมชาย วงษ์',
    commissionRate: 10,
    createdAt: subDays(new Date(), 90).toISOString(),
  },
  {
    id: 'ord-005',
    serviceType: 'Delivery',
    deliverySubType: 'ReturnDelivery',
    status: 'Active',
    clientId: 'client-3',
    clientName: 'Charlie Brown',
    clientPhone: '091-234-5678',
    clientEmail: 'charlie@email.com',
    serviceAddress: '77 Chatuchak, Bangkok',
    serviceFloor: '3',
    hasElevator: true,
    itemsDescription: 'ส่งคืน: กล่องเอกสาร 5 กล่อง',
    itemCategories: ['เอกสาร'],
    serviceDate: addDays(new Date(), 7).toISOString(),
    quantity: 5,
    quantityUnit: 'กล่อง',
    branchId: 'branch-bkk-sukhumvit',
    branchName: 'Widing Sukhumvit',
    eContractStatus: 'Sent',
    saleStaffName: 'นัตตาพร ดี',
    createdAt: subDays(new Date(), 5).toISOString(),
  },
];

export const getOrders = (serviceType?: ServiceType): Order[] => {
  if (serviceType) return mockOrders.filter(o => o.serviceType === serviceType);
  return mockOrders;
};

export const getOrderById = (id: string): Order | undefined => {
  return mockOrders.find(o => o.id === id);
};

    
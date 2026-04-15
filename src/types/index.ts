
export interface Branch {
  id: string;
  name: string;
  addressDetail?: string;
  province?: string;
  district?: string;
  subDistrict?: string;
  postcode?: string;

  contactInfo: string;
  totalCapacity: string;
  occupiedCapacity?: string;
  availableSpaces?: number;
  remainingBulkCapacity?: string;

  ceilingHeightMeters?: number;
  numberOfFloors?: number;
  branchType: 'Owned' | 'Partner' | 'Franchise';
  branchOwner?: string;
  operatingHours?: string;
  googleMapsLink?: string; 

  payoutDayOfMonth?: number; 
  commissionRatePercent?: number; 
  commissionNotes?: string;
}

export interface Space {
  id: string;
  branchId: string;
  spaceIdentifier: string;
  dimensions: string;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  clientId?: string;
  clientName?: string;
  monthlyRate?: number;
}

export type ClientStatus = 'Prospect' | 'Active' | 'Churned' | 'ReturnCompleted';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  status: ClientStatus;
  originLocationType: 'Home' | 'Condo';

  originStreetAddress?: string;
  originFloor?: string; // Added
  originProvince?: string;
  originDistrict?: string;
  originSubDistrict?: string;
  originPostcode?: string;
}

export type BookingStatus = 'Pending' | 'Processing' | 'Pre-confirmed' | 'Confirmed' | 'InTransit' | 'AwaitingAllocation' | 'Completed' | 'Cancelled';
export type BookingType = 'Pick-up' | 'Return';

export interface Booking {
  id:string;
  branchId: string;
  branchName?: string;
  spaceId?: string;
  spaceIdentifier?: string;
  clientId?: string;
  clientName?: string;
  driverName: string;
  vehicleInfo?: string;
  bookingType: BookingType;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  suggestedInternalUnitIdentifier?: string;

  isAddingToExistingStorage?: boolean;
  linkedAllocationId?: string;

  desiredWidthSqm?: number;
  desiredLengthSqm?: number;
  items?: { type: string; quantity: number }[];
  itemImageNames?: string[];

  selectedAllocationId?: string;
  chosenDeliveryOptionId?: string;
  checkoutPageSent?: { type: 'gateway' | 'manual'; sentAt: string; };

  // Logistics & Notes
  hasDockingArea?: boolean;
  hasCarParkingFee?: boolean;
  hasElevator?: boolean;
  hasBigFurniture?: boolean;
  bigFurnitureMaxWidthCm?: number;
  bigFurnitureMaxHeightCm?: number;
  needsWrapping?: boolean;
  
  // Updated Disassembly
  disassemblyOption?: 'none' | 'all' | 'specific';
  numberOfItemsToDisassemble?: number;

  customerSelfDelivery?: boolean; // New field

  customerNotes?: string;
  staffNotes?: string;

  // Origin (Client's place for Pick-up, or Warehouse for Return)
  originFloor?: string; // Added
  originPhoneNumber?: string;
  originAvailableTimeSlots?: string;
  originGoogleMapsLink?: string;

  // Destination (Warehouse for Pick-up, or Client's place for Return)
  destinationSameAsOrigin?: boolean;
  destinationStreetAddress?: string;
  destinationFloor?: string; // Added
  destinationProvince?: string;
  destinationDistrict?: string;
  destinationSubDistrict?: string;
  destinationPostcode?: string;
  destinationPhoneNumber?: string;
  destinationAvailableTimeSlots?: string;
  destinationGoogleMapsLink?: string;

  thumbnailImageUrl?: string;
  createdAt: string;
}

export type TransactionType = "FullAmount" | "Subscription" | "Refund" | "DeliveryOnly" | "Other" | "ExtensionFee";

export interface Transaction {
  id: string;
  bookingId?: string;
  clientId: string;
  clientName?: string;
  date: string;
  type: TransactionType;
  amount: number;
  currency: 'THB';
  method?: 'Cash' | 'CreditCard' | 'BankTransfer' | 'Online' | 'Other';
  status: 'Pending' | 'Completed' | 'Failed' | 'Cancelled';
  description?: string;
  relatedSpaceId?: string;
  relatedAllocationId?: string;
  relatedBranchId?: string;
  invoiceStatus?: 'NotYet' | 'Created' | 'Sent';
  receiptStatus?: 'NotYet' | 'Created' | 'Sent';
}

export type AllocatedBulkSpaceStatus = 'Occupied' | 'Reserved' | 'AwaitingExtensionPayment' | 'Released' | 'AwaitingRenewal';

export interface AllocatedBulkSpace {
  id: string;
  clientId?: string;
  clientName: string;
  branchId: string;
  branchName: string;
  usedSpaceSqm: number;
  status: AllocatedBulkSpaceStatus;
  allocationDate: string;
  notes?: string;
  internalUnitIdentifier?: string;
  relatedBookingId?: string;
  allocatedSpaceImageNames?: string[];
  requestedExtendedSpaceSqm?: number; // For space extensions
  additionalFeeForExtension?: number; // Can be for space or time extension
  extensionRequestDate?: string;
  extensionCheckoutSent?: { type: 'gateway' | 'manual'; sentAt: string; };
  releaseDate?: string;
  currentBillingCycleEndDate?: string; 
  monthsExtended?: number; 
}

export interface VehicleAssignmentData {
  id?: string;
  vehicleType: string;
  otherVehicleType?: string;
  quantity: number;
  numberOfDrivers: number;
  numberOfAssistants: number;
}

export interface DeliveryOption {
  id: string;
  bookingId: string;
  providerName: string;
  otherProviderName?: string;
  vehicleAssignments: VehicleAssignmentData[];
  estimatedCost: number;
  currency: 'THB';
  picPhoneNumber?: string;
  isRecommended?: boolean;
  createdAt: string;
}

export interface PlatformActivity {
  id: string;
  timestamp: string;
  type: PlatformActivityType;
  action: 'Created' | 'Updated' | 'Deleted' | 'StatusChanged' | 'LoggedIn' | 'LoggedOut';
  description: string;
  entityId?: string; 
  entityName?: string; 
  userId?: string; 
  userName?: string; 
  detailsLink?: string; 
}

export type PlatformActivityType = 'Booking' | 'Client' | 'Branch' | 'Transaction' | 'Allocation' | 'User' | 'System';

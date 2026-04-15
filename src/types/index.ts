
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
  name: string;           // Full name (TH)
  nameEn?: string;        // Full name (EN)
  nickname?: string;
  email?: string;         // อีเมล
  phone: string;          // เบอร์ติดต่อ
  phoneAlt?: string;
  joinedDate: string;
  status: ClientStatus;

  // Social contacts
  lineId?: string;
  facebook?: string;
  instagram?: string;
  otherSocial?: string;

  // Pickup/origin address (ที่อยู่)
  originLocationType: 'Home' | 'Condo';
  originStreetAddress?: string;
  originFloor?: string;        // ชั้น
  hasElevator?: boolean;       // มีลิฟมั้ย
  originProvince?: string;
  originDistrict?: string;
  originSubDistrict?: string;
  originPostcode?: string;

  // Service preferences
  preferredPaymentCycle?: PaymentCycle;  // ชำระเงินแบบรายเดือนหรือรายปี
  notes?: string;
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

// ─── Order & Unit Management (Core Focus) ───────────────────────────────────

/** Top-level service type the customer is requesting */
export type ServiceType = 'Storage' | 'Delivery';

/** Sub-type for Storage service */
export type StorageSubType = 'DocumentBox' | 'StorageSpace';

/** Sub-type for Delivery service */
export type DeliverySubType = 'PickupAndStore' | 'ReturnDelivery' | 'MovingService';

/** Billing cycle chosen by the customer */
export type PaymentCycle = 'Monthly' | 'Annual';

/** Physical unit type inside a branch */
export type UnitType = 'DocumentBox' | 'StorageSpace';

export type OrderStatus =
  | 'Draft'
  | 'Pending'
  | 'Confirmed'
  | 'Active'
  | 'AwaitingReturn'
  | 'Completed'
  | 'Cancelled';

/** Unified Order — covers both Storage and Delivery orders */
export interface Order {
  id: string;
  serviceType: ServiceType;
  storageSubType?: StorageSubType;
  deliverySubType?: DeliverySubType;
  status: OrderStatus;

  // ── Customer info (ข้อมูลที่จำเป็น) ──────────────────────
  clientId?: string;
  clientName: string;           // ชื่อนามสกุล
  clientPhone: string;          // เบอร์ติดต่อ
  clientEmail?: string;         // อีเมล
  clientLineId?: string;
  clientFacebook?: string;

  // ── Pickup/service address ────────────────────────────────
  serviceAddress: string;       // ที่อยู่
  serviceFloor?: string;        // ชั้น
  hasElevator?: boolean;        // มีลิฟมั้ย

  // ── What to store (ฝากอะไรบ้าง) ──────────────────────────
  itemsDescription: string;
  itemCategories?: string[];    // e.g. ['เอกสาร', 'เฟอร์นิเจอร์']

  // ── Duration & quantity ───────────────────────────────────
  serviceDate: string;          // วันเวลาที่ต้องการใช้
  storageDuration?: string;     // ฝากนานแค่ไหน
  storageEndDate?: string;
  quantity?: number;            // ปริมาณของที่ต้องการฝาก
  quantityUnit?: 'กล่อง' | 'ตร.ม.' | 'ชิ้น';

  // ── Payment ────────────────────────────────────────────────
  paymentCycle?: PaymentCycle;  // ชำระเงินแบบรายเดือนหรือรายปี
  monthlyRate?: number;
  firstMonthTotal?: number;
  commissionRate?: number;      // 5–15% for agents/staff

  // ── Assignment ─────────────────────────────────────────────
  branchId?: string;
  branchName?: string;
  unitId?: string;
  unitIdentifier?: string;

  // ── e-Contract ─────────────────────────────────────────────
  eContractStatus?: 'Draft' | 'Sent' | 'Signed';

  // ── Staff ──────────────────────────────────────────────────
  saleStaffId?: string;
  saleStaffName?: string;
  staffNotes?: string;

  createdAt: string;
  updatedAt?: string;
}

/** Enhanced Unit — replaces legacy Space, supports DocumentBox and StorageSpace */
export interface Unit {
  id: string;
  branchId: string;
  branchName: string;
  unitIdentifier: string;       // e.g. 'BOX-A-001', 'SPC-B-002'
  unitType: UnitType;
  floor: number;
  zone: string;                 // e.g. 'A', 'B', 'C', 'D'
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

  // For StorageSpace
  widthM?: number;
  lengthM?: number;
  totalSqm?: number;

  // For DocumentBox
  boxCapacity?: number;        // max boxes in this slot

  monthlyRate: number;
  currentClientId?: string;
  currentClientName?: string;
  currentOrderId?: string;
  billingCycleEndDate?: string;

  // 2D floor plan positioning (grid units)
  floorPlanX?: number;
  floorPlanY?: number;
  floorPlanW?: number;
  floorPlanH?: number;

  notes?: string;
  createdAt: string;
}

/** Extended client fields for service intake */
export interface ClientServiceInfo {
  clientId: string;
  // Required for service (ข้อมูลที่จำเป็นให้บริการลูกค้า)
  hasElevator?: boolean;        // มีลิฟมั้ย
  serviceFloor?: string;        // ชั้น
  lineId?: string;
  facebook?: string;
  instagram?: string;
  preferredContactMethod?: 'Phone' | 'Line' | 'Email';
  paymentCycle?: PaymentCycle;
  notes?: string;
}

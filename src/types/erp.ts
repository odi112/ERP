export type ModuleTab = 'dashboard' | 'warehouse' | 'production' | 'attendance' | 'settings';

export type UserRole = 'ADMIN' | 'WAREHOUSE_SUPERVISOR' | 'PRODUCTION_LEAD' | 'HR_MANAGER' | 'OPERATOR';

export interface WarehouseLocation {
  id: string;
  code: string;
  name: string;
  type: 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOODS' | 'QUARANTINE';
  capacity: number;
  currentItemsCount: number;
  manager: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Raw Material' | 'Electronic Component' | 'Mechanical Part' | 'Sub-Assembly' | 'Finished Good' | 'Packaging';
  unit: 'pcs' | 'kg' | 'meter' | 'box' | 'drum' | 'set';
  stockQuantity: number;
  minSafetyStock: number;
  reorderLevel: number;
  unitCost: number; // Cost in IDR or USD
  sellingPrice: number;
  locationId: string; // e.g. WH-RAW, WH-FG
  binLocation: string; // e.g. Rack A-04, Bin 12
  barcode: string;
  batchNumber: string;
  lastUpdated: string;
}

export type MovementType = 
  | 'INBOUND_RECEIPT' 
  | 'OUTBOUND_DISPATCH' 
  | 'INTERNAL_TRANSFER' 
  | 'STOCK_ADJUSTMENT' 
  | 'PRODUCTION_ISSUE' 
  | 'PRODUCTION_RECEIPT';

export interface StockMovement {
  id: string;
  timestamp: string;
  type: MovementType;
  sku: string;
  itemName: string;
  quantity: number;
  unit: string;
  fromLocation: string;
  toLocation: string;
  referenceDoc: string; // e.g., PO-2026-004, WO-883, DO-992
  operatorName: string;
  notes: string;
}

export interface BOMComponent {
  componentSku: string;
  componentName: string;
  quantityNeeded: number;
  unit: string;
  unitCost: number;
}

export interface BillOfMaterials {
  id: string;
  productSku: string;
  productName: string;
  version: string;
  components: BOMComponent[];
  estimatedLaborHours: number;
  standardProductionCost: number;
  notes?: string;
}

export type WorkOrderStatus = 'PLANNED' | 'IN_PROGRESS' | 'QUALITY_CHECK' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
export type PriorityLevel = 'NORMAL' | 'HIGH' | 'URGENT';

export interface WorkOrder {
  id: string;
  woNumber: string; // e.g. WO-2026-0401
  bomId: string;
  finishedGoodSku: string;
  finishedGoodName: string;
  targetQuantity: number;
  completedQuantity: number;
  scrapQuantity: number;
  status: WorkOrderStatus;
  priority: PriorityLevel;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  workCenterId: string;
  assignedTeam: string;
  supervisor: string;
  notes: string;
  materialIssued: boolean;
  historyLogs: {
    timestamp: string;
    action: string;
    user: string;
  }[];
}

export interface WorkCenter {
  id: string;
  code: string;
  name: string;
  type: 'ASSEMBLY' | 'CNC_MACHINING' | 'WELDING' | 'PACKAGING' | 'QUALITY_TESTING';
  status: 'RUNNING' | 'IDLE' | 'MAINTENANCE' | 'CALIBRATION';
  currentWoNumber?: string;
  operatorInCharge: string;
  capacityPerHour: number;
  efficiencyRate: number; // percentage e.g. 94%
}

export type ShiftType = 'Shift 1 (07:00 - 15:00)' | 'Shift 2 (15:00 - 23:00)' | 'Shift 3 (23:00 - 07:00)' | 'Regular (08:00 - 17:00)';
export type DepartmentType = 'Warehouse' | 'Production & Assembly' | 'Quality Control' | 'Maintenance & Engineering' | 'HR & General Affairs' | 'Supply Chain';

export interface Employee {
  id: string;
  nip: string; // Nomor Induk Pegawai
  name: string;
  email: string;
  phone: string;
  department: DepartmentType;
  position: string;
  shift: ShiftType;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  pinCode: string; // for kiosk quick auth
  avatarUrl?: string;
  joinDate: string;
  salaryPerMonth: number;
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE' | 'SICK' | 'HALF_DAY';
export type VerificationMethod = 'KIOSK_PIN' | 'QR_BADGE' | 'WEBCAM_SNAP' | 'MANUAL_ENTRY';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  nip: string;
  employeeName: string;
  department: DepartmentType;
  date: string; // YYYY-MM-DD
  clockInTime: string | null; // HH:mm:ss
  clockOutTime: string | null; // HH:mm:ss
  status: AttendanceStatus;
  lateMinutes: number;
  overtimeHours: number;
  verificationMethod: VerificationMethod;
  notes?: string;
  photoSnapshot?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  nip: string;
  employeeName: string;
  type: 'ANNUAL_LEAVE' | 'SICK' | 'OFFICIAL_DUTY' | 'EMERGENCY_IZIN' | 'UNPAID';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  appliedDate: string;
}

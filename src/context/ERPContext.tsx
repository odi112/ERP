import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ModuleTab, 
  UserRole, 
  WarehouseLocation, 
  InventoryItem, 
  StockMovement, 
  BillOfMaterials, 
  WorkCenter, 
  WorkOrder, 
  Employee, 
  AttendanceRecord, 
  LeaveRequest,
  WorkOrderStatus,
  VerificationMethod,
  AttendanceStatus
} from '../types/erp';
import { 
  INITIAL_LOCATIONS, 
  INITIAL_INVENTORY, 
  INITIAL_MOVEMENTS, 
  INITIAL_BOMS, 
  INITIAL_WORK_CENTERS, 
  INITIAL_WORK_ORDERS, 
  INITIAL_EMPLOYEES, 
  INITIAL_ATTENDANCE, 
  INITIAL_LEAVE_REQUESTS 
} from '../data/initialData';

interface ERPNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

interface ERPContextType {
  activeTab: ModuleTab;
  setActiveTab: (tab: ModuleTab) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  notifications: ERPNotification[];
  dismissNotification: (id: string) => void;
  showNotification: (type: ERPNotification['type'], title: string, message: string) => void;

  // Warehouse Data & Actions
  locations: WarehouseLocation[];
  inventory: InventoryItem[];
  movements: StockMovement[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  recordStockMovement: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => boolean;

  // Production Data & Actions
  boms: BillOfMaterials[];
  workCenters: WorkCenter[];
  workOrders: WorkOrder[];
  addWorkOrder: (wo: Omit<WorkOrder, 'id' | 'historyLogs'>) => void;
  updateWorkOrderStatus: (woId: string, status: WorkOrderStatus, note?: string) => void;
  issueMaterialsForWorkOrder: (woId: string) => { success: boolean; message: string };
  recordProductionOutput: (woId: string, goodQty: number, scrapQty: number, finishOrder: boolean) => void;
  addBOM: (bom: Omit<BillOfMaterials, 'id'>) => void;
  updateWorkCenterStatus: (centerId: string, status: WorkCenter['status']) => void;
  updateWorkCenterOperator: (centerId: string, operatorName: string) => void;
  updateAllWorkCenterOperators: (updates: { centerId: string; operatorInCharge: string }[]) => void;

  // Employee Attendance Data & Actions
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  clockIn: (employeeId: string, method: VerificationMethod, notes?: string, photo?: string) => { success: boolean; message: string };
  clockOut: (employeeId: string, notes?: string) => { success: boolean; message: string };
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => void;
  updateLeaveStatus: (leaveId: string, status: 'APPROVED' | 'REJECTED', approverName: string) => void;
  quickCheckInByPin: (pin: string) => { success: boolean; message: string; employee?: Employee };

  // Utilities
  resetToDefaultData: () => void;
}

const STORAGE_KEY = 'apex_erp_master_storage_v1';

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from storage or default
  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [notifications, setNotifications] = useState<ERPNotification[]>([]);

  const [locations, setLocations] = useState<WarehouseLocation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_locations`);
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_inventory`);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_movements`);
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  const [boms, setBoms] = useState<BillOfMaterials[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_boms`);
    return saved ? JSON.parse(saved) : INITIAL_BOMS;
  });

  const [workCenters, setWorkCenters] = useState<WorkCenter[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_workcenters`);
    if (saved) {
      try {
        const parsed: WorkCenter[] = JSON.parse(saved);
        return parsed.map((wc, index) => {
          if (wc.id === 'WC-CNC-01' || index === 0) {
            return { ...wc, name: 'Mesin Molding 1', code: 'MACH-MOLD-01' };
          }
          if (wc.id === 'WC-SMD-01' || index === 1) {
            return { ...wc, name: 'Mesin Molding 2', code: 'MACH-MOLD-02' };
          }
          if (wc.id === 'WC-WELD-01' || index === 2) {
            return { ...wc, name: 'Mesin Doughbreak 1', code: 'MACH-DB-01' };
          }
          if (wc.id === 'WC-QC-01' || index === 3) {
            return { ...wc, name: 'Mesin Mixer 1', code: 'MACH-MIX-01' };
          }
          if (wc.id === 'WC-PACK-01' || index === 4) {
            return { ...wc, name: 'Mesin Mixer 2', code: 'MACH-MIX-02' };
          }
          return wc;
        });
      } catch {
        return INITIAL_WORK_CENTERS;
      }
    }
    return INITIAL_WORK_CENTERS;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_workorders`);
    return saved ? JSON.parse(saved) : INITIAL_WORK_ORDERS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_employees`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_leaves`);
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_locations`, JSON.stringify(locations));
  }, [locations]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(inventory));
  }, [inventory]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_movements`, JSON.stringify(movements));
  }, [movements]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_boms`, JSON.stringify(boms));
  }, [boms]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_workcenters`, JSON.stringify(workCenters));
  }, [workCenters]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_workorders`, JSON.stringify(workOrders));
  }, [workOrders]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees));
  }, [employees]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendance));
  }, [attendance]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_leaves`, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  const showNotification = (type: ERPNotification['type'], title: string, message: string) => {
    const newNotif: ERPNotification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 5)]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 4500);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- WAREHOUSE LOGIC ---
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `ITEM-${Date.now()}`,
      lastUpdated: new Date().toLocaleString()
    };
    setInventory(prev => [newItem, ...prev]);

    // Record initial stock movement if quantity > 0
    if (newItem.stockQuantity > 0) {
      const initMovement: StockMovement = {
        id: `MOV-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        type: 'INBOUND_RECEIPT',
        sku: newItem.sku,
        itemName: newItem.name,
        quantity: newItem.stockQuantity,
        unit: newItem.unit,
        fromLocation: 'Initial Inventory Setup',
        toLocation: newItem.locationId,
        referenceDoc: 'SETUP-INIT',
        operatorName: 'System Admin',
        notes: 'Initial stock intake on SKU registration'
      };
      setMovements(prev => [initMovement, ...prev]);
    }

    showNotification('success', 'Barang Baru Ditambahkan', `SKU ${newItem.sku} berhasil didaftarkan.`);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updates,
          lastUpdated: new Date().toLocaleString()
        };
      }
      return item;
    }));
    showNotification('info', 'Data Diperbarui', 'Informasi stok dan katalog berhasil diperbarui.');
  };

  const deleteInventoryItem = (id: string) => {
    const item = inventory.find(i => i.id === id);
    setInventory(prev => prev.filter(i => i.id !== id));
    showNotification('warning', 'Barang Dihapus', `Barang ${item?.name || id} telah dihapus dari database.`);
  };

  const recordStockMovement = (data: Omit<StockMovement, 'id' | 'timestamp'>): boolean => {
    const targetItem = inventory.find(i => i.sku === data.sku);
    if (!targetItem) {
      showNotification('error', 'Gagal Transaksi', `SKU ${data.sku} tidak ditemukan di database.`);
      return false;
    }

    // Validate quantities for deduction movements
    if (['OUTBOUND_DISPATCH', 'PRODUCTION_ISSUE'].includes(data.type)) {
      if (targetItem.stockQuantity < data.quantity) {
        showNotification('error', 'Stok Tidak Cukup', `Stok ${targetItem.sku} saat ini ${targetItem.stockQuantity} ${targetItem.unit}, dibutuhkan ${data.quantity} ${targetItem.unit}.`);
        return false;
      }
    }

    // Update stock quantity
    setInventory(prev => prev.map(item => {
      if (item.sku === data.sku) {
        let newQty = item.stockQuantity;
        if (data.type === 'INBOUND_RECEIPT' || data.type === 'PRODUCTION_RECEIPT') {
          newQty += data.quantity;
        } else if (data.type === 'OUTBOUND_DISPATCH' || data.type === 'PRODUCTION_ISSUE') {
          newQty -= data.quantity;
        } else if (data.type === 'STOCK_ADJUSTMENT') {
          newQty = data.quantity; // direct adjustment
        }
        return {
          ...item,
          stockQuantity: Math.max(0, newQty),
          lastUpdated: new Date().toLocaleString()
        };
      }
      return item;
    }));

    // Add log
    const newMovement: StockMovement = {
      ...data,
      id: `MOV-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setMovements(prev => [newMovement, ...prev]);

    showNotification('success', 'Pergerakan Stok Tercatat', `${data.type} sebanyak ${data.quantity} ${data.unit} (${data.sku}) sukses.`);
    return true;
  };

  // --- PRODUCTION LOGIC ---
  const addWorkOrder = (woData: Omit<WorkOrder, 'id' | 'historyLogs'>) => {
    const newWo: WorkOrder = {
      ...woData,
      id: `WO-${Date.now()}`,
      completedQuantity: 0,
      scrapQuantity: 0,
      materialIssued: false,
      historyLogs: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          action: 'SPK Diterbitkan / Work Order created',
          user: woData.supervisor || 'Production Lead'
        }
      ]
    };
    setWorkOrders(prev => [newWo, ...prev]);
    showNotification('success', 'Work Order Baru', `Nomor SPK ${newWo.woNumber} berhasil dijadwalkan.`);
  };

  const updateWorkOrderStatus = (woId: string, status: WorkOrderStatus, note?: string) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId) {
        return {
          ...wo,
          status,
          historyLogs: [
            ...wo.historyLogs,
            {
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
              action: `Status diubah menjadi: ${status} ${note ? `(${note})` : ''}`,
              user: 'Supervisor'
            }
          ]
        };
      }
      return wo;
    }));
    showNotification('info', 'Status Produksi Diperbarui', `Work Order sekarang berstatus: ${status}`);
  };

  // Issue materials from warehouse for a work order based on its BOM
  const issueMaterialsForWorkOrder = (woId: string): { success: boolean; message: string } => {
    const wo = workOrders.find(w => w.id === woId);
    if (!wo) return { success: false, message: 'Work order tidak ditemukan.' };
    if (wo.materialIssued) return { success: false, message: 'Bahan baku untuk SPK ini sudah pernah dikeluarkan sebelumnya.' };

    const bom = boms.find(b => b.id === wo.bomId);
    if (!bom) return { success: false, message: 'BOM untuk produk ini tidak ditemukan.' };

    // Check availability for all components
    const missingItems: string[] = [];
    bom.components.forEach(comp => {
      const totalNeeded = comp.quantityNeeded * wo.targetQuantity;
      const invItem = inventory.find(i => i.sku === comp.componentSku);
      if (!invItem || invItem.stockQuantity < totalNeeded) {
        const available = invItem ? invItem.stockQuantity : 0;
        missingItems.push(`${comp.componentName} (Butuh: ${totalNeeded} ${comp.unit}, Tersedia: ${available})`);
      }
    });

    if (missingItems.length > 0) {
      showNotification('error', 'Stok Bahan Tidak Mencukupi', `Kekurangan bahan: ${missingItems.join(', ')}`);
      return { success: false, message: `Bahan tidak mencukupi: ${missingItems.join('; ')}` };
    }

    // Deduct stock for all components and log movements
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newMovements: StockMovement[] = [];

    setInventory(prevInv => {
      let updated = [...prevInv];
      bom.components.forEach(comp => {
        const totalNeeded = comp.quantityNeeded * wo.targetQuantity;
        updated = updated.map(item => {
          if (item.sku === comp.componentSku) {
            return {
              ...item,
              stockQuantity: Math.max(0, item.stockQuantity - totalNeeded),
              lastUpdated: new Date().toLocaleString()
            };
          }
          return item;
        });

        newMovements.push({
          id: `MOV-${Date.now()}-${comp.componentSku}`,
          timestamp,
          type: 'PRODUCTION_ISSUE',
          sku: comp.componentSku,
          itemName: comp.componentName,
          quantity: totalNeeded,
          unit: comp.unit,
          fromLocation: 'WH-RAW-01',
          toLocation: wo.workCenterId,
          referenceDoc: wo.woNumber,
          operatorName: wo.supervisor,
          notes: `Pengeluaran material otomatis untuk ${wo.woNumber} (${wo.targetQuantity} unit)`
        });
      });
      return updated;
    });

    setMovements(prev => [...newMovements, ...prev]);

    // Update work order state
    setWorkOrders(prev => prev.map(w => {
      if (w.id === woId) {
        return {
          ...w,
          status: 'IN_PROGRESS',
          materialIssued: true,
          historyLogs: [
            ...w.historyLogs,
            {
              timestamp,
              action: `Bahan baku dikeluarkan dari gudang untuk ${w.targetQuantity} unit. SPK dimulai (IN_PROGRESS).`,
              user: 'Warehouse & Production System'
            }
          ]
        };
      }
      return w;
    }));

    showNotification('success', 'Material Berhasil Dikeluarkan', `Semua komponen BOM untuk SPK ${wo.woNumber} telah dialokasikan ke lini produksi.`);
    return { success: true, message: 'Bahan baku berhasil dikeluarkan.' };
  };

  // Record batch output from production into finished goods
  const recordProductionOutput = (woId: string, goodQty: number, scrapQty: number, finishOrder: boolean) => {
    const wo = workOrders.find(w => w.id === woId);
    if (!wo) return;

    const newCompleted = wo.completedQuantity + goodQty;
    const newScrap = wo.scrapQuantity + scrapQty;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Credit finished goods to inventory if goodQty > 0
    if (goodQty > 0) {
      setInventory(prev => {
        return prev.map(item => {
          if (item.sku === wo.finishedGoodSku) {
            return {
              ...item,
              stockQuantity: item.stockQuantity + goodQty,
              lastUpdated: new Date().toLocaleString()
            };
          }
          return item;
        });
      });

      // Add movement log
      const receiptMovement: StockMovement = {
        id: `MOV-${Date.now()}`,
        timestamp,
        type: 'PRODUCTION_RECEIPT',
        sku: wo.finishedGoodSku,
        itemName: wo.finishedGoodName,
        quantity: goodQty,
        unit: 'pcs',
        fromLocation: wo.workCenterId,
        toLocation: 'LOC-FG-01',
        referenceDoc: wo.woNumber,
        operatorName: 'QC & Plant Team',
        notes: `Penerimaan hasil perakitan finished good dari SPK ${wo.woNumber}`
      };
      setMovements(prev => [receiptMovement, ...prev]);
    }

    const nextStatus: WorkOrderStatus = finishOrder || newCompleted >= wo.targetQuantity ? 'COMPLETED' : 'IN_PROGRESS';

    setWorkOrders(prev => prev.map(w => {
      if (w.id === woId) {
        return {
          ...w,
          completedQuantity: newCompleted,
          scrapQuantity: newScrap,
          status: nextStatus,
          completedDate: nextStatus === 'COMPLETED' ? timestamp : w.completedDate,
          historyLogs: [
            ...w.historyLogs,
            {
              timestamp,
              action: `Input hasil produksi: +${goodQty} unit lolos QC, ${scrapQty} unit scrap/cacat.${nextStatus === 'COMPLETED' ? ' SPK dinyatakan SELESAI.' : ''}`,
              user: 'Production QA Lead'
            }
          ]
        };
      }
      return w;
    }));

    showNotification(
      'success', 
      'Hasil Produksi Masuk Gudang', 
      `+${goodQty} unit ${wo.finishedGoodSku} berhasil masuk ke Gudang Barang Jadi (WH-FG-01).`
    );
  };

  const addBOM = (bomData: Omit<BillOfMaterials, 'id'>) => {
    const newBom: BillOfMaterials = {
      ...bomData,
      id: `BOM-${Date.now()}`
    };
    setBoms(prev => [newBom, ...prev]);
    showNotification('success', 'BOM Baru Dibuat', `Bill of Materials untuk ${newBom.productName} berhasil disimpan.`);
  };

  const updateWorkCenterStatus = (centerId: string, status: WorkCenter['status']) => {
    setWorkCenters(prev => prev.map(wc => wc.id === centerId ? { ...wc, status } : wc));
    showNotification('info', 'Status Mesin Diperbarui', `Work Center status diubah menjadi ${status}`);
  };

  const updateWorkCenterOperator = (centerId: string, operatorName: string) => {
    setWorkCenters(prev => prev.map(wc => wc.id === centerId ? { ...wc, operatorInCharge: operatorName } : wc));
    showNotification('success', 'Operator Diperbarui', `Operator mesin berhasil diubah menjadi ${operatorName}`);
  };

  const updateAllWorkCenterOperators = (updates: { centerId: string; operatorInCharge: string }[]) => {
    setWorkCenters(prev => prev.map(wc => {
      const match = updates.find(u => u.centerId === wc.id);
      if (match) {
        return { ...wc, operatorInCharge: match.operatorInCharge };
      }
      return wc;
    }));
  };

  // --- ATTENDANCE & HR LOGIC ---
  const todayStr = '2026-10-15'; // Sync with simulation date

  const clockIn = (
    employeeId: string, 
    method: VerificationMethod, 
    notes?: string, 
    photo?: string
  ): { success: boolean; message: string } => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return { success: false, message: 'Karyawan tidak ditemukan.' };

    const existing = attendance.find(a => a.employeeId === employeeId && a.date === todayStr);
    if (existing && existing.clockInTime) {
      return { success: false, message: `${emp.name} sudah melakukan Clock-In pada pukul ${existing.clockInTime}.` };
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss

    // Late evaluation rule (Shift 1 target 07:00, Regular target 08:00)
    let lateMin = 0;
    let status: AttendanceStatus = 'PRESENT';
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (emp.shift.includes('Shift 1') && (hours > 7 || (hours === 7 && minutes > 5))) {
      status = 'LATE';
      lateMin = (hours - 7) * 60 + minutes;
    } else if (emp.shift.includes('Regular') && (hours > 8 || (hours === 8 && minutes > 5))) {
      status = 'LATE';
      lateMin = (hours - 8) * 60 + minutes;
    }

    if (existing) {
      // update existing placeholder
      setAttendance(prev => prev.map(a => {
        if (a.id === existing.id) {
          return {
            ...a,
            clockInTime: timeStr,
            status,
            lateMinutes: lateMin,
            verificationMethod: method,
            notes: notes || 'Presensi Berhasil',
            photoSnapshot: photo
          };
        }
        return a;
      }));
    } else {
      const newRec: AttendanceRecord = {
        id: `ATT-${Date.now()}`,
        employeeId: emp.id,
        nip: emp.nip,
        employeeName: emp.name,
        department: emp.department,
        date: todayStr,
        clockInTime: timeStr,
        clockOutTime: null,
        status,
        lateMinutes: lateMin,
        overtimeHours: 0,
        verificationMethod: method,
        notes: notes || 'Presensi Karyawan Berhasil',
        photoSnapshot: photo
      };
      setAttendance(prev => [newRec, ...prev]);
    }

    showNotification(
      status === 'LATE' ? 'warning' : 'success', 
      'Clock-In Berhasil', 
      `${emp.name} (${emp.nip}) - Masuk: ${timeStr} ${status === 'LATE' ? `(Terlambat ${lateMin} mnt)` : '(Tepat Waktu)'}`
    );
    return { success: true, message: `Clock-In berhasil dicatat pada ${timeStr}` };
  };

  const clockOut = (employeeId: string, notes?: string): { success: boolean; message: string } => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return { success: false, message: 'Karyawan tidak ditemukan.' };

    const existing = attendance.find(a => a.employeeId === employeeId && a.date === todayStr);
    if (!existing || !existing.clockInTime) {
      return { success: false, message: `${emp.name} belum melakukan Clock-In hari ini.` };
    }

    if (existing.clockOutTime) {
      return { success: false, message: `${emp.name} sudah melakukan Clock-Out pada pukul ${existing.clockOutTime}.` };
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // Compute overtime if shift is past regular end
    let otHours = 0;
    if (now.getHours() >= 17) {
      otHours = Math.max(0, now.getHours() - 17 + (now.getMinutes() >= 30 ? 0.5 : 0));
    }

    setAttendance(prev => prev.map(a => {
      if (a.id === existing.id) {
        return {
          ...a,
          clockOutTime: timeStr,
          overtimeHours: otHours,
          notes: notes ? `${a.notes ? a.notes + ' | ' : ''}${notes}` : a.notes
        };
      }
      return a;
    }));

    showNotification('success', 'Clock-Out Berhasil', `${emp.name} - Pulang: ${timeStr} ${otHours > 0 ? `(Lembur: ${otHours} jam)` : ''}`);
    return { success: true, message: `Clock-Out berhasil dicatat pada ${timeStr}` };
  };

  const quickCheckInByPin = (pin: string): { success: boolean; message: string; employee?: Employee } => {
    const emp = employees.find(e => e.pinCode === pin);
    if (!emp) {
      return { success: false, message: 'PIN tidak terdaftar. Periksa kembali NIP/PIN Anda.' };
    }

    const existing = attendance.find(a => a.employeeId === emp.id && a.date === todayStr);
    if (!existing || !existing.clockInTime) {
      const res = clockIn(emp.id, 'KIOSK_PIN', 'Kiosk Terminal Gate 1');
      return { ...res, employee: emp };
    } else if (!existing.clockOutTime) {
      const res = clockOut(emp.id, 'Kiosk Terminal Gate 1');
      return { ...res, employee: emp };
    } else {
      return { success: false, message: `${emp.name} sudah menyelesaikan Clock-In dan Clock-Out hari ini.`, employee: emp };
    }
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `EMP-${Date.now()}`
    };
    setEmployees(prev => [newEmp, ...prev]);
    showNotification('success', 'Karyawan Baru Terdaftar', `${newEmp.name} (${newEmp.nip}) berhasil ditambahkan ke divisi ${newEmp.department}.`);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    showNotification('info', 'Data Karyawan Diperbarui', 'Data profil karyawan berhasil disimpan.');
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    showNotification('warning', 'Karyawan Dihapus', `${emp?.name} telah dihapus dari sistem.`);
  };

  const submitLeaveRequest = (reqData: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => {
    const newLeave: LeaveRequest = {
      ...reqData,
      id: `LV-${Date.now()}`,
      appliedDate: todayStr,
      status: 'PENDING'
    };
    setLeaveRequests(prev => [newLeave, ...prev]);
    showNotification('info', 'Permohonan Izin Diajukan', `Pengajuan izin ${reqData.type} untuk ${reqData.employeeName} menunggu persetujuan HR.`);
  };

  const updateLeaveStatus = (leaveId: string, status: 'APPROVED' | 'REJECTED', approverName: string) => {
    setLeaveRequests(prev => prev.map(l => {
      if (l.id === leaveId) {
        return {
          ...l,
          status,
          approvedBy: approverName
        };
      }
      return l;
    }));

    // If approved, update attendance status for today if matching
    if (status === 'APPROVED') {
      const leave = leaveRequests.find(l => l.id === leaveId);
      if (leave && leave.startDate <= todayStr && leave.endDate >= todayStr) {
        setAttendance(prev => {
          const found = prev.find(a => a.employeeId === leave.employeeId && a.date === todayStr);
          const attStatus: AttendanceStatus = leave.type === 'SICK' ? 'SICK' : 'LEAVE';
          if (found) {
            return prev.map(a => a.id === found.id ? { ...a, status: attStatus, notes: `Disetujui: ${leave.reason}` } : a);
          } else {
            return [
              ...prev,
              {
                id: `ATT-${Date.now()}`,
                employeeId: leave.employeeId,
                nip: leave.nip,
                employeeName: leave.employeeName,
                department: employees.find(e => e.id === leave.employeeId)?.department || 'Warehouse',
                date: todayStr,
                clockInTime: null,
                clockOutTime: null,
                status: attStatus,
                lateMinutes: 0,
                overtimeHours: 0,
                verificationMethod: 'MANUAL_ENTRY',
                notes: `Izin resmi: ${leave.reason}`
              }
            ];
          }
        });
      }
    }

    showNotification(status === 'APPROVED' ? 'success' : 'warning', `Pengajuan Cuti ${status}`, `Izin cuti telah di-${status.toLowerCase()}.`);
  };

  const resetToDefaultData = () => {
    setLocations(INITIAL_LOCATIONS);
    setInventory(INITIAL_INVENTORY);
    setMovements(INITIAL_MOVEMENTS);
    setBoms(INITIAL_BOMS);
    setWorkCenters(INITIAL_WORK_CENTERS);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setEmployees(INITIAL_EMPLOYEES);
    setAttendance(INITIAL_ATTENDANCE);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    localStorage.clear();
    showNotification('info', 'Sistem Direset', 'Semua data telah dikembalikan ke data pabrik bawaan.');
  };

  return (
    <ERPContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentRole,
        setCurrentRole,
        notifications,
        dismissNotification,
        showNotification,

        locations,
        inventory,
        movements,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        recordStockMovement,

        boms,
        workCenters,
        workOrders,
        addWorkOrder,
        updateWorkOrderStatus,
        issueMaterialsForWorkOrder,
        recordProductionOutput,
        addBOM,
        updateWorkCenterStatus,
        updateWorkCenterOperator,
        updateAllWorkCenterOperators,

        employees,
        attendance,
        leaveRequests,
        clockIn,
        clockOut,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        submitLeaveRequest,
        updateLeaveStatus,
        quickCheckInByPin,

        resetToDefaultData
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};

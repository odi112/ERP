import React from 'react';
import { 
  Boxes, 
  Cog, 
  UserCheck, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Factory, 
  Plus, 
  QrCode, 
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ReorderPointWidget } from './ReorderPointWidget';
import { InventoryItem } from '../../types/erp';
import { getROPSummary } from '../../utils/reorderAlerts';

interface DashboardOverviewProps {
  onOpenKiosk: () => void;
  onOpenNewWO: () => void;
  onOpenNewStockMovement: () => void;
  onOpenNewItem: () => void;
  onOpenRestockModal?: (item?: InventoryItem) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenKiosk,
  onOpenNewWO,
  onOpenNewStockMovement,
  onOpenNewItem,
  onOpenRestockModal
}) => {
  const { 
    inventory, 
    movements, 
    workOrders, 
    workCenters, 
    employees, 
    attendance, 
    locations,
    setActiveTab,
    issueMaterialsForWorkOrder
  } = useERP();

  // Calculations
  const totalStockItems = inventory.reduce((acc, curr) => acc + curr.stockQuantity, 0);
  const totalAssetValue = inventory.reduce((acc, curr) => acc + (curr.stockQuantity * curr.unitCost), 0);
  const ropSummary = getROPSummary(inventory);
  const criticalItems = inventory.filter(i => i.stockQuantity <= i.minSafetyStock);
  const activeWOs = workOrders.filter(w => w.status === 'IN_PROGRESS' || w.status === 'QUALITY_CHECK');
  
  const todayPresent = attendance.filter(a => a.status === 'PRESENT');
  const todayLate = attendance.filter(a => a.status === 'LATE');
  const todayLeave = attendance.filter(a => a.status === 'LEAVE' || a.status === 'SICK');
  const attendanceRate = employees.length > 0 
    ? Math.round(((todayPresent.length + todayLate.length) / employees.length) * 100) 
    : 0;

  // Format IDR currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Factory className="w-4 h-4" />
              Pusat Kendali Pabrik Bakpao Mini Terpadu
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sistem ERP Pabrik Bakpao Mini
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Monitoring real-time gudang tepung & cold storage, alokasi resep BOM, lini mesin mixer, doughbreak, molding 1 & 2, serta absensi karyawan pabrik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('production')}
              className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-medium px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
            >
              <Activity className="w-4 h-4 text-indigo-400" />
              Timeline Produksi
            </button>
            <button
              onClick={onOpenNewWO}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Buat SPK Produksi
            </button>
            <button
              onClick={onOpenNewStockMovement}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
            >
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              Mutasi Stok (IN/OUT)
            </button>
            <button
              onClick={onOpenKiosk}
              className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-medium px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              Terminal Presensi
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Warehouse Stock Value */}
        <div 
          onClick={() => setActiveTab('warehouse')}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 hover:border-indigo-500/50 transition-all duration-200 cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Nilai Stok Gudang</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {formatIDR(totalAssetValue)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5">
              <span>{inventory.length} SKU terdaftar</span>
              <span className="font-mono text-indigo-300">{totalStockItems.toLocaleString()} unit total</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Critical / Low Stock Alert with ROP Integration */}
        <div 
          onClick={() => setActiveTab('warehouse')}
          className={`border rounded-xl p-4.5 transition-all duration-200 cursor-pointer group shadow-sm ${
            ropSummary.criticalCount > 0 
              ? 'bg-rose-950/25 border-rose-800/60 hover:border-rose-500' 
              : ropSummary.warningCount > 0
                ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-500'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Reorder Point & Kritis</span>
            <div className={`p-2 rounded-lg ${
              ropSummary.criticalCount > 0 
                ? 'bg-rose-500/20 text-rose-400 animate-pulse' 
                : ropSummary.warningCount > 0 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-slate-800 text-slate-400'
            }`}>
              {ropSummary.criticalCount > 0 ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
              <span className={ropSummary.criticalCount > 0 ? 'text-rose-400 font-extrabold' : ropSummary.warningCount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                {ropSummary.criticalCount > 0 ? `${ropSummary.criticalCount} Kritis` : `${ropSummary.warningCount} ROP`}
              </span>
              <span className="text-xs text-slate-400 font-normal">
                ({ropSummary.totalAlerts} butuh reorder)
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1.5 truncate">
              {ropSummary.criticalCount > 0 
                ? `🚨 Tepung/Ragi/Isian: ${ropSummary.alerts.slice(0, 2).map(a => a.item.name.split(' ')[0]).join(', ')}` 
                : ropSummary.warningCount > 0
                  ? 'Beberapa bahan mendekati batas ROP.'
                  : 'Seluruh bahan baku di atas batas aman.'}
            </div>
          </div>
        </div>

        {/* KPI 3: Production Orders */}
        <div 
          onClick={() => setActiveTab('production')}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 hover:border-indigo-500/50 transition-all duration-200 cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Program Produksi Aktif</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Cog className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
              <span>{activeWOs.length}</span>
              <span className="text-xs text-slate-400 font-normal">SPK Berjalan / QC</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5">
              <span>Efisiensi Rata-rata: <strong className="text-emerald-400">94.8%</strong></span>
              <span className="text-indigo-400 flex items-center gap-0.5">Lihat SPK <ArrowUpRight className="w-3 h-3" /></span>
            </div>
          </div>
        </div>

        {/* KPI 4: Employee Attendance */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tingkat Kehadiran Hari Ini</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
              <span className="text-emerald-400">{attendanceRate}%</span>
              <span className="text-xs text-slate-400 font-normal font-mono">({todayPresent.length + todayLate.length}/{employees.length} staf)</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1.5 text-slate-400">
              <span className="text-emerald-400">{todayPresent.length} Tepat</span>
              <span>•</span>
              <span className="text-amber-400">{todayLate.length} Telat</span>
              <span>•</span>
              <span className="text-blue-400">{todayLeave.length} Izin/Cuti</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Reorder Point (ROP) Notification & Early Warning System */}
      <ReorderPointWidget 
        onOpenRestockModal={(item) => onOpenRestockModal?.(item)} 
        onNavigateToWarehouse={() => setActiveTab('warehouse')} 
      />

      {/* Main Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Production & Machine Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Work Orders */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Work Order & Progres Manufaktur</h2>
                  <p className="text-xs text-slate-400">Surat Perintah Kerja (SPK) yang sedang dalam antrean dan perakitan</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('production')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Lihat Semua ({workOrders.length}) →
              </button>
            </div>

            <div className="space-y-3.5">
              {workOrders.slice(0, 3).map((wo) => {
                const progressPct = Math.round((wo.completedQuantity / wo.targetQuantity) * 100);
                const isUrgent = wo.priority === 'URGENT' || wo.priority === 'HIGH';

                return (
                  <div key={wo.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {wo.woNumber}
                        </span>
                        <h4 className="text-sm font-semibold text-white">{wo.finishedGoodName}</h4>
                        {isUrgent && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
                            {wo.priority}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          wo.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          wo.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          wo.status === 'QUALITY_CHECK' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {wo.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-1.5 mt-3">
                      <div className="flex justify-between text-xs text-slate-400 font-mono">
                        <span>Pencapaian: {wo.completedQuantity} / {wo.targetQuantity} unit</span>
                        <span className="font-semibold text-slate-200">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            wo.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-900">
                      <div>
                        Supervisor: <span className="text-slate-300 font-medium">{wo.supervisor}</span> • Due: <span className="text-slate-300">{wo.dueDate.slice(0, 10)}</span>
                      </div>
                      
                      {!wo.materialIssued && wo.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => issueMaterialsForWorkOrder(wo.id)}
                          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 rounded font-medium text-xs cursor-pointer"
                        >
                          Keluarkan Bahan BOM
                        </button>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Bahan Terdistribusi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Machine Work Centers Status */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Status Lini Mesin & Work Centers</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {workCenters.filter(w => w.status === 'RUNNING').length}/{workCenters.length} Mesin Beroperasi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workCenters.map((wc) => (
                <div key={wc.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-slate-400">{wc.code}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        wc.status === 'RUNNING' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        wc.status === 'IDLE' ? 'bg-slate-800 text-slate-400' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {wc.status}
                      </span>
                    </div>
                    <div className="font-semibold text-xs sm:text-sm text-slate-200 mt-1 line-clamp-1">
                      {wc.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Operator: <span className="text-slate-300">{wc.operatorInCharge}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Efisiensi:</span>
                    <span className="font-mono font-bold text-emerald-400">{wc.efficiencyRate}% OEE</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Warehouse Space & Live Stock Movements & Attendance */}
        <div className="space-y-6">
          {/* Warehouse Locations */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-400" />
                Pemanfaatan Gudang
              </h3>
              <button 
                onClick={() => setActiveTab('warehouse')}
                className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Detail →
              </button>
            </div>

            <div className="space-y-3">
              {locations.map((loc) => {
                const pct = Math.round((loc.currentItemsCount / loc.capacity) * 100);
                return (
                  <div key={loc.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{loc.code}</span>
                      <span className="font-mono text-slate-400">{loc.currentItemsCount} / {loc.capacity}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{loc.name}</div>
                    
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${pct > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Stock Movement Feed */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Mutasi Stok Terkini
              </h3>
              <button 
                onClick={() => setActiveTab('warehouse')}
                className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Log Lengkap
              </button>
            </div>

            <div className="space-y-2.5">
              {movements.slice(0, 4).map((m) => {
                const isInbound = m.type === 'INBOUND_RECEIPT' || m.type === 'PRODUCTION_RECEIPT';
                return (
                  <div key={m.id} className="text-xs bg-slate-950/60 border border-slate-800/70 p-2.5 rounded-lg flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-md mt-0.5 ${isInbound ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {isInbound ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[11px] text-slate-400 truncate">{m.sku}</span>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">{m.timestamp.slice(11, 16)}</span>
                      </div>
                      <div className="font-medium text-slate-200 truncate">{m.itemName}</div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span className={isInbound ? 'text-emerald-400 font-semibold' : 'text-blue-400 font-semibold'}>
                          {isInbound ? `+${m.quantity}` : `-${m.quantity}`} {m.unit}
                        </span>
                        <span className="text-slate-400 truncate max-w-[100px]">{m.referenceDoc}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Attendance Snapshot */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Presensi Hari Ini
              </h3>
              <button 
                onClick={onOpenKiosk}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                + Kiosk Presensi
              </button>
            </div>

            <div className="space-y-2">
              {attendance.slice(0, 4).map((att) => (
                <div key={att.id} className="text-xs bg-slate-950/60 border border-slate-800/70 p-2.5 rounded-lg flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-200 truncate">{att.employeeName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{att.nip} • {att.department}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-semibold text-slate-200">
                      {att.clockInTime ? att.clockInTime.slice(0, 5) : '--:--'}
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      att.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-400' :
                      att.status === 'LATE' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {att.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

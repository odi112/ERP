import React, { useState } from 'react';
import { 
  Cog, 
  Plus, 
  Layers, 
  Factory, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Play, 
  Pause, 
  FileText, 
  ArrowRight, 
  Check, 
  Printer, 
  Search,
  Activity,
  PackageCheck,
  TrendingUp,
  Cpu,
  Calendar as CalendarIcon,
  Users,
  Edit3
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { WorkOrder, WorkOrderStatus, PriorityLevel } from '../../types/erp';
import { WorkOrderModal } from './WorkOrderModal';
import { LogOutputModal } from './LogOutputModal';
import { BOMModal } from './BOMModal';
import { ProductionTimeline } from './ProductionTimeline';
import { EditMachineOperatorsModal } from './EditMachineOperatorsModal';

interface ProductionViewProps {
  onPrintSPK?: (wo: WorkOrder) => void;
}

export const ProductionView: React.FC<ProductionViewProps> = ({ onPrintSPK }) => {
  const { 
    workOrders, 
    boms, 
    workCenters, 
    inventory, 
    updateWorkOrderStatus, 
    issueMaterialsForWorkOrder,
    updateWorkCenterStatus 
  } = useERP();

  const [subTab, setSubTab] = useState<'timeline' | 'workorders' | 'boms' | 'workcenters'>('timeline');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isWoModalOpen, setIsWoModalOpen] = useState(false);
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const [outputWo, setOutputWo] = useState<WorkOrder | null>(null);
  const [isEditOperatorsModalOpen, setIsEditOperatorsModalOpen] = useState(false);
  const [selectedOperatorMachineId, setSelectedOperatorMachineId] = useState<string | null>(null);

  // Filtered work orders
  const filteredOrders = workOrders.filter(wo => {
    const matchesSearch = 
      wo.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.finishedGoodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.supervisor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Cog className="w-4 h-4" />
            Sistem Eksekusi Manufaktur & Program Produksi
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Program Produksi & Work Order (MES)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Penerbitan SPK, alokasi bahan baku BOM otomatis, pelaporan batch QC, dan utilisasi mesin pabrik.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsWoModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Terbitkan SPK Baru
          </button>

          <button
            onClick={() => setIsBomModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            Master BOM Baru
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center border-b border-slate-800 space-x-1 text-xs sm:text-sm font-medium">
        <button
          onClick={() => setSubTab('timeline')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            subTab === 'timeline'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Timeline Jadwal Produksi (Gantt)
        </button>

        <button
          onClick={() => setSubTab('workorders')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            subTab === 'workorders'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Daftar SPK / Work Orders ({workOrders.length})
        </button>

        <button
          onClick={() => setSubTab('boms')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            subTab === 'boms'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Master Bill of Materials ({boms.length})
        </button>

        <button
          onClick={() => setSubTab('workcenters')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            subTab === 'workcenters'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Factory className="w-4 h-4" />
          Lini Mesin & Work Centers ({workCenters.length})
        </button>
      </div>

      {/* SUB-TAB 0: TIMELINE GANTT */}
      {subTab === 'timeline' && (
        <ProductionTimeline
          onOpenNewWO={() => setIsWoModalOpen(true)}
          onSelectWO={(wo) => setOutputWo(wo)}
          onPrintSPK={onPrintSPK}
          onEditOperators={() => {
            setSelectedOperatorMachineId(null);
            setIsEditOperatorsModalOpen(true);
          }}
        />
      )}

      {/* SUB-TAB 1: WORK ORDERS */}
      {subTab === 'workorders' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nomor SPK, nama produk jadi, atau supervisor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Status SPK</option>
                <option value="PLANNED">PLANNED (Terjadwal)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Sedang Dirakit)</option>
                <option value="QUALITY_CHECK">QUALITY_CHECK (Uji Mutu)</option>
                <option value="COMPLETED">COMPLETED (Selesai Penuh)</option>
                <option value="ON_HOLD">ON_HOLD (Ditunda)</option>
              </select>
            </div>
          </div>

          {/* Work Orders List */}
          <div className="space-y-3.5">
            {filteredOrders.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                Tidak ada SPK yang cocok dengan pencarian atau filter status.
              </div>
            ) : (
              filteredOrders.map((wo) => {
                const progressPct = Math.round((wo.completedQuantity / wo.targetQuantity) * 100);
                const assignedWc = workCenters.find(w => w.id === wo.workCenterId);

                return (
                  <div key={wo.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-700 transition-colors">
                    {/* Top Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                          {wo.woNumber}
                        </span>
                        <div>
                          <h3 className="font-bold text-white text-base">{wo.finishedGoodName}</h3>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            SKU: <strong className="text-slate-300">{wo.finishedGoodSku}</strong> • BOM: <strong className="text-slate-300">{wo.bomId}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Priority Badge */}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                          wo.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          wo.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {wo.priority}
                        </span>

                        {/* Status Dropdown */}
                        <select
                          value={wo.status}
                          onChange={(e) => updateWorkOrderStatus(wo.id, e.target.value as WorkOrderStatus)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                            wo.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            wo.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            wo.status === 'QUALITY_CHECK' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                            'bg-slate-950 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="PLANNED" className="bg-slate-900 text-white">PLANNED</option>
                          <option value="IN_PROGRESS" className="bg-slate-900 text-white">IN_PROGRESS</option>
                          <option value="QUALITY_CHECK" className="bg-slate-900 text-white">QUALITY_CHECK</option>
                          <option value="COMPLETED" className="bg-slate-900 text-white">COMPLETED</option>
                          <option value="ON_HOLD" className="bg-slate-900 text-white">ON_HOLD</option>
                        </select>
                      </div>
                    </div>

                    {/* Progress Bar & Target Units */}
                    <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between text-xs text-slate-300">
                        <div className="flex items-center gap-4">
                          <span>Target: <strong className="text-white font-mono">{wo.targetQuantity}</strong> unit</span>
                          <span>Telah Lolos QC: <strong className="text-emerald-400 font-mono">{wo.completedQuantity}</strong> unit</span>
                          {wo.scrapQuantity > 0 && (
                            <span>Scrap / Cacat: <strong className="text-rose-400 font-mono">{wo.scrapQuantity}</strong> unit</span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-white">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            wo.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-500'
                          }`} 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta info & Action Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                      <div className="flex flex-wrap items-center gap-3 text-slate-400">
                        <span>Lini: <strong className="text-slate-300">{assignedWc?.name || wo.workCenterId}</strong></span>
                        <span>•</span>
                        <span>Supervisor: <strong className="text-slate-300">{wo.supervisor}</strong></span>
                        <span>•</span>
                        <span>Tenggat: <strong className="text-slate-300 font-mono">{wo.dueDate}</strong></span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Action 1: Issue Materials from Warehouse */}
                        {!wo.materialIssued ? (
                          <button
                            onClick={() => issueMaterialsForWorkOrder(wo.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                            title="Otomatis potong stok bahan baku dari gudang sesuai BOM"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            Keluarkan Bahan Gudang (Issue BOM)
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Bahan Terdistribusi
                          </span>
                        )}

                        {/* Action 2: Log Production Output */}
                        {wo.status !== 'COMPLETED' && (
                          <button
                            onClick={() => setOutputWo(wo)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            Catat Hasil Produksi
                          </button>
                        )}

                        {/* Action 3: Print SPK Traveler */}
                        <button
                          onClick={() => onPrintSPK && onPrintSPK(wo)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
                          title="Cetak Lembar Kerja SPK"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Cetak SPK</span>
                        </button>
                      </div>
                    </div>

                    {/* History Log drawer if any */}
                    {wo.historyLogs && wo.historyLogs.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                          Log Riwayat SPK:
                        </span>
                        <div className="space-y-1">
                          {wo.historyLogs.slice(-2).map((h, i) => (
                            <div key={i} className="text-[11px] text-slate-400 flex items-center justify-between">
                              <span>• {h.action}</span>
                              <span className="font-mono text-[10px] text-slate-400 shrink-0">{h.timestamp} ({h.user})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BILL OF MATERIALS (BOM) */}
      {subTab === 'boms' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boms.map((bom) => {
              return (
                <div key={bom.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {bom.id}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {bom.version}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white">{bom.productName}</h3>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      Target SKU: <strong className="text-slate-300">{bom.productSku}</strong>
                    </div>

                    <div className="mt-4 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Komponen & Resep Bahan:
                      </span>
                      <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        {bom.components.map((c, idx) => {
                          const stockItem = inventory.find(i => i.sku === c.componentSku);
                          const isLow = stockItem && stockItem.stockQuantity < (c.quantityNeeded * 10);

                          return (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 truncate max-w-[160px]" title={c.componentName}>
                                • {c.componentName}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-semibold text-slate-200">
                                  {c.quantityNeeded} {c.unit}
                                </span>
                                {isLow && (
                                  <span className="text-[10px] text-amber-400 font-bold" title="Stok bahan ini di gudang menipis">
                                    ⚠️
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Standar HPP Produksi:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {formatIDR(bom.standardProductionCost)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Labor Time:</span>
                      <span className="font-mono text-slate-200">{bom.estimatedLaborHours} Jam/Unit</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: MACHINES & WORK CENTERS */}
      {subTab === 'workcenters' && (
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl text-xs shadow-sm">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Manajemen Operator & Penugasan Mesin Produksi
              </h3>
              <p className="text-slate-400 mt-0.5">
                Konfigurasi penanggung jawab staf operator untuk seluruh mesin (Molding 1 & 2, Doughbreak, Mixer 1 & 2)
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedOperatorMachineId(null);
                setIsEditOperatorsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Operator Semua Mesin
            </button>
          </div>

          {/* Machine Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workCenters.map((wc) => (
              <div key={wc.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-400">{wc.code}</span>
                      <h3 className="font-bold text-sm text-white">{wc.name}</h3>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    wc.status === 'RUNNING' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    wc.status === 'IDLE' ? 'bg-slate-800 text-slate-400' :
                    'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {wc.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Operator Bertugas:</span>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="font-semibold text-slate-200 truncate" title={wc.operatorInCharge}>
                        {wc.operatorInCharge}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedOperatorMachineId(wc.id);
                          setIsEditOperatorsModalOpen(true);
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold shrink-0 cursor-pointer ml-1"
                        title="Ubah operator mesin ini"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Kapasitas:</span>
                    <div className="font-mono font-semibold text-slate-200 mt-0.5">{wc.capacityPerHour} unit/jam</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Efisiensi OEE Mesin:</span>
                    <span className="font-mono text-emerald-400 font-bold">{wc.efficiencyRate}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-500" 
                      style={{ width: `${wc.efficiencyRate}%` }} 
                    />
                  </div>
                </div>

                {/* Status Controller buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Ubah Mode:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateWorkCenterStatus(wc.id, 'RUNNING')}
                      className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                        wc.status === 'RUNNING' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Run
                    </button>
                    <button
                      onClick={() => updateWorkCenterStatus(wc.id, 'IDLE')}
                      className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                        wc.status === 'IDLE' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Idle
                    </button>
                    <button
                      onClick={() => updateWorkCenterStatus(wc.id, 'MAINTENANCE')}
                      className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                        wc.status === 'MAINTENANCE' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Maint.
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <WorkOrderModal
        isOpen={isWoModalOpen}
        onClose={() => setIsWoModalOpen(false)}
      />

      <BOMModal
        isOpen={isBomModalOpen}
        onClose={() => setIsBomModalOpen(false)}
      />

      <LogOutputModal
        isOpen={!!outputWo}
        onClose={() => setOutputWo(null)}
        workOrder={outputWo}
      />

      <EditMachineOperatorsModal
        isOpen={isEditOperatorsModalOpen}
        onClose={() => setIsEditOperatorsModalOpen(false)}
        specificMachineId={selectedOperatorMachineId}
      />
    </div>
  );
};

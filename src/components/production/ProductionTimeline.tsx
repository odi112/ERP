import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Plus, 
  Layers, 
  Cpu, 
  ArrowRight,
  Info
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { WorkOrder, WorkCenter } from '../../types/erp';

interface ProductionTimelineProps {
  onOpenNewWO: () => void;
  onSelectWO?: (wo: WorkOrder) => void;
  onPrintSPK?: (wo: WorkOrder) => void;
  onEditOperators?: () => void;
}

export const ProductionTimeline: React.FC<ProductionTimelineProps> = ({
  onOpenNewWO,
  onSelectWO,
  onPrintSPK,
  onEditOperators
}) => {
  const { workOrders, workCenters } = useERP();

  // Timeline window settings
  // Center around October 15, 2026 (simulation date)
  const [selectedMachineFilter, setSelectedMachineFilter] = useState<string>('ALL');
  const [timelineStartDay, setTimelineStartDay] = useState<number>(10); // 10 Oct 2026
  const numDays = 14; // 14-day timeline window (Oct 10 - Oct 23)

  // Generate date array for the window
  const days = Array.from({ length: numDays }, (_, i) => {
    const dayNum = timelineStartDay + i;
    const dateStr = `2026-10-${dayNum < 10 ? '0' + dayNum : dayNum}`;
    const dateObj = new Date(2026, 9, dayNum); // month is 0-indexed (9 = Oct)
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const dayOfWeek = dayNames[dateObj.getDay()];
    const isToday = dateStr === '2026-10-15';
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    return {
      dayNum,
      dateStr,
      dayOfWeek,
      isToday,
      isWeekend
    };
  });

  // Filter machines / work centers
  const activeMachines = workCenters.filter(wc => 
    selectedMachineFilter === 'ALL' || wc.id === selectedMachineFilter
  );

  // Helper to parse date strings "2026-10-14 08:00" into day number relative to window
  const getDayOffset = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.slice(0, 10).split('-');
    if (parts.length < 3) return null;
    const day = parseInt(parts[2], 10);
    return day - timelineStartDay;
  };

  // Helper to calculate start & duration in days for a work order
  const getWoSpan = (wo: WorkOrder) => {
    const startOffset = getDayOffset(wo.startDate);
    const endOffset = getDayOffset(wo.dueDate);

    if (startOffset === null || endOffset === null) {
      return null;
    }

    const clampedStart = Math.max(0, startOffset);
    const clampedEnd = Math.min(numDays - 1, endOffset);
    const duration = Math.max(1, clampedEnd - clampedStart + 1);

    // If completely outside window
    if (endOffset < 0 || startOffset >= numDays) {
      return null;
    }

    return {
      startCol: clampedStart,
      duration,
      startsBefore: startOffset < 0,
      endsAfter: endOffset >= numDays
    };
  };

  // Status color styles
  const getStatusBadge = (status: WorkOrder['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30';
      case 'IN_PROGRESS':
        return 'bg-blue-600/25 text-blue-300 border-blue-500/50 hover:bg-blue-600/35';
      case 'QUALITY_CHECK':
        return 'bg-purple-600/25 text-purple-300 border-purple-500/50 hover:bg-purple-600/35';
      case 'PLANNED':
        return 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30 hover:bg-indigo-900/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Timeline Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <CalendarIcon className="w-4 h-4" />
            Visual Production Master Schedule (Gantt Timeline)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Timeline Jadwal Produksi Lini Manufaktur
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualisasi alokasi tanggal mulai, jatuh tempo, serta utilisasi mesin per work order.
          </p>
        </div>

        {/* Navigation & Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Machine Filter Dropdown */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select
              value={selectedMachineFilter}
              onChange={(e) => setSelectedMachineFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Lini Mesin ({workCenters.length})</option>
              {workCenters.map(wc => (
                <option key={wc.id} value={wc.id}>{wc.code} - {wc.name}</option>
              ))}
            </select>
          </div>

          {/* Date Window Navigation */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setTimelineStartDay(prev => Math.max(1, prev - 4))}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 cursor-pointer"
              title="Geser Mundur"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-slate-200 font-semibold">
              {days[0].dayNum} - {days[days.length - 1].dayNum} Okt 2026
            </span>
            <button
              onClick={() => setTimelineStartDay(prev => Math.min(18, prev + 4))}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 cursor-pointer"
              title="Geser Maju"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setTimelineStartDay(10)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Reset ke Hari Ini
          </button>

          {onEditOperators && (
            <button
              onClick={onEditOperators}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Atur Operator
            </button>
          )}

          <button
            onClick={onOpenNewWO}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Jadwalkan SPK
          </button>
        </div>
      </div>

      {/* Legend & Summary Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-slate-400 font-semibold">Keterangan Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500/30 border border-indigo-500/60" />
            <span className="text-slate-300">PLANNED (Terjadwal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500/40 border border-blue-400" />
            <span className="text-slate-300">IN PROGRESS (Sedang Dirakit)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-500/40 border border-purple-400" />
            <span className="text-slate-300">QC CHECK (Uji Mutu)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-400" />
            <span className="text-slate-300">COMPLETED (Selesai Penuh)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Hari Ini: <strong className="text-white font-mono">15 Okt 2026</strong></span>
        </div>
      </div>

      {/* Gantt Matrix Grid */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950 shadow-inner">
        <div className="min-w-[960px]">
          {/* Header Row: Days of the Month */}
          <div className="grid grid-cols-[220px_1fr] border-b border-slate-800 bg-slate-900/90 text-xs font-semibold">
            {/* Machine Name Column Header */}
            <div className="p-3 text-slate-400 font-bold uppercase tracking-wider border-r border-slate-800 flex items-center">
              Lini Mesin / Work Center
            </div>

            {/* 14 Day Columns Grid */}
            <div className="grid grid-cols-[repeat(14,minmax(0,1fr))]">
              {days.map((day) => (
                <div 
                  key={day.dateStr} 
                  className={`p-2 text-center border-r border-slate-800/80 flex flex-col justify-center items-center ${
                    day.isToday 
                      ? 'bg-indigo-600/20 text-indigo-300 font-bold border-indigo-500/50' 
                      : day.isWeekend 
                      ? 'bg-slate-900/40 text-slate-500' 
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-[10px] uppercase">{day.dayOfWeek}</span>
                  <span className={`text-xs font-mono font-bold mt-0.5 ${day.isToday ? 'px-1.5 py-0.2 bg-indigo-600 text-white rounded-full' : ''}`}>
                    {day.dayNum}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Machine Schedule Rows */}
          <div className="divide-y divide-slate-800/60">
            {activeMachines.map((wc) => {
              // Find work orders assigned to this machine
              const machineOrders = workOrders.filter(wo => wo.workCenterId === wc.id);

              return (
                <div key={wc.id} className="grid grid-cols-[220px_1fr] min-h-[92px] relative hover:bg-slate-900/30 transition-colors">
                  {/* Left Column: Machine Details */}
                  <div className="p-3 border-r border-slate-800 flex flex-col justify-between bg-slate-950/80">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-indigo-400 font-bold">{wc.code}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          wc.status === 'RUNNING' ? 'bg-emerald-500/20 text-emerald-400' :
                          wc.status === 'IDLE' ? 'bg-slate-800 text-slate-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {wc.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1 line-clamp-1" title={wc.name}>
                        {wc.name}
                      </h4>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-2 truncate">
                      Op: {wc.operatorInCharge.split(' ')[0]} • Cap: {wc.capacityPerHour}/jam
                    </div>
                  </div>

                  {/* 14 Day Timeline Grid Cells */}
                  <div className="relative grid grid-cols-[repeat(14,minmax(0,1fr))]">
                    {/* Background grid vertical lines */}
                    {days.map((day) => (
                      <div 
                        key={day.dateStr} 
                        className={`h-full border-r border-slate-800/40 ${
                          day.isToday ? 'bg-indigo-500/5 border-indigo-500/20' : ''
                        }`} 
                      />
                    ))}

                    {/* Today Marker Line */}
                    {days.some(d => d.isToday) && (
                      <div 
                        className="absolute top-0 bottom-0 z-20 pointer-events-none"
                        style={{
                          left: `${(days.findIndex(d => d.isToday) + 0.5) * (100 / 14)}%`
                        }}
                      >
                        <div className="w-0.5 h-full bg-indigo-500 shadow-md shadow-indigo-500/50" />
                      </div>
                    )}

                    {/* Work Order Scheduled Blocks */}
                    {machineOrders.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[11px] text-slate-600 italic">Tidak ada jadwal SPK aktif</span>
                      </div>
                    ) : (
                      machineOrders.map((wo) => {
                        const span = getWoSpan(wo);
                        if (!span) return null;

                        const leftPercent = (span.startCol / 14) * 100;
                        const widthPercent = (span.duration / 14) * 100;
                        const progressPct = Math.round((wo.completedQuantity / wo.targetQuantity) * 100);

                        return (
                          <div
                            key={wo.id}
                            onClick={() => onSelectWO && onSelectWO(wo)}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                              top: '10px',
                              bottom: '10px'
                            }}
                            className={`absolute z-10 rounded-xl p-2.5 border shadow-lg flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:z-30 ${getStatusBadge(wo.status)}`}
                            title={`${wo.woNumber}: ${wo.finishedGoodName} (${wo.completedQuantity}/${wo.targetQuantity} units) - Status: ${wo.status}`}
                          >
                            {/* Inner progress fill bar */}
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-white/10 pointer-events-none transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />

                            {/* Block Header */}
                            <div className="relative z-10 flex items-center justify-between gap-1">
                              <span className="font-mono text-[10px] font-extrabold tracking-wider truncate">
                                {wo.woNumber}
                              </span>
                              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-black/40 text-white shrink-0">
                                {progressPct}%
                              </span>
                            </div>

                            {/* Product Title */}
                            <div className="relative z-10 text-[11px] font-bold text-white truncate my-0.5">
                              {wo.finishedGoodName}
                            </div>

                            {/* Target & Units */}
                            <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-200">
                              <span className="font-mono font-medium">
                                {wo.completedQuantity}/{wo.targetQuantity} unit
                              </span>
                              <span className="text-[9px] uppercase font-semibold">
                                {wo.priority === 'URGENT' ? '🔥 URGENT' : wo.status}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Work Orders Queue breakdown */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Antrean SPK & Jadwal Produksi Mendatang (Upcoming Work Orders)
          </h3>
          <span className="text-xs text-slate-400">
            {workOrders.filter(w => w.status !== 'COMPLETED').length} SPK Aktif / Dalam Antrean
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {workOrders.map((wo) => {
            const assignedWc = workCenters.find(w => w.id === wo.workCenterId);
            const isCompleted = wo.status === 'COMPLETED';

            return (
              <div 
                key={wo.id} 
                className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-indigo-400">{wo.woNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      wo.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                      wo.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                      wo.status === 'QUALITY_CHECK' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {wo.status}
                    </span>
                  </div>

                  <h5 className="font-semibold text-xs text-white line-clamp-1">{wo.finishedGoodName}</h5>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Lini: <strong className="text-slate-300">{assignedWc?.code || wo.workCenterId}</strong>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="text-slate-400 font-mono">
                    Target: <strong className="text-white">{wo.targetQuantity}</strong> unit
                  </div>
                  <div className="text-slate-400 font-mono">
                    Due: <strong className="text-slate-200">{wo.dueDate.slice(0, 10)}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

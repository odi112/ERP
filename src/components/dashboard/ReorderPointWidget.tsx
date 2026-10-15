import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  ShoppingCart, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  TrendingDown, 
  Clock, 
  PackageCheck,
  ShieldAlert
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { getROPSummary, classifyBakpaoMaterial } from '../../utils/reorderAlerts';
import { InventoryItem } from '../../types/erp';

interface ReorderPointWidgetProps {
  onOpenRestockModal: (item?: InventoryItem) => void;
  onNavigateToWarehouse: (sku?: string) => void;
}

export const ReorderPointWidget: React.FC<ReorderPointWidgetProps> = ({
  onOpenRestockModal,
  onNavigateToWarehouse
}) => {
  const { inventory, simulateConsumptionROP, quickRestockItem } = useERP();
  const summary = getROPSummary(inventory);

  // Group core bakpao materials
  const tepungItems = inventory.filter(i => classifyBakpaoMaterial(i).type === 'TEPUNG');
  const ragiItems = inventory.filter(i => classifyBakpaoMaterial(i).type === 'RAGI');
  const isianItems = inventory.filter(i => classifyBakpaoMaterial(i).type === 'ISIAN');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Early Warning System Gudang Bahan Baku
            </span>
            {summary.hasCoreCritical && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full animate-pulse">
                🚨 Alarm Kritis Aktif
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
            Status Reorder Point (ROP) Bahan Baku Utama Bakpao Mini
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pengawasan otomatis persediaan Tepung, Ragi Saf-Instant, dan Isian agar lini mixer & molding tidak terhenti.
          </p>
        </div>

        {/* Top summary chips */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Total Kritis: </span>
            <strong className="text-rose-400 font-mono font-bold">{summary.criticalCount} SKU</strong>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Reorder Alert: </span>
            <strong className="text-amber-400 font-mono font-bold">{summary.warningCount} SKU</strong>
          </div>
        </div>
      </div>

      {/* 3 Core Material Grid Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SECTION 1: TEPUNG */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍞</span>
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">Bahan Baku Tepung</h3>
                  <span className="text-[10px] text-slate-400">Terigu Low Ash & Tang Mien</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                summary.tepungAlerts.some(a => a.alertLevel === 'CRITICAL')
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : summary.tepungAlerts.length > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {summary.tepungAlerts.length > 0 ? `${summary.tepungAlerts.length} Perlu Order` : '✅ Aman'}
              </span>
            </div>

            <div className="mt-3.5 space-y-3">
              {tepungItems.map(item => {
                const isCritical = item.stockQuantity <= item.minSafetyStock;
                const isWarning = !isCritical && item.stockQuantity <= item.reorderLevel;
                const progressPct = Math.min(100, Math.max(8, (item.stockQuantity / (item.reorderLevel * 2)) * 100));

                return (
                  <div key={item.id} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/70">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-xs text-slate-200 font-semibold line-clamp-1" title={item.name}>
                        {item.name.replace(/Bakpao|Premium|Khusus|\(.*?\)/gi, '').trim()}
                      </span>
                      <span className={`text-xs font-mono font-bold shrink-0 ${
                        isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {item.stockQuantity} {item.unit}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-1.5 flex relative">
                      <div 
                        className={`h-full ${isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                      <span>Safety: {item.minSafetyStock}</span>
                      <span>ROP: {item.reorderLevel} {item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onNavigateToWarehouse('RAW-TPG')}
              className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Lihat di Rak Gudang
            </button>
            <button
              onClick={() => onOpenRestockModal(tepungItems[1] || tepungItems[0])}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-3 h-3" />
              Restok Tepung
            </button>
          </div>
        </div>

        {/* SECTION 2: RAGI INSTAN */}
        <div className={`rounded-xl p-4 flex flex-col justify-between transition-colors border ${
          summary.ragiAlerts.some(a => a.alertLevel === 'CRITICAL')
            ? 'bg-rose-950/20 border-rose-800/70 shadow-lg shadow-rose-950/20'
            : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧪</span>
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">Ragi Instan (Yeast)</h3>
                  <span className="text-[10px] text-slate-400">Saf-Instant Gold Bakery Grade</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                summary.ragiAlerts.some(a => a.alertLevel === 'CRITICAL')
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                  : summary.ragiAlerts.length > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {summary.ragiAlerts.some(a => a.alertLevel === 'CRITICAL') 
                  ? '🚨 LEVEL KRITIS' 
                  : summary.ragiAlerts.length > 0 
                    ? '⚠️ ROP Alert' 
                    : '✅ Aman'}
              </span>
            </div>

            <div className="mt-3.5 space-y-3">
              {ragiItems.map(item => {
                const isCritical = item.stockQuantity <= item.minSafetyStock;
                const isWarning = !isCritical && item.stockQuantity <= item.reorderLevel;
                const progressPct = Math.min(100, Math.max(8, (item.stockQuantity / (item.reorderLevel * 2)) * 100));

                return (
                  <div key={item.id} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/70">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-xs text-slate-200 font-semibold" title={item.name}>
                        {item.name}
                      </span>
                      <span className={`text-xs font-mono font-bold shrink-0 ${
                        isCritical ? 'text-rose-400 font-extrabold' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {item.stockQuantity} {item.unit}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-1.5 flex relative">
                      <div 
                        className={`h-full ${isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                      <span className="text-rose-400">Min Safety: {item.minSafetyStock} kg</span>
                      <span className="text-amber-400">ROP: {item.reorderLevel} kg</span>
                    </div>

                    {isCritical && (
                      <div className="mt-2 text-[10px] text-rose-300 bg-rose-500/10 p-1.5 rounded border border-rose-500/30 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Defisit {(item.minSafetyStock - item.stockQuantity)} kg! Stok ragi harus segera dipesan.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onNavigateToWarehouse('RAW-RGI')}
              className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Lihat di Cold Rack
            </button>
            <button
              onClick={() => onOpenRestockModal(ragiItems[0])}
              className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/40 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-3 h-3" />
              ⚡ Restok Ragi Kilat
            </button>
          </div>
        </div>

        {/* SECTION 3: BAHAN ISIAN (FILLING) */}
        <div className={`rounded-xl p-4 flex flex-col justify-between transition-colors border ${
          summary.isianAlerts.some(a => a.alertLevel === 'CRITICAL')
            ? 'bg-rose-950/20 border-rose-800/70'
            : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥟</span>
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">Bahan Isian (Filling)</h3>
                  <span className="text-[10px] text-slate-400">Cold Storage Chiller 4°C</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                summary.isianAlerts.some(a => a.alertLevel === 'CRITICAL')
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : summary.isianAlerts.length > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {summary.isianAlerts.length > 0 ? `${summary.isianAlerts.length} Butuh Order` : '✅ Aman'}
              </span>
            </div>

            <div className="mt-3.5 space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {isianItems.map(item => {
                const isCritical = item.stockQuantity <= item.minSafetyStock;
                const isWarning = !isCritical && item.stockQuantity <= item.reorderLevel;

                return (
                  <div key={item.id} className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/70 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-200 truncate pr-1">
                        {item.name.replace(/Bakery Grade|Dark Choco Lava Filling|Spesial|Mung Bean Paste|\(.*?\)/gi, '').trim()}
                      </span>
                      <span className={`font-mono font-bold shrink-0 ${
                        isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {item.stockQuantity} {item.unit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>Safety: {item.minSafetyStock} kg</span>
                      <span className="text-slate-500">ROP: {item.reorderLevel} kg</span>
                      {isCritical && <span className="text-rose-400 font-bold">🚨 Kritis</span>}
                      {isWarning && <span className="text-amber-400 font-semibold">⚠️ Reorder</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onNavigateToWarehouse('FIL-')}
              className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Lihat di Cold Storage
            </button>
            <button
              onClick={() => onOpenRestockModal(summary.isianAlerts[0]?.item || isianItems[0])}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-3 h-3" />
              Restok Isian
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Simulation & Test Bar */}
      <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-300">
            <strong>Uji Coba Sistem Notifikasi:</strong> Simulasikan pengurangan stok bahan secara langsung untuk melihat alarm bekerja.
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => simulateConsumptionROP('RAGI')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
            title="Kurangi stok Ragi Saf-Instant ke level kritis"
          >
            Picu Kritis Ragi
          </button>
          <button
            onClick={() => simulateConsumptionROP('TEPUNG')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
            title="Kurangi stok Tepung ke level Reorder Point"
          >
            Picu ROP Tepung
          </button>
          <button
            onClick={() => simulateConsumptionROP('ISIAN')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-colors cursor-pointer"
            title="Kurangi stok Isian Pasta Cokelat ke level kritis"
          >
            Picu Kritis Isian
          </button>
        </div>
      </div>
    </div>
  );
};

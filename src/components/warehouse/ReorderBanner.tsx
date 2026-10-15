import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  ShoppingCart, 
  ArrowRight, 
  Boxes, 
  Layers, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { getROPSummary } from '../../utils/reorderAlerts';
import { InventoryItem } from '../../types/erp';

interface ReorderBannerProps {
  onOpenRestockModal: (item?: InventoryItem) => void;
  onFilterLowStock: () => void;
  isFilterActive: boolean;
}

export const ReorderBanner: React.FC<ReorderBannerProps> = ({
  onOpenRestockModal,
  onFilterLowStock,
  isFilterActive
}) => {
  const { inventory } = useERP();
  const summary = getROPSummary(inventory);

  if (summary.totalAlerts === 0) {
    return (
      <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Status Reorder Point (ROP): Semua Bahan Baku Aman</h4>
            <p className="text-slate-400 mt-0.5">
              Stok tepung terigu, tang mien, ragi Saf-Instant, dan seluruh varian isian bakpao di atas ambang batas kritis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-4.5 sm:p-5 border transition-all shadow-lg ${
      summary.criticalCount > 0 
        ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border-rose-800/60' 
        : 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border-amber-800/60'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
            summary.criticalCount > 0 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' 
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
          }`}>
            {summary.criticalCount > 0 ? <AlertCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                summary.criticalCount > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              }`}>
                {summary.criticalCount > 0 ? '🚨 ALARM STOK KRITIS AKTIF' : '⚠️ PERINGATAN REORDER POINT (ROP)'}
              </span>
              <span className="text-xs text-slate-400">
                Pabrik Bakpao Mini • {summary.totalAlerts} Bahan Baku Butuh Restok
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
              Bahan Baku Utama Mencapai Ambang Batas Minimum Pemesanan
            </h3>

            {/* Quick Status Chips */}
            <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
              {/* Tepung */}
              <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                summary.tepungAlerts.some(a => a.alertLevel === 'CRITICAL')
                  ? 'bg-rose-950/60 border-rose-700/60 text-rose-300 font-bold'
                  : summary.tepungAlerts.length > 0
                    ? 'bg-amber-950/50 border-amber-700/60 text-amber-300 font-medium'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <span>🍞 Tepung:</span>
                <span>
                  {summary.tepungAlerts.length > 0 
                    ? `${summary.tepungAlerts.length} Butuh Order (${summary.tepungAlerts.map(a => `${a.item.stockQuantity}${a.item.unit}`).join(', ')})` 
                    : 'Aman'}
                </span>
              </div>

              {/* Ragi */}
              <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                summary.ragiAlerts.some(a => a.alertLevel === 'CRITICAL')
                  ? 'bg-rose-950/60 border-rose-700/60 text-rose-300 font-bold animate-pulse'
                  : summary.ragiAlerts.length > 0
                    ? 'bg-amber-950/50 border-amber-700/60 text-amber-300 font-medium'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <span>🧪 Ragi Saf-Instant:</span>
                <span>
                  {summary.ragiAlerts.length > 0 
                    ? `${summary.ragiAlerts.map(a => `${a.item.stockQuantity} ${a.item.unit} (Min ${a.item.minSafetyStock} ${a.item.unit})`).join(', ')}` 
                    : 'Aman'}
                </span>
              </div>

              {/* Isian */}
              <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                summary.isianAlerts.some(a => a.alertLevel === 'CRITICAL')
                  ? 'bg-rose-950/60 border-rose-700/60 text-rose-300 font-bold'
                  : summary.isianAlerts.length > 0
                    ? 'bg-amber-950/50 border-amber-700/60 text-amber-300 font-medium'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <span>🥟 Isian (Filling):</span>
                <span>
                  {summary.isianAlerts.length > 0 
                    ? `${summary.isianAlerts.length} Varian (${summary.isianAlerts.map(a => a.item.name.split(' ')[0] + ' ' + (a.item.name.split(' ')[1] || '')).join(', ')})` 
                    : 'Aman'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={onFilterLowStock}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isFilterActive 
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' 
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            {isFilterActive ? '✓ Menampilkan Bahan Kritis' : 'Filter Hanya ROP / Kritis'}
          </button>

          <button
            onClick={() => onOpenRestockModal(summary.alerts[0]?.item)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all cursor-pointer active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>⚡ Buat PO Restok Kilat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

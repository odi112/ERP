import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  X, 
  ShoppingCart, 
  ArrowRight, 
  Boxes, 
  TrendingDown, 
  Sparkles, 
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Play
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { calculateReorderPointAlerts, getROPSummary } from '../../utils/reorderAlerts';
import { InventoryItem, BakpaoMaterialType } from '../../types/erp';

interface ReorderNotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRestockModal: (item: InventoryItem) => void;
  onNavigateToWarehouse: (sku?: string) => void;
}

export const ReorderNotificationDropdown: React.FC<ReorderNotificationDropdownProps> = ({
  isOpen,
  onClose,
  onOpenRestockModal,
  onNavigateToWarehouse
}) => {
  const { inventory, quickRestockItem, simulateConsumptionROP } = useERP();
  const [filterTab, setFilterTab] = useState<'ALL' | 'TEPUNG' | 'RAGI' | 'ISIAN' | 'CRITICAL'>('ALL');

  if (!isOpen) return null;

  const summary = getROPSummary(inventory);
  const allAlerts = summary.alerts;

  const filteredAlerts = allAlerts.filter(a => {
    if (filterTab === 'CRITICAL') return a.alertLevel === 'CRITICAL';
    if (filterTab === 'TEPUNG') return a.materialType === 'TEPUNG';
    if (filterTab === 'RAGI') return a.materialType === 'RAGI';
    if (filterTab === 'ISIAN') return a.materialType === 'ISIAN';
    return true;
  });

  const handleBulkRestockCritical = () => {
    const criticalList = allAlerts.filter(a => a.alertLevel === 'CRITICAL');
    if (criticalList.length === 0) return;

    criticalList.forEach(a => {
      quickRestockItem(
        a.item.sku, 
        a.recommendedOrderQty, 
        'Supplier Resmi Bahan Pangan Pabrik',
        `PO-BULK-${Date.now().toString().slice(-5)}`,
        'Restok darurat massal untuk memulihkan seluruh bahan baku kritis bakpao mini.'
      );
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs"
        onClick={onClose} 
      />

      {/* Floating Panel / Drawer */}
      <div className="fixed top-16 right-2 sm:right-6 w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Pusat Peringatan Reorder Point (ROP)</h3>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full">
                  Bakpao Mini
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Monitoring otomatis tepung, ragi, isian & bahan baku kritis
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Highlights Bar */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              {summary.criticalCount} Level Kritis
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              {summary.warningCount} Perlu Reorder
            </span>
          </div>

          {summary.criticalCount > 0 && (
            <button
              onClick={handleBulkRestockCritical}
              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
            >
              <ShoppingCart className="w-3 h-3" />
              Restok Semua Kritis
            </button>
          )}
        </div>

        {/* Filter Sub-Tabs */}
        <div className="px-3 pt-2.5 pb-1 flex items-center gap-1 overflow-x-auto text-xs border-b border-slate-800/70 scrollbar-none">
          {[
            { id: 'ALL' as const, label: `Semua (${summary.totalAlerts})` },
            { id: 'CRITICAL' as const, label: `🚨 Kritis (${summary.criticalCount})` },
            { id: 'TEPUNG' as const, label: `Tepung (${summary.tepungAlerts.length})` },
            { id: 'RAGI' as const, label: `Ragi (${summary.ragiAlerts.length})` },
            { id: 'ISIAN' as const, label: `Isian (${summary.isianAlerts.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-all ${
                filterTab === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">
                Semua Bahan Baku Dalam Kondisi Aman!
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Tidak ada bahan baku yang berada di bawah Reorder Point atau Safety Stock untuk filter yang dipilih.
              </p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isCritical = alert.alertLevel === 'CRITICAL';
              const progressPct = Math.min(
                100, 
                Math.max(5, (alert.stockQuantity / (alert.reorderLevel * 2)) * 100)
              );

              return (
                <div
                  key={alert.item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCritical 
                      ? 'bg-rose-950/20 border-rose-800/50 hover:border-rose-500' 
                      : 'bg-amber-950/20 border-amber-800/50 hover:border-amber-500'
                  }`}
                >
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full border ${
                          isCritical 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {isCritical ? '🚨 KRITIS (Di Bawah Safety)' : '⚠️ REORDER POINT (ROP)'}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-300">
                          {alert.materialTypeLabel}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug">
                        {alert.item.name}
                      </h4>
                      <span className="font-mono text-[10px] text-slate-400">
                        SKU: {alert.item.sku} • Lokasi: {alert.item.binLocation}
                      </span>
                    </div>

                    {/* Stock Quantity Display */}
                    <div className="text-right shrink-0">
                      <div className={`text-base font-extrabold font-mono ${
                        isCritical ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {alert.stockQuantity} {alert.item.unit}
                      </div>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        ROP: {alert.reorderLevel} {alert.item.unit}
                      </span>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Safety Stock: <strong className="text-rose-400">{alert.minSafetyStock} {alert.item.unit}</strong></span>
                      <span>Estimasi Sisa: <strong className="text-white">{alert.estimatedDaysRemaining} hari produksi</strong></span>
                    </div>

                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex relative">
                      <div 
                        className={`h-full transition-all duration-300 ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Message & Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-300 font-medium">
                      Rekomendasi Order: <strong className="text-emerald-400 font-mono">+{alert.recommendedOrderQty} {alert.item.unit}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToWarehouse(alert.item.sku);
                        }}
                        className="px-2 py-1 text-[10px] font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Buka di Database Gudang"
                      >
                        Buka Gudang
                      </button>

                      <button
                        onClick={() => {
                          onOpenRestockModal(alert.item);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-[10px] font-bold shadow-md shadow-emerald-900/30 transition-all cursor-pointer active:scale-95"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        ⚡ Restok / Buat PO
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Simulation Controls (Great for testing the system) */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[10px] text-slate-400">Simulasi Trigger ROP:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => simulateConsumptionROP('RAGI')}
              className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 cursor-pointer"
              title="Kurangi stok Ragi Instan untuk memicu notifikasi kritis"
            >
              Test Ragi
            </button>
            <button
              onClick={() => simulateConsumptionROP('TEPUNG')}
              className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700 cursor-pointer"
              title="Kurangi stok Tepung Terigu untuk memicu peringatan ROP"
            >
              Test Tepung
            </button>
            <button
              onClick={() => simulateConsumptionROP('ISIAN')}
              className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-rose-300 rounded border border-slate-700 cursor-pointer"
              title="Kurangi stok Isian untuk memicu notifikasi kritis"
            >
              Test Isian
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

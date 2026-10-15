import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  AlertCircle, 
  ShoppingCart, 
  CheckCircle2, 
  Building2, 
  Truck, 
  FileText, 
  ShieldAlert,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { InventoryItem } from '../../types/erp';
import { useERP } from '../../context/ERPContext';
import { classifyBakpaoMaterial, getROPAlertLevel } from '../../utils/reorderAlerts';

interface ReorderAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem?: InventoryItem | null;
}

export const ReorderAlertModal: React.FC<ReorderAlertModalProps> = ({
  isOpen,
  onClose,
  targetItem
}) => {
  const { inventory, locations, quickRestockItem } = useERP();

  const [selectedSku, setSelectedSku] = useState<string>(targetItem?.sku || '');
  const [orderQuantity, setOrderQuantity] = useState<number>(100);
  const [supplierName, setSupplierName] = useState<string>('');
  const [poNumber, setPoNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const currentItem = inventory.find(i => i.sku === selectedSku) || targetItem || inventory[0];

  useEffect(() => {
    if (targetItem) {
      setSelectedSku(targetItem.sku);
    } else if (inventory.length > 0 && !selectedSku) {
      setSelectedSku(inventory[0].sku);
    }
  }, [targetItem, inventory]);

  useEffect(() => {
    if (currentItem) {
      const { type } = classifyBakpaoMaterial(currentItem);
      // Auto calculate optimal recommended reorder quantity
      let recQty = Math.max(currentItem.reorderLevel * 2 - currentItem.stockQuantity, currentItem.reorderLevel);
      if (currentItem.unit === 'kg') {
        if (type === 'TEPUNG') recQty = Math.ceil(recQty / 25) * 25;
        else if (type === 'RAGI') recQty = Math.ceil(recQty / 5) * 5;
        else recQty = Math.ceil(recQty / 10) * 10;
      }
      setOrderQuantity(Math.max(1, recQty));

      // Auto assign default supplier based on material type
      if (type === 'TEPUNG') {
        setSupplierName('PT Sriboga Raturaya / Bogasari Flour Mills');
      } else if (type === 'RAGI') {
        setSupplierName('PT Saf Indonusa (Saf-Instant Distributor)');
      } else if (type === 'ISIAN') {
        if (currentItem.name.toLowerCase().includes('ayam')) {
          setSupplierName('Supplier Unggas Prima Segar Cold Chain');
        } else if (currentItem.name.toLowerCase().includes('cokelat')) {
          setSupplierName('PT Barry Callebaut / Colatta Bakery Supply');
        } else {
          setSupplierName('Mitra Pangan Nusantara (Bakery Filling Supply)');
        }
      } else {
        setSupplierName('PT Mitra Distribusi Pangan Utama');
      }

      setPoNumber(`PO-ROP-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`);
      setNotes(`Penerbitan PO darurat/reorder point untuk bahan baku produksi bakpao mini.`);
    }
  }, [selectedSku, currentItem?.id]);

  if (!isOpen || !currentItem) return null;

  const alertLevel = getROPAlertLevel(currentItem);
  const { type: materialType, label: materialTypeLabel } = classifyBakpaoMaterial(currentItem);
  const locationObj = locations.find(l => l.id === currentItem.locationId);

  const deficitSafety = Math.max(0, currentItem.minSafetyStock - currentItem.stockQuantity);
  const deficitReorder = Math.max(0, currentItem.reorderLevel - currentItem.stockQuantity);
  const estimatedCost = orderQuantity * currentItem.unitCost;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderQuantity <= 0) return;

    quickRestockItem(currentItem.sku, Number(orderQuantity), supplierName, poNumber, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          alertLevel === 'CRITICAL' 
            ? 'bg-rose-950/30 border-rose-800/40' 
            : 'bg-amber-950/30 border-amber-800/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              alertLevel === 'CRITICAL' 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {alertLevel === 'CRITICAL' ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {materialTypeLabel}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                  alertLevel === 'CRITICAL' 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {alertLevel === 'CRITICAL' ? '🚨 STOK KRITIS (Di Bawah Min Safety)' : '⚠️ MENCAPAI REORDER POINT'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Restok Kilat / Purchase Order (ROP)
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Material Selector & Current Status Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Pilih Bahan Baku Bakpao Mini:
                </label>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <optgroup label="Tepung Terigu & Pati (Bahan Kulit)">
                    {inventory.filter(i => classifyBakpaoMaterial(i).type === 'TEPUNG').map(item => (
                      <option key={item.id} value={item.sku}>
                        {item.name} ({item.stockQuantity} {item.unit}) - {getROPAlertLevel(item)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Ragi Instan (Yeast)">
                    {inventory.filter(i => classifyBakpaoMaterial(i).type === 'RAGI').map(item => (
                      <option key={item.id} value={item.sku}>
                        {item.name} ({item.stockQuantity} {item.unit}) - {getROPAlertLevel(item)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Bahan Isian (Filling)">
                    {inventory.filter(i => classifyBakpaoMaterial(i).type === 'ISIAN').map(item => (
                      <option key={item.id} value={item.sku}>
                        {item.name} ({item.stockQuantity} {item.unit}) - {getROPAlertLevel(item)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Bahan Pengembang & Bumbu">
                    {inventory.filter(i => classifyBakpaoMaterial(i).type === 'BUMBU_PENGEMBANG').map(item => (
                      <option key={item.id} value={item.sku}>
                        {item.name} ({item.stockQuantity} {item.unit}) - {getROPAlertLevel(item)}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="sm:text-right">
                <span className="text-[11px] text-slate-400 block">Kode SKU:</span>
                <span className="font-mono text-sm font-bold text-indigo-300">{currentItem.sku}</span>
              </div>
            </div>

            {/* Visual Inventory Level Bar */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-400">Level Stok Saat Ini vs Ambang Batas:</span>
                <span className={`font-mono font-bold ${alertLevel === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {currentItem.stockQuantity} {currentItem.unit}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex relative">
                {/* Min Safety threshold mark */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                  style={{ left: `${Math.min(100, (currentItem.minSafetyStock / (currentItem.reorderLevel * 2)) * 100)}%` }}
                  title={`Safety Stock: ${currentItem.minSafetyStock}`}
                />
                {/* Reorder Level threshold mark */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                  style={{ left: `${Math.min(100, (currentItem.reorderLevel / (currentItem.reorderLevel * 2)) * 100)}%` }}
                  title={`Reorder Point: ${currentItem.reorderLevel}`}
                />

                <div 
                  className={`h-full transition-all duration-500 ${
                    alertLevel === 'CRITICAL' 
                      ? 'bg-rose-500' 
                      : alertLevel === 'WARNING' 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, (currentItem.stockQuantity / (currentItem.reorderLevel * 2)) * 100))}%` }}
                />
              </div>

              {/* Threshold Labels */}
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span className="text-rose-400">Min Safety: {currentItem.minSafetyStock} {currentItem.unit}</span>
                <span className="text-amber-400">Reorder Point: {currentItem.reorderLevel} {currentItem.unit}</span>
                <span className="text-slate-500">Target Ideal: {currentItem.reorderLevel * 2} {currentItem.unit}</span>
              </div>
            </div>

            {/* Alert Summary Box */}
            <div className={`p-2.5 rounded-lg text-xs flex items-center justify-between ${
              alertLevel === 'CRITICAL' 
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300' 
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 shrink-0" />
                <span>
                  {alertLevel === 'CRITICAL' 
                    ? `Defisit ${deficitSafety} ${currentItem.unit} di bawah Safety Stock minimum!` 
                    : `Defisit ${deficitReorder} ${currentItem.unit} terhadap batas Reorder Point.`}
                </span>
              </div>
              <span className="font-semibold text-white">
                Lokasi: {locationObj?.code || currentItem.locationId} ({currentItem.binLocation})
              </span>
            </div>
          </div>

          {/* Form Reorder Input */}
          <form onSubmit={handleConfirmRestock} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Jumlah Pemesanan Restok ({currentItem.unit}):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">
                    {currentItem.unit}
                  </span>
                </div>
                <p className="text-[10px] text-indigo-400 mt-1">
                  Rekomendasi otomatis agar stok kembali optimal di atas ROP.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Nomor Referensi Purchase Order (PO):
                </label>
                <input
                  type="text"
                  required
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Pemasok / Supplier:
                </label>
                <div className="relative">
                  <Truck className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Gudang Penerima:
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    disabled
                    value={`${locationObj?.name || currentItem.locationId} (${currentItem.binLocation})`}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-slate-400 text-xs cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Catatan Penerimaan / Instruksi Batch:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Cek sertifikat halal & tanggal kedaluwarsa minimal 12 bulan..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Estimated Total PO Calculation */}
            <div className="bg-slate-950 border border-indigo-900/40 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Estimasi Nilai Pengadaan PO:</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {formatIDR(estimatedCost)}
                </span>
                <span className="text-[10px] text-slate-500 ml-2">
                  (@ {formatIDR(currentItem.unitCost)} / {currentItem.unit})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Stok Setelah Restok:</span>
                <span className="text-sm font-bold text-white font-mono">
                  {currentItem.stockQuantity + Number(orderQuantity)} {currentItem.unit}
                </span>
                <span className="text-[10px] text-emerald-400 block">✅ Status Aman</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                Kirim PO & Terima Stok (Instant Inbound)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

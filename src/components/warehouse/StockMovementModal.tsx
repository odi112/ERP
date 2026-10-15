import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, RefreshCw, Layers } from 'lucide-react';
import { MovementType } from '../../types/erp';
import { useERP } from '../../context/ERPContext';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedSku?: string;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({ 
  isOpen, 
  onClose,
  preselectedSku 
}) => {
  const { inventory, recordStockMovement, locations } = useERP();

  const [sku, setSku] = useState(preselectedSku || (inventory[0]?.sku || ''));
  const [type, setType] = useState<MovementType>('INBOUND_RECEIPT');
  const [quantity, setQuantity] = useState<number>(10);
  const [fromLocation, setFromLocation] = useState('Supplier Vendor');
  const [toLocation, setToLocation] = useState(locations[0]?.code || 'WH-RAW-01');
  const [referenceDoc, setReferenceDoc] = useState(`PO-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [operatorName, setOperatorName] = useState('Budi Santoso');
  const [notes, setNotes] = useState('Penerimaan rutin pasokan bahan');

  React.useEffect(() => {
    if (preselectedSku) {
      setSku(preselectedSku);
    } else if (inventory.length > 0 && !sku) {
      setSku(inventory[0].sku);
    }
  }, [preselectedSku, inventory]);

  const selectedItem = inventory.find(i => i.sku === sku);

  // Auto configure default locations and references when type changes
  const handleTypeChange = (newType: MovementType) => {
    setType(newType);
    if (newType === 'INBOUND_RECEIPT') {
      setFromLocation('Vendor Supplier');
      setToLocation(locations[0]?.code || 'WH-RAW-01');
      setReferenceDoc(`PO-2026-${Math.floor(100 + Math.random() * 900)}`);
      setNotes('Penerimaan barang dari supplier (Good Receipt Note)');
    } else if (newType === 'OUTBOUND_DISPATCH') {
      setFromLocation(locations.find(l => l.type === 'FINISHED_GOODS')?.code || 'WH-FG-01');
      setToLocation('Ekspedisi / Pelanggan');
      setReferenceDoc(`DO-2026-${Math.floor(100 + Math.random() * 900)}`);
      setNotes('Pengiriman surat jalan ke customer');
    } else if (newType === 'INTERNAL_TRANSFER') {
      setFromLocation('WH-RAW-01');
      setToLocation('WH-WIP-01');
      setReferenceDoc(`TRF-2026-${Math.floor(100 + Math.random() * 900)}`);
      setNotes('Mutasi internal buffer lini produksi');
    } else if (newType === 'STOCK_ADJUSTMENT') {
      setFromLocation('Warehouse Floor');
      setToLocation('Warehouse Floor');
      setReferenceDoc(`AUDIT-${new Date().toISOString().slice(0, 10)}`);
      setNotes('Penyesuaian hasil audit stock opname fisik');
      if (selectedItem) setQuantity(selectedItem.stockQuantity);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || quantity <= 0) return;

    const ok = recordStockMovement({
      type,
      sku: selectedItem.sku,
      itemName: selectedItem.name,
      quantity: Number(quantity),
      unit: selectedItem.unit,
      fromLocation,
      toLocation,
      referenceDoc,
      operatorName,
      notes
    });

    if (ok) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Catat Mutasi & Pergerakan Stok
            </h2>
            <p className="text-xs text-slate-400">
              Transaksi fisik barang masuk, keluar, transfer antar gudang, atau stock opname
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Movement Type Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Jenis Transaksi *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'INBOUND_RECEIPT', label: 'Inbound (Masuk)', icon: ArrowDownRight, color: 'text-emerald-400' },
                { id: 'OUTBOUND_DISPATCH', label: 'Outbound (Keluar)', icon: ArrowUpRight, color: 'text-rose-400' },
                { id: 'INTERNAL_TRANSFER', label: 'Transfer Lokasi', icon: RefreshCw, color: 'text-indigo-400' },
                { id: 'STOCK_ADJUSTMENT', label: 'Stock Opname', icon: Layers, color: 'text-amber-400' },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = type === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => handleTypeChange(m.id as MovementType)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${m.color}`} />
                    <span className="text-[11px] leading-tight">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SKU selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Pilih Barang (SKU) *</label>
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            >
              {inventory.map((item) => (
                <option key={item.id} value={item.sku}>
                  [{item.sku}] {item.name} — Stok saat ini: {item.stockQuantity} {item.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Item details snapshot */}
          {selectedItem && (
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Stok Saat Ini:</span>
                <div className="text-sm font-bold text-white font-mono">
                  {selectedItem.stockQuantity} {selectedItem.unit}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Safety Stock:</span>
                <div className="text-sm font-semibold text-slate-300 font-mono">
                  {selectedItem.minSafetyStock} {selectedItem.unit}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Lokasi Rak:</span>
                <div className="text-sm font-semibold text-indigo-400 font-mono">
                  {selectedItem.binLocation}
                </div>
              </div>
            </div>
          )}

          {/* Quantity and Ref doc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {type === 'STOCK_ADJUSTMENT' ? 'Jumlah Stok Fisik Riil (Hasil Opname)' : 'Jumlah Mutasi (Qty) *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-slate-500 font-mono">
                  {selectedItem?.unit || 'pcs'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nomor Dokumen Referensi *</label>
              <input
                type="text"
                required
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                placeholder="Contoh: PO-2026-001, DO-002"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* From and To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Dari Lokasi / Asal *</label>
              <input
                type="text"
                required
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ke Lokasi / Tujuan *</label>
              <input
                type="text"
                required
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Petugas / Operator Pelaksana *</label>
              <input
                type="text"
                required
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Catatan Keterangan</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              Eksekusi Mutasi Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

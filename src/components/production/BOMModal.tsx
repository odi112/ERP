import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Layers } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { BOMComponent } from '../../types/erp';

interface BOMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BOMModal: React.FC<BOMModalProps> = ({ isOpen, onClose }) => {
  const { inventory, addBOM } = useERP();

  const [productSku, setProductSku] = useState('');
  const [productName, setProductName] = useState('');
  const [version, setVersion] = useState('Rev 1.0');
  const [estimatedLaborHours, setEstimatedLaborHours] = useState(1.5);
  const [notes, setNotes] = useState('Resep perakitan standar lini manufaktur.');

  // Components list
  const [components, setComponents] = useState<BOMComponent[]>([
    {
      componentSku: inventory[0]?.sku || 'RAW-ALU-6061',
      componentName: inventory[0]?.name || 'Aluminum Alloy',
      quantityNeeded: 2,
      unit: inventory[0]?.unit || 'kg',
      unitCost: inventory[0]?.unitCost || 65000
    }
  ]);

  if (!isOpen) return null;

  const handleAddComponent = () => {
    const defaultItem = inventory[0];
    setComponents([
      ...components,
      {
        componentSku: defaultItem?.sku || '',
        componentName: defaultItem?.name || '',
        quantityNeeded: 1,
        unit: defaultItem?.unit || 'pcs',
        unitCost: defaultItem?.unitCost || 0
      }
    ]);
  };

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleComponentChange = (index: number, sku: string) => {
    const item = inventory.find(i => i.sku === sku);
    if (!item) return;

    const updated = [...components];
    updated[index] = {
      ...updated[index],
      componentSku: item.sku,
      componentName: item.name,
      unit: item.unit,
      unitCost: item.unitCost
    };
    setComponents(updated);
  };

  const handleQtyChange = (index: number, qty: number) => {
    const updated = [...components];
    updated[index].quantityNeeded = qty;
    setComponents(updated);
  };

  const totalMaterialCost = components.reduce((acc, c) => acc + (c.quantityNeeded * c.unitCost), 0);
  const laborCost = estimatedLaborHours * 75000; // IDR 75k per labor hour
  const standardCost = totalMaterialCost + laborCost;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productSku || !productName || components.length === 0) return;

    addBOM({
      productSku,
      productName,
      version,
      components,
      estimatedLaborHours,
      standardProductionCost: standardCost,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Buat Bill of Materials (BOM) Baru
            </h2>
            <p className="text-xs text-slate-400">
              Master resep komponen perakitan produk manufaktur
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">SKU Barang Jadi (FG) *</label>
              <input
                type="text"
                required
                value={productSku}
                onChange={(e) => setProductSku(e.target.value.toUpperCase())}
                placeholder="Contoh: FG-MOTOR-48V"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Nama Produk / Rakitan *</label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Contoh: ApexPower High Efficiency Inverter Module"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Revisi / Versi BOM</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Rev 1.0"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Estimasi Jam Kerja (Labor Hours)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={estimatedLaborHours}
                onChange={(e) => setEstimatedLaborHours(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Component items */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 font-semibold">
                Daftar Bahan Baku & Komponen Penyusun (BOM Items) *
              </label>
              <button
                type="button"
                onClick={handleAddComponent}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Komponen
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {components.map((comp, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <select
                      value={comp.componentSku}
                      onChange={(e) => handleComponentChange(idx, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
                    >
                      {inventory.map(item => (
                        <option key={item.id} value={item.sku}>
                          [{item.sku}] {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      step="0.1"
                      min="0.01"
                      value={comp.quantityNeeded}
                      onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-xs text-right focus:outline-none"
                    />
                  </div>

                  <span className="w-12 text-slate-400 font-mono text-[11px]">
                    {comp.unit}
                  </span>

                  <span className="w-24 font-mono text-slate-300 text-right text-[11px]">
                    {formatIDR(comp.quantityNeeded * comp.unitCost)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveComponent(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cost estimation banner */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Kalkulasi Biaya Standar per Unit:</span>
              <span className="text-[11px] text-slate-500">Material ({formatIDR(totalMaterialCost)}) + Tenaga Kerja ({formatIDR(laborCost)})</span>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {formatIDR(standardCost)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Catatan Proses Manufaktur</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
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
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Master BOM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

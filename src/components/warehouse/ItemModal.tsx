import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../../types/erp';
import { useERP } from '../../context/ERPContext';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: InventoryItem | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, editItem }) => {
  const { addInventoryItem, updateInventoryItem, locations } = useERP();

  const [sku, setSku] = useState(editItem?.sku || '');
  const [name, setName] = useState(editItem?.name || '');
  const [category, setCategory] = useState<InventoryItem['category']>(editItem?.category || 'Raw Material');
  const [unit, setUnit] = useState<InventoryItem['unit']>(editItem?.unit || 'pcs');
  const [stockQuantity, setStockQuantity] = useState(editItem?.stockQuantity || 0);
  const [minSafetyStock, setMinSafetyStock] = useState(editItem?.minSafetyStock || 100);
  const [reorderLevel, setReorderLevel] = useState(editItem?.reorderLevel || 150);
  const [unitCost, setUnitCost] = useState(editItem?.unitCost || 50000);
  const [sellingPrice, setSellingPrice] = useState(editItem?.sellingPrice || 0);
  const [locationId, setLocationId] = useState(editItem?.locationId || locations[0]?.id || 'LOC-RAW-01');
  const [binLocation, setBinLocation] = useState(editItem?.binLocation || 'A-01-RACK-01');
  const [batchNumber, setBatchNumber] = useState(editItem?.batchNumber || `BATCH-${new Date().getFullYear()}-01`);
  const [barcode, setBarcode] = useState(editItem?.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`);

  React.useEffect(() => {
    if (editItem) {
      setSku(editItem.sku);
      setName(editItem.name);
      setCategory(editItem.category);
      setUnit(editItem.unit);
      setStockQuantity(editItem.stockQuantity);
      setMinSafetyStock(editItem.minSafetyStock);
      setReorderLevel(editItem.reorderLevel);
      setUnitCost(editItem.unitCost);
      setSellingPrice(editItem.sellingPrice);
      setLocationId(editItem.locationId);
      setBinLocation(editItem.binLocation);
      setBatchNumber(editItem.batchNumber);
      setBarcode(editItem.barcode);
    } else {
      setSku(`SKU-${Date.now().toString().slice(-6)}`);
      setName('');
      setCategory('Raw Material');
      setStockQuantity(100);
      setMinSafetyStock(50);
      setReorderLevel(80);
      setUnitCost(25000);
      setSellingPrice(0);
      setBinLocation('A-01-RACK-01');
      setBatchNumber(`BATCH-26-${Math.floor(100 + Math.random() * 900)}`);
      setBarcode(`${Math.floor(100000000000 + Math.random() * 900000000000)}`);
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) return;

    if (editItem) {
      updateInventoryItem(editItem.id, {
        sku,
        name,
        category,
        unit,
        stockQuantity: Number(stockQuantity),
        minSafetyStock: Number(minSafetyStock),
        reorderLevel: Number(reorderLevel),
        unitCost: Number(unitCost),
        sellingPrice: Number(sellingPrice),
        locationId,
        binLocation,
        batchNumber,
        barcode
      });
    } else {
      addInventoryItem({
        sku,
        name,
        category,
        unit,
        stockQuantity: Number(stockQuantity),
        minSafetyStock: Number(minSafetyStock),
        reorderLevel: Number(reorderLevel),
        unitCost: Number(unitCost),
        sellingPrice: Number(sellingPrice),
        locationId,
        binLocation,
        batchNumber,
        barcode
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editItem ? 'Edit Data Barang (SKU)' : 'Pendaftaran SKU & Barang Baru'}
            </h2>
            <p className="text-xs text-slate-400">
              Sistem database master inventaris gudang pabrik
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kode SKU *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="Contoh: RAW-ALU-01"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kategori Barang *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Bahan Baku Tepung">Bahan Baku Tepung (Flour)</option>
                <option value="Bahan Isian (Filling)">Bahan Isian (Filling / Pasta)</option>
                <option value="Bahan Pengembang & Bumbu">Bahan Pengembang & Bumbu</option>
                <option value="Sub-Assembly Adonan">Sub-Assembly Adonan (WIP)</option>
                <option value="Finished Good">Finished Good (Bakpao Frozen)</option>
                <option value="Packaging & Kemasan">Packaging & Kemasan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nama Barang / Deskripsi Lengkap *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Tepung Terigu Khusus Bakpao 25kg"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Satuan Ukur (UOM)</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="gram">Gram (g)</option>
                <option value="pack">Pack / Bungkus</option>
                <option value="lembar">Lembar (Kertas Alas)</option>
                <option value="box">Box / Karton</option>
                <option value="sak">Sak (25kg)</option>
                <option value="pcs">Pcs (Satuan)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stok Awal Fisik</label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Safety Stock Min.</label>
              <input
                type="number"
                min="0"
                value={minSafetyStock}
                onChange={(e) => setMinSafetyStock(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Biaya Pokok Satuan (HPP/Cost) Rp</label>
              <input
                type="number"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Harga Jual Satuan (Jika FG) Rp</label>
              <input
                type="number"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Gudang Penyimpanan</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.code} - {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Posisi Rak / Bin Location</label>
              <input
                type="text"
                value={binLocation}
                onChange={(e) => setBinLocation(e.target.value)}
                placeholder="Misal: A-04-RACK-02"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nomor Barcode / EAN</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Batch / Lot Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-2 text-slate-400">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Setiap penambahan atau pengubahan barang akan otomatis tersinkronisasi ke modul Program Produksi (BOM) dan kalkulasi nilai aset pabrik.</span>
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
              {editItem ? 'Simpan Perubahan' : 'Daftarkan Barang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

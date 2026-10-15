import React, { useState } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  Plus, 
  ArrowDownRight, 
  ArrowUpRight, 
  RefreshCw, 
  AlertTriangle, 
  Download, 
  Barcode, 
  Edit3, 
  Trash2, 
  Building2, 
  MapPin, 
  Layers,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { InventoryItem, MovementType } from '../../types/erp';
import { ItemModal } from './ItemModal';
import { StockMovementModal } from './StockMovementModal';
import { BarcodeModal } from './BarcodeModal';

export const WarehouseView: React.FC = () => {
  const { 
    inventory, 
    locations, 
    movements, 
    deleteInventoryItem 
  } = useERP();

  const [subTab, setSubTab] = useState<'inventory' | 'movements' | 'locations'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [preselectedSku, setPreselectedSku] = useState<string | undefined>(undefined);
  const [barcodeItem, setBarcodeItem] = useState<InventoryItem | null>(null);

  // Filtering inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.binLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm);
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesLocation = locationFilter === 'ALL' || item.locationId === locationFilter;
    const matchesLowStock = !lowStockOnly || item.stockQuantity <= item.minSafetyStock;

    return matchesSearch && matchesCategory && matchesLocation && matchesLowStock;
  });

  // Filter movements
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('ALL');
  const filteredMovements = movements.filter(m => {
    const matchesSearch = 
      m.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.referenceDoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.operatorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = movementTypeFilter === 'ALL' || m.type === movementTypeFilter;
    return matchesSearch && matchesType;
  });

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleExportCSV = () => {
    const headers = ['SKU', 'Nama Barang', 'Kategori', 'Satuan', 'Stok Aktual', 'Safety Stock', 'Reorder Level', 'HPP (Cost)', 'Lokasi Gudang', 'Bin Rak', 'Barcode', 'Batch'];
    const rows = filteredInventory.map(i => [
      `"${i.sku}"`,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.category}"`,
      `"${i.unit}"`,
      i.stockQuantity,
      i.minSafetyStock,
      i.reorderLevel,
      i.unitCost,
      `"${locations.find(l => l.id === i.locationId)?.code || i.locationId}"`,
      `"${i.binLocation}"`,
      `"${i.barcode}"`,
      `"${i.batchNumber}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ApexERP_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Boxes className="w-4 h-4" />
            Modul Manajemen Gudang & Inventaris
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Database Inventaris & Pergudangan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Pusat master data SKU, pencatatan mutasi fisik, kontrol safety stock, dan multi-lokasi rak.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Tambah SKU Baru
          </button>

          <button
            onClick={() => {
              setPreselectedSku(undefined);
              setIsMovementModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95"
          >
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            Catat Mutasi Stok
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sub navigation tabs */}
      <div className="flex items-center border-b border-slate-800 space-x-1 text-xs sm:text-sm font-medium">
        <button
          onClick={() => setSubTab('inventory')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            subTab === 'inventory'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Katalog Stok ({inventory.length} SKU)
        </button>

        <button
          onClick={() => setSubTab('movements')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            subTab === 'movements'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Buku Besar Mutasi ({movements.length} Log)
        </button>

        <button
          onClick={() => setSubTab('locations')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            subTab === 'locations'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Lokasi & Gudang Fisik ({locations.length})
        </button>
      </div>

      {/* SUB-TAB 1: INVENTORY CATALOG */}
      {subTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari SKU, nama barang, kode barcode, atau rak bin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Bahan Baku Tepung">Bahan Baku Tepung</option>
                <option value="Bahan Isian (Filling)">Bahan Isian (Filling / Pasta)</option>
                <option value="Bahan Pengembang & Bumbu">Bahan Pengembang & Bumbu</option>
                <option value="Sub-Assembly Adonan">Sub-Assembly Adonan</option>
                <option value="Finished Good">Finished Good (Bakpao Frozen)</option>
                <option value="Packaging & Kemasan">Packaging & Kemasan</option>
              </select>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Lokasi Gudang</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.code}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setLowStockOnly(!lowStockOnly)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  lowStockOnly 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' 
                    : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Hanya Stok Kritis
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Kode SKU / Barcode</th>
                    <th className="py-3 px-4">Nama Barang & Kategori</th>
                    <th className="py-3 px-4">Lokasi Rak / Bin</th>
                    <th className="py-3 px-4 text-right">Stok Fisik</th>
                    <th className="py-3 px-4 text-right">Safety Stock</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">HPP (Cost)</th>
                    <th className="py-3 px-4 text-right">Total Nilai</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        Tidak ada barang yang cocok dengan filter atau kata kunci.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const isLow = item.stockQuantity <= item.minSafetyStock;
                      const isZero = item.stockQuantity === 0;
                      const totalVal = item.stockQuantity * item.unitCost;
                      const locCode = locations.find(l => l.id === item.locationId)?.code || item.locationId;

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-indigo-400">{item.sku}</div>
                            <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Barcode className="w-3 h-3 text-slate-400" />
                              {item.barcode}
                            </div>
                          </td>

                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-semibold text-white truncate" title={item.name}>
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                {item.category}
                              </span>
                              <span>Lot: {item.batchNumber}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-mono font-medium text-slate-200">{item.binLocation}</div>
                            <div className="text-[10px] text-slate-400">{locCode}</div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <span className="font-mono text-sm font-bold text-white">
                              {item.stockQuantity.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1 font-mono">
                              {item.unit}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-mono text-slate-400">
                            {item.minSafetyStock.toLocaleString()} {item.unit}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isZero 
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                                : isLow 
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' 
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {isZero ? 'Habis' : isLow ? 'Stok Kritis' : 'Optimal'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-mono text-slate-300">
                            {formatIDR(item.unitCost)}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                            {formatIDR(totalVal)}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Quick Movement */}
                              <button
                                onClick={() => {
                                  setPreselectedSku(item.sku);
                                  setIsMovementModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors cursor-pointer"
                                title="Catat Mutasi SKU Ini"
                              >
                                <ArrowDownRight className="w-3.5 h-3.5" />
                              </button>

                              {/* Print Barcode */}
                              <button
                                onClick={() => setBarcodeItem(item)}
                                className="p-1.5 hover:bg-slate-700 text-indigo-400 rounded-lg transition-colors cursor-pointer"
                                title="Cetak Label Barcode Rak"
                              >
                                <Barcode className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setIsItemModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                                title="Edit Data Barang"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus SKU ${item.sku} (${item.name})?`)) {
                                    deleteInventoryItem(item.id);
                                  }
                                }}
                                className="p-1.5 hover:bg-slate-700 text-rose-400 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Barang"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
              <div>
                Menampilkan <strong>{filteredInventory.length}</strong> dari <strong>{inventory.length}</strong> total SKU terdaftar.
              </div>
              <div className="font-mono text-slate-300">
                Total Aset Terfilter: <strong className="text-white">{formatIDR(filteredInventory.reduce((acc, c) => acc + (c.stockQuantity * c.unitCost), 0))}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STOCK MOVEMENTS LEDGER */}
      {subTab === 'movements' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nomor dokumen referensi, SKU, atau nama operator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Jenis Mutasi</option>
              <option value="INBOUND_RECEIPT">Inbound (Penerimaan Supplier)</option>
              <option value="OUTBOUND_DISPATCH">Outbound (Pengiriman Pelanggan)</option>
              <option value="INTERNAL_TRANSFER">Transfer Antar Gudang</option>
              <option value="PRODUCTION_ISSUE">Pengeluaran Bahan Baku ke SPK</option>
              <option value="PRODUCTION_RECEIPT">Penerimaan Barang Jadi Hasil Produksi</option>
              <option value="STOCK_ADJUSTMENT">Penyesuaian Fisik (Opname)</option>
            </select>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Waktu Transaksi</th>
                    <th className="py-3 px-4">Jenis Mutasi</th>
                    <th className="py-3 px-4">SKU & Barang</th>
                    <th className="py-3 px-4 text-right">Jumlah (Qty)</th>
                    <th className="py-3 px-4">Dari Lokasi</th>
                    <th className="py-3 px-4">Ke Lokasi</th>
                    <th className="py-3 px-4">No. Dokumen (PO/WO/DO)</th>
                    <th className="py-3 px-4">Petugas / Operator</th>
                    <th className="py-3 px-4">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        Belum ada mutasi stok yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((mov) => {
                      const isInflow = mov.type === 'INBOUND_RECEIPT' || mov.type === 'PRODUCTION_RECEIPT';
                      return (
                        <tr key={mov.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                            {mov.timestamp}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              mov.type === 'INBOUND_RECEIPT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              mov.type === 'PRODUCTION_RECEIPT' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                              mov.type === 'OUTBOUND_DISPATCH' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              mov.type === 'PRODUCTION_ISSUE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            }`}>
                              {mov.type}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-white">{mov.sku}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{mov.itemName}</div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <span className={`font-mono text-sm font-bold ${isInflow ? 'text-emerald-400' : 'text-blue-400'}`}>
                              {isInflow ? `+${mov.quantity}` : `-${mov.quantity}`}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1 font-mono">{mov.unit}</span>
                          </td>

                          <td className="py-3 px-4 text-slate-300">{mov.fromLocation}</td>
                          <td className="py-3 px-4 text-slate-300">{mov.toLocation}</td>

                          <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                            {mov.referenceDoc}
                          </td>

                          <td className="py-3 px-4 text-slate-300">{mov.operatorName}</td>
                          <td className="py-3 px-4 text-slate-400 text-[11px] max-w-[200px] truncate" title={mov.notes}>
                            {mov.notes}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WAREHOUSE PHYSICAL LOCATIONS */}
      {subTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => {
            const itemsInLoc = inventory.filter(i => i.locationId === loc.id);
            const totalQty = itemsInLoc.reduce((acc, curr) => acc + curr.stockQuantity, 0);
            const pct = Math.min(100, Math.round((loc.currentItemsCount / loc.capacity) * 100));

            return (
              <div key={loc.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-indigo-400">{loc.code}</div>
                      <h3 className="font-bold text-base text-white">{loc.name}</h3>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {loc.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400">Kepala Gudang:</span>
                    <div className="font-semibold text-slate-200 mt-0.5">{loc.manager}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Jumlah SKU Terdaftar:</span>
                    <div className="font-mono font-semibold text-slate-200 mt-0.5">{itemsInLoc.length} SKU</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Okupansi Penyimpanan:</span>
                    <span className="font-mono text-slate-200 font-semibold">{loc.currentItemsCount} / {loc.capacity} Unit ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct > 85 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Plant Complex Zone {loc.code.slice(-2)}
                  </span>
                  <button 
                    onClick={() => {
                      setLocationFilter(loc.id);
                      setSubTab('inventory');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    Lihat Isi Gudang →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        editItem={editingItem}
      />

      {/* Stock Movement Modal */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        preselectedSku={preselectedSku}
      />

      {/* Barcode Print Modal */}
      <BarcodeModal
        isOpen={!!barcodeItem}
        onClose={() => setBarcodeItem(null)}
        item={barcodeItem}
      />
    </div>
  );
};

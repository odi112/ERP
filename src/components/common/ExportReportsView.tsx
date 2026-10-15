import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Boxes, 
  Cog, 
  Users, 
  Layers, 
  Printer, 
  Database, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const ExportReportsView: React.FC = () => {
  const { inventory, movements, workOrders, employees, attendance, locations } = useERP();

  const downloadCSV = (filename: string, content: string) => {
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInventory = () => {
    const headers = ['SKU', 'Nama Barang', 'Kategori', 'Satuan', 'Stok Aktual', 'Safety Stock', 'Reorder Level', 'HPP (Cost)', 'Lokasi Gudang', 'Bin Rak', 'Barcode', 'Batch'];
    const rows = inventory.map(i => [
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
    downloadCSV(`ApexERP_Inventory_Master_${new Date().toISOString().slice(0, 10)}.csv`, [headers.join(','), ...rows.map(e => e.join(','))].join('\n'));
  };

  const exportMovements = () => {
    const headers = ['ID Mutasi', 'Timestamp', 'Tipe Mutasi', 'SKU', 'Nama Barang', 'Jumlah', 'Satuan', 'Dari', 'Ke', 'Dokumen Referensi', 'Operator', 'Catatan'];
    const rows = movements.map(m => [
      `"${m.id}"`,
      `"${m.timestamp}"`,
      `"${m.type}"`,
      `"${m.sku}"`,
      `"${m.itemName.replace(/"/g, '""')}"`,
      m.quantity,
      `"${m.unit}"`,
      `"${m.fromLocation}"`,
      `"${m.toLocation}"`,
      `"${m.referenceDoc}"`,
      `"${m.operatorName}"`,
      `"${m.notes.replace(/"/g, '""')}"`
    ]);
    downloadCSV(`ApexERP_Stock_Movements_${new Date().toISOString().slice(0, 10)}.csv`, [headers.join(','), ...rows.map(e => e.join(','))].join('\n'));
  };

  const exportWorkOrders = () => {
    const headers = ['Nomor SPK', 'SKU Barang Jadi', 'Nama Produk', 'Target Qty', 'Completed Qty', 'Scrap Qty', 'Status', 'Prioritas', 'Tanggal Mulai', 'Tenggat', 'Work Center', 'Supervisor'];
    const rows = workOrders.map(w => [
      `"${w.woNumber}"`,
      `"${w.finishedGoodSku}"`,
      `"${w.finishedGoodName.replace(/"/g, '""')}"`,
      w.targetQuantity,
      w.completedQuantity,
      w.scrapQuantity,
      `"${w.status}"`,
      `"${w.priority}"`,
      `"${w.startDate}"`,
      `"${w.dueDate}"`,
      `"${w.workCenterId}"`,
      `"${w.supervisor}"`
    ]);
    downloadCSV(`ApexERP_WorkOrders_Report_${new Date().toISOString().slice(0, 10)}.csv`, [headers.join(','), ...rows.map(e => e.join(','))].join('\n'));
  };

  const exportAttendance = () => {
    const headers = ['NIP', 'Nama Karyawan', 'Departemen', 'Tanggal', 'Jam Masuk', 'Jam Keluar', 'Status Presensi', 'Terlambat (Menit)', 'Lembur (Jam)', 'Metode'];
    const rows = attendance.map(a => [
      `"${a.nip}"`,
      `"${a.employeeName}"`,
      `"${a.department}"`,
      `"${a.date}"`,
      `"${a.clockInTime || '-'}"`,
      `"${a.clockOutTime || '-'}"`,
      `"${a.status}"`,
      a.lateMinutes,
      a.overtimeHours,
      `"${a.verificationMethod}"`
    ]);
    downloadCSV(`ApexERP_Attendance_Timesheet_${new Date().toISOString().slice(0, 10)}.csv`, [headers.join(','), ...rows.map(e => e.join(','))].join('\n'));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
          <FileSpreadsheet className="w-4 h-4" />
          Pusat Laporan & Ekspor Data Terpadu
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Ekspor Dokumen & Rekapitulasi ERP
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Unduh data mentah format CSV untuk analisis spreadsheet, audit internal pabrik, dan pelaporan manajemen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Warehouse */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Database Stok & Mutasi Gudang</h3>
              <p className="text-xs text-slate-400">{inventory.length} SKU terdaftar • {movements.length} transaksi mutasi</p>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Ekspor mencakup nomor SKU, spesifikasi material, lokasi rak/bin, safety stock, HPP/unit cost, dan buku besar arus masuk/keluar barang.
          </p>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={exportInventory}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Master Stok (.csv)
            </button>
            <button
              onClick={exportMovements}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Buku Mutasi (.csv)
            </button>
          </div>
        </div>

        {/* Card 2: Production */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Cog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Laporan Program & SPK Manufaktur</h3>
              <p className="text-xs text-slate-400">{workOrders.length} SPK tercatat • Metrik Scrap & Output</p>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Ekspor rekapitulasi surat perintah kerja, target batch vs pencapaian lolos QC, scrap/defective rate, lini mesin, dan tanggal jatuh tempo.
          </p>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={exportWorkOrders}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Log SPK (.csv)
            </button>
          </div>
        </div>

        {/* Card 3: Attendance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Timesheet & Buku Absensi Karyawan</h3>
              <p className="text-xs text-slate-400">{employees.length} staf aktif • {attendance.length} catatan kehadiran</p>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Data terinci jam masuk (clock-in), jam pulang (clock-out), kalkulasi keterlambatan per menit, akumulasi lembur, serta bukti metode verifikasi kiosk.
          </p>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={exportAttendance}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Timesheet Presensi (.csv)
            </button>
          </div>
        </div>

        {/* Card 4: System Integrity */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Integritas Database & Penyimpanan</h3>
              <p className="text-xs text-slate-400">Sinkronisasi Otomatis LocalStorage Engine</p>
            </div>
          </div>
          <div className="text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Relasi Database Antar-Modul Aktif
            </div>
            <p className="text-slate-400">
              Perubahan stok pada modul produksi otomatis memotong bahan baku di gudang dan menambahkan finished goods hasil rakitan secara real-time.
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
            Schema Version: v4.2.0 • Engine: React TSX In-Memory Persistent Store
          </div>
        </div>
      </div>
    </div>
  );
};

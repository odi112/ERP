import React from 'react';
import { X, Printer, FileText, CheckSquare, QrCode } from 'lucide-react';
import { WorkOrder } from '../../types/erp';
import { useERP } from '../../context/ERPContext';

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({ isOpen, onClose, workOrder }) => {
  const { boms, workCenters } = useERP();

  if (!isOpen || !workOrder) return null;

  const bom = boms.find(b => b.id === workOrder.bomId);
  const wc = workCenters.find(w => w.id === workOrder.workCenterId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Lembar Kerja SPK Manufaktur (Job Traveler)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Dokumen
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document (Clean White Sheet styling for printer compatibility) */}
        <div className="p-6">
          <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-300 font-sans printable-sheet">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
              <div>
                <div className="text-xl font-black tracking-tight text-slate-950">PT. APEX BAKPAO NUSANTARA</div>
                <div className="text-xs text-slate-600">Pabrik Pengolahan Makanan & Produksi Bakpao Mini Frozen • Kawasan Industri KIIC Karawang</div>
                <div className="text-xs text-slate-500 mt-1">Sertifikasi Halal & BPOM RI • Telp: (021) 8990-4400 • Email: bakery@apex.io</div>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-slate-900 text-white rounded">
                  SURAT PERINTAH KERJA (SPK)
                </span>
                <div className="text-lg font-black font-mono text-slate-950 mt-1.5">
                  {workOrder.woNumber}
                </div>
                <div className="text-[11px] text-slate-500">Tanggal: {workOrder.startDate.slice(0, 10)}</div>
              </div>
            </div>

            {/* SPK Details Table */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-bold">Produk / Finished Good:</div>
                <div className="text-sm font-extrabold text-slate-900">{workOrder.finishedGoodName}</div>
                <div className="font-mono text-slate-600 mt-0.5">Kode SKU: {workOrder.finishedGoodSku}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Target Produksi:</div>
                  <div className="text-base font-black text-slate-900 font-mono">{workOrder.targetQuantity} Unit</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Prioritas Order:</div>
                  <div className="text-xs font-bold text-slate-800">{workOrder.priority}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Lini / Mesin:</div>
                  <div className="text-xs font-semibold text-slate-800">{wc?.name || workOrder.workCenterId}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Tenggat Selesai:</div>
                  <div className="text-xs font-mono font-semibold text-slate-800">{workOrder.dueDate}</div>
                </div>
              </div>
            </div>

            {/* BOM Checklist table */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Daftar Alokasi Bahan Baku & Komponen (BOM Checklist)
              </h4>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="py-2 px-3 border-b border-slate-200">No</th>
                    <th className="py-2 px-3 border-b border-slate-200">Kode Bahan</th>
                    <th className="py-2 px-3 border-b border-slate-200">Deskripsi Komponen</th>
                    <th className="py-2 px-3 border-b border-slate-200 text-right">Kebutuhan per Unit</th>
                    <th className="py-2 px-3 border-b border-slate-200 text-right">Total Kebutuhan SPK</th>
                    <th className="py-2 px-3 border-b border-slate-200 text-center">Check Fisik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bom ? (
                    bom.components.map((c, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 font-mono text-slate-500">{i + 1}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-slate-900">{c.componentSku}</td>
                        <td className="py-2 px-3 text-slate-800">{c.componentName}</td>
                        <td className="py-2 px-3 text-right font-mono">{c.quantityNeeded} {c.unit}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {(c.quantityNeeded * workOrder.targetQuantity).toLocaleString()} {c.unit}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-block w-4 h-4 border-2 border-slate-400 rounded"></span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-3 text-center text-slate-500">
                        Detail BOM standar perakitan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Special Notes */}
            {workOrder.notes && (
              <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Instruksi Khusus & Catatan QC:</span>
                <span className="text-slate-600">{workOrder.notes}</span>
              </div>
            )}

            {/* Signatures & Barcode */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-200 text-center text-xs">
              <div>
                <span className="text-slate-500 block mb-12">Diterbitkan oleh (PPIC / Lead):</span>
                <div className="font-bold text-slate-900 underline">{workOrder.supervisor}</div>
                <div className="text-[10px] text-slate-500">Plant Supervisor</div>
              </div>
              <div>
                <span className="text-slate-500 block mb-12">Diterima Operator Mesin:</span>
                <div className="font-bold text-slate-900 underline">{wc?.operatorInCharge || 'Kepala Regu'}</div>
                <div className="text-[10px] text-slate-500">Manufacturing Operator</div>
              </div>
              <div>
                <span className="text-slate-500 block mb-12">Inspeksi Mutu (QA/QC):</span>
                <div className="font-bold text-slate-900 underline">( ........................................ )</div>
                <div className="text-[10px] text-slate-500">Quality Control Officer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, ArrowDownRight, PackageCheck } from 'lucide-react';
import { WorkOrder } from '../../types/erp';
import { useERP } from '../../context/ERPContext';

interface LogOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
}

export const LogOutputModal: React.FC<LogOutputModalProps> = ({ isOpen, onClose, workOrder }) => {
  const { recordProductionOutput } = useERP();

  const [goodQty, setGoodQty] = useState(20);
  const [scrapQty, setScrapQty] = useState(0);
  const [markComplete, setMarkComplete] = useState(false);

  React.useEffect(() => {
    if (workOrder) {
      const remaining = Math.max(0, workOrder.targetQuantity - workOrder.completedQuantity);
      setGoodQty(remaining > 0 ? remaining : 10);
      setScrapQty(0);
      setMarkComplete(remaining <= 20);
    }
  }, [workOrder, isOpen]);

  if (!isOpen || !workOrder) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goodQty < 0 || scrapQty < 0) return;

    recordProductionOutput(workOrder.id, Number(goodQty), Number(scrapQty), markComplete);
    onClose();
  };

  const remainingBefore = Math.max(0, workOrder.targetQuantity - workOrder.completedQuantity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Input Hasil Produksi & QC
              </h2>
              <p className="text-xs text-slate-400">
                {workOrder.woNumber} - {workOrder.finishedGoodSku}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Order Summary banner */}
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="font-semibold text-slate-200 text-sm">
              {workOrder.finishedGoodName}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-slate-400 block text-[10px]">Target</span>
                <span className="font-bold text-white font-mono">{workOrder.targetQuantity}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Telah Selesai</span>
                <span className="font-bold text-emerald-400 font-mono">{workOrder.completedQuantity}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Sisa Target</span>
                <span className="font-bold text-amber-400 font-mono">{remainingBefore}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Lolos QC / Barang Baik (Unit) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={goodQty}
                onChange={(e) => setGoodQty(Number(e.target.value))}
                className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Otomatis masuk ke Gudang Barang Jadi (WH-FG-01)
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Barang Cacat / Scrap (Unit)
              </label>
              <input
                type="number"
                min="0"
                value={scrapQty}
                onChange={(e) => setScrapQty(Number(e.target.value))}
                className="w-full bg-slate-950 border border-rose-500/50 rounded-xl px-3 py-2 text-rose-300 font-mono text-base font-bold focus:border-rose-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Dihitung ke statistik scrap rate
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={markComplete}
                onChange={(e) => setMarkComplete(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-white block">Tandai SPK Selesai Penuh (COMPLETED)</span>
                <span className="text-[11px] text-slate-400">Order akan ditutup dan status mesin di-idle untuk jadwal batch berikutnya.</span>
              </div>
            </label>
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
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Simpan Hasil & Masukkan ke Gudang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

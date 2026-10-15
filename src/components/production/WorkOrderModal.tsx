import React, { useState } from 'react';
import { X, Plus, Calendar, AlertCircle } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { PriorityLevel } from '../../types/erp';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({ isOpen, onClose }) => {
  const { boms, workCenters, addWorkOrder } = useERP();

  const [bomId, setBomId] = useState(boms[0]?.id || '');
  const [targetQuantity, setTargetQuantity] = useState(100);
  const [priority, setPriority] = useState<PriorityLevel>('NORMAL');
  const [workCenterId, setWorkCenterId] = useState(workCenters[0]?.id || '');
  const [assignedTeam, setAssignedTeam] = useState('Assembly Squad Alpha');
  const [supervisor, setSupervisor] = useState('Ir. Ahmad Zulkarnaen');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10) + ' 17:00';
  });
  const [notes, setNotes] = useState('Pesanan produksi reguler batch sesuai jadwal mingguan.');

  React.useEffect(() => {
    if (boms.length > 0 && !bomId) setBomId(boms[0].id);
    if (workCenters.length > 0 && !workCenterId) setWorkCenterId(workCenters[0].id);
  }, [boms, workCenters]);

  if (!isOpen) return null;

  const selectedBom = boms.find(b => b.id === bomId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBom || targetQuantity <= 0) return;

    const randomNum = Math.floor(100 + Math.random() * 900);
    const woNumber = `WO-2026-${randomNum}`;

    addWorkOrder({
      woNumber,
      bomId: selectedBom.id,
      finishedGoodSku: selectedBom.productSku,
      finishedGoodName: selectedBom.productName,
      targetQuantity: Number(targetQuantity),
      completedQuantity: 0,
      scrapQuantity: 0,
      status: 'PLANNED',
      priority,
      startDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      dueDate,
      workCenterId,
      assignedTeam,
      supervisor,
      notes,
      materialIssued: false
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Penerbitan Surat Perintah Kerja (SPK) Baru
            </h2>
            <p className="text-xs text-slate-400">
              Modul Perencanaan & Penjadwalan Produksi Pabrik
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
          {/* Select Product BOM */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Produk / Bill of Materials (BOM) *
            </label>
            <select
              value={bomId}
              onChange={(e) => setBomId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            >
              {boms.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.productName} ({b.productSku}) - {b.version}
                </option>
              ))}
            </select>
          </div>

          {/* BOM Material preview */}
          {selectedBom && (
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block mb-1.5">
                Kebutuhan Bahan Baku per 1 Unit:
              </span>
              <div className="space-y-1">
                {selectedBom.components.map((c, i) => (
                  <div key={i} className="flex justify-between text-[11px] text-slate-300">
                    <span>• {c.componentName}</span>
                    <span className="font-mono text-slate-400">
                      {(c.quantityNeeded * targetQuantity).toLocaleString()} {c.unit} total
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Quantity and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Produksi (Unit) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Tingkat Prioritas *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">Tinggi (High Priority)</option>
                <option value="URGENT">Mendesak (Urgent Batch)</option>
              </select>
            </div>
          </div>

          {/* Work Center & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Lini Mesin / Work Center *
              </label>
              <select
                value={workCenterId}
                onChange={(e) => setWorkCenterId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                {workCenters.map((wc) => (
                  <option key={wc.id} value={wc.id}>
                    {wc.code} - {wc.name} ({wc.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Tenggat Selesai (Due Date) *
              </label>
              <input
                type="text"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Team & Supervisor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Regu Kerja (Team) *
              </label>
              <input
                type="text"
                required
                value={assignedTeam}
                onChange={(e) => setAssignedTeam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Supervisor Penanggung Jawab *
              </label>
              <input
                type="text"
                required
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Catatan Instruksi Khusus
            </label>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              Terbitkan SPK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

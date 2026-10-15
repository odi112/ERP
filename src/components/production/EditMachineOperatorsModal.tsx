import React, { useState } from 'react';
import { X, UserCheck, Save, Users, Cpu, ShieldCheck } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface EditMachineOperatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  specificMachineId?: string | null;
}

export const EditMachineOperatorsModal: React.FC<EditMachineOperatorsModalProps> = ({
  isOpen,
  onClose,
  specificMachineId
}) => {
  const { workCenters, employees, updateAllWorkCenterOperators, showNotification } = useERP();

  // Local state for all machine assignments: { [machineId]: operatorName }
  const [assignments, setAssignments] = useState<{ [machineId: string]: string }>({});

  React.useEffect(() => {
    if (isOpen) {
      const initialMap: { [machineId: string]: string } = {};
      workCenters.forEach((wc) => {
        initialMap[wc.id] = wc.operatorInCharge;
      });
      setAssignments(initialMap);
    }
  }, [isOpen, workCenters]);

  if (!isOpen) return null;

  const handleOperatorChange = (machineId: string, value: string) => {
    setAssignments(prev => ({
      ...prev,
      [machineId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = Object.entries(assignments).map(([centerId, operatorInCharge]) => ({
      centerId,
      operatorInCharge
    }));

    updateAllWorkCenterOperators(payload);
    showNotification('success', 'Operator Berhasil Ditugaskan', 'Penugasan operator untuk lini mesin pabrik telah diperbarui.');
    onClose();
  };

  // Filter machines if specific machine was requested, else show all
  const displayedMachines = specificMachineId 
    ? workCenters.filter(w => w.id === specificMachineId)
    : workCenters;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {specificMachineId ? 'Edit Operator Mesin' : 'Penugasan Operator Semua Mesin Produksi'}
              </h2>
              <p className="text-xs text-slate-400">
                Pilih atau masukkan nama staf penanggung jawab operasional per work center
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
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Total Lini Mesin Aktif: <strong className="text-white font-mono">{workCenters.length} Unit</strong>
            </span>
            <span className="text-slate-400">
              Sinkron ke Gantt Timeline & Work Order
            </span>
          </div>

          {/* Machine rows */}
          <div className="space-y-3">
            {displayedMachines.map((wc) => {
              const currentOp = assignments[wc.id] !== undefined ? assignments[wc.id] : wc.operatorInCharge;

              return (
                <div 
                  key={wc.id}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="sm:w-1/3 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {wc.code}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        wc.status === 'RUNNING' ? 'bg-emerald-500/20 text-emerald-400' :
                        wc.status === 'IDLE' ? 'bg-slate-800 text-slate-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {wc.status}
                      </span>
                    </div>
                    <div className="font-bold text-white text-xs mt-1 truncate">
                      {wc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Kapasitas: {wc.capacityPerHour} unit/jam • OEE: {wc.efficiencyRate}%
                    </div>
                  </div>

                  {/* Operator Assignment Input / Selector */}
                  <div className="sm:w-2/3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        Pilih Karyawan Terdaftar:
                      </label>
                      <select
                        value={employees.some(e => `${e.name} (${e.nip})` === currentOp || e.name === currentOp) ? currentOp : 'CUSTOM'}
                        onChange={(e) => {
                          if (e.target.value !== 'CUSTOM') {
                            handleOperatorChange(wc.id, e.target.value);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-indigo-500 focus:outline-none cursor-pointer"
                      >
                        <option value="CUSTOM">-- Ketik Nama Manual --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={`${emp.name} (${emp.nip})`}>
                            {emp.name} - {emp.nip} ({emp.position})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        Nama / Kode Operator:
                      </label>
                      <input
                        type="text"
                        required
                        value={currentOp}
                        onChange={(e) => handleOperatorChange(wc.id, e.target.value)}
                        placeholder="Contoh: Rizky Maulana (OP-004)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
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
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Penugasan Operator
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

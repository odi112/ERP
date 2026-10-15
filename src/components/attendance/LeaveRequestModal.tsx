import React, { useState } from 'react';
import { X, Calendar, Send } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { LeaveRequest } from '../../types/erp';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose }) => {
  const { employees, submitLeaveRequest } = useERP();

  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [type, setType] = useState<LeaveRequest['type']>('ANNUAL_LEAVE');
  const [startDate, setStartDate] = useState('2026-10-16');
  const [endDate, setEndDate] = useState('2026-10-17');
  const [days, setDays] = useState(2);
  const [reason, setReason] = useState('Keperluan keluarga mendesak');

  React.useEffect(() => {
    if (employees.length > 0 && !employeeId) {
      setEmployeeId(employees[0].id);
    }
  }, [employees]);

  if (!isOpen) return null;

  const selectedEmp = employees.find(e => e.id === employeeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !reason.trim()) return;

    submitLeaveRequest({
      employeeId: selectedEmp.id,
      nip: selectedEmp.nip,
      employeeName: selectedEmp.name,
      type,
      startDate,
      endDate,
      days: Number(days),
      reason
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              Formulir Permohonan Cuti & Izin
            </h2>
            <p className="text-xs text-slate-400">
              Pengajuan ketidakhadiran kerja karyawan pabrik
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Pilih Karyawan *</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  [{emp.nip}] {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Jenis Ketidakhadiran *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="ANNUAL_LEAVE">Cuti Tahunan (Annual Leave)</option>
              <option value="SICK">Sakit dengan Surat Dokter (Sick Leave)</option>
              <option value="EMERGENCY_IZIN">Izin Keperluan Darurat (Permission)</option>
              <option value="OFFICIAL_DUTY">Tugas Dinas Luar Kota (Official Duty)</option>
              <option value="UNPAID">Cuti di Luar Tanggungan (Unpaid)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mulai Tanggal *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Sampai Tanggal *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Jumlah Hari Kerja *</label>
            <input
              type="number"
              min="1"
              required
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Alasan Pengajuan Cuti / Izin *</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 focus:outline-none"
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
              <Send className="w-4 h-4" />
              Kirim Pengajuan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

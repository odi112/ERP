import React, { useState } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Employee, DepartmentType, ShiftType } from '../../types/erp';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editEmployee?: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, editEmployee }) => {
  const { addEmployee, updateEmployee } = useERP();

  const [nip, setNip] = useState(editEmployee?.nip || '');
  const [name, setName] = useState(editEmployee?.name || '');
  const [email, setEmail] = useState(editEmployee?.email || '');
  const [phone, setPhone] = useState(editEmployee?.phone || '+62 812-');
  const [department, setDepartment] = useState<DepartmentType>(editEmployee?.department || 'Production & Assembly');
  const [position, setPosition] = useState(editEmployee?.position || 'Operator Produksi');
  const [shift, setShift] = useState<ShiftType>(editEmployee?.shift || 'Shift 1 (07:00 - 15:00)');
  const [pinCode, setPinCode] = useState(editEmployee?.pinCode || '');
  const [salaryPerMonth, setSalaryPerMonth] = useState(editEmployee?.salaryPerMonth || 7500000);

  React.useEffect(() => {
    if (editEmployee) {
      setNip(editEmployee.nip);
      setName(editEmployee.name);
      setEmail(editEmployee.email);
      setPhone(editEmployee.phone);
      setDepartment(editEmployee.department);
      setPosition(editEmployee.position);
      setShift(editEmployee.shift);
      setPinCode(editEmployee.pinCode);
      setSalaryPerMonth(editEmployee.salaryPerMonth);
    } else {
      const randomId = Math.floor(100 + Math.random() * 900);
      setNip(`NIP-2026-${randomId}`);
      setName('');
      setEmail('');
      setPhone('+62 8');
      setDepartment('Production & Assembly');
      setPosition('Operator Perakitan Lini');
      setShift('Shift 1 (07:00 - 15:00)');
      setPinCode(`${randomId + 1000}`);
      setSalaryPerMonth(7200000);
    }
  }, [editEmployee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nip.trim() || !pinCode.trim()) return;

    if (editEmployee) {
      updateEmployee(editEmployee.id, {
        nip,
        name,
        email,
        phone,
        department,
        position,
        shift,
        pinCode,
        salaryPerMonth: Number(salaryPerMonth)
      });
    } else {
      addEmployee({
        nip,
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@factory.apex.io`,
        phone,
        department,
        position,
        shift,
        status: 'ACTIVE',
        pinCode,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`,
        joinDate: new Date().toISOString().slice(0, 10),
        salaryPerMonth: Number(salaryPerMonth)
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {editEmployee ? 'Edit Data Karyawan' : 'Pendaftaran Karyawan Pabrik Baru'}
            </h2>
            <p className="text-xs text-slate-400">
              Master data kepegawaian & konfigurasi PIN terminal presensi
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
              <label className="block text-slate-300 font-semibold mb-1">NIP (Nomor Induk Pegawai) *</label>
              <input
                type="text"
                required
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Contoh: NIP-2026-042"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">PIN Kiosk Presensi (4 Digit) *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="Misal: 1024"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap Karyawan *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Muhammad Rizky Saputra"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Departemen / Divisi *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as DepartmentType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="Production & Assembly">Production & Assembly (Produksi)</option>
                <option value="Warehouse">Warehouse (Gudang & Logistik)</option>
                <option value="Quality Control">Quality Control (QA / QC)</option>
                <option value="Maintenance & Engineering">Maintenance & Engineering</option>
                <option value="HR & General Affairs">HR & General Affairs</option>
                <option value="Supply Chain">Supply Chain & Procurement</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Jabatan / Posisi *</label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Contoh: Operator CNC 4-Axis"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Jadwal Shift Kerja *</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as ShiftType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="Shift 1 (07:00 - 15:00)">Shift 1 (Pagi: 07:00 - 15:00)</option>
                <option value="Shift 2 (15:00 - 23:00)">Shift 2 (Sore: 15:00 - 23:00)</option>
                <option value="Shift 3 (23:00 - 07:00)">Shift 3 (Malam: 23:00 - 07:00)</option>
                <option value="Regular (08:00 - 17:00)">Regular Day (08:00 - 17:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">No. WhatsApp / HP</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
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
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {editEmployee ? 'Simpan Perubahan' : 'Daftarkan Karyawan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

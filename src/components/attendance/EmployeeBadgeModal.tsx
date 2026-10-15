import React from 'react';
import { X, Printer, Shield, QrCode } from 'lucide-react';
import { Employee } from '../../types/erp';

interface EmployeeBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const EmployeeBadgeModal: React.FC<EmployeeBadgeModalProps> = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Kartu Tanda Pengenal Karyawan</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col items-center">
          <div className="w-full bg-slate-950 text-white rounded-2xl border-2 border-indigo-500/50 shadow-2xl p-5 flex flex-col items-center relative overflow-hidden font-sans">
            {/* Top decorative header */}
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-xs">
                  A
                </div>
                <div>
                  <div className="text-xs font-black tracking-tight leading-none">APEX INDUSTRIES</div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">MANUFACTURING PLANT</div>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                SECURITY ACCESS
              </span>
            </div>

            {/* Avatar photo */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-400/80 shadow-md mb-3 bg-slate-800 flex items-center justify-center">
              {employee.avatarUrl ? (
                <img 
                  src={employee.avatarUrl} 
                  alt={employee.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="text-2xl font-black text-indigo-400">
                  {employee.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name & Title */}
            <h4 className="text-base font-extrabold text-white text-center leading-tight mb-1">
              {employee.name}
            </h4>
            <span className="text-xs text-indigo-300 font-semibold mb-3">
              {employee.position}
            </span>

            {/* Badges info */}
            <div className="w-full bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-[11px] space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Nomor Induk (NIP):</span>
                <span className="font-mono font-bold text-white">{employee.nip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Departemen:</span>
                <span className="font-semibold text-slate-200">{employee.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shift Kerja:</span>
                <span className="text-slate-300">{employee.shift.split(' ')[0]} {employee.shift.split(' ')[1]}</span>
              </div>
            </div>

            {/* Bottom Barcode / RFID Tag */}
            <div className="w-full flex items-center justify-between border-t border-slate-800 pt-3">
              <div className="text-[9px] text-slate-500 font-mono">
                PIN: **** <br />
                ISSUED: {employee.joinDate}
              </div>
              <div className="p-1 bg-white rounded-lg">
                <QrCode className="w-8 h-8 text-black" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak ID Card
          </button>
        </div>
      </div>
    </div>
  );
};

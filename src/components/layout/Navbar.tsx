import React from 'react';
import { 
  Building2, 
  Clock, 
  ShieldCheck, 
  Bell, 
  RotateCcw, 
  QrCode, 
  Search,
  UserCheck
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { UserRole } from '../../types/erp';

interface NavbarProps {
  onOpenKiosk: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenKiosk }) => {
  const { 
    currentRole, 
    setCurrentRole, 
    notifications, 
    resetToDefaultData,
    inventory,
    attendance
  } = useERP();

  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const lowStockCount = inventory.filter(i => i.stockQuantity <= i.minSafetyStock).length;
  const presentEmployeesToday = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Factory Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl tracking-wider">
          A
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-white">Apex<span className="text-indigo-400">ERP</span></span>
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              Smart Factory v4.2
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Warehouse DB • Manufacturing MES • Attendance HR
          </p>
        </div>
      </div>

      {/* Middle Status Indicators */}
      <div className="hidden lg:flex items-center gap-4 bg-slate-950/60 border border-slate-800/80 px-4 py-1.5 rounded-full text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-slate-200 font-medium">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">15 Okt 2026</span>
        </div>

        <div className="w-px h-3.5 bg-slate-800" />

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">Plant Status: <strong className="text-emerald-400 font-semibold">Active Run</strong></span>
        </div>

        {lowStockCount > 0 && (
          <>
            <div className="w-px h-3.5 bg-slate-800" />
            <div className="flex items-center gap-1 text-amber-400 font-medium">
              <span>⚠️ {lowStockCount} SKU Kritis</span>
            </div>
          </>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Attendance Kiosk Quick Launcher */}
        <button
          onClick={onOpenKiosk}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium px-3.5 py-1.5 rounded-lg shadow-md shadow-emerald-900/30 text-xs sm:text-sm transition-all duration-150 active:scale-95 cursor-pointer"
          title="Buka Layar Terminal Presensi Karyawan"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Kiosk Presensi</span>
          <span className="sm:hidden">Kiosk</span>
        </button>

        {/* Role Switcher */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-lg p-1 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:block" />
          <select 
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none px-2 py-0.5 cursor-pointer"
          >
            <option value="ADMIN" className="bg-slate-900 text-white">Super Admin / Plant GM</option>
            <option value="WAREHOUSE_SUPERVISOR" className="bg-slate-900 text-white">Warehouse Supervisor</option>
            <option value="PRODUCTION_LEAD" className="bg-slate-900 text-white">Production Lead</option>
            <option value="HR_MANAGER" className="bg-slate-900 text-white">HR & Payroll Manager</option>
          </select>
        </div>

        {/* Reset Data Button */}
        <button
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin mereset seluruh database ke data awal? Semua perubahan stok, SPK, dan absensi akan dikembalikan ke kondisi pabrik default.')) {
              resetToDefaultData();
            }
          }}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Reset Database ke Sample Default"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

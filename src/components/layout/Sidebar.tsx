import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  Cog, 
  UserCheck, 
  FileSpreadsheet, 
  Layers,
  ChevronRight,
  Database,
  Cpu
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ModuleTab } from '../../types/erp';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    inventory, 
    workOrders, 
    attendance,
    locations
  } = useERP();

  const lowStockCount = inventory.filter(i => i.stockQuantity <= i.minSafetyStock).length;
  const activeWOs = workOrders.filter(w => w.status === 'IN_PROGRESS' || w.status === 'QUALITY_CHECK').length;
  const presentCount = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;

  const navItems: { id: ModuleTab; label: string; subLabel: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      subLabel: 'Overview & KPIs',
      icon: LayoutDashboard
    },
    {
      id: 'warehouse',
      label: 'Sistem Database Gudang',
      subLabel: 'Stok, Mutasi & Lokasi',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    },
    {
      id: 'production',
      label: 'Program Produksi',
      subLabel: 'BOM, SPK & Mesin',
      icon: Cog,
      badge: activeWOs > 0 ? activeWOs : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
    },
    {
      id: 'attendance',
      label: 'Absensi Karyawan',
      subLabel: 'Presensi, Shift & Cuti',
      icon: UserCheck,
      badge: presentCount > 0 ? presentCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'settings',
      label: 'Dokumen & Ekspor',
      subLabel: 'Surat Jalan, SPK & CSV',
      icon: FileSpreadsheet
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 shrink-0 flex flex-col justify-between hidden md:flex">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Menu Utama ERP
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600/15 border border-indigo-500/30 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800/80 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-sm ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {item.subLabel}
                  </div>
                </div>
              </div>

              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Warehouse Summary Widget in Sidebar */}
      <div className="p-3 m-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            Kapasitas Gudang
          </span>
          <span className="font-mono text-[11px] text-indigo-400">
            {locations.length} Lokasi
          </span>
        </div>

        <div className="space-y-1.5">
          {locations.slice(0, 3).map(loc => {
            const pct = Math.min(100, Math.round((loc.currentItemsCount / loc.capacity) * 100));
            return (
              <div key={loc.id} className="text-[11px]">
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span className="truncate max-w-[120px]">{loc.code}</span>
                  <span className="font-mono text-slate-300">{pct}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${pct > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            Engine Online
          </span>
          <span className="text-slate-400">Synced LocalDB</span>
        </div>
      </div>
    </aside>
  );
};

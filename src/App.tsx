import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { WarehouseView } from './components/warehouse/WarehouseView';
import { ProductionView } from './components/production/ProductionView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { ExportReportsView } from './components/common/ExportReportsView';
import { AttendanceKioskModal } from './components/attendance/AttendanceKioskModal';
import { WorkOrderModal } from './components/production/WorkOrderModal';
import { StockMovementModal } from './components/warehouse/StockMovementModal';
import { ItemModal } from './components/warehouse/ItemModal';
import { PrintDocumentModal } from './components/common/PrintDocumentModal';
import { WorkOrder, ModuleTab } from './types/erp';
import { 
  LayoutDashboard, 
  Boxes, 
  Cog, 
  UserCheck, 
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertCircle
} from 'lucide-react';

const ERPAppContent: React.FC = () => {
  const { activeTab, setActiveTab, notifications, dismissNotification } = useERP();

  // Modals controlled from global header / dashboard
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [isQuickWoOpen, setIsQuickWoOpen] = useState(false);
  const [isQuickMovementOpen, setIsQuickMovementOpen] = useState(false);
  const [isQuickItemOpen, setIsQuickItemOpen] = useState(false);
  const [printingWo, setPrintingWo] = useState<WorkOrder | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenKiosk={() => setIsKioskOpen(true)} />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onOpenKiosk={() => setIsKioskOpen(true)}
              onOpenNewWO={() => setIsQuickWoOpen(true)}
              onOpenNewStockMovement={() => setIsQuickMovementOpen(true)}
              onOpenNewItem={() => setIsQuickItemOpen(true)}
            />
          )}

          {activeTab === 'warehouse' && <WarehouseView />}

          {activeTab === 'production' && (
            <ProductionView onPrintSPK={(wo) => setPrintingWo(wo)} />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView onOpenKiosk={() => setIsKioskOpen(true)} />
          )}

          {activeTab === 'settings' && <ExportReportsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg flex items-center justify-around z-30 px-2">
        {[
          { id: 'dashboard' as ModuleTab, label: 'Dashboard', icon: LayoutDashboard },
          { id: 'warehouse' as ModuleTab, label: 'Gudang', icon: Boxes },
          { id: 'production' as ModuleTab, label: 'Produksi', icon: Cog },
          { id: 'attendance' as ModuleTab, label: 'Absensi', icon: UserCheck },
          { id: 'settings' as ModuleTab, label: 'Laporan', icon: FileSpreadsheet },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-14 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Floating System Notifications (Toasts) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all animate-fadeIn ${
              n.type === 'success' ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300' :
              n.type === 'warning' ? 'bg-slate-900/95 border-amber-500/50 text-amber-300' :
              n.type === 'error' ? 'bg-slate-900/95 border-rose-500/50 text-rose-300' :
              'bg-slate-900/95 border-indigo-500/50 text-indigo-300'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {n.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {n.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-white leading-tight">{n.title}</div>
              <div className="text-[11px] text-slate-300 mt-0.5">{n.message}</div>
              <span className="text-[9px] text-slate-500 mt-1 block font-mono">{n.timestamp}</span>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Global Modals */}
      <AttendanceKioskModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
      />

      <WorkOrderModal
        isOpen={isQuickWoOpen}
        onClose={() => setIsQuickWoOpen(false)}
      />

      <StockMovementModal
        isOpen={isQuickMovementOpen}
        onClose={() => setIsQuickMovementOpen(false)}
      />

      <ItemModal
        isOpen={isQuickItemOpen}
        onClose={() => setIsQuickItemOpen(false)}
      />

      <PrintDocumentModal
        isOpen={!!printingWo}
        onClose={() => setPrintingWo(null)}
        workOrder={printingWo}
      />
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <ERPAppContent />
    </ERPProvider>
  );
}

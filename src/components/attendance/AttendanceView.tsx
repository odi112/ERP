import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  QrCode, 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Edit3, 
  Trash2,
  Check,
  X,
  Printer
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Employee, AttendanceRecord, LeaveRequest } from '../../types/erp';
import { EmployeeModal } from './EmployeeModal';
import { LeaveRequestModal } from './LeaveRequestModal';
import { EmployeeBadgeModal } from './EmployeeBadgeModal';

interface AttendanceViewProps {
  onOpenKiosk: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ onOpenKiosk }) => {
  const { 
    employees, 
    attendance, 
    leaveRequests, 
    clockIn, 
    clockOut, 
    updateLeaveStatus, 
    deleteEmployee 
  } = useERP();

  const [subTab, setSubTab] = useState<'today' | 'directory' | 'leaves' | 'monthly'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modals
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [badgeEmployee, setBadgeEmployee] = useState<Employee | null>(null);

  // Today calculations
  const todayRecords = attendance.filter(a => a.date === '2026-10-15');
  const presentCount = todayRecords.filter(a => a.status === 'PRESENT').length;
  const lateCount = todayRecords.filter(a => a.status === 'LATE').length;
  const leaveCount = todayRecords.filter(a => a.status === 'LEAVE' || a.status === 'SICK').length;
  const attendanceRate = employees.length > 0 
    ? Math.round(((presentCount + lateCount) / employees.length) * 100) 
    : 0;

  // Filtered attendance records
  const filteredTodayAttendance = todayRecords.filter(rec => {
    const matchesSearch = 
      rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || rec.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleExportCSV = () => {
    const headers = ['NIP', 'Nama Karyawan', 'Departemen', 'Tanggal', 'Jam Masuk', 'Jam Keluar', 'Status', 'Terlambat (Menit)', 'Lembur (Jam)', 'Metode'];
    const rows = todayRecords.map(r => [
      `"${r.nip}"`,
      `"${r.employeeName}"`,
      `"${r.department}"`,
      r.date,
      r.clockInTime || '-',
      r.clockOutTime || '-',
      r.status,
      r.lateMinutes,
      r.overtimeHours,
      r.verificationMethod
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ApexERP_Attendance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Users className="w-4 h-4" />
            Modul HR & Presensi Karyawan Pabrik
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sistem Absensi & Kepegawaian (HRIS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitoring kehadiran harian, keterlambatan shift, pengajuan cuti, dan integrasi terminal kiosk biometrik.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenKiosk}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/40 transition-all cursor-pointer active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            Buka Kiosk Presensi
          </button>

          <button
            onClick={() => {
              setEditingEmployee(null);
              setIsEmployeeModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Tambah Karyawan
          </button>

          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            Ajukan Cuti/Izin
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Tingkat Kehadiran Hari Ini</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
            {attendanceRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {presentCount + lateCount} dari {employees.length} staf hadir
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Tepat Waktu (On Time)</span>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            {presentCount} <span className="text-xs font-normal text-slate-400">orang</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            Shift 1 & Regular berjalan
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Terlambat Masuk</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">
            {lateCount} <span className="text-xs font-normal text-slate-400">orang</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Dihitung otomatis per shift
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Izin / Cuti Disetujui</span>
          <div className="text-xl sm:text-2xl font-bold text-blue-400 font-mono">
            {leaveCount} <span className="text-xs font-normal text-slate-400">orang</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {leaveRequests.filter(l => l.status === 'PENDING').length} permohonan pending
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center border-b border-slate-800 space-x-1 text-xs sm:text-sm font-medium">
        <button
          onClick={() => setSubTab('today')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            subTab === 'today'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Presensi Harian (Hari Ini: 15 Okt 2026)
        </button>

        <button
          onClick={() => setSubTab('directory')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            subTab === 'directory'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Direktori Karyawan ({employees.length})
        </button>

        <button
          onClick={() => setSubTab('leaves')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            subTab === 'leaves'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Pengajuan Cuti & Izin ({leaveRequests.length})
        </button>

        <button
          onClick={() => setSubTab('monthly')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            subTab === 'monthly'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Rekapitulasi Bulanan
        </button>
      </div>

      {/* SUB-TAB 1: TODAY'S ATTENDANCE LOG */}
      {subTab === 'today' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama karyawan, NIP, atau departemen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Departemen</option>
              <option value="Production & Assembly">Production & Assembly</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Maintenance & Engineering">Maintenance & Engineering</option>
              <option value="HR & General Affairs">HR & General Affairs</option>
            </select>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Karyawan / NIP</th>
                    <th className="py-3 px-4">Departemen</th>
                    <th className="py-3 px-4 text-center">Jam Masuk (In)</th>
                    <th className="py-3 px-4 text-center">Jam Pulang (Out)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Keterlambatan</th>
                    <th className="py-3 px-4 text-center">Lembur (OT)</th>
                    <th className="py-3 px-4">Metode Verifikasi</th>
                    <th className="py-3 px-4 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTodayAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        Tidak ada catatan presensi yang sesuai kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredTodayAttendance.map((rec) => {
                      const emp = employees.find(e => e.id === rec.employeeId);
                      const isClockedIn = !!rec.clockInTime;
                      const isClockedOut = !!rec.clockOutTime;

                      return (
                        <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{rec.employeeName}</div>
                            <div className="font-mono text-[10px] text-slate-400">{rec.nip}</div>
                          </td>

                          <td className="py-3 px-4 text-slate-300">
                            {rec.department}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold">
                            {rec.clockInTime ? (
                              <span className="text-white bg-slate-800 px-2 py-0.5 rounded">
                                {rec.clockInTime}
                              </span>
                            ) : (
                              <span className="text-slate-600">--:--:--</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold">
                            {rec.clockOutTime ? (
                              <span className="text-white bg-slate-800 px-2 py-0.5 rounded">
                                {rec.clockOutTime}
                              </span>
                            ) : (
                              <span className="text-slate-600">--:--:--</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              rec.status === 'LATE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              rec.status === 'LEAVE' || rec.status === 'SICK' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {rec.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center font-mono">
                            {rec.lateMinutes > 0 ? (
                              <span className="text-amber-400 font-bold">+{rec.lateMinutes} mnt</span>
                            ) : (
                              <span className="text-slate-400">0 mnt</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center font-mono">
                            {rec.overtimeHours > 0 ? (
                              <span className="text-emerald-400 font-bold">+{rec.overtimeHours} jam</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                              {rec.verificationMethod}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {!isClockedIn ? (
                                <button
                                  onClick={() => clockIn(rec.employeeId, 'MANUAL_ENTRY', 'Supervisor Manual Check')}
                                  className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  Clock-In
                                </button>
                              ) : !isClockedOut ? (
                                <button
                                  onClick={() => clockOut(rec.employeeId, 'Manual Clock Out')}
                                  className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  Clock-Out
                                </button>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Selesai</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EMPLOYEE DIRECTORY */}
      {subTab === 'directory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 shadow-sm space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                      {emp.avatarUrl ? (
                        <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-white text-base">{emp.name.slice(0, 1)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{emp.name}</h4>
                      <div className="text-[11px] text-slate-400 font-mono">{emp.nip}</div>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-800 text-indigo-300">
                        {emp.position}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Divisi:</span>
                    <span className="text-slate-200 font-medium">{emp.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shift:</span>
                    <span className="text-slate-200">{emp.shift}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PIN Kiosk:</span>
                    <span className="font-mono text-indigo-400 font-bold">{emp.pinCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">No. Kontak:</span>
                    <span className="font-mono text-slate-300">{emp.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setBadgeEmployee(emp)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak ID Badge
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingEmployee(emp);
                      setIsEmployeeModalOpen(true);
                    }}
                    className="p-1.5 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus karyawan ${emp.name}?`)) {
                        deleteEmployee(emp.id);
                      }
                    }}
                    className="p-1.5 hover:bg-slate-800 text-rose-400 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: LEAVE REQUESTS */}
      {subTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 p-4 rounded-xl text-xs">
            <div>
              <h3 className="font-bold text-white text-sm">Alur Persetujuan Cuti & Izin Kerja</h3>
              <p className="text-slate-400">Menampilkan seluruh pengajuan izin, sakit, dan cuti tahunan karyawan</p>
            </div>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Formulir Baru
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Karyawan</th>
                  <th className="py-3 px-4">Jenis Cuti / Izin</th>
                  <th className="py-3 px-4">Rentang Waktu</th>
                  <th className="py-3 px-4 text-center">Durasi</th>
                  <th className="py-3 px-4">Alasan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Disetujui Oleh</th>
                  <th className="py-3 px-4 text-center">Aksi HR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{req.employeeName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{req.nip}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-200">
                        {req.type === 'ANNUAL_LEAVE' ? 'Cuti Tahunan' :
                         req.type === 'SICK' ? 'Sakit (Dokter)' :
                         req.type === 'EMERGENCY_IZIN' ? 'Izin Mendesak' : req.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {req.startDate} s/d {req.endDate}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-white">
                      {req.days} hari
                    </td>

                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        req.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}>
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {req.approvedBy || '-'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => updateLeaveStatus(req.id, 'APPROVED', 'HR Admin')}
                            className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded cursor-pointer"
                            title="Setujui Pengajuan"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(req.id, 'REJECTED', 'HR Admin')}
                            className="p-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded cursor-pointer"
                            title="Tolak Pengajuan"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Diproses</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MONTHLY RECAP */}
      {subTab === 'monthly' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Rekapitulasi Kehadiran & Jam Kerja Bulan Oktober 2026</h3>
              <p className="text-xs text-slate-400">Akumulasi presensi, total keterlambatan, lembur, dan absensi per karyawan</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Unduh Laporan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Rata-rata Ketepatan Waktu</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">92.4%</div>
              <p className="text-[11px] text-slate-500 mt-1">Standar toleransi keterlambatan 5 menit</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Jam Lembur Disetujui</span>
              <div className="text-2xl font-bold text-indigo-400 font-mono">48.5 Jam</div>
              <p className="text-[11px] text-slate-500 mt-1">Dukungan batch lembur perakitan SPK ekspor</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Izin & Cuti Diambil</span>
              <div className="text-2xl font-bold text-blue-400 font-mono">6 Hari</div>
              <p className="text-[11px] text-slate-500 mt-1">Dari total kuota cuti tahunan pabrik</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        editEmployee={editingEmployee}
      />

      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />

      <EmployeeBadgeModal
        isOpen={!!badgeEmployee}
        onClose={() => setBadgeEmployee(null)}
        employee={badgeEmployee}
      />
    </div>
  );
};

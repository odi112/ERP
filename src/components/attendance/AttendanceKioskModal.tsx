import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  Camera, 
  QrCode, 
  CheckCircle, 
  AlertCircle, 
  User, 
  ShieldCheck, 
  Sparkles,
  Delete
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Employee } from '../../types/erp';

interface AttendanceKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceKioskModal: React.FC<AttendanceKioskModalProps> = ({ isOpen, onClose }) => {
  const { employees, attendance, clockIn, clockOut, quickCheckInByPin } = useERP();

  const [pin, setPin] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    employee?: Employee;
  } | null>(null);

  // Camera stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio Chime generator
  const playChime = (success: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (success) {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio not permitted or supported
    }
  };

  // Start webcam
  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
      setFeedback(null);
      setPin('');
      return;
    }

    // Try starting camera
    navigator.mediaDevices?.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      })
      .catch(() => {
        // Camera access denied or not available; fallback gracefully
        setCameraActive(false);
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeypadPress = (val: string) => {
    if (pin.length < 6) {
      const nextPin = pin + val;
      setPin(nextPin);
      if (nextPin.length === 4) {
        // Try quick check with 4-digit PIN
        processPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const processPin = (targetPin: string) => {
    const res = quickCheckInByPin(targetPin);
    if (res.success) {
      playChime(true);
      setFeedback({
        type: 'success',
        title: 'Presensi Berhasil Divalidasi!',
        message: res.message,
        employee: res.employee
      });
      setPin('');
      setTimeout(() => {
        setFeedback(null);
      }, 3500);
    } else {
      playChime(false);
      setFeedback({
        type: 'error',
        title: 'Verifikasi Gagal',
        message: res.message,
        employee: res.employee
      });
      setTimeout(() => {
        setPin('');
        setFeedback(null);
      }, 3000);
    }
  };

  const handleManualCheckIn = (emp: Employee) => {
    const res = quickCheckInByPin(emp.pinCode);
    if (res.success) {
      playChime(true);
      setFeedback({
        type: 'success',
        title: 'Presensi Terverifikasi!',
        message: res.message,
        employee: emp
      });
      setTimeout(() => setFeedback(null), 3500);
    } else {
      playChime(false);
      setFeedback({
        type: 'error',
        title: 'Perhatian',
        message: res.message,
        employee: emp
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[96vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Terminal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                ApexKiosk Terminal Presensi
              </h2>
              <p className="text-xs text-slate-400">
                Gerbang Utama Pabrik • Otentikasi PIN & Biometrik Wajah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Big Clock */}
            <div className="text-right hidden sm:block">
              <div className="font-mono text-2xl font-black text-white tracking-widest">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[11px] text-slate-400">
                Kamis, 15 Oktober 2026 (WIB)
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Feedback Banner if active */}
        {feedback && (
          <div className={`p-4 mx-6 mt-4 rounded-2xl border flex items-center gap-4 animate-scaleUp ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500 text-white' 
              : 'bg-rose-950/40 border-rose-500 text-white'
          }`}>
            <div className={`p-3 rounded-xl ${feedback.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              {feedback.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-base">{feedback.title}</h4>
              <p className="text-xs text-slate-200 mt-0.5">{feedback.message}</p>
              {feedback.employee && (
                <div className="text-xs font-semibold text-emerald-300 mt-1">
                  {feedback.employee.name} • {feedback.employee.nip} ({feedback.employee.department})
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Terminal Body: 2 Columns */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: PIN Pad & Camera Frame */}
          <div className="space-y-4">
            {/* Camera / Biometric Scan Frame */}
            <div className="relative aspect-video sm:h-52 w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center">
              {cameraActive ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover mirror"
                />
              ) : (
                <div className="text-center p-4">
                  <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-pulse" />
                  <span className="text-xs text-slate-400 block font-medium">
                    Kamera Biometrik Siap
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Posisikan wajah menghadap layar atau masukkan PIN
                  </span>
                </div>
              )}

              {/* Scanning visual crosshairs */}
              <div className="absolute inset-4 border-2 border-emerald-500/40 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between text-[10px] text-emerald-400 font-mono">
                  <span>FACIAL_RECOGNITION: READY</span>
                  <span>AI_CONF: 99.2%</span>
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                <div className="text-[10px] text-slate-400 font-mono">
                  GATE-01 TERMINAL
                </div>
              </div>
            </div>

            {/* PIN Entry Display */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400 font-medium block mb-2">
                Masukkan 4 Digit PIN Karyawan:
              </span>
              <div className="flex justify-center items-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-11 h-13 rounded-xl border-2 flex items-center justify-center font-mono text-2xl font-bold transition-all ${
                      pin[idx] 
                        ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                        : 'border-slate-800 bg-slate-900 text-slate-600'
                    }`}
                  >
                    {pin[idx] ? '●' : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeypadPress(digit)}
                  className="h-12 bg-slate-800/80 hover:bg-slate-700 text-white font-mono text-xl font-bold rounded-xl active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-12 bg-slate-800/40 hover:bg-slate-800 text-rose-400 font-semibold text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                CLEAR
              </button>
              <button
                onClick={() => handleKeypadPress('0')}
                className="h-12 bg-slate-800/80 hover:bg-slate-700 text-white font-mono text-xl font-bold rounded-xl active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-12 bg-slate-800/40 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Column 2: Quick Employee Tap List (for demo or RFID tap simulator) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Simulasi Tap Badge RFID Staf
                </span>
                <span className="text-[11px] text-slate-400">
                  Klik untuk clock in/out instan
                </span>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {employees.map((emp) => {
                  const todayAtt = attendance.find(a => a.employeeId === emp.id && a.date === '2026-10-15');
                  const isClockedIn = !!todayAtt?.clockInTime;
                  const isClockedOut = !!todayAtt?.clockOutTime;

                  return (
                    <button
                      key={emp.id}
                      onClick={() => handleManualCheckIn(emp)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                        isClockedOut
                          ? 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-70'
                          : isClockedIn
                          ? 'bg-blue-950/20 border-blue-900/40 text-blue-300 hover:border-blue-500'
                          : 'bg-slate-900 border-slate-800 hover:border-indigo-500 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.name.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-white truncate">{emp.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {emp.nip} • PIN: <span className="text-indigo-400 font-bold">{emp.pinCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isClockedOut ? 'bg-slate-800 text-slate-400' :
                          isClockedIn ? 'bg-blue-500/20 text-blue-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {isClockedOut ? 'Pulang' : isClockedIn ? 'Siap Clock-Out' : 'Clock-In'}
                        </span>
                        {todayAtt?.clockInTime && (
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                            In: {todayAtt.clockInTime.slice(0, 5)}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Shift: <strong className="text-slate-300">Shift 1 Pagi (07:00 - 15:00)</strong></span>
              <span className="text-emerald-400 font-medium">Terminal Online</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-center text-xs text-slate-400">
          Setiap aktivitas presensi otomatis terekam ke buku besar kehadiran, kalkulasi jam kerja, potongan keterlambatan, dan lembur (overtime).
        </div>
      </div>
    </div>
  );
};

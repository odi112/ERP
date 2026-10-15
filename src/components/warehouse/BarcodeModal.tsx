import React from 'react';
import { X, Printer, Barcode as BarcodeIcon, Tag, Check } from 'lucide-react';
import { InventoryItem } from '../../types/erp';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarcodeIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Label Barcode Rak & Inventaris</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Preview */}
        <div className="p-6 flex flex-col items-center">
          <div className="w-full bg-white text-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-300 font-mono printable-area">
            <div className="flex justify-between items-start border-b border-slate-300 pb-2 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">APEX INDUSTRIAL ERP</span>
                <div className="text-base font-extrabold tracking-tight">{item.sku}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-500 font-bold">BIN RACK</span>
                <div className="text-sm font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                  {item.binLocation}
                </div>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-800 mb-2 truncate">
              {item.name}
            </div>

            <div className="grid grid-cols-2 text-[10px] text-slate-600 mb-4 bg-slate-100 p-2 rounded">
              <div>Batch: <strong className="text-slate-900">{item.batchNumber}</strong></div>
              <div>Category: <strong className="text-slate-900">{item.category}</strong></div>
              <div>Min Stock: <strong className="text-slate-900">{item.minSafetyStock} {item.unit}</strong></div>
              <div>UOM: <strong className="text-slate-900">{item.unit.toUpperCase()}</strong></div>
            </div>

            {/* Generated Vector Barcode Pattern */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="flex items-end h-14 w-full justify-center gap-[2.5px] px-2 bg-white">
                {/* Visual algorithmic barcode bars based on SKU string */}
                {Array.from(item.barcode + item.sku).map((char, idx) => {
                  const code = char.charCodeAt(0);
                  const width = (code % 3) + 1;
                  const height = 40 + (code % 15);
                  return (
                    <div 
                      key={idx} 
                      className="bg-black" 
                      style={{ width: `${width * 1.5}px`, height: `${height}px` }} 
                    />
                  );
                })}
              </div>
              <span className="font-mono text-xs tracking-[0.25em] text-black font-semibold mt-1">
                {item.barcode}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center mt-4">
            Dapat ditempel pada bin rak penyimpanan atau kardus lot produksi untuk pemindaian scanner barcode fisik / RFID.
          </p>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Label Barcode
          </button>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { GameState, GameSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState | null;
  currentSettings: GameSettings;
  onExportSlot: (slotId: number) => void; // Giữ nguyên tên prop để tránh sửa App.tsx quá nhiều
  onImport: (file: File) => void;
  onUpdateSettings: (settings: GameSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, gameState, currentSettings, onExportSlot, onImport, onUpdateSettings 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-cinzel text-emerald-400 tracking-wider">HỆ THỐNG TRUYỀN TỐNG</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-10">
          <section className="space-y-4">
             <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-l-2 border-emerald-500 pl-3">Hiển Thị & AI</h3>
             <div className="space-y-4">
               <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700">
                  <label className="flex justify-between text-xs text-slate-300 mb-4 font-bold uppercase">
                    Độ sáng <span>{currentSettings.brightness}%</span>
                  </label>
                  <input 
                    type="range" min="50" max="150" 
                    value={currentSettings.brightness}
                    onChange={(e) => onUpdateSettings({...currentSettings, brightness: parseInt(e.target.value)})}
                    className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
                  />
               </div>

               <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700">
                 <span className="text-xs text-yellow-500 font-bold uppercase">Hiện gợi ý hành động</span>
                 <input 
                  type="checkbox" 
                  checked={currentSettings.showSuggestions} 
                  onChange={e => onUpdateSettings({...currentSettings, showSuggestions: e.target.checked})} 
                 />
               </div>
             </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-l-2 border-emerald-500 pl-3">Dữ Liệu Thế Giới</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Nút Xuất Tệp */}
              <button 
                disabled={!gameState}
                onClick={() => onExportSlot(1)}
                className={`flex items-center justify-between p-6 rounded-2xl border transition-all group active:scale-95 ${!gameState ? 'bg-slate-800 border-slate-700 opacity-40 cursor-not-allowed' : 'bg-emerald-600/10 border-emerald-500/30 hover:bg-emerald-600/20'}`}
              >
                <div className="text-left">
                  <span className="block text-sm font-black text-emerald-400 uppercase tracking-tighter">LƯU THẾ GIỚI (.JSON)</span>
                  <span className="text-[10px] text-slate-500 uppercase">Tải tệp dữ liệu hiện tại về máy của bạn</span>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400 group-hover:scale-110 transition-transform">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                   </svg>
                </div>
              </button>
              
              {/* Nút Nhập Tệp */}
              <label className="flex items-center justify-between p-6 bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 rounded-2xl transition-all cursor-pointer group active:scale-95">
                <div className="text-left">
                  <span className="block text-sm font-black text-blue-400 uppercase tracking-tighter">TẢI THẾ GIỚI LÊN</span>
                  <span className="text-[10px] text-slate-500 uppercase">Chọn tệp .json từ máy để tiếp tục hành trình</span>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full text-blue-400 group-hover:scale-110 transition-transform">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                   </svg>
                </div>
                <input type="file" className="hidden" accept=".json" onChange={(e) => e.target.files && onImport(e.target.files[0])} />
              </label>
            </div>
            {!gameState && (
              <p className="text-[9px] text-slate-600 text-center uppercase tracking-widest font-bold">
                Bạn cần khởi tạo thế giới trước khi có thể Lưu dữ liệu
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

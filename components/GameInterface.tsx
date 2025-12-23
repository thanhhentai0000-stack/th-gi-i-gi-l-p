
import React, { useState, useRef, useEffect } from 'react';
import { GameState, Choice, Item, GameSettings } from '../types';
import { generateSuggestions } from '../services/gemini';

interface GameInterfaceProps {
  state: GameState;
  onChoice: (choice: Choice) => void;
  onUseItem: (item: Item) => void;
  onUpdateSettings: (settings: GameSettings) => void;
  onExit: () => void;
  isLoading: boolean;
  onOpenSettings: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ 
  state, onChoice, onUseItem, onUpdateSettings, onExit, isLoading, onOpenSettings 
}) => {
  const { stats, world, settings, history } = state;
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isCharSheetOpen, setIsCharSheetOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [customAction, setCustomAction] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHistoryOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isHistoryOpen]);

  const toggleMature = () => {
    onUpdateSettings({ ...settings, isMature: !settings.isMature });
  };

  const handleCustomAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAction.trim() && !isLoading) {
      onChoice({ label: customAction, action: customAction });
      setCustomAction("");
      setSuggestions([]);
    }
  };

  const getSuggestions = async () => {
    if (isSuggesting || isLoading) return;
    setIsSuggesting(true);
    try {
      const sugs = await generateSuggestions(state);
      setSuggestions(sugs);
    } catch (err) {
      console.error("Suggestion error", err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch(rarity) {
      case 'Uncommon': return 'text-green-400';
      case 'Rare': return 'text-blue-400';
      case 'Epic': return 'text-purple-400';
      case 'Legendary': return 'text-orange-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[95vh] flex flex-col md:flex-row gap-6 p-4 animate-fade-in relative overflow-hidden">
      {/* Top Floating Controls */}
      <div className="absolute top-6 right-6 z-40 flex items-center gap-3">
        {/* Home Icon (Quay lại trang tạo thế giới) */}
        <button 
          onClick={onExit}
          className="p-3 bg-slate-800/80 hover:bg-slate-700 rounded-full border border-slate-700 transition-all shadow-lg flex items-center gap-2 group"
          title="Về trang khởi tạo & Lưu tự động"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        {/* Toggle History (Cốt truyện) */}
        <button 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className={`p-3 rounded-full border transition-all shadow-lg flex items-center gap-2 ${isHistoryOpen ? 'bg-blue-600 border-blue-400' : 'bg-slate-800/80 border-slate-700 hover:border-blue-500'}`}
          title="Lịch sử hành trình"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs font-bold uppercase hidden md:inline">Lịch Sử</span>
        </button>

        {/* Character Sheet (Icon Hình Người) */}
        <button 
          onClick={() => setIsCharSheetOpen(true)}
          className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-full border border-emerald-400 transition-all shadow-lg flex items-center gap-2 group"
          title="Thông tin nhân vật"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-bold uppercase hidden md:inline text-white">Nhân Vật</span>
        </button>

        <button 
          onClick={toggleMature}
          className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all shadow-lg ${settings.isMature ? 'bg-red-600/90 border-red-400 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'}`}
        >
          <span className="text-[10px] font-black uppercase tracking-tighter">18+</span>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.isMature ? 'bg-red-400' : 'bg-slate-600'}`}>
            <div className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform ${settings.isMature ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        <button onClick={onOpenSettings} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full border border-slate-700 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0 a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        </button>
      </div>

      {/* Main Game Content Area */}
      <div className="flex-grow flex flex-col gap-4 overflow-hidden relative">
        {/* Visual View */}
        {settings.showImages && (
          <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-slate-700 shadow-2xl group shrink-0">
            {state.currentImage ? (
              <img src={state.currentImage} alt="Scene" className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-125" />
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col gap-4 text-slate-700">
                <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-sm font-cinzel animate-pulse">Đang phác họa vận mệnh...</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-8">
               <h2 className="text-3xl font-cinzel text-white drop-shadow-2xl">{state.currentScene?.title}</h2>
               <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{state.location}</p>
            </div>
          </div>
        )}

        {/* Narrative Description */}
        <div className={`flex-grow bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 overflow-y-auto custom-scrollbar shadow-inner relative ${isHistoryOpen ? 'md:max-w-[40%]' : ''} transition-all duration-500`}>
           {state.currentScene && (
             <div className="leading-relaxed text-slate-200 font-quicksand text-xl">
                {state.currentScene.description.split('\n').map((para, i) => (
                  <p key={i} className="mb-6 last:mb-0 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>{para}</p>
                ))}
             </div>
           )}
        </div>

        {/* Interaction Bar */}
        <div className="bg-slate-900/90 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
          {/* Preset Choices */}
          <div className="flex flex-wrap gap-3 justify-center">
            {!isLoading && state.currentScene?.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => onChoice(choice)}
                className="px-6 py-3 bg-slate-800 hover:bg-emerald-800 text-emerald-100 rounded-xl border border-slate-700 hover:border-emerald-400 transition-all text-sm font-bold shadow-md"
              >
                {choice.label}
              </button>
            ))}
          </div>

          {/* Custom Action Input + Lightbulb Suggestion */}
          <div className="flex items-center gap-3">
             {settings.showSuggestions && (
               <button 
                onClick={getSuggestions}
                disabled={isSuggesting || isLoading}
                className={`p-4 rounded-2xl border transition-all shadow-lg ${isSuggesting ? 'bg-yellow-600 border-yellow-400 animate-pulse' : 'bg-slate-800 border-slate-700 hover:bg-yellow-900/20 hover:border-yellow-500'}`}
                title="Gợi ý hành động"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isSuggesting ? 'text-white' : 'text-yellow-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9-.4-2.593-1.003l-.548-.547z" />
                  </svg>
               </button>
             )}

             <form onSubmit={handleCustomAction} className="flex-grow flex items-center bg-slate-800 border border-slate-700 rounded-2xl px-4 py-1 focus-within:border-emerald-500 transition-all">
               <input 
                type="text" 
                placeholder={isLoading ? "Vận mệnh đang xoay vần..." : "Bạn sẽ làm gì tiếp theo?"}
                className="w-full bg-transparent outline-none py-3 text-slate-100 disabled:opacity-50"
                value={customAction}
                onChange={e => setCustomAction(e.target.value)}
                disabled={isLoading}
               />
               <button type="submit" disabled={!customAction.trim() || isLoading} className="p-2 text-emerald-400 disabled:text-slate-600 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                 </svg>
               </button>
             </form>
          </div>

          {/* AI Suggestions Display */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => { onChoice({ label: s, action: s }); setSuggestions([]); }}
                  className="text-[10px] font-bold uppercase tracking-wider bg-yellow-900/10 border border-yellow-800/30 text-yellow-500 px-3 py-1 rounded-full hover:bg-yellow-800/20 transition-all"
                >
                  Gợi ý: {s}
                </button>
              ))}
              <button onClick={() => setSuggestions([])} className="text-[10px] text-slate-500 font-bold uppercase">Đóng</button>
            </div>
          )}
        </div>
      </div>

      {/* History Side Panel (Cốt truyện ẩn hiện) */}
      <div className={`fixed top-0 right-0 h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 z-50 transition-all duration-500 shadow-2xl ${isHistoryOpen ? 'w-full md:w-[400px] translate-x-0' : 'w-0 translate-x-full overflow-hidden'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-cinzel text-blue-400 tracking-widest">BIÊN NIÊN SỬ</h2>
             <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-6">
            {history.map((entry) => (
              <div key={entry.id} className={`p-4 rounded-2xl border ${entry.type === 'action' ? 'bg-slate-800/50 border-slate-700 italic text-emerald-400 text-sm' : 'bg-slate-900/50 border-slate-800 text-slate-300'}`}>
                 <span className="text-[9px] font-bold text-slate-600 block mb-1 uppercase tracking-tighter">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                 {entry.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Character Profile Modal (Human Icon) */}
      {isCharSheetOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            {/* Left: Stats & Profile */}
            <div className="w-full md:w-1/2 p-8 border-r border-slate-800 flex flex-col gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-900/50 border-2 border-emerald-400 flex items-center justify-center text-4xl font-bold text-white shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                    {world.protagonist.name[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-cinzel text-emerald-400">{world.protagonist.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{stats.currentStage}</p>
                    <p className="text-xs text-blue-400 mt-1">Cấp độ {stats.level} ({stats.xp} XP)</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <StatProgress label="Máu (HP)" current={stats.hp} max={stats.maxHp} color="bg-red-500" />
                  <StatProgress label="Mana (MP)" current={stats.mana} max={stats.maxMana} color="bg-blue-500" />
                  <StatProgress label="Thể lực" current={stats.stamina} max={stats.maxStamina} color="bg-orange-500" />
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                     <span className="text-[9px] text-slate-500 uppercase font-bold">Cảm ngộ (Wisdom)</span>
                     <span className="text-lg font-cinzel text-purple-400">{stats.wisdom}</span>
                  </div>
               </div>

               <div className="space-y-3 pt-4 border-t border-slate-800">
                  <AttrItem label="Sức tấn công" value={stats.attack} icon="⚔️" color="text-red-400" />
                  <AttrItem label="Trí tuệ" value={stats.intelligence} icon="🧠" color="text-blue-400" />
                  <AttrItem label="May mắn" value={stats.luck} icon="🍀" color="text-yellow-400" />
               </div>

               <div className="mt-auto">
                 <h4 className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">Tiểu sử vận mệnh</h4>
                 <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-4">"{world.protagonist.biography}"</p>
               </div>
            </div>

            {/* Right: Inventory & Gear */}
            <div className="w-full md:w-1/2 p-8 bg-slate-950/50 flex flex-col">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-cinzel text-slate-300">HÀNH TRANG</h3>
                  <button onClick={() => setIsCharSheetOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 h-[400px]">
                  {state.inventory.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-slate-600 gap-4">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                       </svg>
                       <p className="text-xs uppercase font-bold tracking-widest">Túi đồ trống rỗng</p>
                    </div>
                  ) : (
                    state.inventory.map(item => (
                      <button 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className={`group p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 relative ${getRarityColor(item.rarity).replace('text-', 'border-').replace('400', '900/40')} bg-slate-900/40 hover:scale-[1.02] active:scale-95`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${getRarityColor(item.rarity)}`}>{item.name}</span>
                          <span className="text-[8px] text-slate-600 font-bold uppercase">{item.type}</span>
                        </div>
                        <p className="text-[9px] text-slate-500 line-clamp-2 italic">"{item.description}"</p>
                      </button>
                    ))
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Usage Popup */}
      {selectedItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800">
               <div className="flex justify-between items-start mb-4">
                 <h3 className={`text-2xl font-cinzel font-bold ${getRarityColor(selectedItem.rarity)}`}>{selectedItem.name}</h3>
                 <span className="text-[10px] bg-slate-800 px-3 py-1.5 rounded-full text-slate-400 uppercase tracking-widest border border-slate-700">{selectedItem.type}</span>
               </div>
               <p className="text-slate-300 italic text-sm leading-relaxed">"{selectedItem.description}"</p>
            </div>
            <div className="p-8 space-y-6">
              {selectedItem.effect && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl">
                  <span className="text-[10px] text-emerald-500 font-bold uppercase block mb-1 tracking-widest">Hiệu ứng kích hoạt</span>
                  <p className="text-emerald-200 font-medium">{selectedItem.effect}</p>
                </div>
              )}
              <div className="flex gap-4">
                <button 
                  onClick={() => { onUseItem(selectedItem); setSelectedItem(null); setIsCharSheetOpen(false); }}
                  className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all transform active:scale-95 shadow-xl shadow-emerald-900/20"
                >
                  SỬ DỤNG
                </button>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold transition-all border border-slate-700"
                >
                  ĐÓNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatProgress = ({ label, current, max, color }: any) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
      <span>{label}</span>
      <span className="text-slate-300">{current} / {max}</span>
    </div>
    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
      <div className={`${color} h-full transition-all duration-1000 ease-out`} style={{ width: `${Math.min(100, (current / max) * 100)}%` }} />
    </div>
  </div>
);

const AttrItem = ({ label, value, icon, color }: any) => (
  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</span>
    </div>
    <span className={`text-base font-cinzel font-bold ${color}`}>{value}</span>
  </div>
);

export default GameInterface;

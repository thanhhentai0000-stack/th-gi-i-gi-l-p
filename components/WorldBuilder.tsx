
import React, { useState, useEffect } from 'react';
import { WorldConfig, CharacterProfile } from '../types.ts';
import { fetchCanonicalLore } from '../services/gemini.ts';

interface WorldBuilderProps {
  onStart: (config: WorldConfig, textModel: string, imageModel: string, aiProvider: 'gemini' | 'grok' | 'gpt', showImages: boolean, isMature: boolean, showSuggestions: boolean) => void;
  onOpenSettings: () => void;
  onConfigChange: (config: WorldConfig) => void;
}

const SUGGESTED_TAGS = ["Horror", "Loli", "Milf", "Fantasy", "Action", "Romance", "Adventure", "Stealth", "Isekai", "Xianxia", "Cyberpunk", "Medieval"];

const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Dễ', color: 'text-green-400', desc: 'Kẻ địch yếu, tài nguyên dồi dào.' },
  { id: 'medium', label: 'Trung Bình', color: 'text-blue-400', desc: 'Thử thách vừa đủ cho người mới.' },
  { id: 'hard', label: 'Khó', color: 'text-yellow-400', desc: 'Kẻ địch khôn ngoan, tài nguyên khan hiếm.' },
  { id: 'hell', label: 'Địa Ngục', color: 'text-orange-500', desc: 'Mọi sai lầm đều phải trả giá bằng máu.' },
  { id: 'asian', label: 'Asian', color: 'text-red-500', desc: 'Một mạng duy nhất. Game Over = Xoá dữ liệu.' },
];

const WorldBuilder: React.FC<WorldBuilderProps> = ({ onStart, onOpenSettings, onConfigChange }) => {
  const [activeTab, setActiveTab] = useState<'world' | 'char' | 'stages' | 'tags' | 'ai'>('world');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [textModel, setTextModel] = useState("gemini-3-flash-preview");
  const [imageModel, setImageModel] = useState("gemini-2.5-flash-image");
  const [aiProvider, setAiProvider] = useState<'gemini' | 'grok' | 'gpt'>('gemini');
  const [showImages, setShowImages] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isMature, setIsMature] = useState(false);

  const [config, setConfig] = useState<WorldConfig>({
    name: "Tân Thế Giới",
    referenceWork: "",
    genre: "High Fantasy",
    difficulty: 50,
    difficultyLevel: 'medium',
    emotionalIntensity: 60,
    atmosphere: "Hùng tráng, Huyền bí",
    protagonist: {
      name: "Hạo Nhiên",
      age: "21",
      gender: "Nam",
      appearance: "Áo choàng đen, ánh mắt sắc lẹm.",
      personality: "Quyết đoán, trầm mặc.",
      biography: "Kẻ sống sót cuối cùng của một gia tộc bị lãng quên.",
      goal: "Tìm lại sự thật về nguồn gốc sức mạnh của mình."
    },
    tags: ["Horror", "Adventure"],
    cultivationStages: ["Phàm Nhân", "Luyện Khí", "Trúc Cơ", "Kim Đan"],
    customHook: "Tỉnh dậy giữa một tàn tích cổ xưa sau ngàn năm giấc ngủ.",
    detailedContext: "Thế giới nơi ma thuật bị coi là cấm thuật, những kẻ sở hữu sức mạnh phải lẩn trốn sự truy quét của Thánh Hội."
  });

  const [customTag, setCustomTag] = useState("");
  const [customStage, setCustomStage] = useState("");

  useEffect(() => {
    onConfigChange(config);
  }, [config]);

  const handleAiSupplement = async () => {
    if (!config.referenceWork) {
      alert("Vui lòng nhập tên tác phẩm trước!");
      return;
    }
    setIsAiLoading(true);
    try {
      const lore = await fetchCanonicalLore(config.referenceWork, textModel);
      setConfig(prev => ({
        ...prev,
        ...lore,
        protagonist: { ...prev.protagonist, ...(lore.protagonist || {}) }
      }));
    } catch (err) {
      alert("Lỗi khi kết nối với AI Engine.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setConfig(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const addCustomTag = () => {
    if (customTag && !config.tags.includes(customTag)) {
      toggleTag(customTag);
      setCustomTag("");
    }
  };

  const addCustomStage = () => {
    if (customStage && !config.cultivationStages.includes(customStage)) {
      setConfig(prev => ({ ...prev, cultivationStages: [...prev.cultivationStages, customStage] }));
      setCustomStage("");
    }
  };

  const removeStage = (idx: number) => {
    setConfig(prev => ({ ...prev, cultivationStages: prev.cultivationStages.filter((_, i) => i !== idx) }));
  };

  const updateProtagonist = (field: keyof CharacterProfile, value: string) => {
    setConfig(prev => ({ ...prev, protagonist: { ...prev.protagonist, [field]: value } }));
  };

  const getEmotionalLabel = (val: number) => {
    if (val < 30) return "Lạnh lùng";
    if (val < 60) return "Bình thường";
    if (val < 90) return "Sâu sắc";
    return "Vỡ òa (Biểu cảm ký tự)";
  };

  return (
    <div className="relative max-w-5xl mx-auto p-8 bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl animate-fade-in min-h-[600px] flex flex-col text-slate-100">
      <button 
        onClick={onOpenSettings}
        className="absolute top-6 right-6 z-30 p-3 bg-slate-800/80 hover:bg-emerald-600 rounded-full border border-slate-700 transition-all group shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-cinzel text-emerald-400 tracking-wider">KHỞI TẠO VẬN MỆNH</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">RPG_VN by Trần Thiên Hạo</p>
      </div>

      <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-grow">
          <label className="text-[10px] font-bold text-emerald-400 uppercase mb-1 block">Dựa trên tác phẩm (Lore)</label>
          <input 
            type="text" 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none text-white focus:ring-1 focus:ring-emerald-500"
            placeholder="Ví dụ: Naruto, Harry Potter, Chúa Nhẫn..."
            value={config.referenceWork}
            onChange={e => setConfig({...config, referenceWork: e.target.value})}
          />
        </div>
        <button 
          onClick={handleAiSupplement}
          disabled={isAiLoading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold px-6 py-3 rounded-lg text-xs transition-all active:scale-95 shadow-lg"
        >
          {isAiLoading ? "ĐANG QUÉT..." : "AI HỖ TRỢ"}
        </button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-800 overflow-x-auto custom-scrollbar">
        {[
          {id: 'world', label: 'Thế giới'},
          {id: 'char', label: 'Nhân vật'},
          {id: 'stages', label: 'Cấp bậc'},
          {id: 'tags', label: 'Chủ đề'},
          {id: 'ai', label: 'Hệ thống AI'}
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2 px-4 font-bold transition-all uppercase text-[10px] tracking-widest whitespace-nowrap ${activeTab === tab.id ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 mb-6 min-h-[350px]">
        {activeTab === 'world' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
             <div className="space-y-6">
               <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tên Thế Giới</label>
                <input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none" value={config.name} onChange={e => setConfig({...config, name: e.target.value})} />
               </div>
               <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Thể Loại</label>
                <input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none" value={config.genre} onChange={e => setConfig({...config, genre: e.target.value})} />
               </div>
               
               {/* Lựa chọn độ khó */}
               <div>
                 <label className="text-[10px] font-bold text-emerald-400 uppercase mb-3 block">Độ Khó Thế Giới</label>
                 <div className="grid grid-cols-2 gap-2">
                    {DIFFICULTY_LEVELS.map(level => (
                      <button 
                        key={level.id}
                        onClick={() => setConfig({...config, difficultyLevel: level.id as any})}
                        className={`p-3 rounded-xl border transition-all text-left flex flex-col gap-1 ${config.difficultyLevel === level.id ? 'bg-slate-800 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                      >
                        <span className={`text-xs font-black uppercase ${level.color}`}>{level.label}</span>
                        <span className="text-[8px] text-slate-500 leading-tight">{level.desc}</span>
                      </button>
                    ))}
                 </div>
               </div>
             </div>

             <div className="space-y-4">
               <div>
                <label className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">BỐI CẢNH CHI TIẾT (QUAN TRỌNG)</label>
                <textarea 
                  className="w-full bg-slate-800 border border-emerald-900/30 rounded-lg p-3 h-[250px] resize-none text-sm text-white focus:border-emerald-500 outline-none shadow-inner" 
                  placeholder="Mô tả lịch sử, các phe phái, quy luật sức mạnh hoặc bất kỳ chi tiết nào bạn muốn AI tuân thủ..."
                  value={config.detailedContext} 
                  onChange={e => setConfig({...config, detailedContext: e.target.value})} 
                />
               </div>
             </div>
          </div>
        )}

        {activeTab === 'char' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="space-y-4">
               <div className="grid grid-cols-3 gap-2">
                 <div className="col-span-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase">Tên</label>
                   <input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-white" value={config.protagonist.name} onChange={e => updateProtagonist('name', e.target.value)} />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-slate-500 uppercase">Tuổi</label>
                   <input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-white" value={config.protagonist.age} onChange={e => updateProtagonist('age', e.target.value)} />
                 </div>
               </div>
               <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Ngoại Hình</label>
                <textarea className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 h-20 resize-none text-sm text-white" value={config.protagonist.appearance} onChange={e => updateProtagonist('appearance', e.target.value)} />
               </div>
            </div>
            <div className="space-y-4">
               <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Mục Tiêu</label>
                <textarea className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 h-20 resize-none text-sm text-white" value={config.protagonist.goal} onChange={e => updateProtagonist('goal', e.target.value)} />
               </div>
               <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tiểu Sử</label>
                <textarea className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 h-20 resize-none text-sm text-white" value={config.protagonist.biography} onChange={e => updateProtagonist('biography', e.target.value)} />
               </div>
            </div>
          </div>
        )}

        {activeTab === 'stages' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex gap-2">
               <input type="text" className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex-grow text-sm text-white" placeholder="Cấp bậc sức mạnh mới..." value={customStage} onChange={e => setCustomStage(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomStage()} />
               <button onClick={addCustomStage} className="px-6 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold">THÊM</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
               {config.cultivationStages.map((stage, idx) => (
                 <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700 rounded-xl group">
                    <span className="w-6 h-6 flex items-center justify-center bg-slate-700 rounded-full text-[10px] font-bold text-emerald-400">{idx + 1}</span>
                    <span className="flex-grow text-sm font-semibold text-slate-200">{stage}</span>
                    <button onClick={() => removeStage(idx)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-900/20 rounded-lg text-xs">XÓA</button>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-8 animate-fade-in">
             <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
               <label className="text-[10px] font-bold text-emerald-400 uppercase block mb-4 tracking-widest flex justify-between">
                 Độ chân thật cảm xúc NPC 
                 <span className="text-white">{getEmotionalLabel(config.emotionalIntensity)} ({config.emotionalIntensity}%)</span>
               </label>
               <input 
                type="range" 
                min="0" max="100" 
                className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mb-2"
                value={config.emotionalIntensity}
                onChange={e => setConfig({...config, emotionalIntensity: parseInt(e.target.value)})}
               />
               <p className="text-[9px] text-slate-500 uppercase italic">Mức độ tối đa sẽ kích hoạt biểu cảm bằng ký tự đặc biệt (Kaomoji) trong hội thoại.</p>
             </div>

             <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-4">Các tag đã thêm</label>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl">
                    {config.tags.length === 0 ? (
                      <span className="text-[10px] text-slate-600 uppercase italic">Chưa có tag nào được chọn...</span>
                    ) : (
                      config.tags.map(tag => (
                        <div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/50 rounded-lg group animate-fade-in">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">{tag}</span>
                          <button onClick={() => toggleTag(tag)} className="text-emerald-500 hover:text-red-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
               </div>

               <div>
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Tag gợi ý (Đừng bỏ qua Horror, Loli, Milf)</label>
                 <div className="flex flex-wrap gap-2">
                   {SUGGESTED_TAGS.map(tag => (
                     <button 
                        key={tag} 
                        onClick={() => toggleTag(tag)} 
                        className={`px-4 py-2 rounded-full border text-[10px] font-bold transition-all ${config.tags.includes(tag) ? 'bg-emerald-600 border-emerald-400 text-white opacity-50 cursor-default' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                        disabled={config.tags.includes(tag)}
                     >
                       {tag}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="flex gap-2">
                 <input type="text" className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex-grow text-sm text-white outline-none focus:border-emerald-500" placeholder="Thêm tag tự chọn..." value={customTag} onChange={e => setCustomTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomTag()} />
                 <button onClick={addCustomTag} className="px-6 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-lg shadow-emerald-900/20">THÊM</button>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
               <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-[10px]">Nhà cung cấp trí tuệ</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {['gemini', 'grok', 'gpt'].map((p) => (
                   <button 
                    key={p}
                    onClick={() => setAiProvider(p as any)}
                    className={`p-4 rounded-xl border transition-all text-center ${aiProvider === p ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/50'}`}
                   >
                     <span className="font-bold text-white text-xs uppercase">{p.toUpperCase()}</span>
                   </button>
                 ))}
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-[10px]">Model Văn Bản</h3>
                <div className="flex flex-col gap-2">
                   {["gemini-3-flash-preview", "gemini-3-pro-preview"].map(m => (
                     <button key={m} onClick={() => setTextModel(m)} className={`p-3 rounded-lg border text-xs text-left ${textModel === m ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-slate-700 text-slate-500'}`}>
                        {m === 'gemini-3-flash-preview' ? 'Standard (Nhanh)' : 'Elite (Sâu sắc)'}
                     </button>
                   ))}
                </div>
              </div>
              <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-[10px]">Tùy chọn hiển thị</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg">
                    <span className="text-xs text-slate-300">Hiện hình ảnh</span>
                    <input type="checkbox" checked={showImages} onChange={e => setShowImages(e.target.checked)} />
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg">
                    <span className="text-xs text-yellow-500 font-bold uppercase">Gợi ý hành động</span>
                    <input type="checkbox" checked={showSuggestions} onChange={e => setShowSuggestions(e.target.checked)} />
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg">
                    <span className="text-xs text-red-400 font-bold uppercase">Chế độ 18+</span>
                    <input type="checkbox" checked={isMature} onChange={e => setIsMature(e.target.checked)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={() => onStart(config, textModel, imageModel, aiProvider, showImages, isMature, showSuggestions)}
        className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg font-cinzel"
      >
        KHAI MỞ VẬN MỆNH
      </button>
    </div>
  );
};

export default WorldBuilder;

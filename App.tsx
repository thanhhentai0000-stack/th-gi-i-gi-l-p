
import React, { useState, useEffect, useRef } from 'react';
import { WorldConfig, GameState, Choice, LogEntry, GameSettings, CharacterStats, Item } from './types.ts';
import WorldBuilder from './components/WorldBuilder.tsx';
import GameInterface from './components/GameInterface.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import { generateInitialScene, processPlayerAction, generateSceneImage } from './services/gemini.ts';

enum AppStatus {
  SETUP,
  INITIALIZING,
  PLAYING,
  ERROR,
  GAMEOVER
}

const INITIAL_STATS: Omit<CharacterStats, 'currentStage'> = {
  hp: 100, maxHp: 100,
  stamina: 100, maxStamina: 100,
  mana: 80, maxMana: 80,
  luck: 10, intelligence: 10, wisdom: 10,
  attack: 15, level: 1, xp: 0
};

const DEFAULT_SETTINGS: GameSettings = { 
  brightness: 100, 
  isMature: false,
  textModel: "gemini-3-flash-preview",
  imageModel: "gemini-2.5-flash-image",
  aiProvider: "gemini",
  showImages: true,
  showSuggestions: true
};

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.SETUP);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentBuildingConfig, setCurrentBuildingConfig] = useState<WorldConfig | null>(null);

  const stateRef = useRef<GameState | null>(null);
  useEffect(() => { stateRef.current = gameState; }, [gameState]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('rpg_vn_settings');
    if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
  }, []);

  const checkApiKeyRequirement = async (textModel: string, imageModel: string) => {
    if (imageModel === 'gemini-3-pro-image-preview' || textModel === 'gemini-3-pro-preview') {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
    }
  };

  const startWorld = async (config: WorldConfig, selectedTextModel: string, selectedImageModel: string, provider: 'gemini' | 'grok' | 'gpt', showImages: boolean, isMature: boolean, showSuggestions: boolean) => {
    setLoading(true);
    setStatus(AppStatus.INITIALIZING);
    
    const newSettings: GameSettings = { ...settings, textModel: selectedTextModel, imageModel: selectedImageModel, aiProvider: provider, showImages, isMature, showSuggestions };
    setSettings(newSettings);
    localStorage.setItem('rpg_vn_settings', JSON.stringify(newSettings));

    try {
      await checkApiKeyRequirement(selectedTextModel, selectedImageModel);
      const scene = await generateInitialScene(config, newSettings);
      
      let imageUrl = null;
      if (showImages) {
        imageUrl = await generateSceneImage(scene.imagePrompt, selectedImageModel);
      }
      
      const initialState: GameState = {
        world: config,
        stats: { ...INITIAL_STATS, currentStage: config.cultivationStages[0] || "Vô Danh" },
        inventory: [],
        location: scene.title,
        history: [{ id: Date.now().toString(), type: 'narrative', content: scene.description, timestamp: Date.now() }],
        currentScene: scene,
        currentImage: imageUrl,
        settings: newSettings
      };
      setGameState(initialState);
      setStatus(AppStatus.PLAYING);
    } catch (err) {
      setError("Thiên thư bị nhiễu loạn. Vui lòng thử lại.");
      setStatus(AppStatus.ERROR);
    } finally { setLoading(false); }
  };

  const handleAction = async (action: string) => {
    if (!gameState || loading) return;
    setLoading(true);

    const actionLog: LogEntry = { id: `act-${Date.now()}`, type: 'action', content: action, timestamp: Date.now() };
    setGameState(prev => prev ? { ...prev, history: [...prev.history, actionLog] } : null);

    try {
      await checkApiKeyRequirement(settings.textModel, settings.imageModel);
      const nextScene = await processPlayerAction(gameState, action);
      
      let imageUrl = null;
      if (settings.showImages) {
        imageUrl = await generateSceneImage(nextScene.imagePrompt, settings.imageModel);
      }

      setGameState(prev => {
        if (!prev) return null;
        const newStats = { ...prev.stats };
        if (nextScene.statChanges) {
          newStats.hp = Math.max(0, Math.min(newStats.maxHp, newStats.hp + (nextScene.statChanges.hp || 0)));
          newStats.mana = Math.max(0, Math.min(newStats.maxMana, newStats.mana + (nextScene.statChanges.mana || 0)));
          newStats.stamina = Math.max(0, Math.min(newStats.maxStamina, newStats.stamina + (nextScene.statChanges.stamina || 0)));
          newStats.xp = newStats.xp + (nextScene.statChanges.xp || 0);
          newStats.level = nextScene.statChanges.level || newStats.level;
          newStats.attack = nextScene.statChanges.attack || newStats.attack;
          newStats.intelligence = nextScene.statChanges.intelligence || newStats.intelligence;
          newStats.luck = nextScene.statChanges.luck || newStats.luck;
          if (nextScene.statChanges.currentStage) newStats.currentStage = nextScene.statChanges.currentStage;
        }

        if (newStats.hp <= 0) {
           setStatus(AppStatus.GAMEOVER);
        }

        let newInventory = [...prev.inventory];
        if (nextScene.newItems) newInventory = [...newInventory, ...nextScene.newItems];
        if (nextScene.removeItemIds) {
          newInventory = newInventory.filter(i => !nextScene.removeItemIds?.includes(i.id));
        }

        return {
          ...prev,
          location: nextScene.title,
          stats: newStats,
          inventory: newInventory,
          currentScene: nextScene,
          currentImage: imageUrl,
          history: [...prev.history, { id: `nar-${Date.now()}`, type: 'narrative', content: nextScene.description, timestamp: Date.now() }]
        };
      });
    } catch (err) { setError("Vận mệnh bị đứt đoạn."); } finally { setLoading(false); }
  };

  const handleExportData = () => {
    let dataToSave: GameState | null = stateRef.current;

    if (!dataToSave && status === AppStatus.SETUP && currentBuildingConfig) {
      dataToSave = {
        world: currentBuildingConfig,
        stats: { ...INITIAL_STATS, currentStage: currentBuildingConfig.cultivationStages[0] || "Khởi Đầu" },
        inventory: [],
        location: "Khởi tạo",
        history: [],
        currentScene: null,
        currentImage: null,
        settings: settings
      };
    }

    if (!dataToSave) {
      alert("Không có dữ liệu để lưu!");
      return;
    }

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RPG_VN_${dataToSave.world.name}_${new Date().toLocaleDateString('vi-VN')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData && importedData.world) {
          setGameState(importedData);
          if (importedData.settings) setSettings(importedData.settings);
          setStatus(AppStatus.PLAYING);
          setIsSettingsOpen(false);
        }
      } catch (err) {
        alert("Tệp tin không hợp lệ!");
      }
    };
    reader.readAsText(file);
  };

  const updateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem('rpg_vn_settings', JSON.stringify(newSettings));
    if (gameState) setGameState({ ...gameState, settings: newSettings });
  };

  const handleExitToSetup = () => {
    if (window.confirm("Bạn có chắc chắn muốn thoát về trang chính? Đừng quên lưu dữ liệu nếu cần!")) {
      setGameState(null);
      setError(null);
      setStatus(AppStatus.SETUP);
    }
  };

  const handleReset = () => {
    if (gameState?.world.difficultyLevel === 'asian') {
      alert("CHẾ ĐỘ ASIAN: Cái chết là sự kết thúc vĩnh viễn. Dữ liệu hiện tại đã bị xoá.");
    }
    setGameState(null);
    setStatus(AppStatus.SETUP);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-4 transition-all duration-300" style={{ filter: `brightness(${settings.brightness}%)` }}>
      {status === AppStatus.SETUP && (
        <WorldBuilder 
          onStart={startWorld} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onConfigChange={(config) => setCurrentBuildingConfig(config)}
        />
      )}
      {status === AppStatus.INITIALIZING && (
        <div className="flex flex-col items-center gap-6 animate-fade-in text-center">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin" />
          <h2 className="text-xl font-cinzel text-emerald-400 tracking-widest animate-pulse">ĐANG KHAI MỞ THẾ GIỚI...</h2>
        </div>
      )}
      {status === AppStatus.PLAYING && gameState && (
        <GameInterface 
          state={gameState} 
          onChoice={(c) => handleAction(c.action)} 
          onUseItem={(i) => handleAction(`Sử dụng: ${i.name}`)}
          onUpdateSettings={updateSettings}
          onExit={handleExitToSetup}
          isLoading={loading} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
        />
      )}
      {status === AppStatus.GAMEOVER && (
        <div className="max-w-2xl w-full text-center p-12 bg-slate-900 border-2 border-red-500 rounded-3xl animate-fade-in shadow-[0_0_50px_rgba(239,68,68,0.3)]">
           <h2 className="text-5xl font-cinzel text-red-500 mb-6 tracking-tighter">VẬN MỆNH KẾT THÚC</h2>
           <p className="text-slate-400 mb-4 text-lg">Anh hùng của bạn đã ngã xuống giữa dòng đời nghiệt ngã.</p>
           {gameState?.world.difficultyLevel === 'asian' && (
             <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-xl mb-8">
               <p className="text-red-400 font-bold uppercase tracking-widest">Asian Mode Penalty:</p>
               <p className="text-red-500 text-sm">Toàn bộ dữ liệu thế giới này đã bị huỷ diệt.</p>
             </div>
           )}
           <button 
            onClick={handleReset} 
            className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-xl shadow-red-900/40"
           >
             QUAY LẠI KHỞI ĐẦU
           </button>
        </div>
      )}
      {status === AppStatus.ERROR && (
        <div className="text-center p-12 bg-slate-900 border border-red-500/50 rounded-3xl">
          <h2 className="text-2xl font-cinzel text-red-500 mb-4">LỖI THIÊN ĐẠO</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 rounded-xl font-bold">QUAY LẠI</button>
        </div>
      )}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        gameState={gameState || (status === AppStatus.SETUP && currentBuildingConfig ? { world: currentBuildingConfig } as any : null)} 
        currentSettings={settings} 
        onExportSlot={handleExportData} 
        onImport={handleImport} 
        onUpdateSettings={updateSettings} 
      />
      <footer className="fixed bottom-4 right-4 text-[9px] text-slate-700 font-bold uppercase tracking-widest pointer-events-none">
        RPG_VN &bull; BY TRẦN THIÊN HẠO &bull; VER 5.0
      </footer>
    </div>
  );
};

export default App;

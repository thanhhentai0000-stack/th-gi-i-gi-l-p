
export interface WorldConfig {
  name: string;
  referenceWork?: string;
  genre: string;
  difficulty: number; // Tỉ lệ phần trăm thử thách
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'hell' | 'asian';
  emotionalIntensity: number;
  atmosphere: string;
  protagonist: CharacterProfile;
  tags: string[];
  cultivationStages: string[];
  customHook: string;
  detailedContext: string;
}

export interface CharacterProfile {
  name: string;
  age: string;
  gender: string;
  appearance: string;
  personality: string;
  biography: string;
  goal: string;
}

export interface CharacterStats {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  mana: number;
  maxMana: number;
  luck: number;
  intelligence: number;
  wisdom: number;
  attack: number;
  level: number;
  xp: number;
  currentStage: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'quest' | 'special';
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  effect?: string;
}

export interface GameSettings {
  brightness: number;
  isMature: boolean;
  textModel: string;
  imageModel: string;
  aiProvider: 'gemini' | 'grok' | 'gpt';
  showImages: boolean;
  showSuggestions: boolean; // Tính năng mới: Tắt/Mở gợi ý
}

export interface GameState {
  world: WorldConfig;
  stats: CharacterStats;
  inventory: Item[];
  location: string;
  history: LogEntry[];
  currentScene: SceneData | null;
  currentImage: string | null;
  settings: GameSettings;
  isGameOver?: boolean;
}

export interface LogEntry {
  id: string;
  type: 'narrative' | 'action' | 'system';
  content: string;
  timestamp: number;
}

export interface Choice {
  label: string;
  action: string;
}

export interface SceneData {
  title: string;
  description: string;
  choices: Choice[];
  newItems?: Item[];
  removeItemIds?: string[];
  statChanges?: Partial<CharacterStats & { currentStage: string }>;
  imagePrompt: string;
}

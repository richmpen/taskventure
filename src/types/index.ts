export interface AnimeCharacter {
  id: string;
  name: string;
  images: string[];  // Массив из 3 изображений
  level: number;
  health: number;
  damage: number;
  affection: number;  // Уровень близости
  phrases: {
    battle: string[];
    victory: string[];
    defeat: string[];
    gift: string[];
    interaction: string[];
  };
  stats: {
    strength: number;
    intelligence: number;
    charisma: number;
    kawaii: number;  // Особый параметр для аниме-персонажей
  };
  isUnlocked: boolean;
  defeatedCount: number;  // Сколько раз победили персонажа
  lastDefeatTime?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  experience: number;
  coins: number;
  crystals: number;
  stats: {
    strength: number;
    intelligence: number;
    charisma: number;
    luck: number;
  };
  unlockedCharacters: string[];  // ID персонажей
  inventory: InventoryItem[];
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'gift' | 'potion' | 'equipment';
  description: string;
  image: string;
  price: {
    coins?: number;
    crystals?: number;
  };
  effects?: {
    affection?: number;
    stats?: Partial<UserProfile['stats']>;
  };
}

export interface BattleState {
  character: AnimeCharacter | null;
  playerHealth: number;
  characterHealth: number;
  turn: 'player' | 'character';
  log: string[];
  animation: boolean;
  matchCount: number;
} 
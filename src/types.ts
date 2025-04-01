// Интерфейс для аниме-персонажа
export interface AnimeCharacter {
  id: string;
  name: string;
  description: string;
  stats: {
    health: number;
    attack: number;
    defense: number;
    level: number;
  };
  level: number;
  health: number;
  damage: number;
  affection: number;
  defeatedCount: number;
  images: {
    default: string;
    level1?: string; // Доступно при уровне близости 1
    level2?: string; // Доступно при уровне близости 2
    level3?: string; // Доступно при уровне близости 3
    chibi?: string;  // Уменьшенная версия для аватара
  };
  quotes: {
    greeting: string[];
    battle: string[];
    victory: string[];
    defeat: string[];
    levelUp: string[];
  };
  phrases: {
    battle: string[];
    victory: string[];
    defeat: string[];
    gift: string[];
    interaction: string[];
  };
  isUnlocked?: boolean;
  closenessLevel?: number; // Уровень близости с персонажем
}

// Интерфейс для пользователя
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  experience: number;
  level: number;
  coins: number;
  crystals: number;
  tasks: Task[];
  settings: Settings;
  character?: AnimeCharacter;
  isAdmin?: boolean;
  friends?: Friend[];
  messages?: Record<string, Message[]>;
  unlockedCharacters: string[]; // ID разблокированных персонажей
  characterProgress: Record<string, { 
    victories: number;
    closenessLevel: number;
    lastInteraction?: Date;
  }>;
  inventory: Item[]; // Инвентарь предметов
  friendRequests?: Friend[]; // Запросы в друзья
  createdAt: Date;
  lastActive: Date;
  battlesWon?: number; // Количество выигранных битв
  streakDays?: number; // Количество дней подряд с выполненными задачами
}

// Интерфейс для задачи
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
  createdAt: Date;
  completedAt?: Date;
  usedInBattle?: boolean;
}

// Интерфейс для подарка или предмета
export interface Item {
  id: string;
  name: string;
  description: string;
  price: {
    coins?: number;
    crystals?: number;
  };
  image: string;
  category: 'gift' | 'booster' | 'ticket' | 'cosmetic';
  effects?: {
    closenessPoints?: number;
    experienceBoost?: number;
    coinBoost?: number;
  };
  expiresAt?: Date;
  quantity: number;
}

// Интерфейс для друга
export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastActive: string;
}

// Интерфейс для сообщения
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

// Интерфейс для обновления пользователя
export type UserUpdate = Partial<User>;

// Интерфейс для событий в таймлайне
export interface TimelineEvent {
  id: string;
  type: 'task_completed' | 'character_unlocked' | 'level_up' | 'battle_won';
  title: string;
  description: string;
  timestamp: Date;
  relatedId?: string; // ID связанной задачи или персонажа
}

// Интерфейс для результатов битвы
export interface BattleResult {
  won: boolean;
  experienceGained: number;
  coinsGained: number;
  characterId: string;
}

// Интерфейс для настроек
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  sound: boolean;
  language: 'ru' | 'en';
}

// Интерфейс для подарка
export interface Gift {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  affectionPoints: number;
} 
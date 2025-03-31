// Типы пользователя
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
}

// Типы аутентификации
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Типы задач
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  HEALTH = 'health',
  EDUCATION = 'education',
  FINANCE = 'finance',
  HOBBY = 'hobby',
  OTHER = 'other'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  xpReward: number;
  goldReward: number;
}

// Типы персонажа
export enum CharacterStat {
  STRENGTH = 'strength',
  INTELLIGENCE = 'intelligence',
  ENDURANCE = 'endurance',
  WISDOM = 'wisdom',
  DEXTERITY = 'dexterity',
  CHARISMA = 'charisma'
}

export interface Character {
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  stats: Record<CharacterStat, number>;
  skillPoints: number;
  title: string;
  joinedAt: string;
  totalTasksCompleted: number;
  streakDays: number;
}

// Типы инвентаря
export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  TROPHY = 'trophy'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  icon: string;
  stats: Partial<Record<CharacterStat, number>>;
  isEquipped: boolean;
  acquiredAt: string;
}

// Типы достижений
export enum AchievementCategory {
  TASKS = 'tasks',
  BATTLE = 'battle',
  PROGRESSION = 'progression',
  COLLECTION = 'collection',
  SOCIAL = 'social',
  SPECIAL = 'special'
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
  reward: {
    xp: number;
    gold: number;
    item?: string;
  };
}

// Типы боевой системы
export interface Enemy {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  xpReward: number;
  goldReward: number;
  image: string;
}

export interface BattleResult {
  id: string;
  enemyId: string;
  enemyName: string;
  playerWon: boolean;
  xpEarned: number;
  goldEarned: number;
  itemsDropped: string[];
  date: string;
}

// Типы настроек
export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  soundEffects: boolean;
  language: string;
  lastSyncDate: string | null;
} 
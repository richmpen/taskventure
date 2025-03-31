import { v4 as uuidv4 } from 'uuid';
import { Character, CharacterStat, Enemy, BattleResult } from './types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { getCurrentDateISO } from './dateHelpers';
import { addXpToCharacter, addGoldToCharacter } from './characterHelpers';

/**
 * Получает историю битв
 */
export const getBattleHistory = async (): Promise<BattleResult[]> => {
  const history = await getItem<BattleResult[]>(STORAGE_KEYS.BATTLE_HISTORY);
  return history || [];
};

/**
 * Сохраняет результат битвы
 */
export const saveBattleResult = async (result: BattleResult): Promise<void> => {
  const history = await getBattleHistory();
  history.unshift(result); // Добавляем в начало массива, чтобы последние были первыми
  await setItem(STORAGE_KEYS.BATTLE_HISTORY, history);
};

/**
 * Генерирует список врагов для выбора
 */
export const generateEnemies = (playerLevel: number): Enemy[] => {
  const enemies: Enemy[] = [
    {
      id: "goblin",
      name: "Гоблин",
      level: Math.max(1, playerLevel - 1),
      health: 30 + (playerLevel - 1) * 5,
      maxHealth: 30 + (playerLevel - 1) * 5,
      attack: 5 + (playerLevel - 1) * 2,
      defense: 3 + (playerLevel - 1) * 1,
      xpReward: 15 + (playerLevel - 1) * 3,
      goldReward: 10 + (playerLevel - 1) * 2,
      image: "🧌"
    },
    {
      id: "skeleton",
      name: "Скелет",
      level: playerLevel,
      health: 40 + playerLevel * 5,
      maxHealth: 40 + playerLevel * 5,
      attack: 7 + playerLevel * 2,
      defense: 5 + playerLevel * 1,
      xpReward: 20 + playerLevel * 3,
      goldReward: 15 + playerLevel * 2,
      image: "💀"
    },
    {
      id: "orc",
      name: "Орк",
      level: playerLevel + 1,
      health: 60 + (playerLevel + 1) * 7,
      maxHealth: 60 + (playerLevel + 1) * 7,
      attack: 10 + (playerLevel + 1) * 3,
      defense: 8 + (playerLevel + 1) * 2,
      xpReward: 30 + (playerLevel + 1) * 5,
      goldReward: 25 + (playerLevel + 1) * 3,
      image: "👹"
    },
    {
      id: "dragon",
      name: "Дракон",
      level: Math.max(5, playerLevel + 2),
      health: 100 + (playerLevel + 2) * 10,
      maxHealth: 100 + (playerLevel + 2) * 10,
      attack: 15 + (playerLevel + 2) * 4,
      defense: 12 + (playerLevel + 2) * 3,
      xpReward: 50 + (playerLevel + 2) * 8,
      goldReward: 40 + (playerLevel + 2) * 5,
      image: "🐉"
    }
  ];
  
  return enemies;
};

/**
 * Рассчитывает урон атаки
 */
export const calculateAttackDamage = (attacker: { attack: number }, defender: { defense: number }): number => {
  // Базовый урон
  let damage = attacker.attack - defender.defense / 2;
  
  // Случайность (80% - 120% от базового урона)
  const randomFactor = 0.8 + Math.random() * 0.4;
  damage = damage * randomFactor;
  
  // Минимальный урон всегда 1
  return Math.max(1, Math.floor(damage));
};

/**
 * Рассчитывает шанс уклонения
 */
export const calculateDodgeChance = (character: Character): number => {
  // Базовый шанс уклонения
  return Math.min(0.05 + character.stats[CharacterStat.DEXTERITY] * 0.005, 0.3);
};

/**
 * Рассчитывает шанс критического удара
 */
export const calculateCritChance = (character: Character): number => {
  // Базовый шанс крита
  return Math.min(0.05 + character.stats[CharacterStat.DEXTERITY] * 0.003 + character.stats[CharacterStat.INTELLIGENCE] * 0.002, 0.25);
};

/**
 * Рассчитывает множитель критического урона
 */
export const calculateCritMultiplier = (character: Character): number => {
  // Базовый множитель крита 150%
  return 1.5 + character.stats[CharacterStat.STRENGTH] * 0.01;
};

/**
 * Получает здоровье персонажа
 */
export const getPlayerHealth = (character: Character): number => {
  // Базовое здоровье 100
  return 100 + character.level * 10 + character.stats[CharacterStat.ENDURANCE] * 5;
};

/**
 * Получает значение атаки персонажа
 */
export const getPlayerAttack = (character: Character): number => {
  // Базовая атака 10
  return 10 + character.level * 2 + character.stats[CharacterStat.STRENGTH] * 2 + character.stats[CharacterStat.DEXTERITY] * 0.5;
};

/**
 * Получает значение защиты персонажа
 */
export const getPlayerDefense = (character: Character): number => {
  // Базовая защита 5
  return 5 + character.level * 1 + character.stats[CharacterStat.ENDURANCE] * 1 + character.stats[CharacterStat.STRENGTH] * 0.3;
};

/**
 * Проводит ход боя
 */
export const processBattleTurn = (
  playerHealth: number,
  enemyHealth: number,
  playerAttack: number,
  enemyAttack: number,
  playerDefense: number,
  enemyDefense: number,
  dodgeChance: number,
  critChance: number,
  critMultiplier: number
): {
  newPlayerHealth: number;
  newEnemyHealth: number;
  playerDamageDealt: number;
  enemyDamageDealt: number;
  playerCrit: boolean;
  enemyCrit: boolean;
  playerDodged: boolean;
  enemyDodged: boolean;
} => {
  // Игрок атакует
  const playerCrit = Math.random() < critChance;
  const enemyDodged = Math.random() < 0.1; // У врага базовый шанс уклонения 10%
  
  let playerDamageDealt = 0;
  if (!enemyDodged) {
    playerDamageDealt = calculateAttackDamage({ attack: playerAttack }, { defense: enemyDefense });
    if (playerCrit) {
      playerDamageDealt = Math.floor(playerDamageDealt * critMultiplier);
    }
  }
  
  // Враг атакует
  const enemyCrit = Math.random() < 0.1; // У врага базовый шанс крита 10%
  const playerDodged = Math.random() < dodgeChance;
  
  let enemyDamageDealt = 0;
  if (!playerDodged) {
    enemyDamageDealt = calculateAttackDamage({ attack: enemyAttack }, { defense: playerDefense });
    if (enemyCrit) {
      enemyDamageDealt = Math.floor(enemyDamageDealt * 1.5); // Множитель крита врага 150%
    }
  }
  
  // Обновляем здоровье
  const newEnemyHealth = Math.max(0, enemyHealth - playerDamageDealt);
  const newPlayerHealth = Math.max(0, playerHealth - enemyDamageDealt);
  
  return {
    newPlayerHealth,
    newEnemyHealth,
    playerDamageDealt,
    enemyDamageDealt,
    playerCrit,
    enemyCrit,
    playerDodged,
    enemyDodged
  };
};

/**
 * Проводит полную битву и возвращает результат
 */
export const simulateBattle = async (
  character: Character,
  enemy: Enemy
): Promise<BattleResult> => {
  // Получаем параметры персонажа
  const playerMaxHealth = getPlayerHealth(character);
  const playerAttack = getPlayerAttack(character);
  const playerDefense = getPlayerDefense(character);
  const dodgeChance = calculateDodgeChance(character);
  const critChance = calculateCritChance(character);
  const critMultiplier = calculateCritMultiplier(character);
  
  let playerHealth = playerMaxHealth;
  let enemyHealth = enemy.health;
  
  // Симулируем бой пока кто-то не проиграет
  while (playerHealth > 0 && enemyHealth > 0) {
    const turnResult = processBattleTurn(
      playerHealth,
      enemyHealth,
      playerAttack,
      enemy.attack,
      playerDefense,
      enemy.defense,
      dodgeChance,
      critChance,
      critMultiplier
    );
    
    playerHealth = turnResult.newPlayerHealth;
    enemyHealth = turnResult.newEnemyHealth;
  }
  
  // Определяем победителя
  const playerWon = playerHealth > 0;
  
  // Награда в случае победы
  let xpEarned = 0;
  let goldEarned = 0;
  if (playerWon) {
    xpEarned = enemy.xpReward;
    goldEarned = enemy.goldReward;
    
    // Начисляем награду персонажу
    await addXpToCharacter(xpEarned, character);
    await addGoldToCharacter(goldEarned, character);
  }
  
  // Создаем результат битвы
  const result: BattleResult = {
    id: uuidv4(),
    enemyId: enemy.id,
    enemyName: enemy.name,
    playerWon,
    xpEarned,
    goldEarned,
    itemsDropped: [], // Пока предметы не реализованы
    date: getCurrentDateISO()
  };
  
  // Сохраняем результат
  await saveBattleResult(result);
  
  return result;
}; 
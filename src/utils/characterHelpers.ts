import { Character, CharacterStat } from './types';
import { getItem, setItem, STORAGE_KEYS } from './storage';

/**
 * Рассчитывает необходимое количество опыта для следующего уровня
 */
export const calculateXpForLevel = (level: number): number => {
  // Базовый опыт для первого уровня
  const baseXp = 100;
  // Множитель сложности
  const difficultyMultiplier = 1.5;
  
  return Math.floor(baseXp * Math.pow(level, difficultyMultiplier));
};

/**
 * Создает нового персонажа с базовыми характеристиками
 */
export const createDefaultCharacter = (): Character => {
  return {
    level: 1,
    xp: 0,
    xpToNextLevel: calculateXpForLevel(1),
    gold: 50,
    stats: {
      [CharacterStat.STRENGTH]: 5,
      [CharacterStat.INTELLIGENCE]: 5,
      [CharacterStat.ENDURANCE]: 5,
      [CharacterStat.WISDOM]: 5,
      [CharacterStat.DEXTERITY]: 5,
      [CharacterStat.CHARISMA]: 5
    },
    skillPoints: 0,
    title: 'Начинающий',
    joinedAt: new Date().toISOString(),
    totalTasksCompleted: 0,
    streakDays: 0
  };
};

/**
 * Получает персонажа из хранилища или создает нового, если не существует
 */
export const getCharacter = async (): Promise<Character> => {
  const character = await getItem<Character>(STORAGE_KEYS.CHARACTER);
  if (!character) {
    const newCharacter = createDefaultCharacter();
    await setItem(STORAGE_KEYS.CHARACTER, newCharacter);
    return newCharacter;
  }
  return character;
};

/**
 * Сохраняет персонажа в хранилище
 */
export const saveCharacter = async (character: Character): Promise<void> => {
  await setItem(STORAGE_KEYS.CHARACTER, character);
};

/**
 * Добавляет опыт персонажу и повышает уровень, если нужно
 */
export const addXpToCharacter = async (
  xpAmount: number,
  character?: Character
): Promise<{ character: Character; leveledUp: boolean; newLevel?: number }> => {
  const currentCharacter = character || await getCharacter();
  let { xp, level, xpToNextLevel } = currentCharacter;
  
  xp += xpAmount;
  let leveledUp = false;
  let newLevel;

  // Повышение уровня, если достаточно опыта
  while (xp >= xpToNextLevel) {
    xp -= xpToNextLevel;
    level += 1;
    leveledUp = true;
    newLevel = level;
    xpToNextLevel = calculateXpForLevel(level);
    
    // Добавляем очки навыков при повышении уровня
    currentCharacter.skillPoints += 2;
  }

  const updatedCharacter: Character = {
    ...currentCharacter,
    xp,
    level,
    xpToNextLevel,
  };

  await saveCharacter(updatedCharacter);
  
  return { character: updatedCharacter, leveledUp, newLevel };
};

/**
 * Добавляет золото персонажу
 */
export const addGoldToCharacter = async (
  goldAmount: number,
  character?: Character
): Promise<Character> => {
  const currentCharacter = character || await getCharacter();
  
  const updatedCharacter: Character = {
    ...currentCharacter,
    gold: currentCharacter.gold + goldAmount
  };

  await saveCharacter(updatedCharacter);
  
  return updatedCharacter;
};

/**
 * Улучшает характеристику персонажа
 */
export const upgradeStat = async (
  stat: CharacterStat,
  character?: Character
): Promise<Character | null> => {
  const currentCharacter = character || await getCharacter();
  
  if (currentCharacter.skillPoints <= 0) {
    return null;
  }
  
  const updatedCharacter: Character = {
    ...currentCharacter,
    stats: {
      ...currentCharacter.stats,
      [stat]: currentCharacter.stats[stat] + 1
    },
    skillPoints: currentCharacter.skillPoints - 1
  };

  await saveCharacter(updatedCharacter);
  
  return updatedCharacter;
};

/**
 * Получает описание характеристики
 */
export const getStatDescription = (stat: CharacterStat): { name: string; description: string } => {
  switch (stat) {
    case CharacterStat.STRENGTH:
      return {
        name: 'Сила',
        description: 'Увеличивает урон в боях и помогает выполнять физические задачи'
      };
    case CharacterStat.INTELLIGENCE:
      return {
        name: 'Интеллект',
        description: 'Повышает эффективность в образовательных задачах и учебе'
      };
    case CharacterStat.ENDURANCE:
      return {
        name: 'Выносливость',
        description: 'Увеличивает здоровье и выносливость в боях и при выполнении задач'
      };
    case CharacterStat.WISDOM:
      return {
        name: 'Мудрость',
        description: 'Повышает способность принимать решения и планировать'
      };
    case CharacterStat.DEXTERITY:
      return {
        name: 'Ловкость',
        description: 'Увеличивает скорость выполнения задач и шанс уклонения в боях'
      };
    case CharacterStat.CHARISMA:
      return {
        name: 'Харизма',
        description: 'Помогает в социальных задачах и взаимодействии с другими'
      };
  }
}; 
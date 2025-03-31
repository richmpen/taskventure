import localforage from 'localforage';

// Конфигурация localforage
localforage.config({
  name: 'Taskventure',
  storeName: 'taskventure_data',
  description: 'Локальное хранилище для Taskventure'
});

// Ключи для хранилища
export const STORAGE_KEYS = {
  USER: 'user',
  TASKS: 'tasks',
  CHARACTER: 'character',
  SETTINGS: 'settings',
  INVENTORY: 'inventory',
  ACHIEVEMENTS: 'achievements',
  BATTLE_HISTORY: 'battle_history'
};

// Получение данных из хранилища
export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    return await localforage.getItem<T>(key);
  } catch (error) {
    console.error(`Ошибка при получении ${key} из хранилища:`, error);
    return null;
  }
};

// Сохранение данных в хранилище
export const setItem = async <T>(key: string, value: T): Promise<T | null> => {
  try {
    await localforage.setItem(key, value);
    return value;
  } catch (error) {
    console.error(`Ошибка при сохранении ${key} в хранилище:`, error);
    return null;
  }
};

// Удаление данных из хранилища
export const removeItem = async (key: string): Promise<boolean> => {
  try {
    await localforage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Ошибка при удалении ${key} из хранилища:`, error);
    return false;
  }
};

// Очистка всего хранилища
export const clearStorage = async (): Promise<boolean> => {
  try {
    await localforage.clear();
    return true;
  } catch (error) {
    console.error('Ошибка при очистке хранилища:', error);
    return false;
  }
};

// Проверка наличия данных в хранилище
export const hasItem = async (key: string): Promise<boolean> => {
  try {
    const value = await localforage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`Ошибка при проверке наличия ${key} в хранилище:`, error);
    return false;
  }
}; 
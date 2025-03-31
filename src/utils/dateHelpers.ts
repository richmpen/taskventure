import { format, formatDistance, isToday, isYesterday, parseISO, isBefore, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Форматирует дату в локализованную строку
 */
export const formatDate = (dateString: string, formatStr: string = 'PPP'): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: ru });
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return dateString;
  }
};

/**
 * Возвращает относительную дату (например, "2 часа назад", "вчера" и т.д.)
 */
export const getRelativeDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return `Сегодня, ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Вчера, ${format(date, 'HH:mm')}`;
    } else {
      return formatDistance(date, new Date(), { 
        addSuffix: true,
        locale: ru
      });
    }
  } catch (error) {
    console.error('Ошибка форматирования относительной даты:', error);
    return dateString;
  }
};

/**
 * Проверяет, просрочена ли задача
 */
export const isTaskOverdue = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  
  try {
    const date = parseISO(dueDate);
    return isBefore(date, new Date()) && !isToday(date);
  } catch (error) {
    console.error('Ошибка при проверке просрочки задачи:', error);
    return false;
  }
};

/**
 * Возвращает строку класса для отображения статуса задачи по сроку выполнения
 */
export const getDueDateClass = (dueDate: string | null): string => {
  if (!dueDate) return '';
  
  try {
    const date = parseISO(dueDate);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (isBefore(date, today) && !isToday(date)) {
      return 'text-error';
    } else if (isToday(date)) {
      return 'text-warning';
    } else if (isBefore(date, tomorrow)) {
      return 'text-warning-content';
    }
    return '';
  } catch (error) {
    console.error('Ошибка получения класса для даты:', error);
    return '';
  }
};

/**
 * Возвращает текущую дату в ISO формате
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString();
};

/**
 * Форматирует продолжительность в миллисекундах в читаемый формат
 */
export const formatDuration = (durationMs: number): string => {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours} ч ${minutes % 60} мин`;
  } else if (minutes > 0) {
    return `${minutes} мин ${seconds % 60} сек`;
  } else {
    return `${seconds} сек`;
  }
}; 
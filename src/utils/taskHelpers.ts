import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus, TaskPriority, TaskCategory } from './types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { getCurrentDateISO } from './dateHelpers';
import { addXpToCharacter, addGoldToCharacter } from './characterHelpers';

/**
 * Получает все задачи из хранилища
 */
export const getAllTasks = async (): Promise<Task[]> => {
  const tasks = await getItem<Task[]>(STORAGE_KEYS.TASKS);
  return tasks || [];
};

/**
 * Создает новую задачу с заданными параметрами
 */
export const createTask = async (
  title: string,
  description: string = '',
  category: TaskCategory = TaskCategory.OTHER,
  priority: TaskPriority = TaskPriority.MEDIUM,
  dueDate: string | null = null
): Promise<Task> => {
  const tasks = await getAllTasks();
  
  // Расчет награды за задачу в зависимости от приоритета
  let xpReward = 10;
  let goldReward = 5;
  
  switch (priority) {
    case TaskPriority.LOW:
      xpReward = 5;
      goldReward = 2;
      break;
    case TaskPriority.MEDIUM:
      xpReward = 10;
      goldReward = 5;
      break;
    case TaskPriority.HIGH:
      xpReward = 15;
      goldReward = 10;
      break;
    case TaskPriority.URGENT:
      xpReward = 25;
      goldReward = 15;
      break;
  }
  
  const now = getCurrentDateISO();
  
  const newTask: Task = {
    id: uuidv4(),
    title,
    description,
    category,
    priority,
    status: TaskStatus.TODO,
    dueDate,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    xpReward,
    goldReward
  };
  
  tasks.push(newTask);
  await setItem(STORAGE_KEYS.TASKS, tasks);
  
  return newTask;
};

/**
 * Обновляет существующую задачу
 */
export const updateTask = async (updatedTask: Task): Promise<Task | null> => {
  const tasks = await getAllTasks();
  const taskIndex = tasks.findIndex(task => task.id === updatedTask.id);
  
  if (taskIndex === -1) {
    return null;
  }
  
  updatedTask.updatedAt = getCurrentDateISO();
  tasks[taskIndex] = updatedTask;
  
  await setItem(STORAGE_KEYS.TASKS, tasks);
  return updatedTask;
};

/**
 * Удаляет задачу по ID
 */
export const deleteTask = async (taskId: string): Promise<boolean> => {
  const tasks = await getAllTasks();
  const filteredTasks = tasks.filter(task => task.id !== taskId);
  
  if (filteredTasks.length === tasks.length) {
    return false;
  }
  
  await setItem(STORAGE_KEYS.TASKS, filteredTasks);
  return true;
};

/**
 * Завершает задачу и начисляет награду
 */
export const completeTask = async (taskId: string): Promise<{ success: boolean; xpEarned?: number; goldEarned?: number }> => {
  const tasks = await getAllTasks();
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    return { success: false };
  }
  
  const task = tasks[taskIndex];
  
  // Проверяем, что задача не была уже завершена
  if (task.status === TaskStatus.COMPLETED) {
    return { success: false };
  }
  
  const now = getCurrentDateISO();
  
  task.status = TaskStatus.COMPLETED;
  task.completedAt = now;
  task.updatedAt = now;
  
  // Сохраняем обновленную задачу
  tasks[taskIndex] = task;
  await setItem(STORAGE_KEYS.TASKS, tasks);
  
  // Начисляем награду персонажу
  const { xpReward, goldReward } = task;
  await addXpToCharacter(xpReward);
  await addGoldToCharacter(goldReward);
  
  return { 
    success: true,
    xpEarned: xpReward,
    goldEarned: goldReward
  };
};

/**
 * Возвращает фильтрованный список задач
 */
export const getFilteredTasks = async (
  statusFilter?: TaskStatus | 'all',
  categoryFilter?: TaskCategory | 'all',
  priorityFilter?: TaskPriority | 'all',
  searchQuery?: string
): Promise<Task[]> => {
  let tasks = await getAllTasks();
  
  // Фильтрация по статусу
  if (statusFilter && statusFilter !== 'all') {
    tasks = tasks.filter(task => task.status === statusFilter);
  }
  
  // Фильтрация по категории
  if (categoryFilter && categoryFilter !== 'all') {
    tasks = tasks.filter(task => task.category === categoryFilter);
  }
  
  // Фильтрация по приоритету
  if (priorityFilter && priorityFilter !== 'all') {
    tasks = tasks.filter(task => task.priority === priorityFilter);
  }
  
  // Поиск по тексту
  if (searchQuery && searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase().trim();
    tasks = tasks.filter(task => 
      task.title.toLowerCase().includes(query) || 
      task.description.toLowerCase().includes(query)
    );
  }
  
  return tasks;
};

/**
 * Возвращает цвет приоритета задачи
 */
export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.LOW:
      return 'info';
    case TaskPriority.MEDIUM:
      return 'success';
    case TaskPriority.HIGH:
      return 'warning';
    case TaskPriority.URGENT:
      return 'error';
  }
};

/**
 * Возвращает название категории задачи
 */
export const getCategoryName = (category: TaskCategory): string => {
  switch (category) {
    case TaskCategory.WORK:
      return 'Работа';
    case TaskCategory.PERSONAL:
      return 'Личное';
    case TaskCategory.HEALTH:
      return 'Здоровье';
    case TaskCategory.EDUCATION:
      return 'Образование';
    case TaskCategory.FINANCE:
      return 'Финансы';
    case TaskCategory.HOBBY:
      return 'Хобби';
    case TaskCategory.OTHER:
      return 'Другое';
  }
}; 
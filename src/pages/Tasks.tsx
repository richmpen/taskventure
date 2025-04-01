import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import localforage from 'localforage';
import { Task } from '../types';
import { FaTasks, FaClock, FaChartLine } from 'react-icons/fa';

// Дополнительный интерфейс для расширенных свойств задачи в Tasks
interface TaskExtended extends Task {
  experience?: number;
  subTasks?: { id: string; title: string; completed: boolean }[];
  dueDate?: Date;
  createdAt: Date;
  tags: string[];
}

const Tasks: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [tasks, setTasks] = useState<TaskExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<TaskExtended | null>(null);
  
  // Значения для новой задачи
  const [newTask, setNewTask] = useState<Partial<TaskExtended>>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Личное',
    experience: 50,
    completed: false,
    dueDate: undefined
  });

  // Добавляем состояния для работы с подзадачами
  const [newSubTask, setNewSubTask] = useState('');

  // Добавим состояние для предотвращения нежелательных обновлений
  const [isAdding, setIsAdding] = useState(false);
  
  // Статистические показатели
  const completedTasksCount = useMemo(() => tasks.filter(task => task.completed).length, [tasks]);
  
  // Ближайший дедлайн
  const { nextDeadline, nextDeadlineTask } = useMemo(() => {
    const activeTasks = tasks.filter(task => !task.completed && task.dueDate);
    if (activeTasks.length === 0) return { nextDeadline: null, nextDeadlineTask: null };
    
    const sortedTasks = [...activeTasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    return { 
      nextDeadline: sortedTasks[0].dueDate, 
      nextDeadlineTask: sortedTasks[0] 
    };
  }, [tasks]);
  
  // Активность за последнюю неделю
  const { completedThisWeek, createdThisWeek } = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const completed = tasks.filter(task => 
      task.completed && 
      task.completedAt && 
      new Date(task.completedAt) >= weekAgo
    ).length;
    
    const created = tasks.filter(task => 
      new Date(task.createdAt) >= weekAgo
    ).length;
    
    return { completedThisWeek: completed, createdThisWeek: created };
  }, [tasks]);
  
  // Функция форматирования даты
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Добавим расширенные логи для отладки
  useEffect(() => {
    console.log('Tasks.tsx: Монтирование компонента');
    console.log('Tasks.tsx: Текущий пользователь:', currentUser);
    console.log('Tasks.tsx: Задачи пользователя:', currentUser?.tasks);
    
    if (currentUser) {
      const userTasks = currentUser.tasks || [];
      console.log('Tasks.tsx: Установка задач из пользователя:', userTasks);
      setTasks(userTasks as TaskExtended[]);
    }
  }, [currentUser]);

  // Загрузка задач
  useEffect(() => {
    const fetchTasks = async () => {
      console.log('Tasks.tsx: Начало загрузки задач');
      try {
        // Если есть текущий пользователь, используем его задачи
        if (currentUser && currentUser.tasks && currentUser.tasks.length > 0) {
          console.log('Tasks.tsx: Используем задачи пользователя:', currentUser.tasks);
          setTasks(currentUser.tasks as TaskExtended[]);
          setLoading(false);
          return;
        }
        
        console.log('Tasks.tsx: Пытаемся загрузить задачи из localforage');
        const storedTasks = await localforage.getItem<TaskExtended[]>('tasks');
        
        if (storedTasks && storedTasks.length > 0) {
          console.log('Tasks.tsx: Найдены сохраненные задачи в localforage:', storedTasks);
          setTasks(storedTasks);
        } else {
          console.log('Tasks.tsx: Создаем демо-задачи');
          // Демо-задачи для первого запуска
          const demoTasks: TaskExtended[] = [
            {
              id: 'demo-task-1',
              title: 'Изучить интерфейс Taskventure',
              description: 'Познакомиться с разделами и функциями приложения, понять принцип работы',
              completed: false,
              dueDate: new Date(Date.now() + 86400000 * 2), // +2 дня
              priority: 'high',
              category: 'Обучение',
              experience: 50,
              createdAt: new Date(),
              tags: ['демо', 'обучение']
            },
            {
              id: 'demo-task-2',
              title: 'Участвовать в битве с персонажем',
              description: 'Перейти в раздел битв и выбрать персонажа для сражения',
              completed: false,
              dueDate: new Date(Date.now() + 86400000), // +1 день
              priority: 'medium',
              category: 'Игра',
              experience: 80,
              createdAt: new Date(),
              tags: ['демо', 'битва']
            },
            {
              id: 'demo-task-3',
              title: 'Создать свою первую задачу',
              description: 'Нажать кнопку "+" и добавить в список собственную задачу',
              completed: false,
              dueDate: new Date(),
              priority: 'medium',
              category: 'Обучение',
              experience: 30,
              createdAt: new Date(),
              tags: ['демо', 'обучение']
            },
            {
              id: 'demo-task-4',
              title: 'Выполнить задачу',
              description: 'Отметить любую задачу как выполненную и получить опыт',
              completed: false,
              dueDate: new Date(),
              priority: 'low',
              category: 'Обучение',
              experience: 20,
              createdAt: new Date(),
              tags: ['демо', 'обучение']
            }
          ];
          
          console.log('Tasks.tsx: Созданы демо-задачи:', demoTasks);
          
          // Если у пользователя еще нет задач, создаем их
          if (currentUser && (!currentUser.tasks || currentUser.tasks.length === 0)) {
            console.log('Tasks.tsx: Обновляем пользователя с демо-задачами');
            const tasksForUpdate = demoTasks.map(task => ({
              id: task.id,
              title: task.title,
              description: task.description,
              completed: task.completed,
              priority: task.priority,
              category: task.category,
              createdAt: task.createdAt,
              tags: task.tags,
              dueDate: task.dueDate
            }));
            
            await updateUser({ tasks: tasksForUpdate });
          }
          
          await localforage.setItem('tasks', demoTasks);
          setTasks(demoTasks);
        }
      } catch (error) {
        console.error('Tasks.tsx: Ошибка при загрузке задач:', error);
      } finally {
        setLoading(false);
        console.log('Tasks.tsx: Завершение загрузки задач');
      }
    };

    fetchTasks();
  }, [currentUser, updateUser]);

  // Фильтрация задач
  const filteredTasks = tasks.filter(task => {
    const statusFilter = 
      filter === 'all' ? true : 
      filter === 'active' ? !task.completed : 
      task.completed;
    
    const catFilter = 
      categoryFilter === 'all' ? true : 
      task.category === categoryFilter;
    
    return statusFilter && catFilter;
  });

  // Получение списка категорий
  const categories = [...new Set(tasks.map(task => task.category))];

  // Обработчики действий
  const toggleTaskComplete = async (id: string) => {
    // Предотвращаем множественные клики
    if (loading) {
      console.log('Tasks.tsx: Клик игнорирован - идет загрузка');
      return;
    }
    
    console.log('Tasks.tsx: Переключение статуса задачи ID:', id);
    
    // Находим задачу
    const taskToToggle = tasks.find(t => t.id === id);
    if (!taskToToggle) {
      console.error('Tasks.tsx: Задача не найдена:', id);
      return;
    }
    
    try {
      setLoading(true);
      
      // Создаем новый объект задачи с обновленным статусом
      const updatedTask = { 
        ...taskToToggle, 
        completed: !taskToToggle.completed,
        completedAt: !taskToToggle.completed ? new Date() : undefined
      };
      
      // ВАЖНО: Создаем новый массив задач для избежания проблем с ссылками
      const updatedTasks = tasks.map(task => 
        task.id === id ? updatedTask : task
      );
      
      // Немедленно обновляем UI
      setTasks([...updatedTasks]);
      
      // Синхронно сохраняем в хранилище
      await localforage.setItem('tasks', updatedTasks);
      
      // Если есть текущий пользователь, обновляем его задачи
      if (currentUser) {
        const tasksForUpdate = updatedTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.completed,
          completedAt: task.completedAt,
          priority: task.priority,
          category: task.category || 'Личное',
          createdAt: task.createdAt,
          tags: task.tags || [],
          dueDate: task.dueDate,
          subTasks: task.subTasks
        }));
        
        await updateUser({ tasks: tasksForUpdate });
        
        // Если задача выполнена, добавляем опыт
        if (updatedTask.completed) {
          const taskExperience = updatedTask.experience || 0;
          const updatedUser = {
            ...currentUser,
            experience: (currentUser.experience || 0) + taskExperience
          };
          
          // Проверяем повышение уровня
          const expForNextLevel = (currentUser.level || 1) * 1000;
          if (updatedUser.experience >= expForNextLevel) {
            updatedUser.level = (currentUser.level || 1) + 1;
          }
          
          await updateUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Tasks.tsx: Ошибка при обновлении задачи:', error);
    } finally {
      setLoading(false);
    }
  };

  // Модифицируем функцию добавления задачи
  const handleAddTask = async (taskData: Partial<TaskExtended>) => {
    console.log('Tasks.tsx: Начало добавления задачи:', taskData);
    
    if (loading || isAdding) {
      console.log('Tasks.tsx: Задача уже добавляется или идет загрузка, отмена');
      return;
    }
    
    if (!taskData.title?.trim()) {
      console.log('Tasks.tsx: Название задачи пустое, отмена');
      return;
    }
    
    setIsAdding(true);
    setLoading(true);
    
    try {
      const newTask: TaskExtended = {
        id: `task-${Date.now()}`,
        title: taskData.title.trim(),
        description: taskData.description || '',
        completed: false,
        priority: taskData.priority || 'medium',
        category: taskData.category || 'Личное',
        experience: taskData.experience || 50,
        dueDate: taskData.dueDate,
        createdAt: new Date(),
        tags: taskData.tags || [],
        subTasks: []
      };
      
      console.log('Tasks.tsx: Создана новая задача:', newTask);
      
      // Добавляем задачу в локальное состояние
      const updatedTasks = [...tasks, newTask];
      
      // Сохраняем в локальное хранилище
      await localforage.setItem('tasks', updatedTasks);
      console.log('Tasks.tsx: Задачи сохранены в localforage');
      
      // Если у пользователя есть задачи, обновляем их в профиле
      if (currentUser) {
        console.log('Tasks.tsx: Обновляем задачи в профиле пользователя');
        await updateUser({ tasks: updatedTasks });
      }
      
      // Обновляем состояние
      setTasks(updatedTasks);
      console.log('Tasks.tsx: Состояние задач обновлено');
      
      // Закрываем модальное окно
      setShowModal(false);
    } catch (error) {
      console.error('Tasks.tsx: Ошибка при добавлении задачи:', error);
    } finally {
      setLoading(false);
      setIsAdding(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Удаляем задачу из списка
      const updatedTasks = tasks.filter(task => task.id !== id);
      
      // Сначала сохраняем в хранилище
      await localforage.setItem('tasks', updatedTasks);
      
      // Затем обновляем состояние
      setTasks(updatedTasks);
      
      // Закрываем окно с деталями задачи
      setSelectedTask(null);
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
    } finally {
      setLoading(false);
    }
  };

  // Добавляем функцию для добавления подзадачи к выбранной задаче
  const addSubTask = async () => {
    if (!selectedTask || !newSubTask.trim() || loading) return;
    
    setLoading(true);
    
    try {
      // Создаем новый объект подзадачи
      const newSubTaskObj = {
        id: `subtask-${Date.now()}`,
        title: newSubTask,
        completed: false
      };
      
      // Создаем копию выбранной задачи
      const updatedTask = { 
        ...selectedTask,
        subTasks: [...(selectedTask.subTasks || []), newSubTaskObj]
      };
      
      // Обновляем задачу в общем списке, создавая новый массив
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id ? updatedTask : task
      );
      
      // Обновляем состояние - важен порядок
      // 1. Сначала обновляем общий список задач
      setTasks([...updatedTasks]);
      
      // 2. Затем обновляем выбранную задачу
      setSelectedTask(updatedTask);
      
      // 3. Очищаем поле ввода новой подзадачи
      setNewSubTask('');
      
      // 4. Сохраняем в хранилище
      await localforage.setItem('tasks', updatedTasks);
      
      // 5. Если у пользователя есть задачи, обновляем их в профиле
      if (currentUser) {
        await updateUser({ tasks: updatedTasks });
      }
    } catch (error) {
      console.error('Ошибка при добавлении подзадачи:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Добавляем функцию для изменения статуса подзадачи
  const toggleSubTaskComplete = async (taskId: string, subTaskId: string) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Найдем задачу
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate || !taskToUpdate.subTasks) return;
      
      // Обновляем статус подзадачи
      const updatedSubTasks = taskToUpdate.subTasks.map(st => 
        st.id === subTaskId ? { ...st, completed: !st.completed } : st
      );
      
      // Создаем новый объект задачи
      const updatedTask = { ...taskToUpdate, subTasks: updatedSubTasks };
      
      // Обновляем задачу в общем списке
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
      
      // Обновляем состояние в правильном порядке
      // 1. Сначала общий список задач
      setTasks([...updatedTasks]);
      
      // 2. Затем выбранную задачу, если она открыта
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }
      
      // 3. Сохраняем в хранилище
      await localforage.setItem('tasks', updatedTasks);
      
      // 4. Если у пользователя есть задачи, обновляем их в профиле
      if (currentUser) {
        await updateUser({ tasks: updatedTasks });
      }
    } catch (error) {
      console.error('Ошибка при обновлении подзадачи:', error);
    } finally {
      setLoading(false);
    }
  };

  // Оптимизированные компоненты для работы с задачами
  const TaskModal = () => {
    // Создаем локальное состояние для формы
    const [taskForm, setTaskForm] = useState<Partial<TaskExtended>>({
      title: '',
      description: '',
      priority: 'medium',
      category: 'Личное',
      experience: 50,
      dueDate: undefined
    });
    const [formSubmitting, setFormSubmitting] = useState(false);
    
    // Обработчик изменения полей формы
    const updateFormField = (field: string, value: any) => {
      setTaskForm(prev => ({...prev, [field]: value}));
    };
    
    // Обработчик отправки формы
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Tasks.tsx: Отправка формы добавления задачи');
      
      if (formSubmitting || !taskForm.title || isAdding) {
        console.log('Tasks.tsx: Форма не заполнена или уже отправляется:', { 
          formSubmitting, 
          title: taskForm.title,
          isAdding 
        });
        return;
      }
      
      setFormSubmitting(true);
      console.log('Tasks.tsx: Форма заполнена, начинаем добавление задачи:', taskForm);
      
      // Вызываем функцию добавления задачи напрямую с данными формы
      await handleAddTask(taskForm);
      
      setFormSubmitting(false);
      console.log('Tasks.tsx: Форма отправлена, сброс состояния отправки');
    };
    
    // Закрытие модального окна
    const handleClose = () => {
      if (formSubmitting) return;
      setShowModal(false);
    };
    
    return (
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div 
          className="container-ios max-w-md w-full"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4">Новая задача</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="form-label">
                Название задачи
              </label>
              <input
                id="title"
                type="text"
                value={taskForm.title || ''}
                onChange={(e) => updateFormField('title', e.target.value)}
                className="form-input"
                placeholder="Что нужно сделать?"
                required
                autoFocus
                disabled={formSubmitting || loading}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="form-label">
                Описание
              </label>
              <textarea
                id="description"
                value={taskForm.description || ''}
                onChange={(e) => updateFormField('description', e.target.value)}
                className="form-input"
                placeholder="Описание задачи..."
                rows={3}
                disabled={formSubmitting || loading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="form-label">
                  Категория
                </label>
                <select
                  id="category"
                  value={taskForm.category || 'Личное'}
                  onChange={(e) => updateFormField('category', e.target.value)}
                  className="form-input"
                  disabled={formSubmitting || loading}
                >
                  <option>Личное</option>
                  <option>Работа</option>
                  <option>Здоровье</option>
                  <option>Учеба</option>
                  <option>Финансы</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className="form-label">
                  Приоритет
                </label>
                <select
                  id="priority"
                  value={taskForm.priority || 'medium'}
                  onChange={(e) => updateFormField('priority', e.target.value as 'low' | 'medium' | 'high')}
                  className="form-input"
                  disabled={formSubmitting || loading}
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="deadline" className="form-label">
                  Срок выполнения
                </label>
                <input
                  id="deadline"
                  type="date"
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    updateFormField('dueDate', date);
                  }}
                  className="form-input"
                  disabled={formSubmitting || loading}
                />
              </div>
              
              <div>
                <label htmlFor="experience" className="form-label">
                  Опыт (XP)
                </label>
                <input
                  id="experience"
                  type="number"
                  value={taskForm.experience || 50}
                  onChange={(e) => updateFormField('experience', parseInt(e.target.value) || 50)}
                  className="form-input"
                  min={10}
                  max={1000}
                  disabled={formSubmitting || loading}
                />
                <p className="form-hint">От 10 до 1000 XP</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-3">
              <button 
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={formSubmitting || loading}
              >
                Отмена
              </button>
              <button 
                type="submit"
                className="btn-primary"
                disabled={!taskForm.title || formSubmitting || loading}
              >
                {formSubmitting || loading ? 'Добавление...' : 'Добавить задачу'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const TaskDetails = () => {
    const [detailsLoading, setDetailsLoading] = useState(false);
    
    if (!selectedTask) return null;
    
    const handleComplete = async () => {
      if (detailsLoading || loading) return;
      
      setDetailsLoading(true);
      
      try {
        await toggleTaskComplete(selectedTask.id);
        
        // Не закрываем диалог после выполнения, чтобы пользователь видел результат
        // setSelectedTask(null);
        
        // Вместо закрытия обновляем выбранную задачу из списка задач
        const updatedTask = tasks.find(t => t.id === selectedTask.id);
        if (updatedTask) {
          setSelectedTask(updatedTask);
        }
      } finally {
        setDetailsLoading(false);
      }
    };
    
    const handleDelete = async () => {
      if (detailsLoading || loading) return;
      
      setDetailsLoading(true);
      
      try {
        await handleDeleteTask(selectedTask.id);
      } finally {
        setDetailsLoading(false);
      }
    };
    
    const handleClose = () => {
      if (detailsLoading || loading) return;
      setSelectedTask(null);
    };
    
    return (
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div 
          className="container-ios max-w-md w-full"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              disabled={detailsLoading || loading}
            >
              &times;
            </button>
          </div>
          
          {selectedTask.description && (
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300">{selectedTask.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Категория:</span>
              <p>{selectedTask.category}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Приоритет:</span>
              <p>
                {selectedTask.priority === 'high' ? 'Высокий' : 
                selectedTask.priority === 'medium' ? 'Средний' : 
                'Низкий'}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Статус:</span>
              <p>{selectedTask.completed ? 'Выполнено' : 'Активно'}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Опыт:</span>
              <p>{selectedTask.experience} XP</p>
            </div>
          </div>
          
          {selectedTask.dueDate && (
            <div className="mb-4">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Срок выполнения:</span>
              <p>{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
            </div>
          )}
          
          {/* Блок с подзадачами */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Подзадачи:</h3>
            
            {selectedTask.subTasks && selectedTask.subTasks.length > 0 ? (
              <ul className="space-y-2 mb-3">
                {selectedTask.subTasks.map(subTask => (
                  <li key={subTask.id} className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <button
                      className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                        subTask.completed 
                          ? 'bg-success border-success' 
                          : 'border-gray-400 dark:border-gray-500'
                      } mr-3 flex items-center justify-center cursor-pointer`}
                      onClick={() => {
                        console.log('Toggling subtask completion:', subTask.id);
                        toggleSubTaskComplete(selectedTask.id, subTask.id);
                      }}
                    >
                      {subTask.completed && <span className="text-white text-xs">✓</span>}
                    </button>
                    <span className={subTask.completed ? 'line-through text-gray-500' : ''}>
                      {subTask.title}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mb-3">Нет подзадач</p>
            )}
            
            {/* Форма добавления подзадачи */}
            <div className="flex items-center">
              <input
                type="text"
                value={newSubTask}
                onChange={(e) => setNewSubTask(e.target.value)}
                placeholder="Новая подзадача"
                className="form-input flex-grow mr-2 py-1"
                disabled={detailsLoading || loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSubTask.trim()) {
                    addSubTask();
                  }
                }}
              />
              <button
                onClick={addSubTask}
                className="btn-primary py-1 px-3"
                disabled={!newSubTask.trim() || detailsLoading || loading}
              >
                +
              </button>
            </div>
          </div>
          
          <div className="flex justify-between pt-3">
            <button 
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-ios hover:bg-red-50 dark:hover:bg-red-900/20"
              disabled={detailsLoading || loading}
            >
              {detailsLoading || loading ? 'Загрузка...' : 'Удалить'}
            </button>
            <button 
              onClick={handleComplete}
              className={selectedTask.completed ? 'btn-secondary' : 'btn-primary'}
              disabled={detailsLoading || loading}
            >
              {detailsLoading || loading 
                ? 'Загрузка...' 
                : selectedTask.completed 
                  ? 'Отменить выполнение' 
                  : 'Отметить выполненным'
              }
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Улучшим компонент для отображения активности
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">МОИ ЗАДАЧИ</h1>
          <motion.button
            onClick={() => setShowModal(true)}
            className="btn-primary px-3 py-1 flex items-center justify-center shadow-md rounded-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm mr-1">+</span> Добавить
          </motion.button>
        </div>
      </div>
      
      {/* Статистика по заданиям */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Ваш Прогресс</h2>
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mr-4">
              <FaTasks className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Завершено: {completedTasksCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Всего: {tasks.length}</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                {tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Предстоящие Сроки</h2>
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-4">
              <FaClock className="text-yellow-500 dark:text-yellow-400" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Ближайший дедлайн:</p>
              {nextDeadline ? (
                <p className="font-medium">{formatDate(nextDeadline)}</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Нет предстоящих сроков</p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {nextDeadlineTask ? `Задача: ${nextDeadlineTask.title}` : ''}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Ваша Активность</h2>
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4">
              <FaChartLine className="text-green-500 dark:text-green-400" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-green-600 dark:text-green-400">{completedThisWeek}</span> задач выполнено за неделю
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">{createdThisWeek}</span> задач создано за неделю
              </p>
              <div className="mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentUser 
                    ? `Текущий опыт: ${currentUser.experience || 0} / ${((currentUser.level || 1) * 1000)}`
                    : 'Войдите, чтобы отслеживать опыт'
                  }
                </p>
                {currentUser && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-1">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(100, ((currentUser.experience || 0) / ((currentUser.level || 1) * 1000)) * 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <>
          <AnimatePresence mode="sync">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <motion.div
                  key={task.id}
                  className={`task-item flex justify-between items-center ${
                    task.completed ? 'completed' : 
                    task.priority === 'high' ? 'border-red-500' : 
                    task.priority === 'medium' ? 'border-yellow-500' : 
                    'border-green-500'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, margin: 0 }}
                >
                  <div className="flex items-center flex-grow">
                    <button 
                      className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                        task.completed 
                          ? 'bg-success border-success' 
                          : 'border-gray-400 dark:border-gray-500'
                      } mr-3 flex items-center justify-center cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(task.id);
                      }}
                    >
                      {task.completed && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div className="cursor-pointer flex-grow" onClick={() => setSelectedTask(task)}>
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <span className="mr-3">{task.category}</span>
                          {task.dueDate && (
                            <span>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        {/* Индикатор подзадач - улучшенный и более заметный */}
                        {task.subTasks && task.subTasks.length > 0 && (
                          <div className="flex items-center bg-primary/10 text-primary rounded-md px-2 py-1 mr-2">
                            <span className="mr-1">Подзадачи:</span>
                            <span className="font-bold">{task.subTasks.filter(st => st.completed).length}/{task.subTasks.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-xs font-medium bg-primary/10 text-primary rounded-full px-2 py-1 mr-2">
                      +{task.experience} XP
                    </div>
                    <button 
                      className="p-2 text-gray-500 hover:text-primary"
                      onClick={() => setSelectedTask(task)}
                    >
                      Детали
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="text-center py-10 text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-xl mb-2">Нет задач для отображения</p>
                <p>У вас пока нет задач в выбранном фильтре</p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      </div>
      
      <>
        <AnimatePresence mode="sync">
          {showModal && <TaskModal />}
          {selectedTask && <TaskDetails />}
        </AnimatePresence>
      </>
    </div>
  );
};

export default Tasks; 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import localforage from 'localforage';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  experience: number;
  subTasks?: { id: string; title: string; completed: boolean }[];
}

const Tasks: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Значения для новой задачи
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Личное',
    experience: 50,
    completed: false
  });

  // Загрузка задач
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const storedTasks = await localforage.getItem<Task[]>('tasks');
        
        if (storedTasks) {
          setTasks(storedTasks);
        } else {
          // Демо-задачи для первого запуска
          const demoTasks: Task[] = [
            {
              id: '1',
              title: 'Завершить проект',
              description: 'Доработать все компоненты и подготовить к релизу',
              completed: false,
              deadline: new Date(Date.now() + 86400000 * 3), // +3 дня
              priority: 'high',
              category: 'Работа',
              experience: 100,
              subTasks: [
                { id: 's1', title: 'Проверить баги', completed: true },
                { id: 's2', title: 'Обновить документацию', completed: false }
              ]
            },
            {
              id: '2',
              title: 'Тренировка',
              description: 'Кардио и силовые упражнения',
              completed: false,
              deadline: new Date(),
              priority: 'medium',
              category: 'Здоровье',
              experience: 50
            },
            {
              id: '3',
              title: 'Купить продукты',
              description: 'Молоко, хлеб, фрукты',
              completed: true,
              deadline: new Date(Date.now() - 86400000), // -1 день
              priority: 'low',
              category: 'Личное',
              experience: 30
            }
          ];
          
          await localforage.setItem('tasks', demoTasks);
          setTasks(demoTasks);
        }
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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
    const taskToToggle = tasks.find(t => t.id === id);
    if (!taskToToggle) return;
    
    const updatedTask = { ...taskToToggle, completed: !taskToToggle.completed };
    const updatedTasks = tasks.map(task => 
      task.id === id ? updatedTask : task
    );
    
    setTasks(updatedTasks);
    await localforage.setItem('tasks', updatedTasks);
    
    // Если задача помечена как выполненная, добавляем опыт пользователю
    if (updatedTask.completed && currentUser) {
      const updatedUser = {
        ...currentUser,
        experience: (currentUser.experience || 0) + updatedTask.experience
      };
      
      // Если опыт достаточен для повышения уровня
      if (updatedUser.experience >= (currentUser.level || 1) * 1000) {
        updatedUser.level = (currentUser.level || 1) + 1;
      }
      
      await updateUser(updatedUser);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title || '',
      description: newTask.description || '',
      completed: false,
      priority: newTask.priority as 'low' | 'medium' | 'high' || 'medium',
      category: newTask.category || 'Личное',
      experience: newTask.experience || 50,
      deadline: newTask.deadline
    };
    
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    await localforage.setItem('tasks', updatedTasks);
    
    // Сбрасываем форму
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'Личное',
      experience: 50,
      completed: false
    });
    
    setShowModal(false);
  };

  const handleDeleteTask = async (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    await localforage.setItem('tasks', updatedTasks);
    setSelectedTask(null);
  };

  // Компоненты UI
  const TaskModal = () => (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowModal(false)}
    >
      <motion.div 
        className="container-ios max-w-md w-full"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Новая задача</h2>
        
        <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }} className="space-y-4">
          <div>
            <label htmlFor="title" className="form-label">
              Название задачи
            </label>
            <input
              id="title"
              type="text"
              value={newTask.title || ''}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="form-input"
              placeholder="Что нужно сделать?"
              required
              autoFocus
            />
          </div>
          
          <div>
            <label htmlFor="description" className="form-label">
              Описание
            </label>
            <textarea
              id="description"
              value={newTask.description || ''}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="form-input"
              placeholder="Описание задачи..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="form-label">
                Категория
              </label>
              <select
                id="category"
                value={newTask.category || 'Личное'}
                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                className="form-input"
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
                value={newTask.priority || 'medium'}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
                className="form-input"
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
                  setNewTask({...newTask, deadline: date});
                }}
                className="form-input"
              />
            </div>
            
            <div>
              <label htmlFor="experience" className="form-label">
                Опыт (XP)
              </label>
              <input
                id="experience"
                type="number"
                value={newTask.experience || 50}
                onChange={(e) => setNewTask({...newTask, experience: parseInt(e.target.value) || 50})}
                className="form-input"
                min={10}
                max={1000}
              />
              <p className="form-hint">От 10 до 1000 XP</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-3">
            <button 
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Отмена
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={!newTask.title}
            >
              Добавить задачу
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  const TaskDetails = () => {
    if (!selectedTask) return null;
    
    return (
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedTask(null)}
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
              onClick={() => setSelectedTask(null)}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
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
          
          {selectedTask.deadline && (
            <div className="mb-4">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Срок выполнения:</span>
              <p>{new Date(selectedTask.deadline).toLocaleDateString()}</p>
            </div>
          )}
          
          {selectedTask.subTasks && selectedTask.subTasks.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Подзадачи:</h3>
              <ul className="space-y-1">
                {selectedTask.subTasks.map(subTask => (
                  <li key={subTask.id} className="flex items-center">
                    <span className={`mr-2 ${subTask.completed ? 'text-success' : 'text-gray-500'}`}>
                      {subTask.completed ? '✓' : '○'}
                    </span>
                    <span className={subTask.completed ? 'line-through text-gray-500' : ''}>
                      {subTask.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex justify-between pt-3">
            <button 
              onClick={() => handleDeleteTask(selectedTask.id)}
              className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-ios hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Удалить
            </button>
            <button 
              onClick={() => {
                toggleTaskComplete(selectedTask.id);
                setSelectedTask(null);
              }}
              className={selectedTask.completed ? 'btn-secondary' : 'btn-primary'}
            >
              {selectedTask.completed ? 'Отменить выполнение' : 'Отметить выполненным'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Мои задачи</h1>
        
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Все
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'active' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Активные
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'completed' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Выполненные
            </button>
          </div>
          
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-input text-sm py-1 px-3"
            >
              <option value="all">Все категории</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
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
                  className={`task-item flex justify-between items-center cursor-pointer ${
                    task.completed ? 'completed' : 
                    task.priority === 'high' ? 'border-red-500' : 
                    task.priority === 'medium' ? 'border-yellow-500' : 
                    'border-green-500'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, margin: 0 }}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-center">
                    <button 
                      className={`flex-shrink-0 w-5 h-5 rounded-full border ${
                        task.completed 
                          ? 'bg-success border-success' 
                          : 'border-gray-400 dark:border-gray-500'
                      } mr-3 flex items-center justify-center`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(task.id);
                      }}
                    >
                      {task.completed && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div>
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="mr-3">{task.category}</span>
                        {task.deadline && (
                          <span>
                            {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium bg-primary/10 text-primary rounded-full px-2 py-1">
                    +{task.experience} XP
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
      
      <div className="fixed bottom-20 md:bottom-6 right-6">
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-2xl">+</span>
        </motion.button>
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
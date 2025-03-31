import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import localforage from 'localforage';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  experience: number;
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // В реальном приложении здесь был бы запрос к API
        // Загружаем тестовые задачи из localStorage
        const storedTasks = await localforage.getItem<Task[]>('tasks');
        
        if (storedTasks) {
          setTasks(storedTasks);
          
          // Подсчёт заданий, выполненных сегодня
          const today = new Date().setHours(0, 0, 0, 0);
          const completedTodayCount = storedTasks.filter(task => 
            task.completed && new Date(task.deadline || Date.now()).setHours(0, 0, 0, 0) === today
          ).length;
          
          setCompletedToday(completedTodayCount);
        } else {
          // Создаем тестовые задачи, если ничего не найдено
          const demoTasks: Task[] = [
            {
              id: '1',
              title: 'Завершить проект',
              completed: false,
              deadline: new Date(Date.now() + 86400000), // +1 день
              priority: 'high',
              category: 'Работа',
              experience: 100
            },
            {
              id: '2',
              title: 'Тренировка',
              completed: false,
              deadline: new Date(),
              priority: 'medium',
              category: 'Здоровье',
              experience: 50
            },
            {
              id: '3',
              title: 'Купить продукты',
              completed: true,
              deadline: new Date(),
              priority: 'low',
              category: 'Личное',
              experience: 30
            }
          ];
          
          await localforage.setItem('tasks', demoTasks);
          setTasks(demoTasks);
          setCompletedToday(1); // Одна задача выполнена
        }
        
        // Получаем текущую серию выполненных задач
        const storedStreak = await localforage.getItem<number>('streak');
        setStreak(storedStreak || 3); // Демо-значение для отображения
        
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Расчет прогресса уровня
  const levelProgress = (currentUser?.experience || 0) % 1000;
  const progressPercentage = (levelProgress / 1000) * 100;

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Приветствие и уровень */}
        <motion.div variants={itemVariants} className="container-ios">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Привет, {currentUser?.username}!</h1>
              <p className="text-gray-600 dark:text-gray-400">Вот ваш прогресс на сегодня</p>
            </div>
            <div className="bg-primary/10 rounded-full p-2 flex flex-col items-center">
              <span className="text-2xl font-bold text-primary">{currentUser?.level}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Уровень</span>
            </div>
          </div>
          
          {/* Прогресс уровня */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Опыт: {levelProgress}/1000</span>
              <span>До следующего уровня: {1000 - levelProgress} XP</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Статистика */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="container-ios text-center">
            <div className="text-3xl font-bold text-primary mb-1">{tasks.length}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Всего задач</div>
          </div>
          
          <div className="container-ios text-center">
            <div className="text-3xl font-bold text-success mb-1">{tasks.filter(t => t.completed).length}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Выполнено</div>
          </div>
          
          <div className="container-ios text-center">
            <div className="text-3xl font-bold text-secondary mb-1">{completedToday}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Сегодня</div>
          </div>
          
          <div className="container-ios text-center">
            <div className="text-3xl font-bold text-info mb-1">{streak}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Серия дней</div>
          </div>
        </motion.div>

        {/* Ближайшие задачи */}
        <motion.div variants={itemVariants} className="container-ios">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Ближайшие задачи</h2>
            <Link to="/tasks" className="text-primary">
              Все задачи
            </Link>
          </div>
          
          <div className="space-y-2">
            {tasks.filter(task => !task.completed).slice(0, 3).map(task => (
              <div 
                key={task.id} 
                className={`task-item flex justify-between items-center ${
                  task.priority === 'high' ? 'border-red-500' : 
                  task.priority === 'medium' ? 'border-yellow-500' : 
                  'border-green-500'
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-medium">{task.title}</h3>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="mr-3">{task.category}</span>
                    {task.deadline && (
                      <span>
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs font-medium bg-primary/10 text-primary rounded-full px-2 py-1">
                  +{task.experience} XP
                </div>
              </div>
            ))}
            
            {tasks.filter(task => !task.completed).length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p>У вас нет активных задач</p>
                <Link to="/tasks" className="text-primary block mt-2">
                  Создать новую задачу
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Мини-карточка боя */}
        <motion.div 
          variants={itemVariants}
          className="container-ios bg-gradient-to-r from-primary/20 to-secondary/20"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-1">Готовы к битве?</h2>
              <p className="text-gray-700 dark:text-gray-300">Выполните 3 задачи, чтобы разблокировать сражение</p>
              <Link to="/battle" className="btn-primary inline-block mt-3">
                К битве
              </Link>
            </div>
            <div className="text-6xl animate-float">⚔️</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 
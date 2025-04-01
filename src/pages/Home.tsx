import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTasks, FaGamepad, FaUser, FaSignInAlt, FaUserPlus, FaArrowRight, FaStar, FaHeart, FaSmile, FaTrophy, FaCalendarAlt, FaBolt, FaShieldAlt, FaArrowUp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { AnimeCharacter } from '../types';
import localforage from 'localforage';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [favoriteCharacter, setFavoriteCharacter] = useState<AnimeCharacter | null>(null);
  const [stats, setStats] = useState({
    totalTasksCompleted: 0,
    tasksCompletedToday: 0,
    battlesWon: 0,
    charactersUnlocked: 0,
    experienceGained: 0,
    streakDays: 0
  });

  useEffect(() => {
    if (currentUser) {
      // Если пользователь авторизован, перенаправляем на дашборд
      // В реальном проекте здесь была бы загрузка данных и т.д.
      loadFavoriteCharacter();
      calculateStats();
    }
  }, [currentUser]);

  const loadFavoriteCharacter = async () => {
    try {
      // Загружаем избранного персонажа
      const favoriteId = await localforage.getItem('favoriteCharacterId') as string | null;
      if (favoriteId) {
        const characters = await localforage.getItem('animeCharacters') as AnimeCharacter[] | null;
        if (characters) {
          const favorite = characters.find(char => char.id === favoriteId);
          if (favorite) {
            setFavoriteCharacter(favorite);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке избранного персонажа:', error);
    }
  };

  const calculateStats = () => {
    if (!currentUser) return;

    // Рассчитываем статистику
    const completed = currentUser.tasks?.filter(task => task.completed)?.length || 0;
    
    // Задачи, выполненные сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = currentUser.tasks?.filter(task => {
      if (!task.completed || !task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    })?.length || 0;
    
    // Количество разблокированных персонажей
    const unlockedCount = currentUser.unlockedCharacters?.length || 0;
    
    setStats({
      totalTasksCompleted: completed,
      tasksCompletedToday: completedToday,
      battlesWon: currentUser.battlesWon || 0,
      charactersUnlocked: unlockedCount,
      experienceGained: currentUser.experience || 0,
      streakDays: currentUser.streakDays || 0
    });
  };

  // Анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5, 
        when: "beforeChildren", 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <motion.div 
          className="flex-grow flex flex-col items-center justify-center relative overflow-hidden py-10 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Фоновые элементы */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-20 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          
          <motion.div 
            className="container-glass max-w-4xl mx-auto z-10 overflow-hidden rounded-2xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row">
              {/* Левая колонка (описание) */}
              <div className="p-8 md:p-12 md:w-1/2">
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Taskventure
                </motion.h1>
                
                <motion.p 
                  className="mt-4 text-lg text-gray-700 dark:text-gray-300"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Объединяем управление задачами с аниме-персонажами в одном приложении!
                </motion.p>
                
                <motion.div 
                  className="mt-8 space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-primary">
                      <FaTasks />
                    </div>
                    <p className="ml-3 text-gray-700 dark:text-gray-300">
                      Создавайте задачи и получайте опыт за их выполнение
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-red-500">
                      <FaGamepad />
                    </div>
                    <p className="ml-3 text-gray-700 dark:text-gray-300">
                      Сражайтесь с аниме-девушками и разблокируйте их
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-pink-500">
                      <FaHeart />
                    </div>
                    <p className="ml-3 text-gray-700 dark:text-gray-300">
                      Развивайте отношения с персонажами и открывайте новые изображения
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="mt-8 flex flex-col sm:flex-row gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Link 
                    to="/login" 
                    className="btn-glass bg-primary/70 hover:bg-primary/90 px-6 py-3 rounded-xl flex items-center justify-center font-medium"
                  >
                    <FaSignInAlt className="mr-2" />
                    Войти
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-glass bg-purple-600/70 hover:bg-purple-600/90 px-6 py-3 rounded-xl flex items-center justify-center font-medium"
                  >
                    <FaUserPlus className="mr-2" />
                    Регистрация
                  </Link>
                </motion.div>
                
                <motion.div 
                  className="mt-6 text-sm text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <p>Для администратора: <span className="font-mono">admin@taskventure.com</span> / <span className="font-mono">123</span></p>
                </motion.div>
              </div>
              
              {/* Правая колонка (изображение) */}
              <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm overflow-hidden relative">
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <img 
                    src="https://i.imgur.com/3k56x5k.png" 
                    alt="Аниме-девушка" 
                    className="h-full object-cover opacity-90"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="max-w-4xl w-full mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 z-10 px-4"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="container-glass p-6 rounded-xl text-center">
              <div className="bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTasks className="text-blue-500" />
              </div>
              <h3 className="font-bold mb-2">Управление задачами</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Создавайте, отслеживайте и выполняйте задачи для получения опыта и наград
              </p>
            </div>
            
            <div className="container-glass p-6 rounded-xl text-center">
              <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGamepad className="text-purple-500" />
              </div>
              <h3 className="font-bold mb-2">Битвы с персонажами</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Используйте выполненные задачи в битвах с аниме-девушками
              </p>
            </div>
            
            <div className="container-glass p-6 rounded-xl text-center">
              <div className="bg-pink-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeart className="text-pink-500" />
              </div>
              <h3 className="font-bold mb-2">Отношения и награды</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Развивайте отношения с персонажами, дарите подарки и получайте награды
              </p>
            </div>
          </motion.div>
        </motion.div>
          
        <footer className="container mx-auto text-center py-6 z-10">
          <p className="text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Taskventure - Аниме и задачи
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Статистика вашего профиля</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Статистика */}
        <div className="lg:col-span-2">
          <div className="container-glass p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaTrophy className="text-yellow-500 mr-2" /> Ваша активность
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-primary text-3xl font-bold">{stats.totalTasksCompleted}</div>
                <div className="text-sm mt-1">Выполнено задач</div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-green-500 text-3xl font-bold">{stats.tasksCompletedToday}</div>
                <div className="text-sm mt-1">Задач сегодня</div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-blue-500 text-3xl font-bold">{stats.battlesWon}</div>
                <div className="text-sm mt-1">Побед в битвах</div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-purple-500 text-3xl font-bold">{stats.charactersUnlocked}</div>
                <div className="text-sm mt-1">Персонажей</div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-amber-500 text-3xl font-bold">{stats.experienceGained}</div>
                <div className="text-sm mt-1">Опыта</div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-red-500 text-3xl font-bold">{stats.streakDays}</div>
                <div className="text-sm mt-1">Дней подряд</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Ваш прогресс</h3>
              <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full" 
                  style={{ width: `${Math.min((currentUser?.experience || 0) / ((currentUser?.level || 1) * 100) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>{currentUser?.experience || 0} XP</span>
                <span>Уровень {currentUser?.level || 1}</span>
              </div>
            </div>
          </div>
          
          <div className="container-glass p-6 rounded-xl mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaCalendarAlt className="text-primary mr-2" /> Ваша активность
            </h2>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-sm ${
                    Math.random() > 0.5 
                      ? 'bg-primary/40 dark:bg-primary/60' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  title={`${Math.floor(Math.random() * 5)} задач`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Избранный персонаж */}
        <div className="container-glass p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaStar className="text-yellow-500 mr-2" /> Избранный персонаж
          </h2>
          
          {favoriteCharacter ? (
            <div className="text-center">
              <div className="relative mx-auto w-48 h-60 mb-4">
                <img 
                  src={favoriteCharacter.images.default} 
                  alt={favoriteCharacter.name} 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              
              <h3 className="text-lg font-semibold">{favoriteCharacter.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{favoriteCharacter.description}</p>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 flex items-center">
                  <FaHeart className="text-red-500 mr-2" />
                  <div>
                    <div className="font-semibold">{favoriteCharacter.health}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Здоровье</div>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 flex items-center">
                  <FaBolt className="text-yellow-500 mr-2" />
                  <div>
                    <div className="font-semibold">{favoriteCharacter.damage}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Урон</div>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 flex items-center">
                  <FaShieldAlt className="text-blue-500 mr-2" />
                  <div>
                    <div className="font-semibold">{favoriteCharacter.stats.defense}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Защита</div>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 flex items-center">
                  <FaArrowUp className="text-green-500 mr-2" />
                  <div>
                    <div className="font-semibold">{favoriteCharacter.level}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Уровень</div>
                  </div>
                </div>
              </div>
              
              <button 
                className="btn-primary w-full"
                onClick={() => navigate(`/character/${favoriteCharacter.id}`)}
              >
                Перейти к персонажу
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <FaStar className="text-gray-300 dark:text-gray-600 text-5xl mx-auto mb-3" />
              <p className="mb-2">У вас пока нет избранного персонажа</p>
              <p className="text-sm mb-4">Победите персонажа в битве 3 раза, разблокируйте его и добавьте в избранное</p>
              
              <button 
                className="btn-primary"
                onClick={() => navigate('/battle')}
              >
                Перейти к битвам
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import localforage from 'localforage';

interface Enemy {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  image: string;
  experienceReward: number;
}

const Battle: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [maxPlayerHealth, setMaxPlayerHealth] = useState(100);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [battleState, setBattleState] = useState<'ready' | 'progress' | 'win' | 'loss'>('ready');
  const [taskCount, setTaskCount] = useState(0);
  const [animation, setAnimation] = useState('');
  const [showReward, setShowReward] = useState(false);
  const [rewardExp, setRewardExp] = useState(0);

  // Загрузка информации о выполненных задачах
  useEffect(() => {
    const fetchTasksCount = async () => {
      try {
        const tasks = await localforage.getItem<any[]>('tasks');
        if (tasks) {
          const completedCount = tasks.filter(task => task.completed).length || 0;
          setTaskCount(completedCount);
        }
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
      }
    };

    fetchTasksCount();
  }, []);

  // Инициализация игрока
  useEffect(() => {
    if (currentUser) {
      const playerLevel = currentUser.level || 1;
      const baseHealth = 100;
      const healthPerLevel = 20;
      const maxHealth = baseHealth + (playerLevel - 1) * healthPerLevel;
      
      setMaxPlayerHealth(maxHealth);
      setPlayerHealth(maxHealth);
    }
  }, [currentUser]);

  // Генерация врага
  const generateEnemy = () => {
    const enemies = [
      {
        id: 'e1',
        name: 'Ленивый Прокрастинатор',
        level: 1,
        health: 80,
        maxHealth: 80,
        attack: 8,
        defense: 3,
        image: '😴',
        experienceReward: 50
      },
      {
        id: 'e2',
        name: 'Монстр Дедлайн',
        level: 2,
        health: 120,
        maxHealth: 120,
        attack: 12,
        defense: 5,
        image: '⏰',
        experienceReward: 80
      },
      {
        id: 'e3',
        name: 'Король Хаоса',
        level: 3,
        health: 200,
        maxHealth: 200,
        attack: 18,
        defense: 8,
        image: '👹',
        experienceReward: 120
      }
    ];
    
    // Выбираем врага в зависимости от уровня игрока
    const playerLevel = currentUser?.level || 1;
    let enemyIndex = 0;
    
    if (playerLevel >= 3) {
      enemyIndex = 2;
    } else if (playerLevel >= 2) {
      enemyIndex = 1;
    }
    
    return enemies[enemyIndex];
  };

  // Запуск битвы
  const startBattle = () => {
    if (taskCount < 3) {
      // Недостаточно выполненных задач
      setBattleLog([
        'Для начала битвы необходимо выполнить хотя бы 3 задачи!'
      ]);
      return;
    }
    
    const newEnemy = generateEnemy();
    setEnemy(newEnemy);
    setBattleState('progress');
    setBattleLog([
      `Вы встретили ${newEnemy.name} (Уровень ${newEnemy.level})!`,
      'Битва началась!'
    ]);
  };

  // Атака игрока
  const playerAttack = () => {
    if (!enemy || battleState !== 'progress') return;
    
    // Расчёт атаки игрока
    const playerStrength = (currentUser?.character?.stats?.strength || 10) + (currentUser?.level || 1) * 2;
    const attackPower = Math.floor(Math.random() * 6) + playerStrength;
    const damage = Math.max(1, attackPower - enemy.defense);
    
    // Применение урона
    const newEnemyHealth = Math.max(0, enemy.health - damage);
    setEnemy({...enemy, health: newEnemyHealth});
    
    // Анимация атаки
    setAnimation('player-attack');
    setTimeout(() => setAnimation(''), 500);
    
    // Обновление лога
    setBattleLog(prev => [...prev, `Вы атакуете и наносите ${damage} урона!`]);
    
    // Проверка победы
    if (newEnemyHealth <= 0) {
      handleVictory();
      return;
    }
    
    // Ответная атака врага (с задержкой)
    setTimeout(() => {
      enemyAttack();
    }, 1000);
  };

  // Атака врага
  const enemyAttack = () => {
    if (!enemy || battleState !== 'progress') return;
    
    // Расчёт атаки врага
    const attackPower = Math.floor(Math.random() * 4) + enemy.attack;
    const playerDefense = (currentUser?.character?.stats?.agility || 10) / 2;
    const damage = Math.max(1, attackPower - playerDefense);
    
    // Применение урона
    const newPlayerHealth = Math.max(0, playerHealth - damage);
    setPlayerHealth(newPlayerHealth);
    
    // Анимация атаки
    setAnimation('enemy-attack');
    setTimeout(() => setAnimation(''), 500);
    
    // Обновление лога
    setBattleLog(prev => [...prev, `${enemy.name} атакует и наносит ${damage} урона!`]);
    
    // Проверка поражения
    if (newPlayerHealth <= 0) {
      setBattleState('loss');
      setBattleLog(prev => [...prev, 'Вы проиграли битву! Но в следующий раз вам повезёт больше.']);
    }
  };

  // Обработка победы
  const handleVictory = async () => {
    if (!enemy || !currentUser) return;
    
    setBattleState('win');
    const expReward = enemy.experienceReward;
    setRewardExp(expReward);
    
    // Обновление лога
    setBattleLog(prev => [
      ...prev, 
      `Вы победили ${enemy.name}!`,
      `Получено ${expReward} опыта!`
    ]);
    
    // Показ анимации награды
    setShowReward(true);
    
    // Обновление опыта игрока
    const updatedUser = {
      ...currentUser,
      experience: (currentUser.experience || 0) + expReward
    };
    
    // Уровень повышается, если достаточно опыта
    if (updatedUser.experience >= (currentUser.level || 1) * 1000) {
      const newLevel = (currentUser.level || 1) + 1;
      updatedUser.level = newLevel;
      setBattleLog(prev => [...prev, `Поздравляем! Вы достигли ${newLevel} уровня!`]);
    }
    
    // Обновляем пользователя в хранилище
    await updateUser(updatedUser);
    
    // Сбрасываем счётчик выполненных задач (для будущих битв)
    const tasks = await localforage.getItem<any[]>('tasks');
    if (tasks) {
      const updatedTasks = tasks.map(task => {
        if (task.completed) {
          return { ...task, usedForBattle: true };
        }
        return task;
      });
      await localforage.setItem('tasks', updatedTasks);
    }
  };

  // Сброс битвы
  const resetBattle = () => {
    setEnemy(null);
    setPlayerHealth(maxPlayerHealth);
    setBattleLog([]);
    setBattleState('ready');
    setShowReward(false);
  };

  // UI компоненты
  const BattleArena = () => (
    <div className="container-ios p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Игрок */}
        <motion.div 
          className={`flex flex-col items-center ${animation === 'enemy-attack' ? 'animate-bounce text-red-500' : ''}`}
          animate={animation === 'player-attack' ? { x: [0, 30, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-5xl mb-3">
            👤
          </div>
          <h3 className="font-bold mb-1">{currentUser?.username || 'Игрок'}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Уровень {currentUser?.level || 1}</p>
          
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs mb-1">
              <span>HP:</span>
              <span>{playerHealth}/{maxPlayerHealth}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(playerHealth / maxPlayerHealth) * 100}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
        
        {/* Центральный элемент битвы */}
        <div className="flex flex-col items-center">
          {battleState === 'progress' ? (
            <div className="text-4xl">⚔️</div>
          ) : battleState === 'win' ? (
            <div className="text-4xl">🏆</div>
          ) : battleState === 'loss' ? (
            <div className="text-4xl">💔</div>
          ) : (
            <div className="text-4xl">VS</div>
          )}
          
          {battleState === 'progress' && (
            <button 
              onClick={playerAttack}
              className="btn-primary mt-4"
              disabled={animation !== ''}
            >
              Атаковать!
            </button>
          )}
          
          {(battleState === 'win' || battleState === 'loss') && (
            <button 
              onClick={resetBattle}
              className="btn-secondary mt-4"
            >
              Новая битва
            </button>
          )}
        </div>
        
        {/* Враг */}
        {enemy ? (
          <motion.div 
            className={`flex flex-col items-center ${animation === 'player-attack' ? 'animate-bounce text-red-500' : ''}`}
            animate={animation === 'enemy-attack' ? { x: [0, -30, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-5xl mb-3">
              {enemy.image}
            </div>
            <h3 className="font-bold mb-1">{enemy.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Уровень {enemy.level}</p>
            
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs mb-1">
                <span>HP:</span>
                <span>{enemy.health}/{enemy.maxHealth}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-5xl mb-3 opacity-50">
              ?
            </div>
            <h3 className="font-bold mb-1 text-gray-500">Враг не выбран</h3>
            
            {battleState === 'ready' && taskCount >= 3 && (
              <button 
                onClick={startBattle}
                className="btn-primary mt-4"
              >
                Начать битву
              </button>
            )}
            
            {battleState === 'ready' && taskCount < 3 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                Выполните еще {3 - taskCount} задач
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  const BattleLog = () => (
    <div className="container-ios p-4 h-64 overflow-auto">
      <h3 className="font-bold mb-3">Журнал битвы</h3>
      
      {battleLog.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Информация о битве будет отображаться здесь
        </p>
      ) : (
        <ul className="space-y-2">
          {battleLog.map((log, index) => (
            <motion.li 
              key={index} 
              className="text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {log}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
  
  const RewardModal = () => (
    <>
      <AnimatePresence mode="sync">
        {showReward && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="container-ios max-w-md w-full text-center p-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4">Победа!</h2>
              <div className="text-6xl mb-6">🏆</div>
              <p className="text-xl mb-6">Вы получили:</p>
              
              <motion.div 
                className="bg-primary/10 text-primary rounded-lg py-4 px-6 inline-block mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-2xl font-bold">+{rewardExp} XP</span>
              </motion.div>
              
              <button 
                onClick={() => setShowReward(false)}
                className="btn-primary w-full"
              >
                Продолжить
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Арена битвы</h1>
      
      {/* Информация о статусе */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="container-ios p-3 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Уровень</p>
          <p className="text-xl font-bold text-primary">{currentUser?.level || 1}</p>
        </div>
        
        <div className="container-ios p-3 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Сила</p>
          <p className="text-xl font-bold text-red-500">{currentUser?.character?.stats?.strength || 10}</p>
        </div>
        
        <div className="container-ios p-3 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Ловкость</p>
          <p className="text-xl font-bold text-green-500">{currentUser?.character?.stats?.agility || 10}</p>
        </div>
        
        <div className="container-ios p-3 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Задачи</p>
          <p className="text-xl font-bold text-amber-500">{taskCount}/3</p>
        </div>
      </div>
      
      <BattleArena />
      <BattleLog />
      <RewardModal />
    </div>
  );
};

export default Battle; 
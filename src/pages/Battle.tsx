import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaBolt, FaTrophy, FaArrowRight, FaCoins, FaGem, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { AnimeCharacter, Task } from '../types';
import localforage from 'localforage';

// Расширенный интерфейс задачи для страницы битвы
interface TaskExtended extends Task {
  experience?: number;
  subTasks?: { id: string; title: string; completed: boolean }[];
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
  tags: string[];
  usedInBattle?: boolean;
}

// Данные для примеров персонажей
const sampleCharacters: AnimeCharacter[] = [
  {
    id: 'char1',
    name: 'Мизуки',
    description: 'Энергичная и жизнерадостная девушка с большими амбициями.',
    level: 1,
    health: 100,
    damage: 15,
    affection: 0,
    defeatedCount: 0,
    stats: {
      health: 100,
      attack: 15,
      defense: 10,
      level: 1
    },
    images: {
      default: 'https://placewaifu.com/image/200/300',
      level1: 'https://placewaifu.com/image/200/301',
      level2: 'https://placewaifu.com/image/200/302',
      level3: 'https://placewaifu.com/image/200/303',
      chibi: 'https://placewaifu.com/image/150/150'
    },
    quotes: {
      greeting: ['Привет! Готов к бою?', 'Наконец-то ты пришел!'],
      battle: ['Я не сдамся!', 'Это всё, на что ты способен?'],
      victory: ['Я победила!', 'Это было легко.'],
      defeat: ['Ты сильнее, чем кажешься...', 'В следующий раз я не проиграю!'],
      levelUp: ['Я стала сильнее!', 'Чувствую прилив энергии!']
    },
    phrases: {
      battle: ['Я не сдамся!', 'Это всё, на что ты способен?'],
      victory: ['Я победила!', 'Это было легко.'],
      defeat: ['Ты сильнее, чем кажешься...', 'В следующий раз я не проиграю!'],
      gift: ['Спасибо за подарок!', 'Это очень мило с твоей стороны!'],
      interaction: ['Привет! Как у тебя дела?', 'Интересно, чем ты занимаешься?']
    }
  },
  {
    id: 'char2',
    name: 'Харука',
    description: 'Застенчивая, но очень умная девушка, которая всегда готова прийти на помощь.',
    level: 1,
    health: 80,
    damage: 12,
    affection: 0,
    defeatedCount: 0,
    stats: {
      health: 80,
      attack: 12,
      defense: 15,
      level: 1
    },
    images: {
      default: 'https://placewaifu.com/image/200/310',
      level1: 'https://placewaifu.com/image/200/311',
      level2: 'https://placewaifu.com/image/200/312',
      level3: 'https://placewaifu.com/image/200/313',
      chibi: 'https://placewaifu.com/image/150/151'
    },
    quotes: {
      greeting: ['П-привет...', 'Ты пришел сразиться со мной?'],
      battle: ['Я должна стать сильнее!', 'Я не сдамся!'],
      victory: ['Я... победила?', 'Ура! Я смогла!'],
      defeat: ['Ты действительно сильный...', 'Мне нужно больше тренироваться...'],
      levelUp: ['Я чувствую себя увереннее!', 'Я стала немного сильнее.']
    },
    phrases: {
      battle: ['Я должна стать сильнее!', 'Я не сдамся!'],
      victory: ['Я... победила?', 'Ура! Я смогла!'],
      defeat: ['Ты действительно сильный...', 'Мне нужно больше тренироваться...'],
      gift: ['С-спасибо...', 'Это для меня?'],
      interaction: ['Я рада тебя видеть!', 'Ты сегодня хорошо выглядишь!']
    }
  },
  {
    id: 'char3',
    name: 'Юкино',
    description: 'Холодная и расчетливая, но справедливая. Отличный стратег.',
    level: 2,
    health: 90,
    damage: 18,
    affection: 0,
    defeatedCount: 0,
    stats: {
      health: 90,
      attack: 18,
      defense: 8,
      level: 2
    },
    images: {
      default: 'https://placewaifu.com/image/200/320',
      level1: 'https://placewaifu.com/image/200/321',
      level2: 'https://placewaifu.com/image/200/322',
      level3: 'https://placewaifu.com/image/200/323',
      chibi: 'https://placewaifu.com/image/150/152'
    },
    quotes: {
      greeting: ['Не трать мое время.', 'Докажи, что достоин моего внимания.'],
      battle: ['Слишком предсказуемо.', 'Ты действуешь нелогично.'],
      victory: ['Как и ожидалось.', 'Я никогда не проигрываю.'],
      defeat: ['Невозможно...', 'Я недооценила тебя.'],
      levelUp: ['Интересно...', 'Я становлюсь сильнее.']
    },
    phrases: {
      battle: ['Слишком предсказуемо.', 'Ты действуешь нелогично.'],
      victory: ['Как и ожидалось.', 'Я никогда не проигрываю.'],
      defeat: ['Невозможно...', 'Я недооценила тебя.'],
      gift: ['Приемлемо.', 'Ты думаешь, что можешь купить мое внимание?'],
      interaction: ['Что тебе нужно?', 'У тебя есть что-то интересное?']
    }
  }
];

// Функция для проверки доступности изображения
const checkImageExists = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Функция для получения URL изображения с обработкой ошибок
const getCharacterImageUrl = async (character: AnimeCharacter, level: string = 'default'): Promise<string> => {
  // Получаем URL из данных персонажа
  const imageKey = level as keyof typeof character.images;
  const imageUrl = character.images[imageKey];
  
  if (!imageUrl) {
    console.log(`Battle: URL изображения для ${character.name} (уровень: ${level}) не найден, использую заглушку`);
    return `https://source.unsplash.com/300x400/?anime,girl,${character.name}`;
  }
  
  // Проверяем, существует ли изображение
  try {
    const exists = await checkImageExists(imageUrl);
    
    if (exists) {
      return imageUrl;
    } else {
      console.log(`Battle: Изображение для ${character.name} (уровень: ${level}) недоступно, использую заглушку`);
      return `https://source.unsplash.com/300x400/?anime,girl,${character.name}`;
    }
  } catch (error) {
    console.error(`Battle: Ошибка при проверке изображения для ${character.name}:`, error);
    return `https://source.unsplash.com/300x400/?anime,girl,${character.name}`;
  }
};

const CharacterFullscreen = ({ character, onClose }: { character: AnimeCharacter; onClose: () => void }) => {
  return (
    <motion.div 
      className="fullscreen-character"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="fullscreen-character-content"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <button 
          className="fullscreen-close-btn"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          {character.images.default ? (
            <img 
              src={character.images.default}
              alt={character.name} 
              className="fullscreen-character-image"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-gray-800">
              <p className="text-white text-3xl">Изображение недоступно</p>
            </div>
          )}
        </div>
        
        <div className="fullscreen-info">
          <h2 className="fullscreen-character-name">{character.name}</h2>
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="fullscreen-character-stats">
                <div className="fullscreen-stat">
                  <span className="fullscreen-stat-label">Уровень</span>
                  <span className="fullscreen-stat-value">{character.level}</span>
                </div>
                <div className="fullscreen-stat">
                  <span className="fullscreen-stat-label">Здоровье</span>
                  <span className="fullscreen-stat-value">{character.health}</span>
                </div>
                <div className="fullscreen-stat">
                  <span className="fullscreen-stat-label">Урон</span>
                  <span className="fullscreen-stat-value">{character.damage}</span>
                </div>
              </div>
              <p className="fullscreen-character-desc">{character.description}</p>
            </div>
            <button 
              className="fullscreen-battle-btn"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onClose();
                // Здесь можно перейти к битве, если необходимо
              }}
            >
              К битве
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Battle: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<AnimeCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<AnimeCharacter | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [inBattle, setInBattle] = useState(false);
  const [battleState, setBattleState] = useState<'idle' | 'playerTurn' | 'enemyTurn' | 'victory' | 'defeat'>('idle');
  const [playerHealth, setPlayerHealth] = useState(0);
  const [enemyHealth, setEnemyHealth] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskExtended[]>([]);
  const [characterImages, setCharacterImages] = useState<Record<string, string>>({});
  const [rewards, setRewards] = useState({ experience: 0, coins: 0 });

  // Загрузка персонажей
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const storedCharacters = await localforage.getItem<AnimeCharacter[]>('animeCharacters');
        
        if (storedCharacters && storedCharacters.length > 0) {
          console.log('Battle.tsx: Загружены персонажи из хранилища:', storedCharacters.length);
          setCharacters(storedCharacters);
          
          // Загружаем картинки для персонажей
          const images: Record<string, string> = {};
          for (const character of storedCharacters) {
            try {
              const imageUrl = await getCharacterImageUrl(character);
              images[character.id] = imageUrl;
            } catch (error) {
              console.error(`Не удалось загрузить изображение для ${character.name}:`, error);
              images[character.id] = character.images.default || '/images/character-placeholder.png';
            }
          }
          setCharacterImages(images);
        } else {
          console.log('Battle.tsx: Персонажи не найдены в хранилище, создаем демо-персонажей');
          const demoCharacters = sampleCharacters;
          await localforage.setItem('animeCharacters', demoCharacters);
          setCharacters(demoCharacters);
        }
      } catch (error) {
        console.error('Battle.tsx: Ошибка при загрузке персонажей:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCharacters();
  }, []);

  // Получаем завершенные задачи
  useEffect(() => {
    const loadCompletedTasks = async () => {
      try {
        let tasks: TaskExtended[] = [];
        
        if (currentUser && currentUser.tasks) {
          // Берем задачи из профиля пользователя
          tasks = currentUser.tasks as TaskExtended[];
        } else {
          // Или из localforage если пользователь не авторизован
          const storedTasks = await localforage.getItem<TaskExtended[]>('tasks');
          if (storedTasks) tasks = storedTasks;
        }
        
        // Фильтруем только завершенные задачи, которые еще не использовались в битве
        const completed = tasks.filter(task => 
          task.completed && !task.usedInBattle
        );
        
        setCompletedTasks(completed);
      } catch (error) {
        console.error('Battle.tsx: Ошибка при загрузке завершенных задач:', error);
      }
    };
    
    loadCompletedTasks();
  }, [currentUser]);

  // Обработчик выбора персонажа
  const handleSelectCharacter = (character: AnimeCharacter) => {
    setSelectedCharacter(character);
    setShowFullscreen(true);
  };

  // Начало битвы
  const startBattle = () => {
    if (!selectedCharacter) return;
    
    // Если нет завершенных задач, показываем сообщение
    if (completedTasks.length === 0) {
      alert('Выполните хотя бы одну задачу, чтобы начать битву!');
      return;
    }
    
    setInBattle(true);
    setBattleState('playerTurn');
    setPlayerHealth(100);
    setEnemyHealth(selectedCharacter.health);
    setBattleLog([`Битва с ${selectedCharacter.name} началась!`]);
    setShowFullscreen(false);
  };

  // Атака игрока
  const playerAttack = async (taskIndex: number) => {
    if (battleState !== 'playerTurn') return;
    
    const task = completedTasks[taskIndex];
    const damage = calculateDamage(task);
    
    // Обновляем здоровье противника
    const newEnemyHealth = Math.max(0, enemyHealth - damage);
    setEnemyHealth(newEnemyHealth);
    
    // Добавляем в лог
    setBattleLog(prev => [...prev, `Вы используете "${task.title}" и наносите ${damage} урона!`]);
    
    // Удаляем задачу из списка доступных
    const updatedTasks = [...completedTasks];
    updatedTasks.splice(taskIndex, 1);
    setCompletedTasks(updatedTasks);
    
    // Обновляем задачу как использованную
    await markTaskAsUsed(task.id);
    
    // Проверяем победу
    if (newEnemyHealth <= 0) {
      handleVictory();
    } else {
      // Ход противника
      setTimeout(() => {
        setBattleState('enemyTurn');
        setTimeout(() => enemyAttack(), 1000);
      }, 1000);
    }
  };

  // Атака противника
  const enemyAttack = () => {
    if (!selectedCharacter) return;
    
    const damage = selectedCharacter.damage;
    const newPlayerHealth = Math.max(0, playerHealth - damage);
    setPlayerHealth(newPlayerHealth);
    
    // Добавляем в лог
    const attackPhrase = selectedCharacter.phrases.battle[Math.floor(Math.random() * selectedCharacter.phrases.battle.length)];
    setBattleLog(prev => [...prev, `${selectedCharacter.name}: "${attackPhrase}"`]);
    setBattleLog(prev => [...prev, `${selectedCharacter.name} наносит ${damage} урона!`]);
    
    // Проверяем поражение
    if (newPlayerHealth <= 0) {
      handleDefeat();
    } else {
      // Возвращаем ход игроку
      setTimeout(() => {
        setBattleState('playerTurn');
      }, 1000);
    }
  };

  // Расчет урона от задачи
  const calculateDamage = (task: TaskExtended) => {
    let baseDamage = 15;
    
    // Бонус от сложности задачи
    if (task.priority === 'high') baseDamage += 10;
    else if (task.priority === 'medium') baseDamage += 5;
    
    // Бонус от опыта задачи
    if (task.experience) baseDamage += Math.floor(task.experience / 10);
    
    // Небольшой случайный фактор
    const randomFactor = Math.random() * 0.3 + 0.85; // От 0.85 до 1.15
    
    return Math.floor(baseDamage * randomFactor);
  };

  // Обработка победы
  const handleVictory = () => {
    setBattleState('victory');
    
    // Рассчитываем награды
    const expReward = selectedCharacter ? selectedCharacter.level * 50 : 50;
    const coinReward = selectedCharacter ? selectedCharacter.level * 10 : 10;
    
    setRewards({ experience: expReward, coins: coinReward });
    
    // Добавляем фразу победы в лог
    if (selectedCharacter) {
      const defeatPhrase = selectedCharacter.phrases.defeat[Math.floor(Math.random() * selectedCharacter.phrases.defeat.length)];
      setBattleLog(prev => [...prev, `${selectedCharacter.name}: "${defeatPhrase}"`]);
    }
    
    setBattleLog(prev => [...prev, `Вы победили! Получено ${expReward} опыта и ${coinReward} монет.`]);
    
    // Обновляем прогресс пользователя, если он авторизован
    if (currentUser) {
      updateUserProgress(expReward, coinReward);
    }
  };

  // Обработка поражения
  const handleDefeat = () => {
    setBattleState('defeat');
    
    // Добавляем фразу победы в лог
    if (selectedCharacter) {
      const victoryPhrase = selectedCharacter.phrases.victory[Math.floor(Math.random() * selectedCharacter.phrases.victory.length)];
      setBattleLog(prev => [...prev, `${selectedCharacter.name}: "${victoryPhrase}"`]);
    }
    
    setBattleLog(prev => [...prev, `Вы проиграли... Попробуйте выполнить больше задач и попытаться снова!`]);
  };

  // Обновляем прогресс пользователя
  const updateUserProgress = async (experience: number, coins: number) => {
    if (!currentUser || !selectedCharacter) return;
    
    try {
      // Обновляем пользователя
      const updatedUser = {
        ...currentUser,
        experience: (currentUser.experience || 0) + experience,
        coins: (currentUser.coins || 0) + coins,
      };
      
      // Проверяем необходимость повышения уровня
      const expForNextLevel = (currentUser.level || 1) * 1000;
      if (updatedUser.experience >= expForNextLevel) {
        updatedUser.level = (currentUser.level || 1) + 1;
      }
      
      // Обновляем прогресс с персонажем
      const characterProgress = { 
        ...(currentUser.characterProgress || {}),
        [selectedCharacter.id]: {
          ...(currentUser.characterProgress?.[selectedCharacter.id] || { closenessLevel: 0, victories: 0 }),
          victories: (currentUser.characterProgress?.[selectedCharacter.id]?.victories || 0) + 1,
          lastInteraction: new Date()
        }
      };
      
      // Если это была третья победа, увеличиваем уровень близости
      if (characterProgress[selectedCharacter.id].victories % 3 === 0) {
        characterProgress[selectedCharacter.id].closenessLevel = 
          (characterProgress[selectedCharacter.id].closenessLevel || 0) + 1;
        
        setBattleLog(prev => [...prev, 
          `Уровень близости с ${selectedCharacter.name} повышен до ${characterProgress[selectedCharacter.id].closenessLevel}!`
        ]);
      }
      
      updatedUser.characterProgress = characterProgress;
      
      // Обновляем пользователя в контексте и хранилище
      await updateUser(updatedUser);
    } catch (error) {
      console.error('Battle.tsx: Ошибка при обновлении прогресса:', error);
    }
  };

  // Помечаем задачу как использованную в битве
  const markTaskAsUsed = async (taskId: string) => {
    try {
      // Обновляем локальное хранилище задач
      const storedTasks = await localforage.getItem<TaskExtended[]>('tasks');
      if (storedTasks) {
        const updatedTasks = storedTasks.map(task => 
          task.id === taskId ? { ...task, usedInBattle: true } : task
        );
        await localforage.setItem('tasks', updatedTasks);
      }
      
      // Если есть пользователь, обновляем его задачи
      if (currentUser && currentUser.tasks) {
        const updatedUserTasks = currentUser.tasks.map(task => 
          task.id === taskId ? { ...task, usedInBattle: true } : task
        );
        await updateUser({ tasks: updatedUserTasks });
      }
    } catch (error) {
      console.error('Battle.tsx: Ошибка при обновлении задачи:', error);
    }
  };

  // Завершение битвы
  const endBattle = () => {
    setInBattle(false);
    setBattleState('idle');
    setSelectedCharacter(null);
  };

  // Рендерим карточку персонажа
  const renderCharacterCard = (character: AnimeCharacter) => {
    const isUnlocked = currentUser?.unlockedCharacters?.includes(character.id) || character.isUnlocked;
    
    return (
      <motion.div 
        key={character.id}
        className={`character-card ${isUnlocked ? 'unlocked' : 'locked'}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelectCharacter(character)}
      >
        <div className="character-image">
          {characterImages[character.id] ? (
            <img 
              src={characterImages[character.id]} 
              alt={character.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/character-placeholder.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span>Загрузка...</span>
            </div>
          )}
          {!isUnlocked && (
            <div className="lock-overlay">
              <FaLock size={24} />
            </div>
          )}
        </div>
        <div className="character-info">
          <h3 className="character-name">{character.name}</h3>
          <div className="character-stats">
            <span>Уровень {character.level}</span>
            <span>❤️ {character.health}</span>
            <span>⚔️ {character.damage}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Рендерим экран битвы
  const renderBattle = () => {
    if (!selectedCharacter) return null;
    
    return (
      <div className="battle-screen">
        <div className="battle-header">
          <div className="battle-character-info">
            <h2>{selectedCharacter.name}</h2>
            <div className="battle-stats">
              <div className="health-bar">
                <div className="health-label">Здоровье: {enemyHealth}/{selectedCharacter.health}</div>
                <div className="health-bar-bg">
                  <div 
                    className="health-bar-fill enemy-health" 
                    style={{ width: `${(enemyHealth / selectedCharacter.health) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="battle-player-info">
            <h2>Вы</h2>
            <div className="battle-stats">
              <div className="health-bar">
                <div className="health-label">Здоровье: {playerHealth}/100</div>
                <div className="health-bar-bg">
                  <div 
                    className="health-bar-fill player-health" 
                    style={{ width: `${playerHealth}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="battle-main">
          <div className="battle-character w-full h-full">
            <img 
              src={characterImages[selectedCharacter.id] || selectedCharacter.images.default} 
              alt={selectedCharacter.name} 
              className="battle-character-image w-full h-full max-h-[70vh] object-contain"
              onClick={() => setShowFullscreen(true)}
              style={{ cursor: 'pointer' }}
            />
          </div>
          
          <div className="battle-log">
            {battleLog.map((log, index) => (
              <div key={index} className="battle-log-entry">
                {log}
              </div>
            ))}
          </div>
        </div>
        
        <div className="battle-actions">
          {battleState === 'playerTurn' && (
            <>
              <h3>Выберите задачу для атаки:</h3>
              <div className="task-list">
                {completedTasks.length > 0 ? (
                  completedTasks.map((task, index) => (
                    <button 
                      key={task.id} 
                      className="task-button"
                      onClick={() => playerAttack(index)}
                    >
                      <span>{task.title}</span>
                      <span className="task-damage">⚔️ ~{calculateDamage(task)}</span>
                    </button>
                  ))
                ) : (
                  <p>У вас нет доступных задач для атаки</p>
                )}
              </div>
            </>
          )}
          
          {battleState === 'enemyTurn' && (
            <div className="enemy-turn-message">
              <p>Ход противника...</p>
            </div>
          )}
          
          {(battleState === 'victory' || battleState === 'defeat') && (
            <div className="battle-result">
              <h3>{battleState === 'victory' ? 'Победа!' : 'Поражение'}</h3>
              {battleState === 'victory' && (
                <div className="battle-rewards">
                  <p>Получено:</p>
                  <div className="rewards-list">
                    <span>✨ {rewards.experience} опыта</span>
                    <span>💰 {rewards.coins} монет</span>
                  </div>
                </div>
              )}
              <button className="btn-primary mt-4" onClick={endBattle}>
                Вернуться к списку персонажей
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Загрузка персонажей...</p>
      </div>
    );
  }

  return (
    <div className="battle-page">
      <AnimatePresence>
        {showFullscreen && selectedCharacter && (
          <CharacterFullscreen 
            character={selectedCharacter} 
            onClose={() => setShowFullscreen(false)} 
          />
        )}
      </AnimatePresence>
      
      {inBattle ? (
        renderBattle()
      ) : (
        <>
          <div className="battle-header">
            <h1>Выберите персонажа для битвы</h1>
            <p>Используйте выполненные задачи, чтобы атаковать персонажей и получать награды.</p>
          </div>
          
          <div className="characters-grid">
            {characters.map(character => renderCharacterCard(character))}
          </div>
          
          {selectedCharacter && !showFullscreen && (
            <div className="character-selection">
              <div className="selected-character-info">
                <h2>{selectedCharacter.name}</h2>
                <p>{selectedCharacter.description}</p>
                <div className="character-stats-detailed">
                  <div className="stat">
                    <span className="stat-label">Уровень</span>
                    <span className="stat-value">{selectedCharacter.level}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Здоровье</span>
                    <span className="stat-value">{selectedCharacter.health}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Урон</span>
                    <span className="stat-value">{selectedCharacter.damage}</span>
                  </div>
                </div>
              </div>
              
              <div className="battle-buttons">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowFullscreen(true)}
                >
                  Просмотр персонажа
                </button>
                <button 
                  className="btn-primary"
                  onClick={startBattle}
                  disabled={completedTasks.length === 0}
                >
                  Начать битву
                </button>
              </div>
              
              {completedTasks.length === 0 && (
                <p className="text-center text-amber-500 mt-2">
                  Выполните хотя бы одну задачу, чтобы начать битву!
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Battle; 
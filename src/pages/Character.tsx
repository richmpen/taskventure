import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Типы характеристик
enum StatType {
  STRENGTH = 'strength',
  INTELLIGENCE = 'intelligence',
  AGILITY = 'agility',
  CHARISMA = 'charisma'
}

// Информация о характеристике
interface StatInfo {
  name: string;
  description: string;
  icon: string;
  color: string;
}

// Структура персонажа
interface CharacterStats {
  strength: number;
  intelligence: number;
  agility: number;
  charisma: number;
}

const Character: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'inventory'>('stats');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedStat, setSelectedStat] = useState<StatType | null>(null);
  
  // Информация о характеристиках
  const statsInfo: Record<StatType, StatInfo> = {
    [StatType.STRENGTH]: {
      name: 'Сила',
      description: 'Увеличивает урон в битвах и позволяет выполнять более сложные задачи.',
      icon: '💪',
      color: 'text-red-500'
    },
    [StatType.INTELLIGENCE]: {
      name: 'Интеллект',
      description: 'Даёт дополнительный опыт за выполнение задач, связанных с обучением.',
      icon: '🧠',
      color: 'text-blue-500'
    },
    [StatType.AGILITY]: {
      name: 'Ловкость',
      description: 'Увеличивает защиту в битвах и шанс уклонения от атак.',
      icon: '🏃',
      color: 'text-green-500'
    },
    [StatType.CHARISMA]: {
      name: 'Харизма',
      description: 'Открывает доступ к специальным заданиям и улучшает наградой.',
      icon: '🌟',
      color: 'text-yellow-500'
    }
  };
  
  // Достижения персонажа
  const achievements = [
    {
      id: 'ach1',
      title: 'Первые шаги',
      description: 'Выполнить первую задачу',
      icon: '🚶',
      unlocked: true
    },
    {
      id: 'ach2',
      title: 'Боевое крещение',
      description: 'Выиграть первую битву',
      icon: '⚔️',
      unlocked: currentUser && currentUser.level >= 2
    },
    {
      id: 'ach3',
      title: 'Мастер планирования',
      description: 'Выполнить 10 задач',
      icon: '📝',
      unlocked: false
    },
    {
      id: 'ach4',
      title: 'Герой продуктивности',
      description: 'Достичь 5 уровня',
      icon: '🏆',
      unlocked: false
    }
  ];
  
  // Предметы в инвентаре
  const inventory = [
    {
      id: 'item1',
      name: 'Кофейный напиток',
      description: '+10 к энергии на следующую задачу',
      icon: '☕',
      usable: true
    },
    {
      id: 'item2',
      name: 'Щит фокуса',
      description: '+5 к защите в битвах',
      icon: '🛡️',
      usable: false,
      equipped: true
    }
  ];

  // Получение значения характеристики
  const getStatValue = (statType: StatType): number => {
    if (!currentUser || !currentUser.character || !currentUser.character.stats) {
      return 10; // Значение по умолчанию
    }
    
    switch (statType) {
      case StatType.STRENGTH:
        return currentUser.character.stats.strength || 10;
      case StatType.INTELLIGENCE:
        return currentUser.character.stats.intelligence || 10;
      case StatType.AGILITY:
        return currentUser.character.stats.agility || 10;
      case StatType.CHARISMA:
        return currentUser.character.stats.charisma || 10;
      default:
        return 10;
    }
  };

  // Обновление характеристики
  const upgradeStat = async (statType: StatType) => {
    if (!currentUser) return;
    
    // Проверка наличия нераспределенных очков (для демонстрации всегда даем возможность)
    // В реальном приложении здесь будет проверка availablePoints
    
    const stats = currentUser.character?.stats || {
      strength: 10,
      intelligence: 10,
      agility: 10,
      charisma: 10
    };
    
    // Создаем копию статов и обновляем нужную характеристику
    const updatedStats: CharacterStats = {
      ...stats,
    };
    
    switch (statType) {
      case StatType.STRENGTH:
        updatedStats.strength += 1;
        break;
      case StatType.INTELLIGENCE:
        updatedStats.intelligence += 1;
        break;
      case StatType.AGILITY:
        updatedStats.agility += 1;
        break;
      case StatType.CHARISMA:
        updatedStats.charisma += 1;
        break;
    }
    
    // Обновляем пользователя
    await updateUser({
      character: {
        ...currentUser.character,
        stats: updatedStats
      }
    });
    
    setShowConfirm(false);
    setSelectedStat(null);
  };
  
  // Отображение модального окна подтверждения
  const StatConfirm = () => {
    if (!selectedStat) return null;
    
    const stat = statsInfo[selectedStat];
    const currentValue = getStatValue(selectedStat);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="container-ios max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Улучшить характеристику?</h2>
          
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl mr-3">
              {stat.icon}
            </div>
            <div>
              <h3 className={`font-bold ${stat.color}`}>{stat.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.description}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm">
              Текущее значение: <span className="font-medium">
                {currentValue}
              </span>
            </p>
            <p className="text-sm">
              Новое значение: <span className="font-medium text-primary">
                {currentValue + 1}
              </span>
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => {
                setShowConfirm(false);
                setSelectedStat(null);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-ios"
            >
              Отмена
            </button>
            <button 
              onClick={() => selectedStat && upgradeStat(selectedStat)}
              className="btn-primary"
            >
              Улучшить
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Мой персонаж</h1>
      
      {/* Карточка персонажа */}
      <div className="container-ios mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-5xl mx-auto">
              👤
            </div>
          </div>
          
          <div className="flex-grow">
            <h2 className="text-xl font-bold">{currentUser?.username || 'Игрок'}</h2>
            <div className="flex items-center mt-1 mb-3">
              <span className="text-primary font-bold mr-2">Уровень {currentUser?.level || 1}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentUser?.experience || 0} / {(currentUser?.level || 1) * 1000} XP
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${((currentUser?.experience || 0) % 1000) / 10}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              До следующего уровня: {(currentUser?.level || 1) * 1000 - (currentUser?.experience || 0)} XP
            </p>
          </div>
        </div>
      </div>
      
      {/* Вкладки */}
      <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 mb-6">
        <button 
          className={`pb-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('stats')}
        >
          Характеристики
        </button>
        <button 
          className={`pb-2 px-4 ${activeTab === 'achievements' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('achievements')}
        >
          Достижения
        </button>
        <button 
          className={`pb-2 px-4 ${activeTab === 'inventory' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('inventory')}
        >
          Инвентарь
        </button>
      </div>
      
      {/* Контент вкладок */}
      <div className="mb-6">
        {/* Характеристики */}
        {activeTab === 'stats' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {Object.entries(statsInfo).map(([key, stat]) => (
              <div 
                key={key}
                className="container-ios flex flex-col sm:flex-row sm:items-center sm:justify-between p-4"
              >
                <div className="flex items-center mb-3 sm:mb-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl mr-3">
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold ${stat.color}`}>{stat.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end sm:flex-shrink-0">
                  <span className="font-bold text-xl mr-4">
                    {getStatValue(key as StatType)}
                  </span>
                  <button 
                    className="btn-primary text-sm py-1"
                    onClick={() => {
                      setSelectedStat(key as StatType);
                      setShowConfirm(true);
                    }}
                  >
                    Улучшить
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
        
        {/* Достижения */}
        {activeTab === 'achievements' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`container-ios p-4 ${!achievement.unlocked ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl mr-3">
                    {achievement.icon}
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {achievement.title}
                      {achievement.unlocked && (
                        <span className="text-green-500 ml-2">✓</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
        
        {/* Инвентарь */}
        {activeTab === 'inventory' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {inventory.length > 0 ? (
              inventory.map((item) => (
                <div 
                  key={item.id}
                  className="container-ios p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl mr-3">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold">
                          {item.name}
                          {item.equipped && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              Экипировано
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    </div>
                    
                    {item.usable && (
                      <button className="btn-secondary text-sm py-1">
                        Использовать
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <p className="text-4xl mb-3">🎒</p>
                <p>Ваш инвентарь пуст</p>
                <p className="text-sm mt-2">
                  Выполняйте задачи и побеждайте в битвах, чтобы получить предметы
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Модальное окно подтверждения */}
      {showConfirm && <StatConfirm />}
    </div>
  );
};

export default Character; 
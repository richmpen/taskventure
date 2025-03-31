import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import localforage from 'localforage';

const Settings: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [language, setLanguage] = useState('ru');
  const [showSaved, setShowSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Получение настроек из localStorage при загрузке
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await localforage.getItem<{
          darkMode: boolean;
          notifications: boolean;
          soundEffects: boolean;
          language: string;
        }>('settings');
        
        if (settings) {
          setDarkMode(settings.darkMode);
          setNotifications(settings.notifications);
          setSoundEffects(settings.soundEffects);
          setLanguage(settings.language);
        }
        
        // Применяем тему при загрузке
        if (settings?.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
      }
    };

    loadSettings();
  }, []);
  
  // Эффект для применения темной темы
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Сохранение настроек
  const saveSettings = async () => {
    try {
      await localforage.setItem('settings', {
        darkMode,
        notifications,
        soundEffects,
        language
      });
      
      // Показываем уведомление об успешном сохранении
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
    }
  };

  // Сброс прогресса
  const resetProgress = async () => {
    try {
      // Удаление задач и прогресса
      await localforage.removeItem('tasks');
      
      // Сброс уровня и опыта пользователя
      if (currentUser) {
        await updateUser({
          level: 1,
          experience: 0,
          character: {
            ...currentUser.character,
            stats: {
              strength: 10,
              intelligence: 10,
              agility: 10,
              charisma: 10
            }
          },
          inventory: [],
          achievements: []
        });
      }
      
      setShowConfirm(false);
      
      // Показываем уведомление об успешном сбросе
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      console.error('Ошибка при сбросе прогресса:', error);
    }
  };

  // Модальное окно подтверждения
  const ConfirmModal = () => (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container-ios max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Сбросить прогресс?</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Это действие удалит все ваши задачи, достижения и сбросит уровень персонажа. Этот процесс необратим.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-ios"
          >
            Отмена
          </button>
          <button 
            onClick={resetProgress}
            className="px-4 py-2 bg-red-600 text-white rounded-ios hover:bg-red-700"
          >
            Сбросить
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>
      
      <div className="space-y-6 mb-8">
        {/* Блок общих настроек */}
        <div className="container-ios">
          <h2 className="text-lg font-semibold mb-4">Общие настройки</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Темная тема</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Переключение между светлой и темной темой
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Уведомления</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Включить уведомления о задачах и событиях
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Звуковые эффекты</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Включить звуки при действиях и битвах
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={soundEffects}
                  onChange={() => setSoundEffects(!soundEffects)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Язык</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Выберите язык интерфейса
                </p>
              </div>
              <select 
                className="form-input py-1 px-3"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={saveSettings}
              className="btn-primary w-full"
            >
              Сохранить настройки
            </button>
          </div>
        </div>
        
        {/* Блок учетной записи */}
        <div className="container-ios">
          <h2 className="text-lg font-semibold mb-4">Учетная запись</h2>
          
          <div className="space-y-3 mb-4">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Имя пользователя</h3>
              <p className="font-medium">{currentUser?.username || 'Не указано'}</p>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Email</h3>
              <p className="font-medium">{currentUser?.email || 'Не указано'}</p>
            </div>
          </div>
          
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-ios w-full text-left"
            >
              Сбросить прогресс
            </button>
          </div>
        </div>
        
        {/* Блок информации */}
        <div className="container-ios">
          <h2 className="text-lg font-semibold mb-4">О приложении</h2>
          
          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Taskventure</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Версия 0.1.0
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">Разработчик</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your Company © 2023
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Уведомление о сохранении */}
      {showSaved && (
        <motion.div 
          className="fixed bottom-6 left-0 right-0 flex justify-center z-50"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <div className="bg-success text-white px-4 py-2 rounded-full shadow-lg">
            Настройки успешно сохранены
          </div>
        </motion.div>
      )}
      
      {/* Модальное окно подтверждения */}
      {showConfirm && <ConfirmModal />}
    </div>
  );
};

export default Settings; 
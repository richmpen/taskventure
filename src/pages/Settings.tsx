import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import localforage from 'localforage';
import { Settings as SettingsType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { TabButton, LanguageButton, FormSwitch } from '../components/ui';

// Словари для локализации
const translations = {
  ru: {
    settings: 'Настройки',
    generalSettings: 'Общие настройки',
    general: 'Общие',
    darkTheme: 'Темная тема',
    darkThemeDesc: 'Переключение между светлой и тёмной темой интерфейса',
    appearance: 'Внешний вид',
    darkMode: 'Темный режим',
    notifications: 'Уведомления',
    enableNotifications: 'Включить уведомления',
    notificationsDesc: 'Включение или отключение уведомлений приложения',
    soundEffects: 'Звуковые эффекты',
    sound: 'Звук',
    soundEffectsDesc: 'Включение или отключение звуковых эффектов',
    language: 'Язык',
    languageDesc: 'Выбор языка интерфейса',
    languageSelection: 'Выбор языка',
    accountInfo: 'Информация об аккаунте',
    username: 'Имя пользователя',
    email: 'Email',
    level: 'Уровень',
    coins: 'Монеты',
    crystals: 'Кристаллы',
    unlockedCharacters: 'Разблокировано персонажей',
    resetProgress: 'Сбросить прогресс',
    logout: 'Выйти из аккаунта',
    notAuthorized: 'Вы не авторизованы',
    about: 'О приложении',
    version: 'Версия',
    developer: 'Разработчик',
    allRightsReserved: '© 2023 Taskventure. Все права защищены.',
    resetConfirmation: 'Подтверждение сброса',
    resetWarning: 'Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить. Будут сброшены:',
    resetItems: [
      'Уровень и опыт',
      'Монеты и кристаллы',
      'Разблокированные персонажи',
      'Все отношения с персонажами',
      'Все задачи'
    ],
    cancel: 'Отмена',
    resetAll: 'Сбросить всё',
    processing: 'Выполняется...',
    saveChanges: 'Сохранить',
    saving: 'Сохранение...',
    saved: 'Сохранено!'
  },
  en: {
    settings: 'Settings',
    generalSettings: 'General Settings',
    general: 'General',
    darkTheme: 'Dark Theme',
    darkThemeDesc: 'Switch between light and dark interface themes',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    enableNotifications: 'Enable Notifications',
    notificationsDesc: 'Enable or disable app notifications',
    soundEffects: 'Sound Effects',
    sound: 'Sound',
    soundEffectsDesc: 'Enable or disable sound effects',
    language: 'Language',
    languageDesc: 'Choose interface language',
    languageSelection: 'Language Selection',
    accountInfo: 'Account Information',
    username: 'Username',
    email: 'Email',
    level: 'Level',
    coins: 'Coins',
    crystals: 'Crystals',
    unlockedCharacters: 'Unlocked Characters',
    resetProgress: 'Reset Progress',
    logout: 'Logout',
    notAuthorized: 'You are not authorized',
    about: 'About App',
    version: 'Version',
    developer: 'Developer',
    allRightsReserved: '© 2023 Taskventure. All rights reserved.',
    resetConfirmation: 'Reset Confirmation',
    resetWarning: 'Are you sure you want to reset all progress? This action cannot be undone. The following will be reset:',
    resetItems: [
      'Level and experience',
      'Coins and crystals',
      'Unlocked characters',
      'All character relationships',
      'All tasks'
    ],
    cancel: 'Cancel',
    resetAll: 'Reset All',
    processing: 'Processing...',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    saved: 'Saved!'
  }
};

const Settings: React.FC = () => {
  const { currentUser, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'language' | 'sound'>('general');
  const [settings, setSettings] = useState<SettingsType>({
    theme: 'light',
    notifications: true,
    sound: true,
    language: 'ru'
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  // Выбираем текущий словарь по настройкам языка
  const t = translations[settings.language as keyof typeof translations];

  // Загрузка настроек при монтировании компонента
  useEffect(() => {
    const loadSettings = async () => {
      if (currentUser) {
        // Получаем настройки из профиля пользователя
        const userSettings = currentUser.settings;
        
        // Проверяем, что настройки существуют и соответствуют ожидаемому формату
        if (userSettings) {
          const validSettings: SettingsType = {
            theme: userSettings.theme as 'light' | 'dark' | 'system',
            notifications: userSettings.notifications === undefined ? true : userSettings.notifications,
            sound: userSettings.sound === undefined ? true : userSettings.sound,
            language: userSettings.language as 'ru' | 'en'
          };
          setSettings(validSettings);
        } else {
          // Устанавливаем настройки по умолчанию
          setSettings({
            theme: 'light',
            notifications: true,
            sound: true,
            language: 'ru'
          });
        }
      }
    };
    
    loadSettings();
  }, [currentUser]);
  
  // Сохранение настроек при их изменении
  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    
    try {
      if (currentUser) {
        await updateUser({ settings });
      }
      
      // Сохраняем настройки в локальное хранилище для быстрого доступа
      await localforage.setItem('settings', settings);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Применение темы
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = theme === 'dark' || (theme === 'system' && prefersDark);
    
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Сброс прогресса
  const resetProgress = async () => {
    if (loading || !currentUser) return;
    
    setLoading(true);
    try {
      // Сбрасываем данные пользователя
      const resetUser = {
        ...currentUser,
        level: 1,
        experience: 0,
        coins: 0,
        crystals: 0,
        unlockedCharacters: [],
        stats: {
          strength: 10,
          intelligence: 10,
          charisma: 10,
          kawaii: 10
        }
      };
      
      // Обновляем данные в контексте и хранилище
      await updateUser(resetUser);
      
      // Удаляем все задачи
      await localforage.setItem('tasks', []);
      
      // Сбрасываем прогресс персонажей
      const characters = await localforage.getItem<any[]>('animeCharacters') || [];
      const resetCharacters = characters.map(character => ({
        ...character,
        isUnlocked: false,
        defeatedCount: 0,
        affection: 0
      }));
      
      await localforage.setItem('animeCharacters', resetCharacters);
      
      setShowResetModal(false);
    } catch (error) {
      console.error('Ошибка при сбросе прогресса:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Компонент для вкладки "Язык"
  const LanguageSettings = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">{t.language}</h3>
          <div className="flex space-x-3">
            <LanguageButton 
              active={settings.language === 'ru'} 
              onClick={() => setSettings({...settings, language: 'ru'})}
            >
              Русский
            </LanguageButton>
            <LanguageButton 
              active={settings.language === 'en'} 
              onClick={() => setSettings({...settings, language: 'en'})}
            >
              English
            </LanguageButton>
          </div>
        </div>
      </div>
    );
  };

  // Компонент для вкладки "Звук"
  const SoundSettings = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span>{t.soundEffects}</span>
          <FormSwitch 
            checked={settings.sound} 
            onChange={() => setSettings({...settings, sound: !settings.sound})}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{t.settings}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
        {/* Навигация по вкладкам */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
          <TabButton 
            active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')}
          >
            {t.generalSettings}
          </TabButton>
          <TabButton 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')}
          >
            {t.notifications}
          </TabButton>
          <TabButton 
            active={activeTab === 'language'} 
            onClick={() => setActiveTab('language')}
          >
            {t.language}
          </TabButton>
          <TabButton 
            active={activeTab === 'sound'} 
            onClick={() => setActiveTab('sound')}
          >
            {t.soundEffects}
          </TabButton>
        </div>
        
        {/* Контент активной вкладки */}
        <div className="p-1">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">{t.darkTheme}</h3>
                <div className="flex items-center justify-between">
                  <span>{t.darkTheme}</span>
                  <FormSwitch 
                    checked={settings.theme === 'dark'} 
                    onChange={() => {
                      const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
                      setSettings({...settings, theme: newTheme});
                      toggleTheme();
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span>{t.notifications}</span>
                <FormSwitch 
                  checked={settings.notifications} 
                  onChange={() => setSettings({...settings, notifications: !settings.notifications})}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'language' && <LanguageSettings />}
          
          {activeTab === 'sound' && <SoundSettings />}
        </div>
        
        {/* Кнопка сохранения настроек */}
        <div className="mt-6 flex justify-end">
          <button 
            className={`btn-primary ${saved ? 'bg-green-500' : ''} ${loading ? 'opacity-70 cursor-wait' : ''}`}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? t.saving : saved ? t.saved : t.saveChanges}
          </button>
        </div>
      </div>
      
      {/* Информация об аккаунте */}
      <div className="container-ios">
        <h2 className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-700">{t.accountInfo}</h2>
        
        <div className="p-4 space-y-4">
          {currentUser ? (
            <>
              <div className="flex items-center justify-between">
                <span className="font-medium">{t.username}</span>
                <span>{currentUser.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{t.email}</span>
                <span>{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{t.level}</span>
                <span>{currentUser.level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{t.coins}</span>
                <span>{currentUser.coins} 💰</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{t.crystals}</span>
                <span>{currentUser.crystals} 💎</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{t.unlockedCharacters}</span>
                <p className="text-sm">{currentUser.unlockedCharacters?.length || 0}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowResetModal(true)}
                  className="btn-danger w-full"
                  disabled={loading}
                >
                  {t.resetProgress}
                </button>
                
                <button
                  onClick={logout}
                  className="btn-secondary w-full mt-3"
                  disabled={loading}
                >
                  {t.logout}
                </button>
              </div>
            </>
          ) : (
            <p className="text-center py-4">{t.notAuthorized}</p>
          )}
        </div>
      </div>
      
      {/* О приложении */}
      <div className="container-ios">
        <h2 className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-700">{t.about}</h2>
        
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{t.version}</span>
            <span>1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">{t.developer}</span>
            <span>Taskventure Team</span>
          </div>
          <div className="pt-4 text-sm text-center text-gray-600 dark:text-gray-400">
            <p>{t.allRightsReserved}</p>
          </div>
        </div>
      </div>
      
      {/* Модальное окно подтверждения сброса прогресса */}
      <AnimatePresence mode="wait">
        {showResetModal && <ResetConfirmModal />}
      </AnimatePresence>
    </div>
  );
  
  // Модальное окно подтверждения сброса прогресса
  function ResetConfirmModal() {
    // Предотвращаем закрытие окна во время обработки
    const handleClose = () => {
      if (loading) return;
      setShowResetModal(false);
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
          <h2 className="text-xl font-bold mb-4 text-red-500">{t.resetConfirmation}</h2>
          <p className="mb-6">
            {t.resetWarning}
          </p>
          
          <ul className="list-disc pl-5 mb-6 space-y-1">
            {t.resetItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={handleClose}
              className="btn-secondary"
              disabled={loading}
            >
              {t.cancel}
            </button>
            <button 
              onClick={resetProgress}
              className="btn-danger"
              disabled={loading}
            >
              {loading ? t.processing : t.resetAll}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }
};

export default Settings; 
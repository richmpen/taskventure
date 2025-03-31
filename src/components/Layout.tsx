import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Анимированные иконки (иллюстрация, в реальном проекте лучше использовать SVG или библиотеку иконок)
const Icons = {
  home: "🏠",
  tasks: "📋",
  battle: "⚔️",
  character: "👤",
  settings: "⚙️",
  logout: "🚪"
};

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300';
  };

  return (
    <div className="flex min-h-screen">
      {/* Мобильная навигация */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
        <nav className="flex justify-around items-center p-3">
          <Link to="/" className={`flex flex-col items-center p-2 rounded-md ${isActive('/')}`}>
            <span className="text-xl">{Icons.home}</span>
            <span className="text-xs mt-1">Главная</span>
          </Link>
          <Link to="/tasks" className={`flex flex-col items-center p-2 rounded-md ${isActive('/tasks')}`}>
            <span className="text-xl">{Icons.tasks}</span>
            <span className="text-xs mt-1">Задачи</span>
          </Link>
          <Link to="/battle" className={`flex flex-col items-center p-2 rounded-md ${isActive('/battle')}`}>
            <span className="text-xl">{Icons.battle}</span>
            <span className="text-xs mt-1">Битва</span>
          </Link>
          <Link to="/character" className={`flex flex-col items-center p-2 rounded-md ${isActive('/character')}`}>
            <span className="text-xl">{Icons.character}</span>
            <span className="text-xs mt-1">Персонаж</span>
          </Link>
          <button 
            onClick={toggleMenu} 
            className="flex flex-col items-center p-2 rounded-md text-gray-600 dark:text-gray-300"
          >
            <span className="text-xl">≡</span>
            <span className="text-xs mt-1">Меню</span>
          </button>
        </nav>
      </div>

      {/* Боковая навигация (десктоп) */}
      <div className="hidden md:flex md:flex-col md:w-60 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary">Taskventure</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ваше продуктивное приключение</p>
        </div>
        
        <div className="p-3">
          <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-ios shadow-sm">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
              {currentUser?.username.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{currentUser?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Уровень {currentUser?.level || 1}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-3">
          <Link to="/" className={`flex items-center p-3 mb-2 rounded-ios ${isActive('/')}`}>
            <span className="mr-3 text-xl">{Icons.home}</span>
            <span>Главная</span>
          </Link>
          <Link to="/tasks" className={`flex items-center p-3 mb-2 rounded-ios ${isActive('/tasks')}`}>
            <span className="mr-3 text-xl">{Icons.tasks}</span>
            <span>Задачи</span>
          </Link>
          <Link to="/battle" className={`flex items-center p-3 mb-2 rounded-ios ${isActive('/battle')}`}>
            <span className="mr-3 text-xl">{Icons.battle}</span>
            <span>Битва</span>
          </Link>
          <Link to="/character" className={`flex items-center p-3 mb-2 rounded-ios ${isActive('/character')}`}>
            <span className="mr-3 text-xl">{Icons.character}</span>
            <span>Персонаж</span>
          </Link>
          <Link to="/settings" className={`flex items-center p-3 mb-2 rounded-ios ${isActive('/settings')}`}>
            <span className="mr-3 text-xl">{Icons.settings}</span>
            <span>Настройки</span>
          </Link>
        </nav>
        
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full p-3 rounded-ios text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="mr-3 text-xl">{Icons.logout}</span>
            <span>Выход</span>
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black bg-opacity-50" onClick={toggleMenu}>
          <div 
            className="absolute right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-primary">Меню</h2>
              <button onClick={toggleMenu} className="text-gray-500 text-xl">&times;</button>
            </div>
            
            <div className="flex items-center p-3 mb-4 bg-gray-100 dark:bg-gray-700 rounded-ios">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
                {currentUser?.username.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{currentUser?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Уровень {currentUser?.level || 1}</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <Link to="/settings" className="flex items-center p-3 rounded-ios text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <span className="mr-3 text-xl">{Icons.settings}</span>
                <span>Настройки</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="flex items-center w-full p-3 rounded-ios text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="mr-3 text-xl">{Icons.logout}</span>
                <span>Выход</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
};

export default Layout; 
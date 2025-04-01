import React, { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, FaTasks, FaGamepad, FaUser, FaCog, 
  FaSignOutAlt, FaShieldAlt, FaBars, FaTimes, 
  FaCoins, FaGem, FaUserFriends, FaStore,
  FaComments, FaPaperPlane, FaEllipsisV,
  FaDragon, FaUserCircle, FaSun, FaMoon,
  FaEnvelope, FaBell, FaChevronDown
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { Task, Friend, Message, AnimeCharacter } from '../types';
import localforage from 'localforage';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [activeTasks, setActiveTasks] = useState<number>(0);
  const [favoriteCharacter, setFavoriteCharacter] = useState<AnimeCharacter | null>(null);
  
  // Состояния для чата
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isSelectingFriend, setIsSelectingFriend] = useState(true);
  
  // При монтировании компонента загружаем любимого персонажа
  useEffect(() => {
    const loadFavoriteCharacter = async () => {
      try {
        const favoriteId = await localforage.getItem<string>('favoriteCharacterId');
        if (favoriteId) {
          const characters = await localforage.getItem<AnimeCharacter[]>('animeCharacters');
          const favorite = characters?.find(char => char.id === favoriteId) || null;
          setFavoriteCharacter(favorite);
        }
      } catch (error) {
        console.error('Ошибка при загрузке избранного персонажа:', error);
      }
    };

    loadFavoriteCharacter();
  }, []);

  // Загружаем количество активных задач
  useEffect(() => {
    const loadActiveTasks = async () => {
      try {
        if (currentUser) {
          const tasks = await localforage.getItem<Task[]>('tasks') || [];
          const active = tasks.filter(task => !task.completed).length;
          setActiveTasks(active);
        }
      } catch (error) {
        console.error('Ошибка при загрузке активных задач:', error);
      }
    };

    loadActiveTasks();
  }, [currentUser, location.pathname]);

  // Проверка на админа
  useEffect(() => {
    if (currentUser?.email === 'admin@taskventure.com') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [currentUser]);

  // Загрузка друзей
  useEffect(() => {
    if (currentUser) {
      // В реальном приложении это был бы API запрос
      const friends = currentUser.friends || [];
      // Если демо-пользователь и нет друзей, создаем демо-друзей
      if (currentUser.email === 'demo@example.com' && friends.length === 0) {
        const demoFriends: Friend[] = [
          {
            id: 'friend-1',
            username: 'Хината',
            avatar: '/avatars/hinata.jpg',
            status: 'online',
            lastActive: new Date().toISOString()
          },
          {
            id: 'friend-2',
            username: 'Сакура',
            avatar: '/avatars/sakura.jpg',
            status: 'offline',
            lastActive: new Date(Date.now() - 86400000).toISOString() // вчера
          },
          {
            id: 'friend-3',
            username: 'Наруто',
            avatar: '/avatars/naruto.jpg',
            status: 'away',
            lastActive: new Date(Date.now() - 3600000).toISOString() // час назад
          }
        ];
        setFriendsList(demoFriends);
      } else {
        setFriendsList(friends);
      }
      
      // Загрузка сообщений
      setMessages(currentUser.messages || {});
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  };

  const menuItems = [
    { path: '/', icon: <FaHome size={20} />, label: 'Главная' },
    { path: '/tasks', icon: <FaTasks size={20} />, label: 'Задачи' },
    { path: '/battle', icon: <FaGamepad size={20} />, label: 'Битва' },
    { path: '/characters', icon: <FaDragon size={20} />, label: 'Персонажи' },
    { path: '/profile', icon: <FaUserCircle size={20} />, label: 'Профиль' },
    { path: '/settings', icon: <FaCog size={20} />, label: 'Настройки' },
    { path: '/friends', icon: <FaUserFriends size={20} />, label: 'Друзья' },
    { path: '/shop', icon: <FaStore size={20} />, label: 'Магазин' },
  ];

  // Добавляем пункт админ-панели для администратора
  if (isAdmin) {
    menuItems.push({ 
      path: '/admin', 
      icon: <FaShieldAlt size={20} />, 
      label: 'Админ панель' 
    });
  }

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'bg-primary/10 text-primary dark:bg-primary/20' 
      : 'text-gray-700 dark:text-gray-300';
  };

  // Анимации
  const menuVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Отправка сообщения
  const sendMessage = () => {
    if (!selectedFriend || !newMessage.trim()) return;
    
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'user',
      receiverId: selectedFriend.id,
      text: newMessage,
      timestamp: new Date(),
      read: true
    };
    
    // Добавляем сообщение в локальное состояние
    setMessages(prevMessages => {
      const friendMsgs = prevMessages[selectedFriend.id] || [];
      return {
        ...prevMessages,
        [selectedFriend.id]: [...friendMsgs, newMsg]
      };
    });
    
    // Сбрасываем поле ввода
    setNewMessage('');
    
    // В реальном приложении сохраняли бы в БД или отправляли через API
  };
  
  // Закрытие чата
  const closeChat = () => {
    setIsChatOpen(false);
    setSelectedFriend(null);
    setIsSelectingFriend(true);
  };
  
  // Выбор друга для чата
  const selectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
    setIsSelectingFriend(false);
  };
  
  // Компонент чата
  const ChatBox = () => {
    return (
      <motion.div 
        className="fixed bottom-20 right-4 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden z-40 border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', duration: 0.4 }}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
          {selectedFriend && !isSelectingFriend ? (
            <>
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    {selectedFriend.avatar ? (
                      <img src={selectedFriend.avatar} alt={selectedFriend.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                        {selectedFriend.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                    selectedFriend.status === 'online' ? 'bg-green-500' :
                    selectedFriend.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="ml-2">
                  <h3 className="font-medium text-sm">{selectedFriend.username}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedFriend.status === 'online' ? 'В сети' :
                     selectedFriend.status === 'away' ? 'Отошел' : 'Не в сети'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => setIsSelectingFriend(true)}
                  className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaEllipsisV size={16} />
                </button>
                <button
                  onClick={closeChat}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-medium">Выберите друга для чата</h3>
              <button
                onClick={closeChat}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes size={18} />
              </button>
            </>
          )}
        </div>
        
        {isSelectingFriend ? (
          <div className="max-h-96 overflow-y-auto">
            {friendsList.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {friendsList.map(friend => (
                  <div 
                    key={friend.id}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                    onClick={() => selectFriend(friend)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        {friend.avatar ? (
                          <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        friend.status === 'online' ? 'bg-green-500' :
                        friend.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">{friend.username}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {friend.status === 'online' ? 'В сети' :
                         friend.status === 'away' ? 'Отошел' : 'Не в сети'}
                      </p>
                    </div>
                    {/* Индикатор непрочитанных сообщений */}
                    {currentUser && currentUser.messages && 
                     currentUser.messages[friend.id] && 
                     currentUser.messages[friend.id].some(msg => !msg.read && msg.senderId === friend.id) && (
                      <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {currentUser.messages[friend.id].filter(msg => !msg.read && msg.senderId === friend.id).length}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>У вас пока нет друзей</p>
                <button
                  onClick={() => navigate('/friends')}
                  className="mt-2 text-primary hover:underline"
                >
                  Найти друзей
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="h-80 overflow-y-auto p-3 flex flex-col space-y-2">
              {selectedFriend && messages[selectedFriend.id] && messages[selectedFriend.id].length > 0 ? (
                messages[selectedFriend.id].map(msg => (
                  <div 
                    key={msg.id}
                    className={`max-w-3/4 rounded-lg p-2 ${
                      msg.senderId === currentUser?.id 
                        ? 'bg-primary/10 text-primary ml-auto' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <p>Начните общение</p>
                </div>
              )}
            </div>
            
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-1 form-input rounded-full text-sm py-1 border-gray-300 dark:border-gray-600"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="ml-2 p-2 rounded-full bg-primary text-white"
                  disabled={!newMessage.trim()}
                >
                  <FaPaperPlane size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Боковое меню (десктоп) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 h-screen shadow-md z-20">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 mr-2 bg-primary rounded-md flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <h1 className="text-xl font-bold text-primary">Taskventure</h1>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="overflow-y-auto flex-1">
          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-ios text-sm ${isActive(item.path)}`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                    
                    {/* Показываем количество активных задач */}
                    {item.path === '/tasks' && activeTasks > 0 && (
                      <span className="ml-auto bg-primary text-white text-xs px-2 py-1 rounded-full">
                        {activeTasks}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {currentUser && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <FaSignOutAlt className="mr-3" size={20} />
              <span>Выйти</span>
            </button>
          </div>
        )}
      </aside>
      
      {/* Основной контент */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Верхняя панель */}
        <header className="bg-white dark:bg-gray-800 shadow h-16 flex items-center justify-between px-6 z-10">
          <div className="flex items-center">
            <button 
              className="md:hidden text-gray-700 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FaBars size={24} />
            </button>
            <h2 className="text-lg font-semibold ml-4 md:ml-0 dark:text-white">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Taskventure'}
            </h2>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:block mr-6">
              <ThemeToggle />
            </div>
            
            <div className="relative">
              {currentUser && (
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <FaCoins className="text-yellow-500" size={14} />
                      <span className="text-sm font-medium">{currentUser.coins || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaGem className="text-purple-500" size={14} />
                      <span className="text-sm font-medium">{currentUser.crystals || 0}</span>
                    </div>
                  </div>
                  
                  {/* Отображение информации о пользователе */}
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
                      {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{currentUser.username || 'Пользователь'}</span>
                      <span className="text-xs text-gray-500">Уровень {currentUser.level || 1}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Контент */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      
      {/* Плавающий чат с друзьями */}
      {currentUser && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            className="btn-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <FaComments size={20} />
            <span className="sr-only">Чат с друзьями</span>
            {/* Индикатор непрочитанных сообщений */}
            {currentUser.messages && Object.values(currentUser.messages).some(messages => 
              messages.some(msg => !msg.read && msg.senderId !== currentUser.id)
            ) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
            )}
          </button>
          
          <AnimatePresence>
            {isChatOpen && <ChatBox />}
          </AnimatePresence>
        </div>
      )}
      
      {/* Мобильное меню */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div 
              className="absolute left-0 top-0 w-64 h-full bg-white dark:bg-gray-800 shadow-xl"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="h-8 w-8 mr-2 bg-primary rounded-md flex items-center justify-center text-white font-bold text-xl">
                    T
                  </div>
                  <h1 className="text-xl font-bold text-primary">Taskventure</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <FaTimes size={24} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
              
              <div className="overflow-y-auto h-full pb-16">
                <nav className="mt-4 px-2">
                  <ul className="space-y-1">
                    {menuItems.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive(item.path)}`}
                          onClick={closeMobileMenu}
                        >
                          <span className="mr-3">{item.icon}</span>
                          <span>{item.label}</span>
                          {item.path === '/tasks' && activeTasks > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                              {activeTasks}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                
                {currentUser && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        <FaCoins className="text-yellow-500" size={14} />
                        <span className="text-sm font-medium">{currentUser.coins || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaGem className="text-purple-500" size={14} />
                        <span className="text-sm font-medium">{currentUser.crystals || 0}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FaSignOutAlt className="mr-2" size={18} />
                      <span>Выйти</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout; 
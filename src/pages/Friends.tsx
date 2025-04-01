import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FaUserPlus, FaUserMinus, FaComment, FaTimes, 
  FaUserFriends, FaSearch, FaEllipsisV, FaPaperPlane,
  FaSmile, FaPaperclip, FaLock, FaCheck, FaUser, FaTrash
} from 'react-icons/fa';
import { Friend } from '../types';

const Friends: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFriends(currentUser.friends || []);
      setFriendRequests(currentUser.friendRequests || []);
    }
  }, [currentUser]);

  const handleSendRequest = () => {
    if (!friendSearch.trim()) return;
    
    // В реальном приложении здесь должен быть запрос к API
    // Для демонстрации просто сбрасываем поле поиска
    alert(`Запрос дружбы отправлен пользователю ${friendSearch}`);
    setFriendSearch('');
  };

  const handleAcceptRequest = (friend: Friend) => {
    if (!currentUser || !updateUser) return;
    
    // Добавляем в друзья
    const updatedFriends = [...friends, friend];
    
    // Удаляем из запросов
    const updatedRequests = friendRequests.filter(req => req.id !== friend.id);
    
    setFriends(updatedFriends);
    setFriendRequests(updatedRequests);
    
    // Обновляем данные пользователя
    updateUser({
      friends: updatedFriends,
      friendRequests: updatedRequests
    });
  };

  const handleRejectRequest = (friendId: string) => {
    if (!currentUser || !updateUser) return;
    
    // Удаляем из запросов
    const updatedRequests = friendRequests.filter(req => req.id !== friendId);
    setFriendRequests(updatedRequests);
    
    // Обновляем данные пользователя
    updateUser({
      friendRequests: updatedRequests
    });
  };

  const handleRemoveFriend = (friendId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого друга?')) return;
    
    if (!currentUser || !updateUser) return;
    
    // Удаляем из друзей
    const updatedFriends = friends.filter(friend => friend.id !== friendId);
    setFriends(updatedFriends);
    
    // Обновляем данные пользователя
    updateUser({
      friends: updatedFriends
    });
  };

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedFriend || !currentUser || !updateUser) return;
    
    // Создаем новое сообщение
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: selectedFriend.id,
      text: messageText,
      timestamp: new Date(),
      read: false
    };
    
    // Получаем текущие сообщения или создаем новый массив
    const currentMessages = currentUser.messages || {};
    const friendMessages = currentMessages[selectedFriend.id] || [];
    
    // Добавляем новое сообщение
    const updatedMessages = {
      ...currentMessages,
      [selectedFriend.id]: [...friendMessages, newMessage]
    };
    
    // Обновляем данные пользователя
    updateUser({
      messages: updatedMessages
    });
    
    setMessageText('');
  };

  // Фильтрация друзей по поиску
  const filteredFriends = useMemo(() => {
    return friends.filter(friend => 
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);
  
  // Фильтрация запросов в друзья по поиску
  const filteredRequests = useMemo(() => {
    return friendRequests.filter(request => 
      request.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friendRequests, searchQuery]);
  
  // Проверка на непрочитанные сообщения
  const hasUnreadMessages = (friendId: string) => {
    if (!currentUser?.messages) return false;
    const friendMessages = currentUser.messages[friendId];
    return friendMessages?.some(msg => !msg.read && msg.senderId === friendId) || false;
  };

  // Отправить сообщение
  const sendMessage = () => {
    if (!message.trim() || !activeChatId) return;
    
    const newMessage = {
      id: `m${Date.now()}`,
      senderId: 'current',
      receiverId: activeChatId,
      text: message,
      timestamp: new Date(),
      read: false
    };
    
    // В реальном приложении здесь должен быть запрос к API
    // Для демонстрации просто добавляем в локальное состояние
    if (currentUser?.messages) {
      const currentMessages = currentUser.messages || {};
      const activeChatMessages = currentMessages[activeChatId] || [];
      
      if (updateUser) {
        updateUser({
          messages: {
            ...currentMessages,
            [activeChatId]: [...activeChatMessages, newMessage]
          }
        });
      }
    }
    
    setMessage('');
  };
  
  // Открыть чат
  const openChat = (friendId: string) => {
    setActiveChatId(friendId);
    setChatVisible(true);
    setIsChatMinimized(false);
    
    // Отметить сообщения как прочитанные
    if (currentUser?.messages && updateUser) {
      const updatedMessages = { ...currentUser.messages };
      if (updatedMessages[friendId]) {
        updatedMessages[friendId] = updatedMessages[friendId].map(msg => 
          msg.senderId !== 'current' ? { ...msg, read: true } : msg
        );
        
        updateUser({
          messages: updatedMessages
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Друзья</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Список друзей */}
        <div className="container-glass p-4 rounded-xl md:col-span-1">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <h2 className="text-lg font-semibold">Ваши друзья</h2>
              <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {friends.length}
              </span>
            </div>
            
            <div className="relative">
              <input
                type="text"
                className="form-input pr-10"
                placeholder="Найти друга..."
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
              />
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary"
                onClick={handleSendRequest}
              >
                <FaUserPlus />
              </button>
            </div>
          </div>
          
          {/* Запросы в друзья */}
          {friendRequests.length > 0 && (
            <div className="mb-4">
              <button
                className="w-full text-left bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center justify-between"
                onClick={() => setShowRequestsPanel(!showRequestsPanel)}
              >
                <span className="font-medium flex items-center">
                  <FaUserPlus className="mr-2 text-blue-500" />
                  Запросы в друзья
                </span>
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {friendRequests.length}
                </span>
              </button>
              
              {showRequestsPanel && (
                <div className="mt-2 space-y-2">
                  {friendRequests.map(request => (
                    <div key={request.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
                          {request.avatar ? (
                            <img src={request.avatar} alt={request.username} className="w-full h-full rounded-full" />
                          ) : (
                            <FaUser className="text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{request.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          className="flex-1 bg-primary text-white py-1 rounded-md text-sm"
                          onClick={() => handleAcceptRequest(request)}
                        >
                          Принять
                        </button>
                        <button
                          className="flex-1 bg-gray-200 dark:bg-gray-700 py-1 rounded-md text-sm"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          Отклонить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Список друзей */}
          <div className="space-y-2">
            {friends.length > 0 ? (
              friends.map(friend => (
                <div
                  key={friend.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedFriend?.id === friend.id
                      ? 'bg-primary/10'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleSelectFriend(friend)}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
                        {friend.avatar ? (
                          <img src={friend.avatar} alt={friend.username} className="w-full h-full rounded-full" />
                        ) : (
                          <FaUser className="text-gray-500" />
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        friend.status === 'online' ? 'bg-green-500' : friend.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{friend.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {friend.status === 'online' ? 'В сети' : friend.status === 'away' ? 'Отошел' : 'Не в сети'}
                      </p>
                    </div>
                    <button
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFriend(friend.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <FaUser className="mx-auto text-2xl mb-2 opacity-50" />
                <p>У вас пока нет друзей</p>
                <p className="text-sm mt-1">Найдите друзей, используя поле поиска выше</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Область для чата */}
        <div className="container-glass p-4 rounded-xl md:col-span-2">
          {selectedFriend ? (
            <div className="h-full flex flex-col">
              {/* Заголовок чата */}
              <div className="flex items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
                    {selectedFriend.avatar ? (
                      <img src={selectedFriend.avatar} alt={selectedFriend.username} className="w-full h-full rounded-full" />
                    ) : (
                      <FaUser className="text-gray-500" />
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                    selectedFriend.status === 'online' ? 'bg-green-500' : selectedFriend.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                <div>
                  <p className="font-medium">{selectedFriend.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedFriend.status === 'online' ? 'В сети' : selectedFriend.status === 'away' ? 'Отошел' : 'Не в сети'}
                  </p>
                </div>
              </div>
              
              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <FaComment className="mx-auto text-2xl mb-2 opacity-50" />
                  <p>Сообщений пока нет</p>
                  <p className="text-sm mt-1">Напишите первое сообщение</p>
                </div>
              </div>
              
              {/* Форма отправки сообщения */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="Написать сообщение..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleSendMessage}
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center py-10 px-4">
                <FaComment className="mx-auto text-4xl mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Выберите друга для общения</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Выберите друга из списка слева, чтобы начать общение
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends; 
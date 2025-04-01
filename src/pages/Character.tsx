import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import localforage from 'localforage';
import { AnimeCharacter, Gift } from '../types';
import { FaHeart, FaCoins, FaGift, FaArrowLeft, FaStar } from 'react-icons/fa';

// Массив подарков по умолчанию
const defaultGifts: Gift[] = [
  {
    id: 'gift1',
    name: 'Цветы',
    description: 'Красивый букет цветов',
    image: 'https://api.dicebear.com/7.x/icons/svg?seed=flower',
    price: 50,
    affectionPoints: 5
  },
  {
    id: 'gift2',
    name: 'Шоколад',
    description: 'Коробка вкусного шоколада',
    image: 'https://api.dicebear.com/7.x/icons/svg?seed=chocolate',
    price: 100,
    affectionPoints: 10
  },
  {
    id: 'gift3',
    name: 'Плюшевая игрушка',
    description: 'Милая плюшевая игрушка',
    image: 'https://api.dicebear.com/7.x/icons/svg?seed=teddy',
    price: 150,
    affectionPoints: 15
  }
];

const Character: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();
  const [character, setCharacter] = useState<AnimeCharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Загрузка персонажа
        const characters = await localforage.getItem<AnimeCharacter[]>('animeCharacters') || [];
        const foundCharacter = characters.find(c => c.id === characterId);
        
        if (foundCharacter) {
          setCharacter(foundCharacter);
          
          // Проверяем, является ли персонаж избранным
          const favoriteId = await localforage.getItem<string>('favoriteCharacterId');
          setIsFavorite(favoriteId === foundCharacter.id);
        } else {
          navigate('/profile');
        }

        // Загрузка подарков
        const savedGifts = await localforage.getItem<Gift[]>('gifts') || [];
        setGifts(savedGifts.length > 0 ? savedGifts : defaultGifts);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [characterId, navigate]);

  // Добавить/удалить из избранного
  const toggleFavorite = async () => {
    if (!character) return;
    
    try {
      if (isFavorite) {
        // Удаляем из избранного
        await localforage.removeItem('favoriteCharacterId');
        setIsFavorite(false);
      } else {
        // Добавляем в избранное
        await localforage.setItem('favoriteCharacterId', character.id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Ошибка при изменении избранного персонажа:', error);
    }
  };

  // Действие с подарком
  const handleGiveGift = async (gift: Gift) => {
    if (!character || !currentUser || processing) return;
    
    setProcessing(true);
    
    try {
      // Проверка наличия денег
      if (currentUser.coins < gift.price) {
        alert('Недостаточно монет!');
        return;
      }

      // Обновление персонажа
      const affectionIncrease = gift.affectionPoints;
      const updatedCharacter = {
        ...character,
        affection: character.affection + affectionIncrease
      };

      // Обновление списка персонажей
      const characters = await localforage.getItem<AnimeCharacter[]>('animeCharacters') || [];
      const updatedCharacters = characters.map(c => 
        c.id === character.id ? updatedCharacter : c
      );
      
      await localforage.setItem('animeCharacters', updatedCharacters);
      setCharacter(updatedCharacter);

      // Обновление пользователя
      const updatedUser = {
        ...currentUser,
        coins: currentUser.coins - gift.price
      };
      
      await updateUser(updatedUser);
      
      // Показать сообщение
      const phrase = character.phrases.gift[Math.floor(Math.random() * character.phrases.gift.length)];
      setMessage(phrase);
      setShowGiftModal(false);
      
    } catch (error) {
      console.error('Ошибка при дарении подарка:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Взаимодействие с персонажем
  const handleInteract = async () => {
    if (!character || processing) return;
    
    setProcessing(true);
    try {
      // Получаем случайную фразу
      const phrases = character.phrases.interaction;
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setMessage(randomPhrase);
      
      // Увеличиваем привязанность
      const newAffection = Math.min(character.affection + 1, 100);
      const updatedCharacter = { ...character, affection: newAffection };
      
      // Сохраняем обновленного персонажа
      const characters = await localforage.getItem<AnimeCharacter[]>('animeCharacters') || [];
      const updatedCharacters = characters.map(c => 
        c.id === character.id ? updatedCharacter : c
      );
      
      await localforage.setItem('animeCharacters', updatedCharacters);
      setCharacter(updatedCharacter);
      
      // Через 3 секунды скрываем сообщение
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error('Ошибка при взаимодействии с персонажем:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Получить ключ изображения на основе уровня отношений
  const getImageIndex = (affection: number): string => {
    if (character) {
      if (affection >= 50 && character.images.level3) return 'level3';
      if (affection >= 20 && character.images.level2) return 'level2';
      if (affection >= 5 && character.images.level1) return 'level1';
    }
    return 'default';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Персонаж не найден</p>
          <button 
            onClick={() => navigate('/profile')} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Вернуться к профилю
          </button>
        </div>
      </div>
    );
  }

  // Определяем изображение в зависимости от уровня отношений
  const imageKey = getImageIndex(character.affection);
  const currentImage = character.images[imageKey as keyof typeof character.images] || character.images.default;
  
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Кнопка возврата */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <button 
          onClick={() => navigate('/profile')}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md"
        >
          <FaArrowLeft size={20} />
        </button>
        
        <button 
          onClick={toggleFavorite}
          className={`p-2 rounded-full shadow-md ${
            isFavorite 
              ? 'bg-yellow-500 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          <FaStar size={20} />
        </button>
      </div>
      
      {/* Полноэкранное изображение */}
      <div className="relative flex-1 w-full h-screen flex items-center justify-center bg-gray-900">
        <img 
          src={currentImage} 
          alt={character.name}
          className="w-full h-full object-contain max-h-screen"
        />
        
        {/* Имя персонажа и привязанность */}
        <div className="absolute top-4 right-4 bg-black/70 p-3 rounded-lg text-white">
          <h1 className="text-xl font-bold">{character.name}</h1>
          <div className="flex items-center mt-1">
            <FaHeart className="text-red-500 mr-2" />
            <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500" 
                style={{ width: `${character.affection}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm">{character.affection}%</span>
          </div>
        </div>
        
        {/* Сообщение от персонажа */}
        {message && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-md">
            <p className="text-center">{message}</p>
          </div>
        )}
        
        {/* Панель действий */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
          <button 
            onClick={handleInteract}
            className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-full shadow-lg"
            disabled={processing}
          >
            <FaHeart size={24} className="text-red-500" />
          </button>
          
          <button 
            onClick={() => setShowGiftModal(true)}
            className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-full shadow-lg"
            disabled={processing}
          >
            <FaGift size={24} className="text-green-500" />
          </button>
        </div>
      </div>

      {/* Модальное окно с подарками */}
      <AnimatePresence>
        {showGiftModal && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGiftModal(false)}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Выберите подарок</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {gifts.map(gift => (
                  <button
                    key={gift.id}
                    className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center"
                    onClick={() => handleGiveGift(gift)}
                    disabled={processing || (currentUser?.coins || 0) < gift.price}
                  >
                    <img src={gift.image} alt={gift.name} className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-semibold">{gift.name}</p>
                    <div className="flex items-center justify-center mt-1">
                      <FaCoins className="text-yellow-500 mr-1" />
                      <span>{gift.price}</span>
                    </div>
                    <p className="text-xs mt-1">+{gift.affectionPoints} к близости</p>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-end mt-4">
                <button 
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                  onClick={() => setShowGiftModal(false)}
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Character; 
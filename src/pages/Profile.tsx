import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCoins, FaGem, FaHeart } from 'react-icons/fa';
import { AnimeCharacter } from '../types';
import localforage from 'localforage';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [characters, setCharacters] = useState<AnimeCharacter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setLoading(true);
        const allCharacters = await localforage.getItem<AnimeCharacter[]>('animeCharacters') || [];
        setCharacters(allCharacters);
      } catch (error) {
        console.error('Ошибка при загрузке персонажей:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, []);

  // Получение разблокированных персонажей
  const unlockedCharacters = characters.filter(character => 
    character.isUnlocked || (currentUser?.unlockedCharacters?.includes(character.id))
  );

  // Получение персонажей, с которыми можно сражаться
  const availableCharacters = characters.filter(character => 
    !character.isUnlocked && !(currentUser?.unlockedCharacters?.includes(character.id))
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Профиль</h1>

      <div className="container-ios p-4 mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
            {currentUser?.username?.charAt(0) || 'U'}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold">{currentUser?.username}</h2>
            <p className="text-sm">Уровень {currentUser?.level}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-ios flex items-center">
            <FaCoins className="text-yellow-500 mr-2 text-xl" />
            <div>
              <p className="text-xs opacity-70">Монеты</p>
              <p className="font-bold">{currentUser?.coins || 0}</p>
            </div>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-ios flex items-center">
            <FaGem className="text-blue-500 mr-2 text-xl" />
            <div>
              <p className="text-xs opacity-70">Кристаллы</p>
              <p className="font-bold">{currentUser?.crystals || 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm">Опыт: {currentUser?.experience || 0} / {(currentUser?.level || 1) * 100}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary"
              style={{ width: `${((currentUser?.experience || 0) / ((currentUser?.level || 1) * 100)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {unlockedCharacters.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Ваши девушки</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {unlockedCharacters.map(character => (
              <Link 
                key={character.id} 
                to={`/character/${character.id}`}
                className="container-ios p-4 cursor-pointer transition hover:shadow-md"
              >
                <div className="relative">
                  <img 
                    src={character.images[getImageIndex(character.affection, character.images) as keyof typeof character.images]}
                    alt={character.name}
                    className="w-full h-48 object-cover rounded-ios mb-3"
                  />
                  
                  <div className="absolute bottom-3 left-2 right-2 bg-black/60 rounded-ios p-2 flex items-center">
                    <div className="flex items-center mr-2">
                      <FaHeart className="text-red-500 mr-1" />
                      <span className="text-white text-xs">{character.affection}%</span>
                    </div>
                    <div className="h-1 flex-1 bg-gray-700 rounded-full">
                      <div className="h-1 bg-red-500 rounded-full" style={{ width: `${character.affection}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-bold">{character.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Уровень {character.level}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">Доступные для сражений</h2>
        {availableCharacters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {availableCharacters.map(character => (
              <Link 
                key={character.id} 
                to={`/battle/${character.id}`}
                className="container-ios p-4 cursor-pointer transition hover:shadow-md"
              >
                <div className="relative">
                  <img 
                    src={character.images.default}
                    alt={character.name}
                    className="w-full h-48 object-cover rounded-ios mb-3 grayscale"
                  />
                  
                  <div className="absolute bottom-3 left-2 right-2 bg-black/60 rounded-ios p-2">
                    <div className="flex justify-between text-white text-xs">
                      <span>Победы: {character.defeatedCount || 0}/3</span>
                      <span>Ур. {character.level}</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-bold">{character.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Нажмите, чтобы сразиться</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="container-ios p-6 text-center">
            <p>Нет доступных персонажей для сражений</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Добавьте персонажей через панель администратора или подождите их появления
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Получить ключ изображения на основе уровня отношений
const getImageIndex = (affection: number, images: AnimeCharacter['images']): string => {
  if (affection >= 50 && images.level3) return 'level3';
  if (affection >= 20 && images.level2) return 'level2';
  if (affection >= 5 && images.level1) return 'level1';
  return 'default';
};

export default Profile; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnimeCharacter } from '../types';
import localforage from 'localforage';

interface NewCharacter {
  name: string;
  level: number;
  health: number;
  damage: number;
  affection: number;
  images: string[];
  phrases: {
    battle: string[];
    victory: string[];
    defeat: string[];
    gift: string[];
    interaction: string[];
  };
  stats: {
    strength: number;
    intelligence: number;
    charisma: number;
    kawaii: number;
  };
  isUnlocked: boolean;
  defeatedCount: number;
}

const Admin: React.FC = () => {
  const { currentUser } = useAuth();
  const [characters, setCharacters] = useState<AnimeCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCharacter, setNewCharacter] = useState<NewCharacter>({
    name: '',
    level: 1,
    health: 100,
    damage: 10,
    affection: 0,
    images: ['', '', ''],
    phrases: {
      battle: ['Я буду сражаться!', 'Готовься к бою!'],
      victory: ['Я победила!', 'Это было легко'],
      defeat: ['Я проиграла...', 'В следующий раз я буду сильнее'],
      gift: ['Спасибо за подарок!', 'Это так мило с твоей стороны'],
      interaction: ['Привет!', 'Как дела?']
    },
    stats: {
      strength: 10,
      intelligence: 10,
      charisma: 10,
      kawaii: 10
    },
    isUnlocked: false,
    defeatedCount: 0
  });

  // Проверка прав администратора
  useEffect(() => {
    console.log('Проверка прав админа:', currentUser);
    if (!currentUser || currentUser.email !== 'admin@taskventure.com') {
      console.error('Нет доступа к админке, перенаправление на главную');
      window.location.href = '/tasks';
      return;
    }
    
    console.log('Права админа подтверждены, загрузка персонажей');
    loadCharacters();
  }, [currentUser]);

  // Загрузка персонажей
  const loadCharacters = async () => {
    try {
      console.log('Admin: Загрузка персонажей...');
      const saved = await localforage.getItem<AnimeCharacter[]>('animeCharacters');
      console.log('Admin: Загруженные персонажи:', saved);
      
      if (saved && saved.length > 0) {
        setCharacters(saved);
      } else {
        // Если персонажей нет, инициализируем их
        console.log('Admin: Персонажи не найдены, инициализация...');
        
        // Базовый URL для изображений из /public/characters/
        const baseImageUrl = (name: string, level: number) => 
          `/characters/${name.toLowerCase()}_${level}.jpg`;
        
        const defaultCharacters: AnimeCharacter[] = [
          {
            id: 'char-1',
            name: 'Мизуки',
            description: 'Энергичная школьница с любовью к приключениям. Обожает спорт и всегда стремится к новым достижениям.',
            level: 1,
            health: 100,
            damage: 15,
            affection: 0,
            defeatedCount: 0,
            images: {
              default: baseImageUrl('mizuki', 1),
              level1: baseImageUrl('mizuki', 1),
              level2: baseImageUrl('mizuki', 2),
              level3: baseImageUrl('mizuki', 3)
            },
            quotes: {
              greeting: ['Привет! Готов к приключениям?', 'Ох, снова ты! Пойдём заниматься вместе!'],
              battle: ['Я не проиграю!', 'Готовься к бою! Я дам тебе фору!'],
              victory: ['Ура! Я выиграла!', 'Это было здорово! Давай ещё раз!'],
              defeat: ['Ох... В следующий раз я точно выиграю!', 'Ты действительно силён... Впечатляет!'],
              levelUp: ['Я стала сильнее! Теперь меня не остановить!', 'Чувствую прилив энергии!']
            },
            phrases: {
              battle: ['Покажи, на что ты способен!', 'Я тренировалась весь день для этого!'],
              victory: ['Ха-ха! Я же говорила, что сильная!', 'Это было весело! Давай ещё!'],
              defeat: ['Ничего, я стану сильнее...', 'Ты действительно хорош!'],
              gift: ['Вау! Это мне? Спасибо огромное!', 'Как мило с твоей стороны!'],
              interaction: ['Знаешь, я сегодня пробежала 10 километров!', 'Хочешь вместе сходить на тренировку?']
            },
            stats: {
              health: 100,
              attack: 15,
              defense: 10,
              level: 1
            },
            isUnlocked: false
          },
          {
            id: 'char-2',
            name: 'Юки',
            description: 'Тихая и умная девушка, любящая книги и учёбу. За её спокойным характером скрывается решительность.',
            level: 1,
            health: 90,
            damage: 18,
            affection: 0,
            defeatedCount: 0,
            images: {
              default: baseImageUrl('yuki', 1),
              level1: baseImageUrl('yuki', 1),
              level2: baseImageUrl('yuki', 2),
              level3: baseImageUrl('yuki', 3)
            },
            quotes: {
              greeting: ['Здравствуй. Ты пришёл заниматься?', 'О, это ты... Рада видеть.'],
              battle: ['Я предпочитаю мирное решение, но если нужно...', 'Я готова.'],
              victory: ['Стратегия победила силу.', 'Я рассчитала каждый ход.'],
              defeat: ['Мне нужно пересмотреть мою тактику...', 'Интересный подход... Запомню это.'],
              levelUp: ['Мои знания расширились.', 'Чувствую, что стала мудрее.']
            },
            phrases: {
              battle: ['Я проанализировала твою тактику.', 'Логика - моё оружие.'],
              victory: ['Выбранная стратегия была оптимальной.', 'Я знала, что так будет.'],
              defeat: ['Нужно больше данных для анализа...', 'Сделаю выводы из этого поражения.'],
              gift: ['О... Это очень вдумчивый подарок. Спасибо.', 'Я ценю твою заботу.'],
              interaction: ['Ты читал эту книгу? Она изменила моё мировоззрение.', 'Могу помочь тебе с учёбой, если хочешь.']
            },
            stats: {
              health: 90,
              attack: 18,
              defense: 8,
              level: 1
            },
            isUnlocked: false
          },
          {
            id: 'char-3',
            name: 'Сакура',
            description: 'Весёлая и дружелюбная девушка с огромной любовью к природе и животным. Всегда готова помочь другим.',
            level: 1,
            health: 95,
            damage: 12,
            affection: 0,
            defeatedCount: 0,
            images: {
              default: baseImageUrl('sakura', 1),
              level1: baseImageUrl('sakura', 1),
              level2: baseImageUrl('sakura', 2),
              level3: baseImageUrl('sakura', 3)
            },
            quotes: {
              greeting: ['Привет! Какой чудесный день, правда?', 'Ох, привет! Я так рада тебя видеть!'],
              battle: ['Я не хочу драться, но если надо...', 'Обещаю, я буду нежной!'],
              victory: ['Ой! Я победила? Правда?', 'Извини, если было больно!'],
              defeat: ['Ох... Я в порядке, не волнуйся!', 'Это было весело, даже если я проиграла!'],
              levelUp: ['Я чувствую себя такой сильной!', 'Ух ты! Я развиваюсь!']
            },
            phrases: {
              battle: ['Давай постараемся не причинять друг другу боль!', 'Я верю в честную игру!'],
              victory: ['Это была хорошая битва! Спасибо!', 'Надеюсь, ты не злишься на меня?'],
              defeat: ['Вау, ты такой сильный!', 'В следующий раз мне повезёт больше!'],
              gift: ['Это самый милый подарок! Спасибо большое!', 'Ты такой добрый, это так мило!'],
              interaction: ['Я сегодня видела котёнка в парке!', 'Не хочешь пойти покормить уточек?']
            },
            stats: {
              health: 95,
              attack: 12,
              defense: 15,
              level: 1
            },
            isUnlocked: false
          },
          {
            id: 'char-4',
            name: 'Рин',
            description: 'Серьёзная и немного строгая девушка с сильным чувством справедливости. За холодной внешностью скрывается доброе сердце.',
            level: 2,
            health: 120,
            damage: 20,
            affection: 0,
            defeatedCount: 0,
            images: {
              default: baseImageUrl('rin', 1),
              level1: baseImageUrl('rin', 1),
              level2: baseImageUrl('rin', 2),
              level3: baseImageUrl('rin', 3)
            },
            quotes: {
              greeting: ['Ты опять здесь? Что ж, здравствуй.', 'Надеюсь, ты пришёл не зря.'],
              battle: ['Я покажу тебе настоящую силу.', 'Не думай, что я буду сдерживаться.'],
              victory: ['Как и ожидалось.', 'Тебе ещё многому нужно научиться.'],
              defeat: ['Невозможно...', 'Я недооценила тебя. Это не повторится.'],
              levelUp: ['Моя сила растёт.', 'Я становлюсь совершеннее.']
            },
            phrases: {
              battle: ['Покажи, что ты достоин моего времени.', 'Сражайся в полную силу или уходи.'],
              victory: ['Результат был предсказуем.', 'Ты не так плох, но недостаточно хорош.'],
              defeat: ['Признаю твою силу... На этот раз.', 'Это... неожиданно.'],
              gift: ['Ты... купил это для меня? ...Спасибо.', 'Я не ожидала... Это приятно.'],
              interaction: ['Ты тренировался сегодня?', 'Не расслабляйся, нужно всегда совершенствоваться.']
            },
            stats: {
              health: 120,
              attack: 20,
              defense: 18,
              level: 2
            },
            isUnlocked: false
          }
        ];
        
        await localforage.setItem('animeCharacters', defaultCharacters);
        setCharacters(defaultCharacters);
        console.log('Admin: Персонажи инициализированы:', defaultCharacters);
        alert('Персонажи успешно инициализированы! Теперь вы можете загрузить свои изображения в папку public/characters/ или изменить URL изображений персонажей.');
      }
    } catch (error) {
      console.error('Admin: Ошибка при загрузке персонажей:', error);
    }
  };

  // Сохранение персонажа
  const handleSave = async () => {
    // Проверяем, что все картинки заполнены
    if (!newCharacter.name || newCharacter.images.some(img => !img)) {
      alert('Заполните имя персонажа и загрузите все 3 изображения');
      return;
    }

    setIsLoading(true);
    try {
      const characterToSave: AnimeCharacter = {
        id: Date.now().toString(),
        name: newCharacter.name,
        description: 'Новый персонаж',
        level: newCharacter.level,
        health: newCharacter.health,
        damage: newCharacter.damage,
        affection: newCharacter.affection,
        defeatedCount: newCharacter.defeatedCount,
        images: {
          default: newCharacter.images[0],
          level1: newCharacter.images[1],
          level2: newCharacter.images[2]
        },
        quotes: {
          greeting: ["Привет!", "Здравствуй!"],
          battle: newCharacter.phrases.battle,
          victory: newCharacter.phrases.victory,
          defeat: newCharacter.phrases.defeat,
          levelUp: ["Я стала сильнее!"]
        },
        phrases: newCharacter.phrases,
        stats: {
          health: newCharacter.health,
          attack: newCharacter.damage,
          defense: 5,
          level: newCharacter.level
        },
        isUnlocked: newCharacter.isUnlocked
      };

      const updatedCharacters = [...characters, characterToSave];
      await localforage.setItem('animeCharacters', updatedCharacters);
      setCharacters(updatedCharacters);
      setShowAddModal(false);
      setNewCharacter({
        name: '',
        level: 1,
        health: 100,
        damage: 10,
        affection: 0,
        images: ['', '', ''],
        phrases: {
          battle: ['Я буду сражаться!', 'Готовься к бою!'],
          victory: ['Я победила!', 'Это было легко'],
          defeat: ['Я проиграла...', 'В следующий раз я буду сильнее'],
          gift: ['Спасибо за подарок!', 'Это так мило с твоей стороны'],
          interaction: ['Привет!', 'Как дела?']
        },
        stats: {
          strength: 10,
          intelligence: 10,
          charisma: 10,
          kawaii: 10
        },
        isUnlocked: false,
        defeatedCount: 0
      });
    } catch (error) {
      console.error('Ошибка при сохранении персонажа:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка изображений
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImages = [...newCharacter.images];
      newImages[index] = reader.result as string;
      setNewCharacter({ ...newCharacter, images: newImages });
    };
    reader.readAsDataURL(file);
  };

  // Удаление персонажа
  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого персонажа?')) return;

    try {
      const updatedCharacters = characters.filter(char => char.id !== id);
      await localforage.setItem('animeCharacters', updatedCharacters);
      setCharacters(updatedCharacters);
    } catch (error) {
      console.error('Ошибка при удалении персонажа:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Панель администратора</h1>

      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-md">
        <p className="font-medium">Инструкция:</p>
        <ol className="list-decimal ml-4 mt-2">
          <li>Добавьте минимум 3 персонажа для работы приложения</li>
          <li>Загрузите ровно 3 изображения для каждого персонажа (в порядке возрастания близости)</li>
          <li>Изображения должны быть аниме-девушек в разрешении примерно 600x800</li>
        </ol>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Управление персонажами ({characters.length})</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Добавить персонажа
          </button>
        </div>

        {characters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Нет добавленных персонажей. Добавьте первого персонажа, чтобы начать.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map(character => (
              <div key={character.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm p-4">
                <div className="flex items-center mb-4">
                  <img
                    src={character.images.default}
                    alt={character.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="font-bold">{character.name}</h3>
                    <p className="text-sm">Уровень {character.level}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p>Здоровье: {character.health}</p>
                  <p>Урон: {character.damage}</p>
                  <p>Изображения: {Object.keys(character.images).length} шт.</p>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleDelete(character.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Добавить персонажа</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Имя персонажа*</label>
                  <input
                    type="text"
                    className="form-input w-full"
                    value={newCharacter.name}
                    onChange={e => setNewCharacter({ ...newCharacter, name: e.target.value })}
                    placeholder="Введите имя персонажа"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Изображения (3 шт.)*</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map(index => (
                      <div key={index} className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleImageUpload(e, index)}
                          className="hidden"
                          id={`image-${index}`}
                        />
                        <label
                          htmlFor={`image-${index}`}
                          className="block w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          {newCharacter.images[index] ? (
                            <img
                              src={newCharacter.images[index]}
                              alt={`Изображение ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                              </svg>
                              <span className="mt-2 text-sm text-gray-500">
                                {index === 0 ? "Обычное" : index === 1 ? "Среднее" : "Близкое"}
                              </span>
                            </div>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Загрузите три изображения в порядке возрастания близости отношений
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">Здоровье</label>
                    <input
                      type="number"
                      className="form-input w-full"
                      value={newCharacter.health}
                      onChange={e => setNewCharacter({ ...newCharacter, health: Number(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Урон</label>
                    <input
                      type="number"
                      className="form-input w-full"
                      value={newCharacter.damage}
                      onChange={e => setNewCharacter({ ...newCharacter, damage: Number(e.target.value) })}
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">Kawaii</label>
                    <input
                      type="number"
                      className="form-input w-full"
                      value={newCharacter.stats.kawaii}
                      onChange={e => setNewCharacter({
                        ...newCharacter,
                        stats: { ...newCharacter.stats, kawaii: Number(e.target.value) }
                      })}
                      min="1"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Уровень</label>
                    <input
                      type="number"
                      className="form-input w-full"
                      value={newCharacter.level}
                      onChange={e => setNewCharacter({ ...newCharacter, level: Number(e.target.value) })}
                      min="1"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary mr-2"
                    disabled={isLoading}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Сохранение...' : 'Сохранить персонажа'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 
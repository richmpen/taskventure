import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FaCoins, FaGem, FaCartPlus, FaInfoCircle, 
  FaHeart, FaFilter, FaSearch, FaTicketAlt, FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Типы товаров в магазине
type ItemCategory = 'gift' | 'booster' | 'ticket' | 'cosmetic';

// Интерфейс товара
interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: {
    coins?: number;
    crystals?: number;
  };
  image: string;
  category: ItemCategory;
  effects?: {
    closenessPoints?: number;
    experienceBoost?: number;
    coinBoost?: number;
  };
}

// Интерфейс предмета в корзине
interface CartItem extends ShopItem {
  quantity: number;
}

const Shop: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Демо-данные для магазина
  useEffect(() => {
    const demoItems: ShopItem[] = [
      {
        id: 'g1',
        name: 'Плюшевая игрушка',
        description: 'Милая плюшевая игрушка. +15 очков близости с персонажем.',
        price: { coins: 150 },
        image: 'https://api.dicebear.com/7.x/icons/svg?seed=gift1',
        category: 'gift',
        effects: { closenessPoints: 15 }
      },
      {
        id: 'g2',
        name: 'Букет цветов',
        description: 'Красивый букет цветов. +25 очков близости с персонажем.',
        price: { coins: 300 },
        image: 'https://api.dicebear.com/7.x/icons/svg?seed=gift2',
        category: 'gift',
        effects: { closenessPoints: 25 }
      },
      {
        id: 'g3',
        name: 'Шоколадные конфеты',
        description: 'Набор вкусных шоколадных конфет. +10 очков близости с персонажем.',
        price: { coins: 100 },
        image: 'https://api.dicebear.com/7.x/icons/svg?seed=gift3',
        category: 'gift',
        effects: { closenessPoints: 10 }
      },
      {
        id: 'g4',
        name: 'Кольцо дружбы',
        description: 'Символ ваших отношений. +50 очков близости с персонажем.',
        price: { crystals: 10 },
        image: 'https://api.dicebear.com/7.x/icons/svg?seed=gift4',
        category: 'gift',
        effects: { closenessPoints: 50 }
      },
      {
        id: 'b1',
        name: 'Бустер опыта (x1.5)',
        description: 'Увеличивает получаемый опыт в 1.5 раза на 24 часа.',
        price: { coins: 500 },
        image: 'https://api.dicebear.com/7.x/icons/svg?seed=booster1',
        category: 'booster',
        effects: { experienceBoost: 1.5 }
      },
      {
        id: 'b2',
        name: 'Бустер монет (x2)',
        description: 'Удваивает получаемые монеты на 24 часа.',
        price: { crystals: 15 },
        image: 'https://api.dicebear.com/7.x/icons/svg?seed=booster2',
        category: 'booster',
        effects: { coinBoost: 2 }
      },
      {
        id: 't1',
        name: 'Билет на фестиваль',
        description: 'Позволяет посетить особое событие с выбранным персонажем. +100 очков близости.',
        price: { crystals: 25 },
        image: 'https://api.dicebear.com/7.x/icons/svg?seed=ticket1',
        category: 'ticket',
        effects: { closenessPoints: 100 }
      },
      {
        id: 'c1',
        name: 'Праздничный наряд',
        description: 'Новый наряд для вашего персонажа. Открывает особые диалоги.',
        price: { coins: 800, crystals: 5 },
        image: 'https://api.dicebear.com/7.x/icons/svg?seed=cosmetic1',
        category: 'cosmetic'
      }
    ];
    
    setItems(demoItems);
  }, []);
  
  // Фильтрация товаров
  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Добавление товара в корзину
  const addToCart = (item: ShopItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem => 
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    
    toast.success(`${item.name} добавлен в корзину`);
  };
  
  // Удаление товара из корзины
  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item => 
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prevCart.filter(item => item.id !== itemId);
      }
    });
  };
  
  // Очистка корзины
  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };
  
  // Расчет общей стоимости корзины
  const calculateTotal = () => {
    let totalCoins = 0;
    let totalCrystals = 0;
    
    cart.forEach(item => {
      if (item.price.coins) {
        totalCoins += item.price.coins * item.quantity;
      }
      if (item.price.crystals) {
        totalCrystals += item.price.crystals * item.quantity;
      }
    });
    
    return { coins: totalCoins, crystals: totalCrystals };
  };
  
  // Завершение покупки
  const checkout = () => {
    const total = calculateTotal();
    
    // Проверка достаточности средств
    if ((total.coins > (currentUser?.coins || 0)) || 
        (total.crystals > (currentUser?.crystals || 0))) {
      toast.error('Недостаточно средств для покупки');
      return;
    }
    
    // Обновление баланса пользователя
    if (updateUser) {
      updateUser({
        coins: (currentUser?.coins || 0) - total.coins,
        crystals: (currentUser?.crystals || 0) - total.crystals
      });
      
      // В реальном приложении здесь должен быть код для обработки эффектов товаров
      
      toast.success('Покупка успешно совершена!');
      clearCart();
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div 
        className="container-glass p-6 rounded-xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Магазин</h1>
          
          <div className="flex items-center space-x-4">
            {/* Баланс пользователя */}
            <div className="flex items-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full px-3 py-1 flex items-center">
                <FaCoins className="text-yellow-500 mr-1" />
                <span className="font-semibold">{currentUser?.coins || 0}</span>
              </div>
              
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full px-3 py-1 flex items-center ml-2">
                <FaGem className="text-blue-500 mr-1" />
                <span className="font-semibold">{currentUser?.crystals || 0}</span>
              </div>
            </div>
            
            {/* Корзина */}
            <button 
              className="relative bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors"
              onClick={() => setIsCartOpen(prev => !prev)}
            >
              <FaCartPlus className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Поиск и фильтры */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              className="form-input pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-700 w-full rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              className={`px-3 py-1 rounded-full flex items-center ${
                activeCategory === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setActiveCategory('all')}
            >
              <FaFilter className="mr-1" /> Все
            </button>
            
            <button
              className={`px-3 py-1 rounded-full flex items-center ${
                activeCategory === 'gift' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setActiveCategory('gift')}
            >
              <FaHeart className="mr-1" /> Подарки
            </button>
            
            <button
              className={`px-3 py-1 rounded-full flex items-center ${
                activeCategory === 'booster' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setActiveCategory('booster')}
            >
              <FaInfoCircle className="mr-1" /> Бустеры
            </button>
            
            <button
              className={`px-3 py-1 rounded-full flex items-center ${
                activeCategory === 'ticket' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setActiveCategory('ticket')}
            >
              <FaTicketAlt className="mr-1" /> Билеты
            </button>
            
            <button
              className={`px-3 py-1 rounded-full flex items-center ${
                activeCategory === 'cosmetic' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setActiveCategory('cosmetic')}
            >
              <FaInfoCircle className="mr-1" /> Косметика
            </button>
          </div>
        </div>
        
        {/* Список товаров */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <motion.div 
              key={item.id}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="p-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-40 flex items-center justify-center mb-4">
                  <img src={item.image} alt={item.name} className="w-24 h-24" />
                </div>
                
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  <div className="flex flex-col items-end">
                    {item.price.coins && (
                      <div className="flex items-center text-sm">
                        <span>{item.price.coins}</span>
                        <FaCoins className="text-yellow-500 ml-1" />
                      </div>
                    )}
                    
                    {item.price.crystals && (
                      <div className="flex items-center text-sm">
                        <span>{item.price.crystals}</span>
                        <FaGem className="text-blue-500 ml-1" />
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 h-24 overflow-y-auto mb-4">
                  {item.description}
                </p>
                
                <button 
                  className="w-full bg-primary text-white rounded-lg py-2 hover:bg-primary-dark transition-colors flex items-center justify-center"
                  onClick={() => addToCart(item)}
                >
                  <FaCartPlus className="mr-2" /> В корзину
                </button>
              </div>
            </motion.div>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Товары не найдены</p>
              <p className="mt-1 text-sm">Попробуйте изменить поисковый запрос или фильтры</p>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Корзина (модальное окно) */}
      {isCartOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden w-full max-w-2xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="p-4 bg-primary text-white flex justify-between items-center">
              <h2 className="font-semibold">Корзина</h2>
              <button onClick={() => setIsCartOpen(false)}>
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              {cart.length > 0 ? (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                        <div className="flex items-center">
                          <img src={item.image} alt={item.name} className="w-12 h-12 mr-3" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <div className="flex items-center mt-1">
                              {item.price.coins && (
                                <div className="flex items-center text-sm mr-2">
                                  <span>{item.price.coins}</span>
                                  <FaCoins className="text-yellow-500 ml-1" />
                                </div>
                              )}
                              
                              {item.price.crystals && (
                                <div className="flex items-center text-sm">
                                  <span>{item.price.crystals}</span>
                                  <FaGem className="text-blue-500 ml-1" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex items-center mr-4">
                            <button 
                              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
                              onClick={() => removeFromCart(item.id)}
                            >
                              -
                            </button>
                            <span className="mx-2">{item.quantity}</span>
                            <button 
                              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
                              onClick={() => addToCart(item)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between mb-4">
                      <p className="font-semibold">Итого:</p>
                      <div className="flex flex-col items-end">
                        {calculateTotal().coins > 0 && (
                          <div className="flex items-center">
                            <span>{calculateTotal().coins}</span>
                            <FaCoins className="text-yellow-500 ml-1" />
                          </div>
                        )}
                        
                        {calculateTotal().crystals > 0 && (
                          <div className="flex items-center">
                            <span>{calculateTotal().crystals}</span>
                            <FaGem className="text-blue-500 ml-1" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button 
                        className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg py-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        onClick={clearCart}
                      >
                        Очистить
                      </button>
                      <button 
                        className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary-dark transition-colors"
                        onClick={checkout}
                      >
                        Купить
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FaCartPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Корзина пуста</p>
                  <p className="mt-1 text-sm">Добавьте товары из магазина</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Shop; 
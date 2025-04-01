import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import localforage from 'localforage';
import { User, UserUpdate, Task } from '../types';

// Интерфейс для контекста авторизации
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, username: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updates: UserUpdate) => Promise<User>;
  handleDemoLogin: () => Promise<User>;
  createDemoUser: () => Promise<User>;
}

// Создание контекста
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Пропсы для провайдера
interface AuthProviderProps {
  children: ReactNode;
}

// Провайдер контекста
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // При загрузке компонента пытаемся восстановить пользователя из localStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await localforage.getItem<User>('currentUser');
        
        if (savedUser) {
          // Если сохранен демо-пользователь с истекшей сессией, создаем нового
          if (savedUser.email === 'demo@example.com' && 
              savedUser.lastActive && 
              new Date(savedUser.lastActive).getTime() + 24 * 60 * 60 * 1000 < Date.now()) {
            const newDemoUser = await createDemoUser();
            setCurrentUser(newDemoUser);
          } else {
            setCurrentUser(savedUser);
          }
        }
      } catch (error) {
        console.error('Ошибка при восстановлении пользователя:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Создание демо-пользователя
  const createDemoUser = async (): Promise<User> => {
    console.log('AuthContext: Создание нового демо-пользователя');
    
    // Создаем разнообразные и интересные демо-задачи
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const demoTasks: Task[] = [
      {
        id: `task-${Date.now()}-1`,
        title: 'Изучить основы TaskVenture',
        description: 'Ознакомиться с основными функциями приложения: задачами, персонажами и боевой системой',
        completed: false,
        category: 'обучение',
        priority: 'high',
        createdAt: now,
        dueDate: tomorrow,
        tags: ['обучение', 'демо']
      },
      {
        id: `task-${Date.now()}-2`,
        title: 'Победить в первой битве',
        description: 'Перейдите в раздел Битва и попробуйте победить первого противника',
        completed: false,
        category: 'игра',
        priority: 'medium',
        createdAt: now,
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        tags: ['игра', 'битва', 'демо']
      },
      {
        id: `task-${Date.now()}-3`,
        title: 'Настроить профиль',
        description: 'Перейдите в раздел настроек и установите предпочтительную тему и язык',
        completed: false,
        category: 'персонализация',
        priority: 'low',
        createdAt: now,
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        tags: ['настройки', 'демо']
      },
      {
        id: `task-${Date.now()}-4`,
        title: 'Создать свою первую задачу',
        description: 'Создайте собственную задачу с нужным вам описанием, сроком и категорией',
        completed: false,
        category: 'обучение',
        priority: 'high',
        createdAt: now,
        dueDate: tomorrow,
        tags: ['обучение', 'демо']
      },
      {
        id: `task-${Date.now()}-5`,
        title: 'Разблокировать нового персонажа',
        description: 'Выполните задачи, чтобы получить опыт и разблокировать нового персонажа в боевой системе',
        completed: false,
        category: 'игра',
        priority: 'medium',
        createdAt: now,
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        tags: ['игра', 'персонаж', 'демо']
      }
    ];
    
    console.log('AuthContext: Созданы демо-задачи:', demoTasks.length);
    
    const demoUser: User = {
      id: `demo-${Date.now()}`,
      username: 'Демо-пользователь',
      email: 'demo@example.com',
      level: 1,
      experience: 0,
      coins: 500,
      crystals: 10,
      tasks: demoTasks,
      unlockedCharacters: [],
      characterProgress: {},
      inventory: [],
      friends: [],
      friendRequests: [],
      messages: {},
      settings: {
        theme: 'system',
        notifications: true,
        sound: true,
        language: 'ru'
      },
      createdAt: new Date(),
      lastActive: new Date()
    };
    
    console.log('AuthContext: Сохраняем демо-пользователя в localforage');
    await localforage.setItem('currentUser', demoUser);
    console.log('AuthContext: Демо-пользователь создан с задачами:', demoUser.tasks);
    return demoUser;
  };

  // Вход в демо-режим
  const handleDemoLogin = async (): Promise<User> => {
    console.log('AuthContext: Запрошен вход в демо-режим');
    console.log('AuthContext: Начинаем процесс входа в демо-режим');
    setLoading(true);
    try {
      // Всегда создаем нового демо-пользователя при входе в демо-режим
      console.log('AuthContext: Вызываем createDemoUser для создания демо-пользователя');
      const demoUser = await createDemoUser();
      console.log('AuthContext: Создан новый демо-пользователь:', demoUser);
      console.log('AuthContext: Задачи демо-пользователя:', demoUser.tasks);
      console.log('AuthContext: Обновляем текущего пользователя на демо-пользователя');
      setCurrentUser(demoUser);
      console.log('AuthContext: Демо-вход успешно завершен');
      return demoUser;
    } catch (error) {
      console.error('AuthContext: Ошибка при входе в демо-режим:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Вход в систему
  const login = async (email: string, password: string): Promise<User> => {
    console.log('AuthContext: Запрошен вход в систему с email:', email);
    setLoading(true);
    try {
      // В реальном приложении здесь должна быть авторизация через API
      // Для демонстрации просто проверяем если это админ
      if (email === 'admin@taskventure.com' && password === 'admin') {
        console.log('AuthContext: Вход в админ-аккаунт');
        
        const adminUser: User = {
          id: 'admin-1',
          username: 'Администратор',
          email: 'admin@taskventure.com',
          level: 99,
          experience: 9999,
          coins: 99999,
          crystals: 999,
          tasks: [],
          unlockedCharacters: [],
          characterProgress: {},
          inventory: [],
          friends: [],
          friendRequests: [],
          messages: {},
          settings: {
            theme: 'system',
            notifications: true,
            sound: true,
            language: 'ru'
          },
          isAdmin: true,
          createdAt: new Date(),
          lastActive: new Date()
        };
        
        console.log('AuthContext: Создан админ-пользователь:', adminUser);
        console.log('AuthContext: isAdmin установлен:', adminUser.isAdmin);
        
        setCurrentUser(adminUser);
        await localforage.setItem('currentUser', adminUser);
        console.log('AuthContext: Админ-пользователь сохранен в localforage');
        return adminUser;
      }
      
      console.log('AuthContext: Вход обычного пользователя');
      
      // Проверяем, существует ли пользователь в localforage
      try {
        const savedUsers = await localforage.getItem<Record<string, User>>('users');
        console.log('AuthContext: Проверка существующих пользователей:', savedUsers);
        
        if (savedUsers && savedUsers[email]) {
          // Проверка пароля (в демо-версии не реализуем настоящую проверку)
          console.log('AuthContext: Найден существующий пользователь для', email);
          const user = savedUsers[email];
          user.lastActive = new Date();
          
          setCurrentUser(user);
          await localforage.setItem('currentUser', user);
          
          // Обновляем запись в хранилище пользователей
          savedUsers[email] = user;
          await localforage.setItem('users', savedUsers);
          
          return user;
        }
      } catch (e) {
        console.log('AuthContext: Ошибка при проверке существующих пользователей:', e);
      }
      
      // Если пользователь не найден, создаем нового
      // Для других пользователей просто создаем нового пользователя
      const newUser: User = {
        id: `user-${Date.now()}`,
        username: email.split('@')[0],
        email,
        level: 1,
        experience: 0,
        coins: 100,
        crystals: 5,
        tasks: [],
        unlockedCharacters: [],
        characterProgress: {},
        inventory: [],
        friends: [],
        friendRequests: [],
        messages: {},
        settings: {
          theme: 'system',
          notifications: true,
          sound: true,
          language: 'ru'
        },
        createdAt: new Date(),
        lastActive: new Date()
      };
      
      console.log('AuthContext: Создан обычный пользователь:', newUser);
      
      // Сохраняем в хранилище всех пользователей
      try {
        const savedUsers = await localforage.getItem<Record<string, User>>('users') || {};
        savedUsers[email] = newUser;
        await localforage.setItem('users', savedUsers);
        console.log('AuthContext: Пользователь добавлен в хранилище пользователей');
      } catch (e) {
        console.error('AuthContext: Ошибка при сохранении в хранилище пользователей:', e);
      }
      
      await localforage.setItem('currentUser', newUser);
      setCurrentUser(newUser);
      return newUser;
    } catch (error) {
      console.error('AuthContext: Ошибка при входе:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Регистрация нового пользователя
  const register = async (email: string, password: string, username: string): Promise<User> => {
    console.log('AuthContext: Регистрация нового пользователя:', { email, username });
    setLoading(true);
    
    try {
      // Проверяем, если это админский аккаунт
      if (email === 'admin@taskventure.com') {
        console.log('AuthContext: Регистрация админского аккаунта');
        
        const adminUser: User = {
          id: 'admin-1',
          username: 'Администратор',
          email: 'admin@taskventure.com',
          level: 99,
          experience: 9999,
          coins: 99999,
          crystals: 999,
          tasks: [],
          unlockedCharacters: [],
          characterProgress: {},
          inventory: [],
          friends: [],
          friendRequests: [],
          messages: {},
          settings: {
            theme: 'system',
            notifications: true,
            sound: true,
            language: 'ru'
          },
          isAdmin: true,
          createdAt: new Date(),
          lastActive: new Date()
        };
        
        console.log('AuthContext: Создан админ-пользователь:', adminUser);
        
        // Сохраняем в хранилище пользователей
        try {
          const savedUsers = await localforage.getItem<Record<string, User>>('users') || {};
          savedUsers[email] = adminUser;
          await localforage.setItem('users', savedUsers);
          console.log('AuthContext: Админ-пользователь добавлен в хранилище пользователей');
        } catch (e) {
          console.error('AuthContext: Ошибка при сохранении в хранилище пользователей:', e);
        }
        
        await localforage.setItem('currentUser', adminUser);
        setCurrentUser(adminUser);
        return adminUser;
      }
      
      // Создаем нового обычного пользователя
      console.log('AuthContext: Создание нового обычного пользователя');
      
      // Проверяем, не существует ли уже пользователь с таким email
      try {
        const savedUsers = await localforage.getItem<Record<string, User>>('users');
        
        if (savedUsers && savedUsers[email]) {
          console.error('AuthContext: Пользователь с email', email, 'уже существует');
          throw new Error('Пользователь с таким email уже существует');
        }
      } catch (e) {
        if (e instanceof Error && e.message === 'Пользователь с таким email уже существует') {
          throw e;
        }
        console.log('AuthContext: Ошибка при проверке существующих пользователей:', e);
      }
      
      // Создаем стартовые демо-задачи для нового пользователя
      const initialTasks: Task[] = [
        {
          id: `task-${Date.now()}-1`,
          title: 'Изучить Taskventure',
          description: 'Познакомиться с функциями приложения',
          completed: false,
          priority: 'medium' as 'low' | 'medium' | 'high',
          category: 'Обучение',
          createdAt: new Date(),
          tags: ['обучение']
        },
        {
          id: `task-${Date.now()}-2`,
          title: 'Завершить первую задачу',
          description: 'Отметить задачу как выполненную и получить опыт',
          completed: false,
          priority: 'high' as 'low' | 'medium' | 'high',
          category: 'Обучение',
          createdAt: new Date(),
          tags: ['обучение']
        }
      ];
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        email,
        level: 1,
        experience: 0,
        coins: 100,
        crystals: 5,
        tasks: initialTasks,
        unlockedCharacters: [],
        characterProgress: {},
        inventory: [],
        friends: [],
        friendRequests: [],
        messages: {},
        settings: {
          theme: 'system',
          notifications: true,
          sound: true,
          language: 'ru'
        },
        createdAt: new Date(),
        lastActive: new Date()
      };
      
      console.log('AuthContext: Новый пользователь создан:', newUser);
      
      // Сохраняем в хранилище пользователей
      try {
        const savedUsers = await localforage.getItem<Record<string, User>>('users') || {};
        savedUsers[email] = newUser;
        await localforage.setItem('users', savedUsers);
        console.log('AuthContext: Новый пользователь добавлен в хранилище пользователей');
      } catch (e) {
        console.error('AuthContext: Ошибка при сохранении в хранилище пользователей:', e);
      }
      
      await localforage.setItem('currentUser', newUser);
      setCurrentUser(newUser);
      return newUser;
    } catch (error) {
      console.error('AuthContext: Ошибка при регистрации:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Выход из системы
  const logout = async (): Promise<void> => {
    console.log('AuthContext: Запрошен выход из системы');
    try {
      // Сохраняем текущие данные пользователя перед выходом
      if (currentUser) {
        console.log('AuthContext: Сохранение состояния пользователя перед выходом');
        
        // Обновляем запись в хранилище всех пользователей, если это не демо
        if (currentUser.email !== 'demo@example.com') {
          try {
            const savedUsers = await localforage.getItem<Record<string, User>>('users') || {};
            if (currentUser.email && savedUsers[currentUser.email]) {
              savedUsers[currentUser.email] = {
                ...currentUser,
                lastActive: new Date()
              };
              await localforage.setItem('users', savedUsers);
              console.log('AuthContext: Пользователь обновлен в хранилище пользователей');
            }
          } catch (e) {
            console.error('AuthContext: Ошибка при обновлении в хранилище пользователей:', e);
          }
        }
      }
      
      // Удаляем текущего пользователя из хранилища
      await localforage.removeItem('currentUser');
      console.log('AuthContext: Пользователь удален из currentUser');
      
      // Очищаем состояние
      setCurrentUser(null);
      console.log('AuthContext: Пользователь вышел из системы');
    } catch (error) {
      console.error('AuthContext: Ошибка при выходе из системы:', error);
      throw error;
    }
  };

  // Обновление данных пользователя
  const updateUser = async (updates: UserUpdate): Promise<User> => {
    console.log('AuthContext: Запрошено обновление пользователя с данными:', updates);
    
    if (!currentUser) {
      console.error('AuthContext: Ошибка - нет текущего пользователя');
      throw new Error('Нет активного пользователя');
    }
    
    try {
      // Объединяем текущие данные пользователя с обновлениями
      const updatedUser = { ...currentUser, ...updates, lastActive: new Date() };
      console.log('AuthContext: Обновленный пользователь:', updatedUser);
      
      // Сохраняем в хранилище
      await localforage.setItem('currentUser', updatedUser);
      console.log('AuthContext: Пользователь сохранен в localforage');
      
      // Обновляем состояние
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('AuthContext: Ошибка при обновлении пользователя:', error);
      throw error;
    }
  };

  // Функция для сброса всех данных (для отладки/тестирования)
  const resetAllData = async (): Promise<void> => {
    console.log('AuthContext: Запрошен сброс всех данных');
    try {
      // Удаляем всех пользователей
      await localforage.removeItem('users');
      console.log('AuthContext: Хранилище пользователей очищено');
      
      // Удаляем текущего пользователя
      await localforage.removeItem('currentUser');
      console.log('AuthContext: Текущий пользователь удален');
      
      // Удаляем задачи
      await localforage.removeItem('tasks');
      console.log('AuthContext: Хранилище задач очищено');
      
      // Очищаем состояние
      setCurrentUser(null);
      console.log('AuthContext: Все данные сброшены');
    } catch (error) {
      console.error('AuthContext: Ошибка при сбросе данных:', error);
      throw error;
    }
  };

  // Если нужно сбросить данные для тестирования, раскомментируйте следующую строку
  // Затем перезагрузите страницу, после чего снова закомментируйте
  // window.addEventListener('load', resetAllData);

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateUser,
    handleDemoLogin,
    createDemoUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста авторизации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

export default AuthContext; 
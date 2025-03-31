import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import localforage from 'localforage';

interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  experience: number;
  character: {
    avatar: string;
    stats: {
      strength: number;
      intelligence: number;
      agility: number;
      charisma: number;
    }
  };
  inventory: any[];
  achievements: any[];
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация и проверка авторизации пользователя
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await localforage.getItem<User>('currentUser');
        const token = await localforage.getItem<string>('authToken');
        
        if (user && token) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Имитация входа пользователя
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // В реальном приложении здесь был бы запрос к API
      // Симуляция задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Для демонстрации создаем тестового пользователя
      // В реальном приложении данные пришли бы от сервера
      if (email === 'demo@example.com' && password === 'password123') {
        const user: User = {
          id: '1',
          username: 'Демо пользователь',
          email: 'demo@example.com',
          level: 1,
          experience: 0,
          character: {
            avatar: 'default',
            stats: {
              strength: 10,
              intelligence: 10,
              agility: 10,
              charisma: 10
            }
          },
          inventory: [],
          achievements: []
        };
        
        await localforage.setItem('currentUser', user);
        await localforage.setItem('authToken', 'fake-token-123');
        
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Неверный email или пароль');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Имитация регистрации пользователя
  const register = useCallback(async (username: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // В реальном приложении здесь был бы запрос к API
      // Симуляция задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Создаем нового пользователя
      const user: User = {
        id: Date.now().toString(),
        username,
        email,
        level: 1,
        experience: 0,
        character: {
          avatar: 'default',
          stats: {
            strength: 10,
            intelligence: 10,
            agility: 10,
            charisma: 10
          }
        },
        inventory: [],
        achievements: []
      };
      
      await localforage.setItem('currentUser', user);
      await localforage.setItem('authToken', `fake-token-${Date.now()}`);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Выход пользователя
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await localforage.removeItem('currentUser');
      await localforage.removeItem('authToken');
      
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Обновление данных пользователя
  const updateUser = useCallback(async (userData: Partial<User>): Promise<void> => {
    if (!currentUser) return;
    
    try {
      // Создаем глубокую копию для предотвращения мутации
      const deepCopy = JSON.parse(JSON.stringify(currentUser));
      
      // Если обновляется вложенное свойство (например, character.stats),
      // объединяем их правильно
      let updatedUser: User;
      
      // Проверяем наличие character в userData
      if (userData.character && currentUser.character) {
        const updatedCharacter = {
          ...deepCopy.character,
          ...userData.character
        };
        
        // Если обновляются stats
        if (userData.character.stats && currentUser.character.stats) {
          updatedCharacter.stats = {
            ...deepCopy.character.stats,
            ...userData.character.stats
          };
        }
        
        updatedUser = {
          ...deepCopy,
          ...userData,
          character: updatedCharacter
        };
      } else {
        updatedUser = {
          ...deepCopy,
          ...userData
        };
      }
      
      // Добавляем небольшую задержку для уменьшения частоты обновлений
      await new Promise(resolve => setTimeout(resolve, 50));
      
      await localforage.setItem('currentUser', updatedUser);
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }, [currentUser]);

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
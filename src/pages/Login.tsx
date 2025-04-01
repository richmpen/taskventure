import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaLock, FaSignInAlt, FaUserAstronaut, FaShieldAlt } from 'react-icons/fa';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, handleDemoLogin } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Проверка на админа
      if (email === 'admin@taskventure.com' && password === 'admin') {
        setLoginSuccess(true);
        // Добавляем анимацию перед переходом
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
        return;
      }
      
      await login(email, password);
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/tasks');
      }, 800);
    } catch (err) {
      setError('Ошибка входа. Пожалуйста, проверьте ваши данные и попробуйте снова.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Вход через демо-режим
  const handleDemoClick = async () => {
    if (isLoading) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Login: Запуск демо-входа');
      console.log('Login: Вызываем handleDemoLogin из AuthContext');
      
      const demoUser = await handleDemoLogin();
      
      console.log('Login: Демо-вход успешен, пользователь:', demoUser);
      console.log('Login: У демо-пользователя', demoUser.tasks.length, 'задач');
      console.log('Login: Перенаправление на страницу задач');
      
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/tasks');
      }, 800);
    } catch (error) {
      console.error('Login: Ошибка демо-входа:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(`Ошибка при входе в демо-режим: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Вход как администратор
  const handleAdminLogin = async () => {
    if (isLoading) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Login: Запуск входа администратора');
      await login('admin@taskventure.com', 'admin');
      console.log('Login: Вход администратора успешен, перенаправление');
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 800);
    } catch (error) {
      setError('Ошибка при входе как администратор');
      console.error('Login: Ошибка входа администратора:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.3 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
      {/* Декоративные элементы фона */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-20 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <AnimatePresence mode="wait">
        {!loginSuccess ? (
          <motion.div 
            className="backdrop-blur-md bg-white/30 dark:bg-gray-900/40 rounded-xl shadow-2xl border border-white/30 dark:border-gray-800/50 max-w-md w-full overflow-hidden shadow-neon"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-8 md:p-10">
              <motion.div variants={itemVariants} className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white dark:text-white mb-2">Taskventure</h1>
                <p className="text-gray-100 dark:text-gray-300">Войдите для начала приключения</p>
              </motion.div>
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="bg-red-100/80 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary block w-full rounded-lg"
                      placeholder="admin@taskventure.com"
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary block w-full rounded-lg"
                      placeholder="admin"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg opacity-70 filter blur-md -z-10"></div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-3 px-4 bg-primary/80 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-white font-medium rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <FaSignInAlt className="text-primary-light group-hover:text-white transition-colors duration-300" />
                    </span>
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Вход...
                      </span>
                    ) : 'Войти'}
                  </button>
                </motion.div>
                
                <div className="flex items-center my-4">
                  <div className="flex-grow h-0.5 bg-gray-300/50 dark:bg-gray-700/50"></div>
                  <span className="px-4 text-sm text-gray-200 dark:text-gray-400">или</span>
                  <div className="flex-grow h-0.5 bg-gray-300/50 dark:bg-gray-700/50"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={itemVariants} className="relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg opacity-70 filter blur-md -z-10"></div>
                    <button
                      type="button" 
                      onClick={handleDemoClick}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-500/80 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <FaUserAstronaut className="text-purple-300 group-hover:text-white transition-colors duration-300" />
                      </span>
                      Демо
                    </button>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-lg opacity-70 filter blur-md -z-10"></div>
                    <button
                      type="button" 
                      onClick={handleAdminLogin}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-500/80 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <FaShieldAlt className="text-red-300 group-hover:text-white transition-colors duration-300" />
                      </span>
                      Админ
                    </button>
                  </motion.div>
                </div>
                
                <motion.div variants={itemVariants} className="text-center pt-4">
                  <p className="text-white/90 dark:text-gray-300">
                    Нет аккаунта?{' '}
                    <Link to="/register" className="text-purple-300 hover:text-white font-medium hover:underline transition-colors">
                      Зарегистрироваться
                    </Link>
                  </p>
                </motion.div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="p-8 bg-white/30 dark:bg-gray-900/40 backdrop-blur-md rounded-xl shadow-xl border border-white/30 dark:border-gray-800/50 shadow-neon"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Успешный вход!</h3>
              <p className="text-gray-100 mt-2">Перенаправление...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login; 
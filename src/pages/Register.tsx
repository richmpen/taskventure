import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError('Ошибка регистрации. Пожалуйста, проверьте ваши данные и попробуйте снова.');
      console.error(err);
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
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark p-4">
      <motion.div 
        className="container-ios max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Taskventure</h1>
          <p className="text-gray-600 dark:text-gray-400">Создайте аккаунт для начала приключения</p>
        </motion.div>
        
        <div className="p-3 bg-blue-100 border-l-4 border-blue-500 text-blue-700 mb-6 rounded-md">
          <p className="font-medium">Совет:</p>
          <p>Используйте email <span className="font-bold">admin@taskventure.com</span> для получения прав администратора.</p>
        </div>
        
        {error && (
          <motion.div 
            variants={itemVariants}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md"
          >
            <p>{error}</p>
          </motion.div>
        )}
        
        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="form-label">
              Имя пользователя
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Ваше имя"
              required
              autoFocus
            />
          </div>
          
          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="example@email.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Подтвердите пароль
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          
          <div className="pt-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Регистрация...
                </span>
              ) : 'Зарегистрироваться'}
            </motion.button>
          </div>
          
          <div className="text-center pt-2">
            <motion.div variants={itemVariants}>
              <p className="text-gray-600 dark:text-gray-400">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Войти
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Register; 
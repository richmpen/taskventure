import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark p-4">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-7xl mb-4"
          animate={{ 
            rotate: [0, 5, -5, 5, 0],
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "mirror" 
          }}
        >
          🧩
        </motion.div>
        
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-2xl font-medium mb-4">Страница не найдена</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          Кажется, вы заблудились в своем приключении. Эта страница не существует или была перемещена.
        </p>
        
        <Link to="/" className="btn-primary inline-block">
          Вернуться на главную
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound; 
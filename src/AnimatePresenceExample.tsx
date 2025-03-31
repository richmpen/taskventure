import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeAnimatePresence from './components/SafeAnimatePresence';

const AnimatePresenceExample: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="p-8">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? 'Скрыть' : 'Показать'}
      </button>

      {/* Используем SafeAnimatePresence вместо AnimatePresence */}
      <SafeAnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-gray-100 p-4 rounded shadow"
          >
            <h2 className="text-xl font-bold mb-2">Анимированный контент</h2>
            <p>
              Этот блок будет анимироваться при появлении и исчезновении.
            </p>
          </motion.div>
        )}
      </SafeAnimatePresence>
    </div>
  );
};

export default AnimatePresenceExample; 
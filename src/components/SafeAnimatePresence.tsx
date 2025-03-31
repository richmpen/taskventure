import React from 'react';
import { AnimatePresence } from 'framer-motion';

interface SafeAnimatePresenceProps {
  children: React.ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
  onExitComplete?: () => void;
}

/**
 * Безопасная обертка для AnimatePresence, решающая проблемы типизации
 */
export const SafeAnimatePresence: React.FC<SafeAnimatePresenceProps> = ({ 
  children, 
  mode = 'sync', 
  initial, 
  onExitComplete 
}) => {
  // Приводим AnimatePresence к any, чтобы обойти ошибки типизации
  const AP = AnimatePresence as any;
  
  return (
    <AP mode={mode} initial={initial} onExitComplete={onExitComplete}>
      {children}
    </AP>
  );
};

export default SafeAnimatePresence; 
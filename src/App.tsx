import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Страницы
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Battle from './pages/Battle';
import Character from './pages/Character';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const AppRoutes: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Имитация загрузки приложения
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-background-dark">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-primary">Загрузка Taskventure...</h2>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background dark:bg-background-dark">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/tasks" element={<PrivateRoute element={<Tasks />} />} />
          <Route path="/battle" element={<PrivateRoute element={<Battle />} />} />
          <Route path="/character" element={<PrivateRoute element={<Character />} />} />
          <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

// Оборачиваем приложение в HashRouter для поддержки GitHub Pages
const App: React.FC = () => {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
};

export default App; 
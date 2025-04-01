import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requireAdmin = false }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  console.log('PrivateRoute проверка:');
  console.log('- Текущий путь:', location.pathname);
  console.log('- Требуется админ:', requireAdmin);
  console.log('- Текущий пользователь:', currentUser);
  console.log('- isAdmin:', currentUser?.isAdmin);

  // Если идет загрузка данных пользователя, показываем заглушку
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Если требуются права администратора, но у пользователя их нет
  if (requireAdmin) {
    if (currentUser.email !== 'admin@taskventure.com') {
      console.error('Доступ запрещен: требуются права администратора');
      return <Navigate to="/tasks" />;
    }
  }

  // Если пользователь авторизован, показываем запрошенную страницу
  return <>{children}</>;
};

export default PrivateRoute; 
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ThemeProvider from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

// Импортируем все страницы из индексного файла
import {
  Home,
  Login,
  Register,
  Tasks,
  Battle,
  Character,
  Profile,
  Admin,
  Settings,
  NotFound,
  Friends,
  Shop
} from './pages';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                color: '#333',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                fontWeight: 500,
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: 'white',
                },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="tasks" element={
                <PrivateRoute>
                  <Tasks />
                </PrivateRoute>
              } />
              <Route path="battle" element={
                <PrivateRoute>
                  <Battle />
                </PrivateRoute>
              } />
              <Route path="characters" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="character/:characterId" element={
                <PrivateRoute>
                  <Character />
                </PrivateRoute>
              } />
              <Route path="profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="friends" element={
                <PrivateRoute>
                  <Friends />
                </PrivateRoute>
              } />
              <Route path="shop" element={
                <PrivateRoute>
                  <Shop />
                </PrivateRoute>
              } />
              <Route path="admin" element={
                <PrivateRoute requireAdmin>
                  <Admin />
                </PrivateRoute>
              } />
              <Route path="settings" element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 
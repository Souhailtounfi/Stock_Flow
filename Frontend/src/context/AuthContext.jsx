import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const API_BASE_URL = 'http://127.0.0.1:5172/api';
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedAuth = localStorage.getItem('auth_data');
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          setAuthHeader(authData.token);
          const response = await axios.get('/auth/me');
          setUser({ ...response.data, token: authData.token });
        } catch (error) {
          console.error("Token verification failed", error);
          localStorage.removeItem('auth_data');
          setAuthHeader(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    const response = await axios.post('/auth/login', { username, password });
    const authData = response.data;
    localStorage.setItem('auth_data', JSON.stringify({ token: authData.token }));
    setAuthHeader(authData.token);
    setUser(authData);
    return authData;
  };

  const register = async (username, email, password, roleId = 2) => {
    const response = await axios.post('/auth/register', { username, email, password, roleId });
    const authData = response.data;
    localStorage.setItem('auth_data', JSON.stringify({ token: authData.token }));
    setAuthHeader(authData.token);
    setUser(authData);
    return authData;
  };

  const logout = () => {
    localStorage.removeItem('auth_data');
    setAuthHeader(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.roleName === 'Admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

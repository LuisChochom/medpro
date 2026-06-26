import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const perms = localStorage.getItem('permissions');
          const roles = localStorage.getItem('roles');
          const email = localStorage.getItem('email');
          setUser({ 
            loggedIn: true, 
            email: email || '',
            permissions: perms ? JSON.parse(perms) : [],
            roles: roles ? JSON.parse(roles) : []
          });
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const newToken = response.data.token;
    const { permissions, roles, email: userEmail } = response.data.user;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('email', userEmail);
    localStorage.setItem('permissions', JSON.stringify(permissions || []));
    localStorage.setItem('roles', JSON.stringify(roles || []));
    
    setToken(newToken);
    setUser({ loggedIn: true, email: userEmail, permissions: permissions || [], roles: roles || [] });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('permissions');
    localStorage.removeItem('roles');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

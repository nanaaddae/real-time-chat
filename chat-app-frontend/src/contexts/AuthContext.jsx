import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const validateSession = async () => {
      const currentUser = authService.getCurrentUser();
      const token = localStorage.getItem('token');
      
      if (currentUser && token) {
        try {
          // Verify token is valid by hitting an authenticated endpoint
          // Note: GET /api/auth/me is better if you have it
          await api.get('/rooms'); 
          setUser(currentUser);
        } catch (error) {
          console.error('Token expired or invalid, logging out:', error);
          authService.logout();
          setUser(null);
        }
      } else {
        // No token found, ensure user is null
        setUser(null);
      }
      
      // Crucial: setLoading(false) must run whether the try succeeds OR fails
      setLoading(false);
    };

    validateSession();
  }, []);

  const login = async (credentials) => {
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login service error:", error);
      throw error; // Rethrow so your Login component can show the error to the user
    }
  };

  const register = async (userData) => {
    try {
      const newUser = await authService.register(userData);
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error("Registration service error:", error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
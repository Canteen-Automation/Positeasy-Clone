import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  checkUserExists: (mobileNumber: string) => Promise<{ success: boolean; userExists: boolean; message: string }>;
  login: (mobileNumber: string, pin: string) => Promise<{ success: boolean; message: string }>;
  register: (mobileNumber: string, name: string, pin: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  changePin: (currentPin: string, newPin: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = `http://${window.location.hostname}:8080/api/auth`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const checkUserExists = async (mobileNumber: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, userExists: false, message: 'Network error. Please try again.' };
    }
  };

  const login = async (mobileNumber: string, pin: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, pin }),
      });
      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const register = async (mobileNumber: string, name: string, pin: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, name, pin }),
      });
      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    if (user) {
      fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: user.mobileNumber }),
      });
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  const changePin = async (currentPin: string, newPin: string) => {
    if (!user) return { success: false, message: 'Not logged in' };
    try {
      const response = await fetch(`${API_BASE_URL}/change-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: user.mobileNumber, currentPin, newPin }),
      });
      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, checkUserExists, login, register, logout, changePin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

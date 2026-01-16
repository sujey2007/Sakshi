import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('@sakshi_user_session');
        if (savedUser) {
          setUser(JSON.parse(savedUser)); 
        }
      } catch (e) {
        console.error("Session load error", e);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };
    checkLoginStatus();
  }, []);

  const login = async (userData) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem('@sakshi_user_session', JSON.stringify(userData));
    } catch (e) { console.error(e); }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('@sakshi_user_session');
    } catch (e) { console.error(e); }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
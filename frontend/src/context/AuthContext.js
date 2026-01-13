import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // CRITICAL: Must be null
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect should only check if a user ALREADY exists.
    // For now, we leave it empty so it ALWAYS goes to login.
    const checkLoginStatus = async () => {
      // Simulate a network check
      setTimeout(() => {
        setIsLoading(false); 
      }, 1000);
    };
    checkLoginStatus();
  }, []);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
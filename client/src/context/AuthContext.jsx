import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  TOKEN: 'shopez_token',
  USER: 'shopez_user',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session from persistent storage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUserData = localStorage.getItem(STORAGE_KEYS.USER);

      if (storedToken && storedUserData) {
        setUser(JSON.parse(storedUserData));
      }
    } catch {
      // In case of parsing anomalies, clear corrupted session
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistSession = useCallback((token, userData) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persistSession(data.token, data.user);
    return data.user;
  }, [persistSession]);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    persistSession(data.token, data.user);
    return data.user;
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed within an AuthProvider subtree');
  }
  return context;
}

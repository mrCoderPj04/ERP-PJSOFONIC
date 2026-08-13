'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmsUser } from '../lib/ems';

interface AuthContextType {
  user: EmsUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: EmsUser, userToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<EmsUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore real-time EMS user session from localStorage
    try {
      const savedUser = localStorage.getItem('pj_ems_user');
      const savedToken = localStorage.getItem('pj_ems_token');
      if (savedUser && savedToken) {
        const parsed = JSON.parse(savedUser);
        if (parsed) {
          parsed.fullName = parsed.fullName || parsed.name || 'EMS Employee';
        }
        setUser(parsed);
        setToken(savedToken);
      }
    } catch (e) {
      console.error('Failed to restore EMS auth session', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: EmsUser, userToken: string) => {
    const normalizedData: EmsUser = {
      ...userData,
      fullName: userData?.fullName || (userData as any)?.name || 'EMS Employee',
    };
    setUser(normalizedData);
    setToken(userToken);
    try {
      localStorage.setItem('pj_ems_user', JSON.stringify(normalizedData));
      localStorage.setItem('pj_ems_token', userToken);
    } catch (e) {
      console.error('Failed to save EMS auth session', e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('pj_ems_user');
      localStorage.removeItem('pj_ems_token');
    } catch (e) {
      console.error('Failed to clear EMS session', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

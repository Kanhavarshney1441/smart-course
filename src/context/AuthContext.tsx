import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  loginAsDemoStudent: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile || null);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      await fetchCurrentUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, role = 'student') => {
    setIsLoading(true);
    try {
      const res = await api.register({ email, password, full_name: fullName, role });
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      await fetchCurrentUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data.profile);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const loginAsDemoStudent = async () => {
    await login('student@example.com', 'student123');
  };

  const loginAsDemoAdmin = async () => {
    await login('admin@example.com', 'admin123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        loginAsDemoStudent,
        loginAsDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

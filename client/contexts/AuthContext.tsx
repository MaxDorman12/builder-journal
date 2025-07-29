import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState } from '@shared/api';

interface AuthContextType extends AuthState {
  login: (password: string, username: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FAMILY_PASSWORD = 'ScotlandAdventures2024'; // In production, this would be more secure

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('familyAuth');
    return saved ? JSON.parse(saved) : {
      isAuthenticated: false,
      isFamilyMember: false,
      currentUser: null
    };
  });

  useEffect(() => {
    localStorage.setItem('familyAuth', JSON.stringify(authState));
  }, [authState]);

  const login = (password: string, username: string): boolean => {
    if (password === FAMILY_PASSWORD) {
      const newAuthState = {
        isAuthenticated: true,
        isFamilyMember: true,
        currentUser: username
      };
      setAuthState(newAuthState);
      return true;
    }
    return false;
  };

  const logout = () => {
    const newAuthState = {
      isAuthenticated: false,
      isFamilyMember: false,
      currentUser: null
    };
    setAuthState(newAuthState);
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

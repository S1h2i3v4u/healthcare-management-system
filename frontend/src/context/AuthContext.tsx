import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { AuthResponse, LoginRequest, RegisterDoctorRequest, RegisterPatientRequest, Role } from '@/types';
import * as authApi from '@/api/authApi';

interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  registerPatient: (payload: RegisterPatientRequest) => Promise<void>;
  registerDoctor: (payload: RegisterDoctorRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Reads whatever was persisted from a previous session, so a page refresh
// doesn't silently log the user out — this is what makes "stay logged in"
// work without any backend session, purely from what's in localStorage.
function loadPersistedUser(): AuthUser | null {
  const raw = localStorage.getItem('authUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadPersistedUser);
  const [isLoading, setIsLoading] = useState(false);

  // Shared by login/registerPatient/registerDoctor — all three do the exact
  // same thing on success: persist the token + user, update state. Kept as
  // one function so that behavior can't drift between the three call sites.
  const persistAuth = useCallback((response: AuthResponse) => {
    const authUser: AuthUser = {
      userId: response.userId,
      fullName: response.fullName,
      email: response.email,
      role: response.role,
    };
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('authUser', JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const login = useCallback(
    async (payload: LoginRequest) => {
      setIsLoading(true);
      try {
        const response = await authApi.login(payload);
        persistAuth(response);
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth],
  );

  const registerPatient = useCallback(
    async (payload: RegisterPatientRequest) => {
      setIsLoading(true);
      try {
        const response = await authApi.registerPatient(payload);
        persistAuth(response);
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth],
  );

  const registerDoctor = useCallback(
    async (payload: RegisterDoctorRequest) => {
      setIsLoading(true);
      try {
        const response = await authApi.registerDoctor(payload);
        persistAuth(response);
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth],
  );

  // No backend call here — matches AuthService's own note that this
  // JWT-stateless design has no server-side logout endpoint. "Logging out"
  // is purely a client-side action: discard the token, clear state. The
  // axiosClient's 401 interceptor does the same cleanup automatically if a
  // token expires mid-session, so this and that stay consistent with each
  // other.
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      registerPatient,
      registerDoctor,
      logout,
    }),
    [user, isLoading, login, registerPatient, registerDoctor, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
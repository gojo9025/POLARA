'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from './types';
import { demoUsers } from './data';

interface StoredAccount extends User {
  passwordHash: string;
  salt: string;
  createdAt: string;
  bio?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  institution?: string;
  researchAreas?: string[];
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User & { bio?: string }>) => Promise<{ success: boolean; error?: string }>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REGISTRY_STORAGE_KEY = 'polara_user_accounts_v1';
const SESSION_STORAGE_KEY = 'polara_auth_session_v1';

// Cryptographic hash helper using Web Crypto API
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random salt
function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize accounts database in localStorage
  const initAccounts = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const existing = localStorage.getItem(REGISTRY_STORAGE_KEY);
      let accounts: StoredAccount[] = existing ? JSON.parse(existing) : [];

      // Ensure demo accounts are seeded with default passwords
      const seedNeeded = demoUsers.some(demo => !accounts.some(acc => acc.email.toLowerCase() === demo.email.toLowerCase()));

      if (seedNeeded) {
        for (const demo of demoUsers) {
          if (!accounts.some(acc => acc.email.toLowerCase() === demo.email.toLowerCase())) {
            const salt = generateSalt();
            const passwordHash = await hashPassword('polara2025', salt);
            accounts.push({
              ...demo,
              passwordHash,
              salt,
              createdAt: new Date().toISOString(),
              bio: `Affiliated with ${demo.institution || 'Polar Science Network'}.`,
            });
          }
        }
        localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(accounts));
      }

      // Restore active session
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const sessionUser: User = JSON.parse(savedSession);
        // Verify user still exists in registry
        const matched = accounts.find(a => a.id === sessionUser.id);
        if (matched) {
          const { passwordHash: _p, salt: _s, ...safeUser } = matched;
          setUser(safeUser);
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Error initializing auth registry:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAccounts();
  }, [initAccounts]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const raw = localStorage.getItem(REGISTRY_STORAGE_KEY);
      const accounts: StoredAccount[] = raw ? JSON.parse(raw) : [];

      const cleanEmail = email.trim().toLowerCase();
      const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);

      if (!account) {
        return { success: false, error: 'No account registered with this email address.' };
      }

      // Check password (also support default demo password fallback)
      const inputHash = await hashPassword(password, account.salt);
      const isDemoPassword = password === 'demo' || password === 'polara' || password === 'polara2025';

      if (inputHash !== account.passwordHash && !isDemoPassword) {
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }

      const { passwordHash: _p, salt: _s, ...safeUser } = account;
      setUser(safeUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = payload.email.trim().toLowerCase();
      if (!cleanEmail || !payload.password || !payload.name) {
        return { success: false, error: 'Name, email, and password are required.' };
      }

      const raw = localStorage.getItem(REGISTRY_STORAGE_KEY);
      const accounts: StoredAccount[] = raw ? JSON.parse(raw) : [];

      if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'An account with this email address already exists.' };
      }

      const salt = generateSalt();
      const passwordHash = await hashPassword(payload.password, salt);

      const newAccount: StoredAccount = {
        id: 'usr_' + Date.now().toString(36),
        name: payload.name.trim(),
        email: cleanEmail,
        role: payload.role || 'researcher',
        institution: payload.institution?.trim() || 'Independent Polar Researcher',
        researchAreas: payload.researchAreas || ['Cryospheric Science'],
        bio: payload.bio?.trim() || 'POLARA community scientific contributor.',
        avatar: undefined,
        passwordHash,
        salt,
        createdAt: new Date().toISOString(),
      };

      accounts.push(newAccount);
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(accounts));

      const { passwordHash: _p, salt: _s, ...safeUser } = newAccount;
      setUser(safeUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User & { bio?: string }>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No authenticated user session.' };

    try {
      const raw = localStorage.getItem(REGISTRY_STORAGE_KEY);
      const accounts: StoredAccount[] = raw ? JSON.parse(raw) : [];

      const idx = accounts.findIndex(a => a.id === user.id);
      if (idx === -1) return { success: false, error: 'User account not found in registry.' };

      const updatedAccount: StoredAccount = {
        ...accounts[idx],
        ...updates,
      };

      accounts[idx] = updatedAccount;
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(accounts));

      const { passwordHash: _p, salt: _s, ...safeUser } = updatedAccount;
      setUser(safeUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
    } else {
      const found = demoUsers.find(u => u.role === role);
      if (found) {
        setUser(found);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(found));
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      switchRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

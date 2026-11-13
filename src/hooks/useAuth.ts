import { useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  email: string;
  name: string;
  signedInAt: string;
}

interface StoredAccount {
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

const SESSION_STORAGE_KEY = 'findmeajob_auth_session_v2';
const LEGACY_SESSION_KEY = 'findmeajob_auth_session_v1';
const ACCOUNTS_STORAGE_KEY = 'findmeajob_auth_accounts_v1';

const DEMO_ACCOUNT: StoredAccount = {
  email: 'RahulShaw16feb@gmail.com',
  name: 'Rahul Shaw',
  password: 'demo-password',
  createdAt: '2026-11-12',
};

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function useAuth() {
  const [accounts, setAccounts] = useState<StoredAccount[]>(() => {
    const stored = readJSON<StoredAccount[]>(ACCOUNTS_STORAGE_KEY, [DEMO_ACCOUNT]);
    return stored.length > 0 ? stored : [DEMO_ACCOUNT];
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      window.localStorage.removeItem(LEGACY_SESSION_KEY);
      window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
      if (
        window.location.hash === '#login' ||
        new URLSearchParams(window.location.search).get('page') === 'login'
      ) {
        return null;
      }
      const persistent = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (persistent) return JSON.parse(persistent) as AuthUser;
      const temp = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (temp) return JSON.parse(temp) as AuthUser;
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch {
      // Ignore storage quota errors
    }
  }, [accounts]);

  const persistSession = useCallback((authUser: AuthUser | null, remember: boolean) => {
    try {
      if (!authUser) {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        return;
      }
      if (remember) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const signIn = useCallback(
    (email: string, password: string, remember: boolean): { ok: true } | { ok: false; error: string } => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return { ok: false, error: 'Enter a valid email address.' };
      }
      if (password.length < 4) {
        return { ok: false, error: 'Password must be at least 4 characters.' };
      }

      const existing = accounts.find(
        (acc) => acc.email.toLowerCase() === normalizedEmail
      );

      if (!existing) {
        return {
          ok: false,
          error: 'No account found for that email. Switch to Create account or use the demo sign-in.',
        };
      }

      if (existing.password !== password) {
        return { ok: false, error: 'Incorrect password. Please try again.' };
      }

      const authUser: AuthUser = {
        email: existing.email,
        name: existing.name,
        signedInAt: new Date().toISOString(),
      };
      setUser(authUser);
      persistSession(authUser, remember);
      return { ok: true };
    },
    [accounts, persistSession]
  );

  const register = useCallback(
    (
      name: string,
      email: string,
      password: string,
      remember: boolean
    ): { ok: true } | { ok: false; error: string } => {
      const trimmedName = name.trim();
      const normalizedEmail = email.trim().toLowerCase();

      if (!trimmedName) {
        return { ok: false, error: 'Enter your full name.' };
      }
      if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return { ok: false, error: 'Enter a valid email address.' };
      }
      if (password.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters.' };
      }

      const duplicate = accounts.some(
        (acc) => acc.email.toLowerCase() === normalizedEmail
      );
      if (duplicate) {
        return {
          ok: false,
          error: 'An account with this email already exists. Sign in instead.',
        };
      }

      const newAccount: StoredAccount = {
        name: trimmedName,
        email: email.trim(),
        password,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setAccounts((prev) => [newAccount, ...prev]);

      const authUser: AuthUser = {
        email: newAccount.email,
        name: newAccount.name,
        signedInAt: new Date().toISOString(),
      };
      setUser(authUser);
      persistSession(authUser, remember);
      return { ok: true };
    },
    [accounts, persistSession]
  );

  const signInDemo = useCallback(
    (remember: boolean = true) => {
      const authUser: AuthUser = {
        email: DEMO_ACCOUNT.email,
        name: DEMO_ACCOUNT.name,
        signedInAt: new Date().toISOString(),
      };
      setUser(authUser);
      persistSession(authUser, remember);
    },
    [persistSession]
  );

  const signOut = useCallback(() => {
    setUser(null);
    persistSession(null, true);
  }, [persistSession]);

  return {
    user,
    signIn,
    register,
    signInDemo,
    signOut,
  };
}

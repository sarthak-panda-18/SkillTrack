'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, LoginInput, RegisterInput } from '@/types/user';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  role: 'STUDENT' | 'ADMIN' | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await authService.getMe();
      if (currentUser && currentUser.status === 'SUSPENDED') {
        await authService.logout();
        setUser(null);
      } else {
        setUser(currentUser);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage =
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password';

    const isAdminPage = pathname.startsWith('/admin');

    const isDashboardPage =
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/assessment') ||
      pathname.startsWith('/learning') ||
      pathname.startsWith('/progress') ||
      isAdminPage;

    if (!user && isDashboardPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (!user.onboardingCompleted) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } else if (user && user.role === 'ADMIN') {
      // ADMIN user routing rules:
      // If visiting /dashboard or landing auth pages, direct them to /admin
      if (pathname === '/dashboard') {
        router.push('/admin');
      }
    } else if (user && user.role === 'STUDENT') {
      // STUDENT user routing rules:
      // Redirect away from /admin immediately
      if (isAdminPage) {
        router.push('/dashboard');
      } else if (isDashboardPage && !user.onboardingCompleted && pathname !== '/onboarding') {
        router.push('/onboarding');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (data: LoginInput) => {
    const res = await authService.login(data);
    setUser(res.user);
    if (res.user.role === 'ADMIN') {
      router.push('/admin');
    } else if (!res.user.onboardingCompleted) {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  };

  const register = async (data: RegisterInput) => {
    const res = await authService.register(data);
    setUser(res.user);
    router.push('/onboarding');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        login,
        register,
        logout,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

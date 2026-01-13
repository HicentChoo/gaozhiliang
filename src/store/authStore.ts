import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

export interface User {
  id: string;
  username: string;
  nickname?: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        try {
          const response = await api.post('/auth/login', { username, password });
          const { token, user } = response;
          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || '登录失败';
          throw new Error(errorMessage);
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      setUser: (user: User) => {
        set({ user });
      },
      updateUser: async (updates: Partial<User>) => {
        try {
          const response = await api.put('/auth/profile', updates);
          const { user } = response;
          set({ user });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || '更新用户信息失败';
          throw new Error(errorMessage);
        }
      },
      updatePassword: async (oldPassword: string, newPassword: string) => {
        try {
          await api.put('/auth/password', { oldPassword, newPassword });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || '修改密码失败';
          throw new Error(errorMessage);
        }
      },
      fetchUser: async () => {
        try {
          const response = await api.get('/auth/me');
          const { user } = response;
          set({ user });
        } catch (error: any) {
          // 如果获取用户信息失败，清除认证状态
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);


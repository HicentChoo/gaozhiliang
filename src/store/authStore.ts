import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  updateUser: (updates: Partial<User>) => void;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (username: string, _password: string) => {
        // 模拟登录API调用
        // 实际应该调用真实API
        const mockUser: User = {
          id: '1',
          username,
          email: `${username}@example.com`,
          role: username === 'admin' ? 'admin' : 'user',
          avatar: username === 'admin' 
            ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin&backgroundColor=b6e3f4,c0aede,d1d4f9'
            : undefined,
        };
        const mockToken = 'mock_token_' + Date.now();
        set({
          user: mockUser,
          token: mockToken,
          isAuthenticated: true,
        });
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
      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
      updatePassword: async (_oldPassword: string, _newPassword: string) => {
        // 模拟更新密码API调用
        // 实际应该调用真实API
        return Promise.resolve();
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);


import { create } from "zustand";

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  getAccessToken: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAccessToken: (token: string) => {
    set({ accessToken: token, isAuthenticated: true });
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  login: (token: string, user: User) => {
    set({
      accessToken: token,
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  getAccessToken: () => {
    return get().accessToken;
  },
}));

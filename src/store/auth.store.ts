import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService from '../services/auth.service';
import type { User, LoginCredentials } from '../services/auth.service';

interface AuthState {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    isInitialized: boolean;
    isInitializing?: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    initAuth: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            loading: true,
            isAuthenticated: false,
            isInitialized: false,
            isInitializing: false,

            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setLoading: (loading) => set({ loading }),

            login: async (credentials) => {
                set({ loading: true });
                try {
                    const response = await authService.login(credentials);
                    set({ user: response.user, isAuthenticated: true, loading: false });
                } catch (error) {
                    set({ user: null, isAuthenticated: false, loading: false });
                    throw error;
                }
            },

            logout: async () => {
                set({ loading: true });
                try {
                    await authService.logout();
                    set({ user: null, isAuthenticated: false, loading: false });
                } catch (error) {
                    set({ user: null, isAuthenticated: false, loading: false });
                }
            },

            initAuth: async () => {
                const { isInitialized, isInitializing } = get();
                if (isInitialized || isInitializing) return;

                set({ isInitializing: true });
                const storedUser = authService.getStoredUser();
                const token = authService.getAccessToken();

                if (storedUser && token) {
                    try {
                        const currentUser = await authService.getCurrentUser();
                        set({ user: currentUser, isAuthenticated: true });
                    } catch (error) {
                        await authService.logout();
                        set({ user: null, isAuthenticated: false });
                    }
                }
                set({ loading: false, isInitialized: true, isInitializing: false });
            },

            refreshUser: async () => {
                try {
                    const currentUser = await authService.getCurrentUser();
                    set({ user: currentUser, isAuthenticated: true });
                } catch (error) {
                    console.error('Failed to refresh user:', error);
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);

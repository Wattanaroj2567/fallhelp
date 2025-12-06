import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { getToken, clearToken, setToken } from '@/services/tokenStorage';
import Logger from '@/utils/logger';

interface AuthContextType {
    isSignedIn: boolean;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    isSignedIn: false,
    isLoading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const token = await getToken();
                setIsSignedIn(!!token);
                if (token) {
                    // Force redirect to main tabs on app launch
                    // This prevents getting stuck on previous screens (like Elder Info) due to state persistence
                    setTimeout(() => {
                        router.replace('/(tabs)');
                    }, 0);
                }
            } catch (e) {
                Logger.error('Auth bootstrap error', e);
            } finally {
                setIsLoading(false);
            }
        };
        bootstrap();
    }, []);

    const signIn = async (token: string) => {
        await setToken(token);
        setIsSignedIn(true);
        // Navigation logic is handled by the layout effect, but we can force a check
    };

    const signOut = async () => {
        await clearToken();
        setIsSignedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isSignedIn, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

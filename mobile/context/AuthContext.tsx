import React, { createContext, useContext, useState, useEffect } from 'react';
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
    useEffect(() => {
        const bootstrap = async () => {
            try {
                let token = null;
                try {
                    token = await getToken();
                } catch (error) {
                    // Retry once if native storage is not ready immediately (common in dev/restart)
                    Logger.warn('Auth bootstrap failed, retrying...', error);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    token = await getToken();
                }

                setIsSignedIn(!!token);
            } catch (e) {
                Logger.error('Auth bootstrap fatal error', e);
                // If it fails twice, we assume signed out.
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

        // Clear all setup persistence
        try {
            const SecureStore = require("expo-secure-store");
            const AsyncStorage = require("@react-native-async-storage/async-storage").default;

            await SecureStore.deleteItemAsync("setup_elderId");
            await SecureStore.deleteItemAsync("setup_step");
            await SecureStore.deleteItemAsync("setup_deviceId");
            await AsyncStorage.removeItem("setup_step1_form_data");
        } catch (error) {
            Logger.warn("Failed to clear setup data on signout", error);
        }

        setIsSignedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isSignedIn, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { OnboardingAnswers } from '@/types/streak';
import { supabase } from '@/lib/supabase';

const AUTH_KEY = 'nogoonerz_auth';
const ONBOARDING_KEY = 'nogoonerz_onboarding';
const SUBSCRIPTION_KEY = 'nogoonerz_subscription';

export interface AuthState {
  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;
  hasSubscription: boolean;
  username: string;
  email: string;
}

const DEFAULT_AUTH: AuthState = {
  isLoggedIn: false,
  hasCompletedOnboarding: false,
  hasSubscription: false,
  username: '',
  email: '',
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [auth, setAuth] = useState<AuthState>(DEFAULT_AUTH);
  const [isReady, setIsReady] = useState(false);

  const authQuery = useQuery({
    queryKey: ['auth-state'],
    queryFn: async (): Promise<AuthState> => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_KEY);
        if (stored) {
          return JSON.parse(stored) as AuthState;
        }
        return DEFAULT_AUTH;
      } catch (e) {
        console.log('Error loading auth:', e);
        return DEFAULT_AUTH;
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newAuth: AuthState) => {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newAuth));
      return newAuth;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-state'] });
    },
  });

  useEffect(() => {
    if (authQuery.data) {
      setAuth(authQuery.data);
      setIsReady(true);
    }
  }, [authQuery.data]);

  const signup = useCallback(
    async (username: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) {
        throw error;
      }

      const userId = data.user?.id;
      if (userId) {
        await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              username,
            },
            { onConflict: 'id' },
          );
      }

      const newAuth: AuthState = {
        ...auth,
        isLoggedIn: true,
        username,
        email,
      };
      setAuth(newAuth);
      await saveMutation.mutateAsync(newAuth);
    },
    [auth, saveMutation],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const usernameFromMetadata =
        data.user?.user_metadata?.username ?? email.split('@')[0];

      const userId = data.user?.id;
      if (userId) {
        await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              username: usernameFromMetadata,
            },
            { onConflict: 'id' },
          );
      }

      const newAuth: AuthState = {
        ...auth,
        isLoggedIn: true,
        email,
        username: usernameFromMetadata,
      };
      setAuth(newAuth);
      await saveMutation.mutateAsync(newAuth);
    },
    [auth, saveMutation],
  );

  const completeOnboarding = useCallback(async (answers: OnboardingAnswers) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(answers));
    } catch (e) {
      console.log('Error saving onboarding:', e);
    }
    const newAuth: AuthState = {
      ...auth,
      hasCompletedOnboarding: true,
    };
    setAuth(newAuth);
    saveMutation.mutate(newAuth);
  }, [auth]);

  const activateSubscription = useCallback(async () => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({ active: true, startDate: new Date().toISOString() }));
    } catch (e) {
      console.log('Error saving subscription:', e);
    }
    const newAuth: AuthState = {
      ...auth,
      hasSubscription: true,
    };
    setAuth(newAuth);
    saveMutation.mutate(newAuth);
  }, [auth]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log('Error signing out from Supabase:', e);
    }

    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
    } catch (e) {
      console.log('Error clearing auth:', e);
    }

    setAuth(DEFAULT_AUTH);
    queryClient.invalidateQueries({ queryKey: ['auth-state'] });
  }, [queryClient]);

  return {
    auth,
    isReady,
    isLoading: authQuery.isLoading,
    signup,
    login,
    completeOnboarding,
    activateSubscription,
    logout,
  };
});

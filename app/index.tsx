import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth, isReady, isLoading } = useAuth();

  useEffect(() => {
    if (!isReady || isLoading) return;

    if (!auth.isLoggedIn) {
      router.replace('/signup');
      return;
    }

    if (!auth.hasCompletedOnboarding) {
      router.replace('/onboarding');
      return;
    }

    router.replace('/tabs');
  }, [auth, isReady, isLoading, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0A0A0F', '#100A18', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome to</Text>
        <Text style={styles.title}>NOGOONERZ (NGZ)</Text>
        <Text style={styles.subtitle}>90 days to reclaim your mind</Text>
        <ActivityIndicator size="small" color={Colors.purple} style={styles.spinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '900' as const,
    color: Colors.text,
    letterSpacing: 3,
    marginTop: 6,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  spinner: {
    marginTop: 24,
  },
});


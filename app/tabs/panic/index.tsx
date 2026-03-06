import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShieldAlert,
  Droplets,
  Dumbbell,
  Trees,
  Phone,
  Wind,
  PenLine,
  Play,
  Pause,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { PANIC_STRATEGIES, RELAPSE_EFFECTS } from '@/mocks/quotes';
import { useStreak } from '@/providers/StreakProvider';

const ICON_MAP: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  Droplets,
  Dumbbell,
  Trees,
  Phone,
  Wind,
  PenLine,
};

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'idle';

export default function PanicScreen() {
  const insets = useSafeAreaInsets();
  const { data } = useStreak();
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('idle');
  const [breathCount, setBreathCount] = useState(0);
  const breathAnim = useRef(new Animated.Value(0.4)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const shake = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -0.5, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.delay(3000),
      ])
    );
    shake.start();
    return () => shake.stop();
  }, []);

  const runBreathCycle = useCallback(() => {
    setBreathPhase('inhale');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.timing(breathAnim, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: true,
    }).start(() => {
      setBreathPhase('hold');
      breathTimerRef.current = setTimeout(() => {
        setBreathPhase('exhale');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.timing(breathAnim, {
          toValue: 0.4,
          duration: 8000,
          useNativeDriver: true,
        }).start(() => {
          setBreathCount((prev) => prev + 1);
          runBreathCycle();
        });
      }, 7000);
    });
  }, []);

  const startBreathing = useCallback(() => {
    setBreathingActive(true);
    setBreathCount(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    runBreathCycle();
  }, [runBreathCycle]);

  const stopBreathing = useCallback(() => {
    setBreathingActive(false);
    setBreathPhase('idle');
    if (breathTimerRef.current) {
      clearTimeout(breathTimerRef.current);
    }
    breathAnim.stopAnimation();
    Animated.timing(breathAnim, {
      toValue: 0.4,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const getPhaseText = (): string => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
      default: return 'Ready';
    }
  };

  const getPhaseColor = (): string => {
    switch (breathPhase) {
      case 'inhale': return Colors.success;
      case 'hold': return Colors.gold;
      case 'exhale': return Colors.accent;
      default: return Colors.textSecondary;
    }
  };

  const shakeTranslate = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-2, 2],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0A0A0F', '#130A10', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.alertBadge, { transform: [{ translateX: shakeTranslate }] }]}>
            <ShieldAlert color="#FF3B30" size={32} />
          </Animated.View>
          <Text style={styles.mainWarning}>
            YOU'RE GOING TO REGRET IT
          </Text>
          <Text style={styles.mainWarningSub}>
            LIKE YOU ALWAYS DO.
          </Text>
          <Text style={styles.subtitle}>
            You have {data.currentStreak} days clean. Don't throw it away.
          </Text>
        </Animated.View>

        <View style={styles.effectsSection}>
          <View style={styles.effectsHeader}>
            <AlertTriangle color={Colors.danger} size={16} />
            <Text style={styles.effectsTitle}>If you relapse right now:</Text>
          </View>
          <View style={styles.effectsGrid}>
            {RELAPSE_EFFECTS.map((effect, index) => (
              <View key={index} style={styles.effectChip}>
                <X color={Colors.danger} size={12} />
                <Text style={styles.effectText}>{effect}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.strategiesGrid}>
          {PANIC_STRATEGIES.map((strategy) => {
            const IconComponent = ICON_MAP[strategy.icon];
            return (
              <TouchableOpacity
                key={strategy.id}
                style={styles.strategyCard}
                activeOpacity={0.7}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={styles.strategyIconContainer}>
                  {IconComponent && (
                    <IconComponent color={Colors.purple} size={20} />
                  )}
                </View>
                <View style={styles.strategyContent}>
                  <Text style={styles.strategyTitle}>{strategy.title}</Text>
                  <Text style={styles.strategyDesc}>{strategy.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.breathingSection}>
          <Text style={styles.breathingSectionTitle}>4-7-8 Breathing</Text>
          <View style={styles.breathingCircleContainer}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [{ scale: breathAnim }],
                  borderColor: getPhaseColor(),
                },
              ]}
            >
              <Text style={[styles.phaseText, { color: getPhaseColor() }]}>
                {getPhaseText()}
              </Text>
              {breathingActive && (
                <Text style={styles.breathCountText}>
                  Cycle {breathCount + 1}
                </Text>
              )}
            </Animated.View>
          </View>

          <View style={styles.breathingControls}>
            {!breathingActive ? (
              <TouchableOpacity
                style={styles.breathButton}
                onPress={startBreathing}
                activeOpacity={0.8}
                testID="start-breathing-button"
              >
                <LinearGradient
                  colors={[Colors.purple, Colors.purpleDark]}
                  style={styles.breathButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Play color={Colors.white} size={20} />
                  <Text style={styles.breathButtonText}>Start Breathing</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.breathButton}
                onPress={stopBreathing}
                activeOpacity={0.8}
                testID="stop-breathing-button"
              >
                <View style={styles.stopButtonInner}>
                  <Pause color={Colors.white} size={20} />
                  <Text style={styles.breathButtonText}>Stop</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.emergencyNote}>
          <Text style={styles.emergencyNoteTitle}>Remember:</Text>
          <Text style={styles.emergencyNoteText}>
            Every urge passes within 15-20 minutes.{'\n'}
            You've beaten this before. You are stronger than you think.{'\n'}
            Your future self is counting on you right now.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  alertBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,59,48,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.2)',
  },
  mainWarning: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: '#FF3B30',
    textAlign: 'center',
    letterSpacing: 1,
  },
  mainWarningSub: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: '#FF3B30',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  effectsSection: {
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.12)',
  },
  effectsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  effectsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.danger,
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  effectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  effectText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  strategiesGrid: {
    gap: 10,
    marginBottom: 28,
  },
  strategyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 12,
  },
  strategyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.purpleMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  strategyContent: {
    flex: 1,
  },
  strategyTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  strategyDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  breathingSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  breathingSectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  breathingCircleContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  breathingCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2.5,
    backgroundColor: 'rgba(139,92,246,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  breathCountText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  breathingControls: {
    width: '100%',
  },
  breathButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  breathButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  breathButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  stopButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
  },
  emergencyNote: {
    backgroundColor: 'rgba(139,92,246,0.06)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.12)',
  },
  emergencyNoteTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.purple,
    marginBottom: 8,
  },
  emergencyNoteText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});

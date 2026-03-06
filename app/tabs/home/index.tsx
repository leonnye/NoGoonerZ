import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Flame,
  CheckCircle,
  RotateCcw,
  Zap,
  ShieldAlert,
  HandMetal,
  Brain,
  Sparkles,
  X,
  Target,
  Crown,
  TrendingUp,
  Clock,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useStreak } from '@/providers/StreakProvider';
import { QUOTES, PLEDGE_TEXT } from '@/mocks/quotes';
import { REBOOT_DAYS, RESET_REASONS } from '@/types/streak';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    data,
    hasStarted,
    startStreak,
    resetStreak,
    checkIn,
    pledge,
    hasCheckedInToday,
    rebootProgress,
    daysUntilReboot,
    currentStage,
  } = useStreak();

  const [showResetModal, setShowResetModal] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const orbGlowAnim = useRef(new Animated.Value(0.3)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const panicScaleAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const dailyQuote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }, []);

  const greetingText = useMemo(() => {
    switch (timeOfDay) {
      case 'morning': return 'Good Morning';
      case 'afternoon': return 'Good Afternoon';
      case 'evening': return 'Good Evening';
    }
  }, [timeOfDay]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: rebootProgress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [rebootProgress]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(orbGlowAnim, {
          toValue: 0.7,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(orbGlowAnim, {
          toValue: 0.3,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );
    glow.start();

    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    shimmer.start();

    return () => {
      pulse.stop();
      glow.stop();
      shimmer.stop();
    };
  }, []);

  useEffect(() => {
    const panicPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(panicScaleAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(panicScaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    panicPulse.start();
    return () => panicPulse.stop();
  }, []);

  const handleStartStreak = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    startStreak();
  }, [startStreak]);

  const handleCheckIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    checkIn();
  }, [checkIn]);

  const handlePledge = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pledge();
  }, [pledge]);

  const handleResetPress = useCallback(() => {
    setShowResetModal(true);
  }, []);

  const handleResetWithReason = useCallback((reason: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    resetStreak(reason);
    setShowResetModal(false);
  }, [resetStreak]);

  const rebootProgressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  if (!hasStarted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#0A0A0F', '#0F0A1A', '#0A0A0F']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            styles.onboardingContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.orbOuterGlow}>
              <LinearGradient
                colors={[Colors.purple, Colors.blue, Colors.accent]}
                style={styles.logoBg}
              >
                <Flame color={Colors.white} size={44} />
              </LinearGradient>
            </View>
          </Animated.View>
          <Text style={styles.brandName}>NOGOONERZ</Text>
          <Text style={styles.tagline}>RECLAIM YOUR MIND</Text>
          <Text style={styles.onboardingText}>
            90 days to rewire your brain.{'\n'}
            Your transformation starts now.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartStreak}
            activeOpacity={0.8}
            testID="start-streak-button"
          >
            <LinearGradient
              colors={[Colors.purple, Colors.purpleDark]}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Zap color={Colors.white} size={22} />
              <Text style={styles.startButtonText}>Begin My Reboot</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0A0A0F', '#100A18', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.headerSection, { opacity: fadeAnim }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.appName}>NOGOONERZ</Text>
              <Text style={styles.greetingText}>{greetingText}</Text>
            </View>
            <View style={styles.streakBadge}>
              <Flame color={Colors.accent} size={14} />
              <Text style={styles.streakBadgeText}>{data.currentStreak}d</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.heroCard,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={['rgba(139,92,246,0.12)', 'rgba(59,130,246,0.08)', 'rgba(255,140,0,0.06)']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroTop}>
              <Animated.View style={[styles.orbGlowOuter, { opacity: orbGlowAnim }]}>
                <View style={[styles.orbGlowRing, { borderColor: currentStage.color }]} />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={[styles.orbContainer, { borderColor: currentStage.color }]}>
                  <LinearGradient
                    colors={[currentStage.color, currentStage.glowColor, '#0A0A0F']}
                    style={styles.orbGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                  >
                    <Text style={[styles.orbDays, { color: currentStage.color === '#5C6370' ? Colors.textMuted : Colors.white }]}>
                      {data.currentStreak}
                    </Text>
                    <Text style={styles.orbDaysLabel}>
                      {data.currentStreak === 1 ? 'DAY' : 'DAYS'}
                    </Text>
                  </LinearGradient>
                </View>
              </Animated.View>
              <Text style={[styles.stageName, { color: currentStage.color }]}>
                {currentStage.name}
              </Text>
            </View>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStat}>
                <TrendingUp color={Colors.purple} size={14} />
                <Text style={styles.heroStatValue}>{data.longestStreak}d</Text>
                <Text style={styles.heroStatLabel}>Best</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Target color={Colors.accent} size={14} />
                <Text style={[styles.heroStatValue, { color: Colors.accent }]}>{data.currentStreak}d</Text>
                <Text style={styles.heroStatLabel}>Current</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Clock color={Colors.blue} size={14} />
                <Text style={styles.heroStatValue}>{daysUntilReboot}d</Text>
                <Text style={styles.heroStatLabel}>Til Reboot</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.rebootSection}>
          <View style={styles.rebootHeader}>
            <Brain color={Colors.purple} size={16} />
            <Text style={styles.rebootTitle}>Brain Rewiring</Text>
            <Text style={styles.rebootPercent}>{Math.round(rebootProgress * 100)}%</Text>
          </View>
          <View style={styles.rebootBar}>
            <Animated.View
              style={[styles.rebootFill, { width: rebootProgressWidth }]}
            >
              <LinearGradient
                colors={[Colors.purple, Colors.blue, Colors.accent]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
          <View style={styles.rebootMilestones}>
            <Text style={styles.rebootSubtext}>{REBOOT_DAYS}-day neuroplasticity reboot</Text>
            <View style={styles.rebootDots}>
              {[25, 50, 75, 100].map((pct) => (
                <View
                  key={pct}
                  style={[
                    styles.rebootDot,
                    rebootProgress * 100 >= pct && styles.rebootDotActive,
                  ]}
                >
                  <Text style={[
                    styles.rebootDotText,
                    rebootProgress * 100 >= pct && styles.rebootDotTextActive,
                  ]}>{pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.actionsSectionTitle}>Daily Actions</Text>
          <View style={styles.actionsGrid}>
            {!data.hasPledgedToday ? (
              <TouchableOpacity
                style={styles.actionCard}
                onPress={handlePledge}
                activeOpacity={0.8}
                testID="pledge-button"
              >
                <LinearGradient
                  colors={['rgba(139,92,246,0.15)', 'rgba(139,92,246,0.05)']}
                  style={styles.actionCardGradient}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: Colors.purpleMuted }]}>
                    <HandMetal color={Colors.purple} size={20} />
                  </View>
                  <Text style={styles.actionCardTitle}>Take Pledge</Text>
                  <Text style={styles.actionCardSub}>Commit to today</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionCard}>
                <LinearGradient
                  colors={['rgba(34,197,94,0.12)', 'rgba(34,197,94,0.04)']}
                  style={styles.actionCardGradient}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: Colors.successMuted }]}>
                    <CheckCircle color={Colors.success} size={20} />
                  </View>
                  <Text style={[styles.actionCardTitle, { color: Colors.success }]}>Pledged</Text>
                  <Text style={styles.actionCardSub}>Done for today</Text>
                </LinearGradient>
              </View>
            )}

            {!hasCheckedInToday ? (
              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleCheckIn}
                activeOpacity={0.8}
                testID="check-in-button"
              >
                <LinearGradient
                  colors={['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.05)']}
                  style={styles.actionCardGradient}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: Colors.blueMuted }]}>
                    <CheckCircle color={Colors.blue} size={20} />
                  </View>
                  <Text style={styles.actionCardTitle}>Check In</Text>
                  <Text style={styles.actionCardSub}>Mark your day</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionCard}>
                <LinearGradient
                  colors={['rgba(34,197,94,0.12)', 'rgba(34,197,94,0.04)']}
                  style={styles.actionCardGradient}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: Colors.successMuted }]}>
                    <CheckCircle color={Colors.success} size={20} />
                  </View>
                  <Text style={[styles.actionCardTitle, { color: Colors.success }]}>Checked In</Text>
                  <Text style={styles.actionCardSub}>Done for today</Text>
                </LinearGradient>
              </View>
            )}

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleResetPress}
              activeOpacity={0.7}
              testID="reset-button"
            >
              <LinearGradient
                colors={['rgba(239,68,68,0.12)', 'rgba(239,68,68,0.04)']}
                style={styles.actionCardGradient}
              >
                <View style={[styles.actionIconBg, { backgroundColor: Colors.dangerMuted }]}>
                  <RotateCcw color={Colors.danger} size={20} />
                </View>
                <Text style={styles.actionCardTitle}>Reset</Text>
                <Text style={styles.actionCardSub}>Log relapse</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {data.hasPledgedToday && (
          <View style={styles.pledgeBanner}>
            <View style={styles.pledgeBannerIcon}>
              <Crown color={Colors.purple} size={16} />
            </View>
            <Text style={styles.pledgeBannerText}>"{PLEDGE_TEXT}"</Text>
          </View>
        )}

        {data.resetHistory && data.resetHistory.length > 0 && (
          <View style={styles.resetHistorySection}>
            <Text style={styles.resetHistoryTitle}>Recent Relapses</Text>
            {data.resetHistory.slice(-3).reverse().map((entry, index) => (
              <View key={index} style={styles.resetHistoryCard}>
                <View style={styles.resetHistoryDot} />
                <View style={styles.resetHistoryInfo}>
                  <Text style={styles.resetHistoryDate}>
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.resetHistoryReason}>{entry.reason}</Text>
                </View>
                <Text style={styles.resetHistoryStreak}>{entry.streakLost}d lost</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.quoteCard}>
          <LinearGradient
            colors={['rgba(139,92,246,0.08)', 'rgba(59,130,246,0.04)']}
            style={styles.quoteGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Sparkles color={Colors.purpleLight} size={16} />
            <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
          </LinearGradient>
        </View>

        <Animated.View style={{ transform: [{ scale: panicScaleAnim }] }}>
          <TouchableOpacity
            style={styles.panicButton}
            onPress={() => router.push('/tabs/panic')}
            activeOpacity={0.85}
            testID="panic-button"
          >
            <LinearGradient
              colors={['#DC2626', '#B91C1C']}
              style={styles.panicGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ShieldAlert color={Colors.white} size={24} />
              <Text style={styles.panicText}>PANIC BUTTON</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>What happened?</Text>
              <TouchableOpacity
                onPress={() => setShowResetModal(false)}
                style={styles.modalClose}
              >
                <X color={Colors.textMuted} size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              It's okay to fall. Understanding why helps you grow stronger.
            </Text>
            <View style={styles.reasonGrid}>
              {RESET_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={styles.reasonButton}
                  onPress={() => handleResetWithReason(reason)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reasonButtonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
  onboardingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 28,
  },
  orbOuterGlow: {
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  logoBg: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.text,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 13,
    color: Colors.purple,
    fontWeight: '700' as const,
    marginTop: 8,
    letterSpacing: 3,
  },
  onboardingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 24,
  },
  startButton: {
    marginTop: 40,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 1,
  },
  headerSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 3,
  },
  greetingText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '500' as const,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,140,0,0.2)',
  },
  streakBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  heroTop: {
    alignItems: 'center',
    marginBottom: 20,
  },
  orbGlowOuter: {
    position: 'absolute',
    top: -10,
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbGlowRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    opacity: 0.4,
  },
  orbContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  orbGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbDays: {
    fontSize: 48,
    fontWeight: '900' as const,
    lineHeight: 52,
  },
  orbDaysLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    letterSpacing: 4,
    marginTop: 2,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '800' as const,
    letterSpacing: 2,
    marginTop: 14,
    textTransform: 'uppercase' as const,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    paddingVertical: 14,
  },
  heroStat: {
    alignItems: 'center',
    gap: 4,
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  heroStatLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.surfaceBorder,
  },
  rebootSection: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  rebootHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  rebootTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  rebootPercent: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.purple,
  },
  rebootBar: {
    height: 10,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 5,
    overflow: 'hidden',
  },
  rebootFill: {
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  rebootMilestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  rebootSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  rebootDots: {
    flexDirection: 'row',
    gap: 8,
  },
  rebootDot: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: Colors.surfaceLight,
  },
  rebootDotActive: {
    backgroundColor: Colors.purpleMuted,
  },
  rebootDotText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  rebootDotTextActive: {
    color: Colors.purple,
  },
  actionsSection: {
    marginBottom: 16,
  },
  actionsSectionTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  actionCardGradient: {
    padding: 14,
    alignItems: 'center',
    gap: 8,
    minHeight: 110,
    justifyContent: 'center',
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  actionCardSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  pledgeBanner: {
    backgroundColor: Colors.purpleMuted,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.purple,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pledgeBannerIcon: {
    marginTop: 2,
  },
  pledgeBannerText: {
    fontSize: 13,
    color: Colors.purpleLight,
    fontStyle: 'italic',
    lineHeight: 20,
    flex: 1,
  },
  resetHistorySection: {
    marginBottom: 16,
  },
  resetHistoryTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  resetHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 10,
  },
  resetHistoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  resetHistoryInfo: {
    flex: 1,
  },
  resetHistoryDate: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  resetHistoryReason: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 1,
  },
  resetHistoryStreak: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.danger,
  },
  quoteCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  quoteGradient: {
    padding: 18,
    gap: 10,
  },
  quoteText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  quoteAuthor: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  panicButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  panicGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  panicText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 18,
    lineHeight: 20,
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reasonButton: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  reasonButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});

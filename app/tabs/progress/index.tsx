import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Star,
  Flame,
  Award,
  Crown,
  Shield,
  Zap,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useStreak } from '@/providers/StreakProvider';
import { MILESTONES, REBOOT_DAYS } from '@/types/streak';

const MILESTONE_DETAILS: Record<number, { label: string; icon: React.ComponentType<{ color: string; size: number }> }> = {
  1: { label: 'First Step', icon: Zap },
  3: { label: '3 Day Warrior', icon: Flame },
  7: { label: 'One Week Strong', icon: Shield },
  14: { label: 'Two Week Champion', icon: Star },
  21: { label: 'Habit Breaker', icon: Target },
  30: { label: 'Monthly Master', icon: Award },
  60: { label: 'Iron Will', icon: TrendingUp },
  90: { label: 'Reborn', icon: Crown },
  180: { label: 'Half Year Legend', icon: Trophy },
  365: { label: 'One Year King', icon: Crown },
};

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { data, rebootProgress, currentStage } = useStreak();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.timing(ringAnim, {
      toValue: rebootProgress,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [rebootProgress]);

  const weeklyData = useMemo(() => {
    const today = new Date();
    const days: { label: string; checked: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      days.push({
        label: dayLabels[date.getDay()],
        checked: data.dailyCheckIns.includes(dateStr),
      });
    }
    return days;
  }, [data.dailyCheckIns]);

  const moodAverage = useMemo(() => {
    if (data.moodLog.length === 0) return null;
    const last7 = data.moodLog.slice(-7);
    const avg = last7.reduce((sum, m) => sum + m.mood, 0) / last7.length;
    return avg.toFixed(1);
  }, [data.moodLog]);

  const ringRotation = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>Your journey visualized</Text>
        </Animated.View>

        <View style={styles.ringSection}>
          <View style={styles.ringContainer}>
            <View style={styles.ringOuter}>
              <Animated.View
                style={[
                  styles.ringProgress,
                  {
                    borderColor: currentStage.color,
                    transform: [{ rotate: ringRotation }],
                  },
                ]}
              />
              <View style={styles.ringInner}>
                <Text style={styles.ringNumber}>{data.currentStreak}</Text>
                <Text style={styles.ringLabel}>DAYS CLEAN</Text>
              </View>
            </View>
          </View>
          <View style={styles.ringStats}>
            <View style={styles.ringStat}>
              <Text style={[styles.ringStatValue, { color: currentStage.color }]}>
                {currentStage.name}
              </Text>
              <Text style={styles.ringStatLabel}>Stage</Text>
            </View>
            <View style={styles.ringStatDivider} />
            <View style={styles.ringStat}>
              <Text style={styles.ringStatValue}>
                {Math.round(rebootProgress * 100)}%
              </Text>
              <Text style={styles.ringStatLabel}>Reboot</Text>
            </View>
          </View>
        </View>

        <View style={styles.overviewCards}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconBg, { backgroundColor: Colors.accentMuted }]}>
                <Flame color={Colors.accent} size={18} />
              </View>
              <Text style={styles.overviewNumber}>{data.longestStreak}</Text>
              <Text style={styles.overviewLabel}>Best Streak</Text>
            </View>
            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconBg, { backgroundColor: Colors.successMuted }]}>
                <Calendar color={Colors.success} size={18} />
              </View>
              <Text style={styles.overviewNumber}>{data.dailyCheckIns.length}</Text>
              <Text style={styles.overviewLabel}>Check-ins</Text>
            </View>
            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconBg, { backgroundColor: Colors.goldMuted }]}>
                <Trophy color={Colors.gold} size={18} />
              </View>
              <Text style={styles.overviewNumber}>{data.milestones.length}</Text>
              <Text style={styles.overviewLabel}>Milestones</Text>
            </View>
          </View>
          {moodAverage !== null && (
            <View style={styles.moodAvgCard}>
              <Text style={styles.moodAvgLabel}>7-Day Mood Avg</Text>
              <Text style={styles.moodAvgValue}>{moodAverage} / 5</Text>
            </View>
          )}
        </View>

        <View style={styles.weekSection}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weekGrid}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View
                  style={[
                    styles.dayDot,
                    day.checked && styles.dayDotActive,
                  ]}
                >
                  {day.checked && <Flame color={Colors.white} size={12} />}
                </View>
                <Text
                  style={[
                    styles.dayLabel,
                    day.checked && styles.dayLabelActive,
                  ]}
                >
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.milestonesSection}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          {MILESTONES.map((milestone) => {
            const achieved = data.milestones.includes(milestone);
            const details = MILESTONE_DETAILS[milestone];
            const IconComponent = details?.icon ?? Star;
            const progress = Math.min(data.currentStreak / milestone, 1);

            return (
              <View
                key={milestone}
                style={[
                  styles.milestoneCard,
                  achieved && styles.milestoneCardAchieved,
                ]}
              >
                <View
                  style={[
                    styles.milestoneIcon,
                    achieved && styles.milestoneIconAchieved,
                  ]}
                >
                  <IconComponent
                    color={achieved ? Colors.purple : Colors.textMuted}
                    size={18}
                  />
                </View>
                <View style={styles.milestoneInfo}>
                  <Text
                    style={[
                      styles.milestoneName,
                      achieved && styles.milestoneNameAchieved,
                    ]}
                  >
                    {details?.label ?? `${milestone} Days`}
                  </Text>
                  <View style={styles.milestoneProgressBar}>
                    <View
                      style={[
                        styles.milestoneProgressFill,
                        {
                          width: `${Math.round(progress * 100)}%`,
                          backgroundColor: achieved
                            ? Colors.purple
                            : Colors.surfaceBorder,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text
                  style={[
                    styles.milestoneDays,
                    achieved && styles.milestoneDaysAchieved,
                  ]}
                >
                  {achieved ? '✓' : `${milestone}d`}
                </Text>
              </View>
            );
          })}
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
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  ringSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ringContainer: {
    marginBottom: 16,
  },
  ringOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: Colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringProgress: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ringInner: {
    alignItems: 'center',
  },
  ringNumber: {
    fontSize: 48,
    fontWeight: '900' as const,
    color: Colors.text,
    lineHeight: 52,
  },
  ringLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginTop: 2,
  },
  ringStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  ringStat: {
    alignItems: 'center',
  },
  ringStatValue: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  ringStatLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  ringStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.surfaceBorder,
  },
  overviewCards: {
    gap: 10,
    marginBottom: 24,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: 10,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  overviewIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  overviewLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moodAvgCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  moodAvgLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  moodAvgValue: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.purple,
  },
  weekSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayDotActive: {
    backgroundColor: Colors.purple,
  },
  dayLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  dayLabelActive: {
    color: Colors.purple,
  },
  milestonesSection: {
    gap: 8,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 12,
  },
  milestoneCardAchieved: {
    borderColor: 'rgba(139,92,246,0.25)',
  },
  milestoneIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneIconAchieved: {
    backgroundColor: Colors.purpleMuted,
  },
  milestoneInfo: {
    flex: 1,
    gap: 5,
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  milestoneNameAchieved: {
    color: Colors.text,
  },
  milestoneProgressBar: {
    height: 3,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  milestoneProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  milestoneDays: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  milestoneDaysAchieved: {
    color: Colors.purple,
    fontSize: 16,
  },
});

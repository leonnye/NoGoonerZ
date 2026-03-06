import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Flame,
  Shield,
  Brain,
  Users,
  Zap,
  Check,
  Crown,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

const FEATURES = [
  { icon: Flame, text: 'Unlimited streak tracking' },
  { icon: Shield, text: 'Panic button & breathing exercises' },
  { icon: Brain, text: 'AI-powered coaching insights' },
  { icon: Users, text: 'Brotherhood community access' },
  { icon: Zap, text: 'Progress analytics & milestones' },
  { icon: Crown, text: 'Library of recovery resources' },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activateSubscription, auth } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (auth.hasSubscription) {
      router.replace('/');
    }
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.8, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, []);

  const handleStartTrial = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    activateSubscription();
    router.replace('/');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    activateSubscription();
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0A0A0F', '#100A18', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <X color={Colors.textMuted} size={22} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Animated.View style={[styles.crownGlow, { opacity: glowAnim }]}>
            <LinearGradient
              colors={[Colors.purple, Colors.blue]}
              style={styles.crownBg}
            >
              <Crown color={Colors.white} size={40} />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.heroTitle}>UNLOCK YOUR{'\n'}FULL POTENTIAL</Text>
          <Text style={styles.heroSubtitle}>
            Get access to every tool built to help you break free
          </Text>
        </Animated.View>

        <View style={styles.featuresSection}>
          {FEATURES.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <Animated.View
                key={index}
                style={[styles.featureRow, { opacity: fadeAnim }]}
              >
                <View style={styles.featureIconBg}>
                  <FeatureIcon color={Colors.purple} size={18} />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
                <Check color={Colors.gold} size={16} />
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.pricingSection}>
          <View style={styles.trialBadge}>
            <Text style={styles.trialBadgeText}>3 DAYS FREE</Text>
          </View>

          <View style={styles.priceCard}>
            <LinearGradient
              colors={['rgba(139,92,246,0.08)', 'rgba(59,130,246,0.04)']}
              style={styles.priceCardGradient}
            >
              <Text style={styles.planName}>NoGoonerz Pro</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>$4.99</Text>
                <Text style={styles.pricePeriod}>/week</Text>
              </View>
              <Text style={styles.priceNote}>After 3-day free trial</Text>
              <View style={styles.priceDivider} />
              <View style={styles.priceDetail}>
                <Check color={Colors.success} size={14} />
                <Text style={styles.priceDetailText}>Cancel anytime during trial</Text>
              </View>
              <View style={styles.priceDetail}>
                <Check color={Colors.success} size={14} />
                <Text style={styles.priceDetailText}>No charge for 3 days</Text>
              </View>
              <View style={styles.priceDetail}>
                <Check color={Colors.success} size={14} />
                <Text style={styles.priceDetailText}>Full access to all features</Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStartTrial}
          activeOpacity={0.85}
          testID="start-trial-button"
        >
          <LinearGradient
            colors={[Colors.purple, Colors.purpleDark]}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Zap color={Colors.white} size={20} />
            <Text style={styles.ctaText}>START FREE TRIAL</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.legalText}>
          3-day free trial, then $4.99/week. Cancel anytime.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 10,
  },
  crownGlow: {
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 20,
    marginBottom: 24,
  },
  crownBg: {
    width: 88,
    height: 88,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  featuresSection: {
    gap: 10,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  featureIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.purpleMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  pricingSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  trialBadge: {
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  trialBadgeText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.gold,
    letterSpacing: 2,
  },
  priceCard: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(139,92,246,0.25)',
  },
  priceCardGradient: {
    padding: 22,
    alignItems: 'center',
  },
  planName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.purple,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 38,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  pricePeriod: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '600' as const,
    marginLeft: 4,
  },
  priceNote: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 14,
  },
  priceDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginBottom: 14,
  },
  priceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  priceDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    backgroundColor: Colors.background,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 2,
  },
  legalText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
  },
});

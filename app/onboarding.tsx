import React, { useState, useRef, useEffect } from 'react';
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
import { ChevronRight, ChevronLeft, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { OnboardingAnswers } from '@/types/streak';

const AGE_OPTIONS = ['13-17', '18-24', '25-34', '35-44', '45+'];
const DURATION_OPTIONS = ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'];
const MOTIVATION_OPTIONS = [
  'Mental clarity & focus',
  'Better relationships',
  'Self-discipline',
  'Spiritual growth',
  'Physical health',
  'Break free from shame',
];
const TRIGGER_OPTIONS = [
  'Boredom',
  'Stress',
  'Loneliness',
  'Late Night',
  'Social Media',
  'Anxiety',
  'Depression',
  'Peer Pressure',
];

interface QuestionProps {
  title: string;
  subtitle: string;
  options: string[];
  selected: string | string[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
}

function QuestionCard({ title, subtitle, options, selected, onSelect, multiSelect }: QuestionProps) {
  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionTitle}>{title}</Text>
      <Text style={styles.questionSubtitle}>{subtitle}</Text>
      <View style={styles.optionsGrid}>
        {options.map((option) => {
          const isSelected = multiSelect
            ? (selected as string[]).includes(option)
            : selected === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(option);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding, auth } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    age: '',
    duration: '',
    motivation: '',
    triggers: [],
  });
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (auth.hasCompletedOnboarding) {
      router.replace('/(tabs)');
    }
  }, []);

  const animateTransition = (direction: 'forward' | 'back') => {
    const startX = direction === 'forward' ? 50 : -50;
    fadeAnim.setValue(0);
    slideAnim.setValue(startX);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleNext = () => {
    if (step < 3) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(step + 1);
      animateTransition('forward');
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      completeOnboarding(answers);
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      animateTransition('back');
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return answers.age !== '';
      case 1: return answers.duration !== '';
      case 2: return answers.motivation !== '';
      case 3: return answers.triggers.length > 0;
      default: return false;
    }
  };

  const handleSelectAge = (value: string) => {
    setAnswers({ ...answers, age: value });
  };

  const handleSelectDuration = (value: string) => {
    setAnswers({ ...answers, duration: value });
  };

  const handleSelectMotivation = (value: string) => {
    setAnswers({ ...answers, motivation: value });
  };

  const handleSelectTrigger = (value: string) => {
    const current = answers.triggers;
    if (current.includes(value)) {
      setAnswers({ ...answers, triggers: current.filter(t => t !== value) });
    } else {
      setAnswers({ ...answers, triggers: [...current, value] });
    }
  };

  const TOTAL_STEPS = 4;
  const progress = (step + 1) / TOTAL_STEPS;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0A0A0F', '#100A18', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topBar}>
        {step > 0 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft color={Colors.textSecondary} size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[Colors.purple, Colors.blue]}
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>
        <Text style={styles.stepText}>{step + 1}/{TOTAL_STEPS}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          {step === 0 && (
            <QuestionCard
              title="How old are you?"
              subtitle="This helps us personalize your experience"
              options={AGE_OPTIONS}
              selected={answers.age}
              onSelect={handleSelectAge}
            />
          )}
          {step === 1 && (
            <QuestionCard
              title="How long have you struggled?"
              subtitle="No judgment. Just understanding where you are"
              options={DURATION_OPTIONS}
              selected={answers.duration}
              onSelect={handleSelectDuration}
            />
          )}
          {step === 2 && (
            <QuestionCard
              title="What motivates your change?"
              subtitle="Pick the one that drives you most"
              options={MOTIVATION_OPTIONS}
              selected={answers.motivation}
              onSelect={handleSelectMotivation}
            />
          )}
          {step === 3 && (
            <QuestionCard
              title="What triggers you?"
              subtitle="Select all that apply - we'll help you fight them"
              options={TRIGGER_OPTIONS}
              selected={answers.triggers}
              onSelect={handleSelectTrigger}
              multiSelect
            />
          )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={handleNext}
          activeOpacity={0.8}
          disabled={!canProceed()}
          testID="onboarding-next"
        >
          <LinearGradient
            colors={canProceed() ? [Colors.purple, Colors.purpleDark] : ['#252836', '#252836']}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.nextButtonText, !canProceed() && styles.nextButtonTextDisabled]}>
              {step === 3 ? 'FINISH' : 'CONTINUE'}
            </Text>
            {step < 3 && (
              <ChevronRight color={canProceed() ? Colors.white : Colors.textMuted} size={20} />
            )}
            {step === 3 && (
              <Flame color={canProceed() ? Colors.white : Colors.textMuted} size={20} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600' as const,
    minWidth: 30,
    textAlign: 'right',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  questionCard: {
    gap: 8,
  },
  questionTitle: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: Colors.text,
    lineHeight: 32,
  },
  questionSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  optionsGrid: {
    gap: 10,
  },
  optionButton: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
  },
  optionButtonSelected: {
    borderColor: Colors.purple,
    backgroundColor: Colors.purpleMuted,
  },
  optionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  optionTextSelected: {
    color: Colors.purple,
    fontWeight: '700' as const,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  nextButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 2,
  },
  nextButtonTextDisabled: {
    color: Colors.textMuted,
  },
});

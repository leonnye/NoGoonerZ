import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  ChevronRight,
  Trash2,
  Bell,
  Info,
  Heart,
  Flame,
  Sparkles,
  BookOpen,
  Headphones,
  SmilePlus,
  LogOut,
  Lightbulb,
  Clock,
  Leaf,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { useStreak } from '@/providers/StreakProvider';
import { useAuth } from '@/providers/AuthProvider';
import { SOUNDSCAPES } from '@/mocks/quotes';

const USERNAME_KEY = 'nogoonerz_username';
const REASON_KEY = 'nogoonerz_reason';

const MOOD_EMOJIS = [
  { value: 1, emoji: '😞', label: 'Rough' },
  { value: 2, emoji: '😐', label: 'Low' },
  { value: 3, emoji: '🙂', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🔥', label: 'Great' },
];

const LESSONS = [
  { id: '1', title: 'What Happens to Your Brain', subtitle: 'The dopamine cycle explained', icon: Lightbulb, color: '#FFAB40' },
  { id: '2', title: 'The 90-Day Reboot', subtitle: 'Why 90 days matters for recovery', icon: Clock, color: '#3B82F6' },
  { id: '3', title: 'Building New Habits', subtitle: 'Replace, don\'t just remove', icon: Leaf, color: '#22C55E' },
  { id: '4', title: 'Self-Compassion', subtitle: 'Dealing with shame & guilt', icon: Heart, color: '#EC4899' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, resetStreak, currentStage, logMood } = useStreak();
  const { auth, logout } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [username, setUsername] = useState(auth.username || 'Warrior');
  const [reason, setReason] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [editingReason, setEditingReason] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showMoodDone, setShowMoodDone] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const todayMood = data.moodLog.find(
    m => m.date === new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (todayMood) {
      setSelectedMood(todayMood.mood);
      setShowMoodDone(true);
    }
  }, [todayMood]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const loadProfile = async () => {
      try {
        const storedName = await AsyncStorage.getItem(USERNAME_KEY);
        const storedReason = await AsyncStorage.getItem(REASON_KEY);
        if (storedName) setUsername(storedName);
        if (storedReason) setReason(storedReason);
      } catch (e) {
        console.log('Error loading profile:', e);
      }
    };
    loadProfile();
  }, []);

  const saveName = useCallback(async () => {
    setEditingName(false);
    try {
      await AsyncStorage.setItem(USERNAME_KEY, username);
    } catch (e) {
      console.log('Error saving name:', e);
    }
  }, [username]);

  const saveReason = useCallback(async () => {
    setEditingReason(false);
    try {
      await AsyncStorage.setItem(REASON_KEY, reason);
    } catch (e) {
      console.log('Error saving reason:', e);
    }
  }, [reason]);

  const handleMoodSelect = useCallback((mood: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMood(mood);
    logMood(mood);
    setShowMoodDone(true);
  }, [logMood]);

  const handleDeleteData = useCallback(() => {
    Alert.alert(
      'Delete All Data',
      'This will permanently remove all your streak data, check-ins, and milestones. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            try {
              await AsyncStorage.clear();
              resetStreak('Data reset');
            } catch (e) {
              console.log('Error deleting data:', e);
            }
          },
        },
      ]
    );
  }, [resetStreak]);

  const handleLogout = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace('/');
  }, [logout, router]);

  const joinDate = data.startDate
    ? new Date(data.startDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not started yet';

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
        <Animated.View style={[styles.profileHeader, { opacity: fadeAnim }]}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[currentStage.color, currentStage.glowColor]}
              style={styles.avatarGradient}
            >
              <User color={Colors.white} size={30} />
            </LinearGradient>
            <View style={[styles.stageBadge, { backgroundColor: currentStage.color + '30' }]}>
              <Sparkles color={currentStage.color} size={10} />
              <Text style={[styles.stageBadgeText, { color: currentStage.color }]}>
                {currentStage.name}
              </Text>
            </View>
          </View>
          {editingName ? (
            <TextInput
              style={styles.nameInput}
              value={username}
              onChangeText={setUsername}
              onBlur={saveName}
              onSubmitEditing={saveName}
              autoFocus
              maxLength={20}
              placeholderTextColor={Colors.textMuted}
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)}>
              <Text style={styles.profileName}>{username}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.joinDate}>Joined {joinDate}</Text>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Flame color={Colors.accent} size={16} />
              <Text style={styles.profileStatNumber}>{data.currentStreak}</Text>
              <Text style={styles.profileStatLabel}>Days</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Sparkles color={Colors.gold} size={16} />
              <Text style={styles.profileStatNumber}>{data.milestones.length}</Text>
              <Text style={styles.profileStatLabel}>Milestones</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Heart color={Colors.danger} size={16} />
              <Text style={styles.profileStatNumber}>{data.dailyCheckIns.length}</Text>
              <Text style={styles.profileStatLabel}>Check-ins</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Why</Text>
          {editingReason ? (
            <TextInput
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              onBlur={saveReason}
              placeholder="Why are you doing this?"
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={200}
              autoFocus
            />
          ) : (
            <TouchableOpacity
              style={styles.reasonCard}
              onPress={() => setEditingReason(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.reasonText}>
                {reason || 'Tap to write your reason for staying clean...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.librarySectionHeader}
            onPress={() => setShowLibrary(!showLibrary)}
            activeOpacity={0.7}
          >
            <View style={styles.librarySectionLeft}>
              <BookOpen color={Colors.purple} size={18} />
              <Text style={styles.sectionTitle}>Library</Text>
            </View>
            <ChevronRight
              color={Colors.textMuted}
              size={18}
              style={{ transform: [{ rotate: showLibrary ? '90deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {showLibrary && (
            <View style={styles.libraryContent}>
              <View style={styles.moodSection}>
                <View style={styles.subSectionHeader}>
                  <SmilePlus color={Colors.gold} size={16} />
                  <Text style={styles.subSectionTitle}>How are you feeling?</Text>
                </View>
                {showMoodDone ? (
                  <View style={styles.moodDoneCard}>
                    <Text style={styles.moodDoneEmoji}>
                      {MOOD_EMOJIS.find(m => m.value === selectedMood)?.emoji ?? '🙂'}
                    </Text>
                    <Text style={styles.moodDoneText}>
                      Mood logged: {MOOD_EMOJIS.find(m => m.value === selectedMood)?.label ?? 'Okay'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.moodRow}>
                    {MOOD_EMOJIS.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.moodOption,
                          selectedMood === item.value && styles.moodOptionSelected,
                        ]}
                        onPress={() => handleMoodSelect(item.value)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.moodEmoji}>{item.emoji}</Text>
                        <Text style={styles.moodLabel}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.soundSection}>
                <View style={styles.subSectionHeader}>
                  <Headphones color={Colors.gold} size={16} />
                  <Text style={styles.subSectionTitle}>Soundscapes</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.soundRow}
                >
                  {SOUNDSCAPES.map((sound) => (
                    <TouchableOpacity
                      key={sound.id}
                      style={styles.soundCard}
                      activeOpacity={0.8}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <LinearGradient
                        colors={[sound.color + '30', sound.color + '08']}
                        style={styles.soundGradient}
                      >
                        <Text style={styles.soundEmoji}>{sound.emoji}</Text>
                        <Text style={styles.soundTitle}>{sound.title}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.lessonsSection}>
                <View style={styles.subSectionHeader}>
                  <BookOpen color={Colors.gold} size={16} />
                  <Text style={styles.subSectionTitle}>Learn</Text>
                </View>
                {LESSONS.map((lesson) => {
                  const LessonIcon = lesson.icon;
                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={styles.lessonCard}
                      activeOpacity={0.7}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <View style={[styles.lessonIcon, { backgroundColor: lesson.color + '20' }]}>
                        <LessonIcon color={lesson.color} size={18} />
                      </View>
                      <View style={styles.lessonContent}>
                        <Text style={styles.lessonTitle}>{lesson.title}</Text>
                        <Text style={styles.lessonSubtitle}>{lesson.subtitle}</Text>
                      </View>
                      <ChevronRight color={Colors.textMuted} size={16} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.purpleMuted }]}>
                  <Bell color={Colors.purple} size={16} />
                </View>
                <Text style={styles.settingLabel}>Reminders</Text>
              </View>
              <ChevronRight color={Colors.textMuted} size={16} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.successMuted }]}>
                  <Info color={Colors.success} size={16} />
                </View>
                <Text style={styles.settingLabel}>About NoGoonerz</Text>
              </View>
              <ChevronRight color={Colors.textMuted} size={16} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut color={Colors.gold} size={16} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteData}
            activeOpacity={0.7}
            testID="delete-data-button"
          >
            <Trash2 color={Colors.danger} size={16} />
            <Text style={styles.deleteButtonText}>Delete All Data</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>NoGoonerz v2.0</Text>
        <Text style={styles.motto}>Reclaim Your Mind</Text>
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
  profileHeader: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  avatarContainer: {
    marginBottom: 14,
    alignItems: 'center',
  },
  avatarGradient: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    marginTop: -12,
  },
  stageBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 4,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    borderBottomWidth: 2,
    borderBottomColor: Colors.purple,
    paddingVertical: 4,
    textAlign: 'center',
    minWidth: 120,
    marginTop: 4,
  },
  joinDate: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  profileStat: {
    alignItems: 'center',
    gap: 5,
  },
  profileStatNumber: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  profileStatLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.surfaceBorder,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  librarySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  librarySectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  libraryContent: {
    gap: 20,
  },
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  moodSection: {},
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  moodOption: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    flex: 1,
  },
  moodOptionSelected: {
    backgroundColor: Colors.purpleMuted,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 3,
    fontWeight: '600' as const,
  },
  moodDoneCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 6,
  },
  moodDoneEmoji: {
    fontSize: 30,
  },
  moodDoneText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  soundSection: {},
  soundRow: {
    gap: 10,
    paddingRight: 20,
  },
  soundCard: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
  },
  soundGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    gap: 6,
  },
  soundEmoji: {
    fontSize: 28,
  },
  soundTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  lessonsSection: {
    gap: 8,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 12,
  },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  lessonSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  reasonCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderLeftWidth: 3,
    borderLeftColor: Colors.purple,
  },
  reasonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  reasonInput: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.purple,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  settingsGroup: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginLeft: 60,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,171,64,0.15)',
    marginBottom: 10,
  },
  logoutButtonText: {
    fontSize: 14,
    color: Colors.gold,
    fontWeight: '600' as const,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dangerMuted,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
  },
  deleteButtonText: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: '600' as const,
  },
  version: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  motto: {
    fontSize: 12,
    color: Colors.purple,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
});

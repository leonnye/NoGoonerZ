import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  Send,
  Heart,
  Flame,
  MessageCircle,
  Trophy,
  Crown,
  Medal,
  TrendingUp,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useCommunity } from '@/providers/CommunityProvider';
import { useStreak } from '@/providers/StreakProvider';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

interface LeaderboardUser {
  id: string;
  username: string;
  level: number;
  streak: number;
  avatar: string;
}

const FALLBACK_LEADERBOARD: LeaderboardUser[] = [
  { id: '1', username: 'PhoenixRising', level: 47, streak: 365, avatar: 'P' },
  { id: '2', username: 'IronWill', level: 42, streak: 312, avatar: 'I' },
  { id: '3', username: 'DisciplinedOne', level: 38, streak: 280, avatar: 'D' },
  { id: '4', username: 'WarriorKing', level: 35, streak: 245, avatar: 'W' },
  { id: '5', username: 'MindMaster', level: 31, streak: 198, avatar: 'M' },
  { id: '6', username: 'StrongSoul', level: 28, streak: 156, avatar: 'S' },
  { id: '7', username: 'FocusBeast', level: 25, streak: 134, avatar: 'F' },
  { id: '8', username: 'CleanBreaker', level: 22, streak: 98, avatar: 'C' },
];

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown color={Colors.gold} size={20} />;
    case 2:
      return <Medal color={Colors.blue} size={20} />;
    case 3:
      return <Medal color={Colors.orange} size={20} />;
    default:
      return <Text style={styles.rankNumber}>#{rank}</Text>;
  }
}

function getLevelColor(level: number) {
  if (level >= 40) return Colors.gold;
  if (level >= 30) return Colors.purple;
  if (level >= 20) return Colors.blue;
  return Colors.orange;
}

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function BrotherhoodScreen() {
  const insets = useSafeAreaInsets();
  const { posts, addPost, toggleLike } = useCommunity();
  const { data } = useStreak();
  const { auth } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [newPost, setNewPost] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    let active = true;

    const loadLeaderboard = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, longest_streak')
        .order('longest_streak', { ascending: false })
        .limit(50);

      if (!active) return;

      if (error) {
        console.log('Error loading leaderboard:', error.message);
        return;
      }

      if (data) {
        const mapped: LeaderboardUser[] = data.map((row: any) => ({
          id: row.id,
          username: row.username ?? 'NGZ Warrior',
          streak: row.longest_streak ?? 0,
          level: Math.max(1, Math.floor((row.longest_streak ?? 0) / 7)),
          avatar: (row.username ?? 'N').charAt(0).toUpperCase(),
        }));
        setLeaders(mapped);
      }
    };

    loadLeaderboard();

    const channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        () => {
          loadLeaderboard();
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePost = useCallback(() => {
    if (!newPost.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addPost(auth.username || 'Anonymous', newPost.trim(), data.currentStreak);
    setNewPost('');
    setShowCompose(false);
  }, [newPost, auth.username, data.currentStreak, addPost]);

  const handleLike = useCallback((postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike(postId);
  }, [toggleLike]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0A0A0F', '#100A18', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerLeft}>
            <Users color={Colors.purple} size={22} />
            <Text style={styles.title}>Brotherhood</Text>
          </View>
          <View style={styles.memberBadge}>
            <Text style={styles.memberCount}>{posts.length} posts</Text>
          </View>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Leaderboard Section */}
          <View style={styles.leaderboardCard}>
            <LinearGradient
              colors={['rgba(139,92,246,0.15)', 'rgba(10,10,15,0.95)']}
              style={styles.leaderboardGradient}
            >
              <View style={styles.leaderboardHeader}>
                <View style={styles.leaderboardTitleRow}>
                  <Trophy color={Colors.gold} size={20} />
                  <Text style={styles.leaderboardTitle}>Leaderboard</Text>
                </View>
                <View style={styles.leaderboardBadge}>
                  <TrendingUp color={Colors.orange} size={12} />
                  <Text style={styles.leaderboardBadgeText}>Live</Text>
                </View>
              </View>
              
              <View style={styles.leaderboardList}>
                {(leaders.length ? leaders : FALLBACK_LEADERBOARD).map((user, index) => (
                  <View key={user.id} style={styles.leaderboardItem}>
                    <View style={styles.rankContainer}>
                      {getRankIcon(index + 1)}
                    </View>
                    <View style={[styles.leaderboardAvatar, index < 3 && styles.topThreeAvatar]}>
                      <Text style={[styles.leaderboardAvatarText, { color: getLevelColor(user.level) }]}>
                        {user.avatar}
                      </Text>
                    </View>
                    <View style={styles.leaderboardInfo}>
                      <Text style={styles.leaderboardUsername}>{user.username}</Text>
                      <View style={styles.leaderboardMeta}>
                        <Flame color={Colors.orange} size={11} />
                        <Text style={styles.leaderboardStreak}>{user.streak}d</Text>
                      </View>
                    </View>
                    <View style={[styles.levelBadge, { borderColor: getLevelColor(user.level) }]}>
                      <Text style={[styles.levelText, { color: getLevelColor(user.level) }]}>
                        LVL {user.level}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>

          <View style={styles.bannerCard}>
            <LinearGradient
              colors={['rgba(139,92,246,0.12)', 'rgba(59,130,246,0.06)']}
              style={styles.bannerGradient}
            >
              <Text style={styles.bannerTitle}>You're not alone in this</Text>
              <Text style={styles.bannerSubtitle}>
                Share your journey. Encourage your brothers. Rise together.
              </Text>
            </LinearGradient>
          </View>

          {showCompose && (
            <View style={styles.composeCard}>
              <TextInput
                style={styles.composeInput}
                placeholder="Share something with the brotherhood..."
                placeholderTextColor={Colors.textMuted}
                value={newPost}
                onChangeText={setNewPost}
                multiline
                maxLength={300}
                autoFocus
                testID="compose-input"
              />
              <View style={styles.composeFooter}>
                <Text style={styles.charCount}>{newPost.length}/300</Text>
                <View style={styles.composeActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => { setShowCompose(false); setNewPost(''); }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sendButton, !newPost.trim() && styles.sendButtonDisabled]}
                    onPress={handlePost}
                    disabled={!newPost.trim()}
                    activeOpacity={0.8}
                    testID="send-post"
                  >
                    <LinearGradient
                      colors={newPost.trim() ? [Colors.purple, Colors.purpleDark] : ['#252836', '#252836']}
                      style={styles.sendGradient}
                    >
                      <Send color={newPost.trim() ? Colors.white : Colors.textMuted} size={16} />
                      <Text style={[styles.sendText, !newPost.trim() && styles.sendTextDisabled]}>Post</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarText}>
                    {post.author.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.postMeta}>
                  <Text style={styles.postAuthor}>{post.author}</Text>
                  <View style={styles.postMetaRow}>
                    <Flame color={Colors.gold} size={11} />
                    <Text style={styles.postStreak}>{post.streak}d streak</Text>
                    <Text style={styles.postTime}>{timeAgo(post.timestamp)}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={() => handleLike(post.id)}
                  activeOpacity={0.7}
                >
                  <Heart
                    color={post.isLiked ? Colors.purple : Colors.textMuted}
                    size={18}
                    fill={post.isLiked ? Colors.purple : 'transparent'}
                  />
                  <Text style={[styles.likeCount, post.isLiked && styles.likeCountActive]}>
                    {post.likes}
                  </Text>
                </TouchableOpacity>
                <View style={styles.commentIcon}>
                  <MessageCircle color={Colors.textMuted} size={16} />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {!showCompose && (
          <View style={[styles.fabContainer, { paddingBottom: insets.bottom > 0 ? 0 : 12 }]}>
            <TouchableOpacity
              style={styles.fab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowCompose(true);
              }}
              activeOpacity={0.85}
              testID="compose-fab"
            >
              <LinearGradient
                colors={[Colors.purple, Colors.blue]}
                style={styles.fabGradient}
              >
                <Send color={Colors.white} size={20} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: Colors.text,
    letterSpacing: 1,
  },
  memberBadge: {
    backgroundColor: Colors.purpleMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  memberCount: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.purple,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  leaderboardCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  leaderboardGradient: {
    padding: 16,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  leaderboardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249,115,22,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  leaderboardBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.orange,
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139,92,246,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  topThreeAvatar: {
    backgroundColor: 'rgba(139,92,246,0.25)',
    borderWidth: 1.5,
    borderColor: Colors.purple,
  },
  leaderboardAvatarText: {
    fontSize: 14,
    fontWeight: '800' as const,
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  leaderboardUsername: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  leaderboardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  leaderboardStreak: {
    fontSize: 11,
    color: Colors.orange,
    fontWeight: '600' as const,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  levelText: {
    fontSize: 11,
    fontWeight: '800' as const,
  },
  bannerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.15)',
  },
  bannerGradient: {
    padding: 20,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  composeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.purple,
  },
  composeInput: {
    fontSize: 15,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  composeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  composeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cancelText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  sendButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  sendText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  sendTextDisabled: {
    color: Colors.textMuted,
  },
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.purpleMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.purple,
  },
  postMeta: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  postStreak: {
    fontSize: 11,
    color: Colors.gold,
    fontWeight: '600' as const,
  },
  postTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  postContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  likeCount: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  likeCountActive: {
    color: Colors.purple,
  },
  commentIcon: {
    padding: 2,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 20,
  },
  fab: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

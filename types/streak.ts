export interface ResetEntry {
  date: string;
  reason: string;
  streakLost: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  startDate: string | null;
  lastResetDate: string | null;
  totalResets: number;
  dailyCheckIns: string[];
  milestones: number[];
  hasPledgedToday: boolean;
  lastPledgeDate: string | null;
  moodLog: MoodEntry[];
  resetHistory: ResetEntry[];
}

export interface MoodEntry {
  date: string;
  mood: number;
  note?: string;
}

export interface DailyQuote {
  text: string;
  author: string;
}

export const MILESTONES = [1, 3, 7, 14, 21, 30, 60, 90, 180, 365];

export const REBOOT_DAYS = 90;

export const RESET_REASONS = [
  'Boredom',
  'Stress',
  'Loneliness',
  'Late Night',
  'Social Media',
  'Anxiety',
  'Depression',
  'Peer Pressure',
  'Curiosity',
  'Other',
];

export interface StageInfo {
  name: string;
  minDays: number;
  color: string;
  glowColor: string;
}

export const STAGES: StageInfo[] = [
  { name: 'Seed', minDays: 0, color: '#5C6370', glowColor: 'rgba(92,99,112,0.3)' },
  { name: 'Sprout', minDays: 1, color: '#FF8C00', glowColor: 'rgba(255,140,0,0.3)' },
  { name: 'Sapling', minDays: 3, color: '#A78BFA', glowColor: 'rgba(167,139,250,0.3)' },
  { name: 'Growth', minDays: 7, color: '#8B5CF6', glowColor: 'rgba(139,92,246,0.3)' },
  { name: 'Bloom', minDays: 14, color: '#3B82F6', glowColor: 'rgba(59,130,246,0.3)' },
  { name: 'Flourish', minDays: 21, color: '#60A5FA', glowColor: 'rgba(96,165,250,0.3)' },
  { name: 'Mastery', minDays: 30, color: '#FFC040', glowColor: 'rgba(255,192,64,0.4)' },
  { name: 'Ascension', minDays: 60, color: '#7C3AED', glowColor: 'rgba(124,58,237,0.3)' },
  { name: 'Nirvana', minDays: 90, color: '#F5F5F7', glowColor: 'rgba(245,245,247,0.4)' },
];

export function getCurrentStage(days: number): StageInfo {
  let stage = STAGES[0];
  for (const s of STAGES) {
    if (days >= s.minDays) stage = s;
  }
  return stage;
}

export const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  startDate: null,
  lastResetDate: null,
  totalResets: 0,
  dailyCheckIns: [],
  milestones: [],
  hasPledgedToday: false,
  lastPledgeDate: null,
  moodLog: [],
  resetHistory: [],
};

export interface CommunityPost {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  streak: number;
  isLiked: boolean;
}

export interface OnboardingAnswers {
  age: string;
  duration: string;
  motivation: string;
  triggers: string[];
}

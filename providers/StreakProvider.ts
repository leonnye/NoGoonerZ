import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { StreakData, DEFAULT_STREAK_DATA, MILESTONES, REBOOT_DAYS, getCurrentStage, ResetEntry } from '@/types/streak';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'nogoonerz_streak_data';

function getDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export const [StreakProvider, useStreak] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [data, setData] = useState<StreakData>(DEFAULT_STREAK_DATA);

  const streakQuery = useQuery({
    queryKey: ['streak-data'],
    queryFn: async (): Promise<StreakData> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as StreakData;
          if (parsed.startDate) {
            const today = getDateString();
            const calculatedStreak = daysBetween(parsed.startDate, today);
            parsed.currentStreak = calculatedStreak;
            if (calculatedStreak > parsed.longestStreak) {
              parsed.longestStreak = calculatedStreak;
            }
            const newMilestones = MILESTONES.filter(
              (m) => calculatedStreak >= m && !parsed.milestones.includes(m)
            );
            if (newMilestones.length > 0) {
              parsed.milestones = [...parsed.milestones, ...newMilestones];
            }
            if (parsed.lastPledgeDate !== today) {
              parsed.hasPledgedToday = false;
            }
          }
          if (!parsed.moodLog) parsed.moodLog = [];
          if (!parsed.resetHistory) parsed.resetHistory = [];
          if (parsed.hasPledgedToday === undefined) parsed.hasPledgedToday = false;
          if (parsed.lastPledgeDate === undefined) parsed.lastPledgeDate = null;
          return parsed;
        }
        return DEFAULT_STREAK_DATA;
      } catch (e) {
        console.log('Error loading streak data:', e);
        return DEFAULT_STREAK_DATA;
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newData: StreakData) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak-data'] });
    },
  });

  useEffect(() => {
    if (streakQuery.data) {
      setData(streakQuery.data);
    }
  }, [streakQuery.data]);

  const syncProfileStreak = async (newData: StreakData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({
        current_streak: newData.currentStreak,
        longest_streak: newData.longestStreak,
        start_date: newData.startDate,
        last_reset_date: newData.lastResetDate,
        total_resets: newData.totalResets,
      })
      .eq('id', user.id);
  };

  const startStreak = useCallback(() => {
    const today = getDateString();
    const newData: StreakData = {
      ...data,
      currentStreak: 0,
      startDate: today,
      dailyCheckIns: [today],
      hasPledgedToday: false,
      lastPledgeDate: null,
      moodLog: [],
      resetHistory: data.resetHistory ?? [],
    };
    setData(newData);
    saveMutation.mutate(newData);
    void syncProfileStreak(newData);
  }, [data]);

  const resetStreak = useCallback((reason: string) => {
    const today = getDateString();
    const resetEntry: ResetEntry = {
      date: today,
      reason,
      streakLost: data.currentStreak,
    };
    const newData: StreakData = {
      ...data,
      currentStreak: 0,
      startDate: today,
      lastResetDate: today,
      totalResets: data.totalResets + 1,
      milestones: [],
      hasPledgedToday: false,
      lastPledgeDate: null,
      resetHistory: [...(data.resetHistory ?? []), resetEntry],
    };
    setData(newData);
    saveMutation.mutate(newData);
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('reset_history')
          .insert({
            user_id: user.id,
            date: today,
            reason,
            streak_lost: resetEntry.streakLost,
          });
      }
      await syncProfileStreak(newData);
    })();
  }, [data]);

  const checkIn = useCallback(() => {
    const today = getDateString();
    if (data.dailyCheckIns.includes(today)) return;
    const newData: StreakData = {
      ...data,
      dailyCheckIns: [...data.dailyCheckIns, today],
    };
    setData(newData);
    saveMutation.mutate(newData);
    void syncProfileStreak(newData);
  }, [data]);

  const pledge = useCallback(() => {
    const today = getDateString();
    const newData: StreakData = {
      ...data,
      hasPledgedToday: true,
      lastPledgeDate: today,
    };
    setData(newData);
    saveMutation.mutate(newData);
    void syncProfileStreak(newData);
  }, [data]);

  const logMood = useCallback((mood: number, note?: string) => {
    const today = getDateString();
    const existing = data.moodLog.filter(m => m.date !== today);
    const newData: StreakData = {
      ...data,
      moodLog: [...existing, { date: today, mood, note }],
    };
    setData(newData);
    saveMutation.mutate(newData);

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('mood_logs')
        .upsert(
          {
            user_id: user.id,
            date: today,
            mood,
            note,
          },
          { onConflict: 'user_id, date' },
        );
    })();
  }, [data]);

  const hasCheckedInToday = useMemo(() => {
    const today = getDateString();
    return data.dailyCheckIns.includes(today);
  }, [data.dailyCheckIns]);

  const nextMilestone = useMemo(() => {
    return MILESTONES.find((m) => m > data.currentStreak) ?? 365;
  }, [data.currentStreak]);

  const progressToNextMilestone = useMemo(() => {
    const prev = [...MILESTONES].reverse().find((m) => m <= data.currentStreak) ?? 0;
    const next = nextMilestone;
    if (next === prev) return 1;
    return (data.currentStreak - prev) / (next - prev);
  }, [data.currentStreak, nextMilestone]);

  const rebootProgress = useMemo(() => {
    return Math.min(data.currentStreak / REBOOT_DAYS, 1);
  }, [data.currentStreak]);

  const daysUntilReboot = useMemo(() => {
    return Math.max(REBOOT_DAYS - data.currentStreak, 0);
  }, [data.currentStreak]);

  const currentStage = useMemo(() => {
    return getCurrentStage(data.currentStreak);
  }, [data.currentStreak]);

  return {
    data,
    isLoading: streakQuery.isLoading,
    startStreak,
    resetStreak,
    checkIn,
    pledge,
    logMood,
    hasCheckedInToday,
    nextMilestone,
    progressToNextMilestone,
    rebootProgress,
    daysUntilReboot,
    currentStage,
    hasStarted: data.startDate !== null,
  };
});

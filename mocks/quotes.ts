import { DailyQuote } from '@/types/streak';

export const QUOTES: DailyQuote[] = [
  { text: "The only way out is through.", author: "Robert Frost" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "A man who conquers himself is greater than one who conquers a thousand men in battle.", author: "Buddha" },
  { text: "You don't have to be extreme, just consistent.", author: "Unknown" },
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "Every day is a new opportunity to change your life.", author: "Unknown" },
  { text: "Strength does not come from winning. Your struggles develop your strength.", author: "Arnold Schwarzenegger" },
  { text: "It's not about being perfect. It's about being better than yesterday.", author: "Unknown" },
  { text: "The harder the battle, the sweeter the victory.", author: "Les Brown" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "You are not your urges. You are the one who decides.", author: "Unknown" },
  { text: "Real strength is being able to say no when everything in you says yes.", author: "Unknown" },
  { text: "Your future self will thank you.", author: "Unknown" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Freedom is what you do with what's been done to you.", author: "Jean-Paul Sartre" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "The secret of change is to focus all your energy not on fighting the old, but on building the new.", author: "Socrates" },
  { text: "Victory belongs to the most persevering.", author: "Napoleon Bonaparte" },
  { text: "You were not born to be controlled by impulse.", author: "Unknown" },
  { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
];

export const PANIC_STRATEGIES = [
  {
    id: '1',
    title: 'Cold Shower',
    description: 'Jump in a cold shower for 2 minutes. The shock resets your nervous system.',
    icon: 'Droplets' as const,
  },
  {
    id: '2',
    title: 'Drop & Give 20',
    description: 'Do 20 push-ups right now. Channel that energy into something productive.',
    icon: 'Dumbbell' as const,
  },
  {
    id: '3',
    title: 'Go Outside',
    description: 'Leave your room. Walk around the block. Change your environment.',
    icon: 'Trees' as const,
  },
  {
    id: '4',
    title: 'Call Someone',
    description: "Text or call someone you trust. You don't have to fight alone.",
    icon: 'Phone' as const,
  },
  {
    id: '5',
    title: 'Breathe Deep',
    description: 'Use the breathing exercise below. 4 seconds in, 7 hold, 8 out.',
    icon: 'Wind' as const,
  },
  {
    id: '6',
    title: 'Write It Down',
    description: 'Journal how you feel right now. The urge will pass in 15 minutes.',
    icon: 'PenLine' as const,
  },
];

export const PLEDGE_TEXT = "I pledge to stay clean today. I choose freedom over impulse. I am stronger than my urges. Today, I win.";

export const RELAPSE_EFFECTS = [
  'Brain fog & reduced focus',
  'Decreased motivation',
  'Emotional numbness',
  'Shame & regret cycle',
  'Desensitization',
  'Weakened willpower',
];

export const SOUNDSCAPES = [
  { id: 'rain', title: 'Rain', emoji: '🌧️', color: '#3B82F6' },
  { id: 'ocean', title: 'Ocean', emoji: '🌊', color: '#06B6D4' },
  { id: 'forest', title: 'Forest', emoji: '🌲', color: '#22C55E' },
  { id: 'campfire', title: 'Campfire', emoji: '🔥', color: '#F59E0B' },
  { id: 'wind', title: 'Mountain Wind', emoji: '🏔️', color: '#94A3B8' },
  { id: 'night', title: 'Night', emoji: '🌙', color: '#8B5CF6' },
];

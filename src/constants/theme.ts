import type { PrayerMethodId, StatName } from '@/types';

export interface ThemeColors {
  name: 'dark' | 'light';
  background: string;
  backgroundSecondary: string;
  backgroundElevated: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  border: string;
  borderFocus: string;
  tabBar: string;
}

export const DarkColors: ThemeColors = {
  name: 'dark',
  background: '#0B0F19',
  backgroundSecondary: '#151B2B',
  backgroundElevated: '#1E2636',
  text: '#E8E2D9',
  textSecondary: '#8A92A5',
  accent: '#D4AF37',
  accentSoft: '#1E2A1E',
  success: '#4ADE80',
  danger: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',
  border: '#2A3447',
  borderFocus: '#D4AF37',
  tabBar: '#0E1420',
};

export const LightColors: ThemeColors = {
  name: 'light',
  background: '#F5F1EB',
  backgroundSecondary: '#E8E2D9',
  backgroundElevated: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#5A5A6E',
  accent: '#B8860B',
  accentSoft: '#F5EBD3',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  info: '#2563EB',
  border: '#D1CCC5',
  borderFocus: '#B8860B',
  tabBar: '#EFEAE2',
};

export const FONTS = {
  display: 'Cinzel_700Bold',
  displayRegular: 'Cinzel_400Regular',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const STARTING_STATS: Record<StatName, number> = {
  faith: 5,
  discipline: 5,
  strength: 5,
  agility: 5,
  vitality: 5,
  wisdom: 5,
  focus: 5,
  charisma: 5,
  empathy: 5,
};

export const STAT_META: Record<
  StatName,
  { label: string; icon: 'moon' | 'shield' | 'sword' | 'run' | 'heart' | 'book' | 'target' | 'talk' | 'hands' }
> = {
  faith: { label: 'Faith', icon: 'moon' },
  discipline: { label: 'Discipline', icon: 'shield' },
  strength: { label: 'Strength', icon: 'sword' },
  agility: { label: 'Agility', icon: 'run' },
  vitality: { label: 'Vitality', icon: 'heart' },
  wisdom: { label: 'Wisdom', icon: 'book' },
  focus: { label: 'Focus', icon: 'target' },
  charisma: { label: 'Charisma', icon: 'talk' },
  empathy: { label: 'Empathy', icon: 'hands' },
};

export const PRAYER_METHODS: { id: PrayerMethodId; label: string; short: string }[] = [
  { id: 'muslim-world-league', label: 'Muslim World League', short: 'MWL' },
  { id: 'isna', label: 'Islamic Society of North America', short: 'ISNA' },
  { id: 'egyptian', label: 'Egyptian General Authority', short: 'EGAS' },
  { id: 'umm-al-qura', label: 'Umm Al-Qura (Makkah)', short: 'UQU' },
  { id: 'karachi', label: 'University of Karachi', short: 'KU' },
  { id: 'dubai', label: 'Dubai', short: 'DUB' },
  { id: 'moonsighting-committee', label: 'Moonsighting Committee', short: 'MSC' },
  { id: 'kuwait', label: 'Kuwait', short: 'KWT' },
  { id: 'qatar', label: 'Qatar', short: 'QAT' },
  { id: 'singapore', label: 'Singapore', short: 'SGP' },
  { id: 'turkey', label: 'Turkey', short: 'TUR' },
  { id: 'tehran', label: 'Tehran', short: 'THR' },
  { id: 'jafari', label: 'Jafari (Shia)', short: 'JAF' },
];

export const MADHABS: { id: 'hanafi' | 'shafi'; label: string; description: string }[] = [
  { id: 'hanafi', label: 'Hanafi', description: 'Asr at later time' },
  { id: 'shafi', label: 'Shafi / Maliki / Hanbali', description: 'Asr at earlier time' },
];
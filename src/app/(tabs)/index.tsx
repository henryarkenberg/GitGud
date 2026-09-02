import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  RefreshControl,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  ArrowRight,
  BookOpen,
  Footprints,
  HandHeart,
  Heart,
  MessageCircle,
  Moon,
  MoonStar,
  ScrollText,
  Settings,
  Shield,
  Sword,
  Target,
  type LucideIcon,
} from 'lucide-react-native';

import { SafeAreaView, Pressable, ScrollView, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { StatsPanel } from '@/components/shared/StatBar';
import { FONTS, STARTING_STATS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

import { usePrayerStore } from '@/stores/usePrayerStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useSleepStore } from '@/stores/useSleepStore';
import { useUserStore } from '@/stores/useUserStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useRelationStore } from '@/stores/useRelationStore';
import { useForgeStore } from '@/stores/useForgeStore';
import { useFitnessStore } from '@/stores/useFitnessStore';
import { useOracleStore } from '@/stores/useOracleStore';

import { dayKey, isHabitDueOn } from '@/utils/rituals';
import { XP_PER_LEVEL, xpIntoLevel, xpToNextLevel } from '@/utils/xp';
import { formatDuration } from '@/utils/sleep';
import { STAT_NAMES, type StatName } from '@/types';

const STAT_ICONS: Record<StatName, LucideIcon> = {
  faith: Moon,
  discipline: Shield,
  strength: Sword,
  agility: Footprints,
  vitality: Heart,
  wisdom: BookOpen,
  focus: Target,
  charisma: MessageCircle,
  empathy: HandHeart,
};

const STAT_COLORS: Record<StatName, string> = {
  faith: '#A78BFA',
  discipline: '#FBBF24',
  strength: '#F87171',
  agility: '#34D399',
  vitality: '#4ADE80',
  wisdom: '#60A5FA',
  focus: '#FB923C',
  charisma: '#F472B6',
  empathy: '#F87171',
};

const QUOTES = [
  'Forge your life with intent.',
  'Small strokes fall great oaks.',
  'The obstacle is the way.',
  'Discipline is the bridge to goals.',
  'You are what you repeat.',
  'Focus on the one thing.',
  'Discomfort is the price of growth.',
  'Do the hard thing first.',
  'The body keeps the score of your habits.',
  'Rise before the sun, conquer the day.',
  'A goal without a plan is a wish.',
  'Consistency beats intensity.',
  'Your only rival is yesterday.',
  'Comfort is the enemy of progress.',
  'Sow an action, reap a habit.',
  'Energy follows attention.',
  'Rest is a weapon, not a reward.',
  'The cave you fear holds the treasure.',
  'Walk the path, not the talk.',
  'Protect your mornings.',
  'The journey is the destination.',
  'Better a diamond with a flaw than a pebble without.',
  'One day, or day one. You decide.',
  'Mind forges the body, body forges the mind.',
  'The chains we bear are broken by small blows.',
  'Train when you do not want to.',
  'Your time is your currency. Spend it well.',
  'Slow is smooth, smooth is fast.',
  'Eat like you love yourself.',
  'Stretch beyond the known edge.',
  'The past is data, not destiny.',
  'Presence is the greatest gift.',
  'Attention is the rarest form of generosity.',
  'A river cuts through rock by persistence.',
  'Make peace with the grind.',
  'Health is the crown the well wear.',
  'One breath at a time.',
  'Design your life, or it designs you.',
  'Strong people do not ask permission.',
  'Repetition is the mother of mastery.',
  'Fall seven times, rise eight.',
  'The wound is where the light enters.',
  'Be the person you needed yesterday.',
  'Small is the seed of mighty things.',
  'Do not watch the clock; do what it does.',
  'Discipline weighs ounces, regret weighs tons.',
  'Walls are just doors that ask a question.',
  'Handle the storm, then enjoy the calm.',
  'Sharpen the axe before the tree falls.',
  'Your habits write your future.',
  'Breathe, then begin again.',
  'The light you seek is already within.',
  'Master the morning, master the day.',
  'Depth over breadth in all things.',
  'Do not confuse motion with progress.',
  'Clean slate, fresh courage.',
  'The fire you tend is the fire you become.',
  'Inch by inch, everything is a cinch.',
  'Build the bridge as you cross the river.',
  'Honor the body to honor the soul.',
  'The grind forgets the impatient.',
  'Clarity comes from action, not thought alone.',
  'You are the architect of your attention.',
  'Return to the path, not to the problem.',
  'A seed grows only in the dark.',
  'The unexamined life is not worth living.',
  'Choose the harder right over the easier wrong.',
  'Your energy is a vault; guard it.',
  'Every rep is a vote for who you become.',
  'The mountain was climbed one ledge at a time.',
  'Out of the mud, the lotus grows.',
  'Conquer yourself, and the war is won.',
  'The purpose is in the practice.',
  'You cannot pour from an empty cup.',,
  'Restore to be stronger tomorrow.',
  'Kindness is a quiet strength.',
  'Your standards are your masters.',
  'The trees that are slow to grow bear the best fruit.',
  'A man is what he does with his attention.',
  'Let the water run, and follow it.',
  'Progress is not always loud.',
  'The soul needs silence to speak.',
  'Light a lamp, not a firework.',
  'Plant today for the harvest of tomorrow.',
  'The moment you accept discomfort, you grow.',
  'Do the work, and the answers follow.',
  'Honor the small, and the large will come.',
  'Your breath is the anchor of the mind.',
  'Rise through gratitude, not force.',
  'The storm passes; the rock remains.',
  'Practice the presence of mind.',
  'Nourish the vessel to serve the spirit.',
  'Guard your focus like treasure.',
  'Begin before you are ready.',
  'The rich soil is made of fallen leaves.',
  'Steady progress outruns rushed starts.',
  'Your word to yourself is the first covenant.',
  'The path is worn by those who walk it.',
  'Be the calm in the chaos.',
  'Life is the great forgery; hammer with intent.',
  'The quiet work becomes the loud result.',
];

function formatDate(): string {
  const d = new Date();
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(d);
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function GlanceTile({
  icon: Icon,
  value,
  label,
  tone = 'secondary',
  onPress,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  tone?: 'accent' | 'secondary';
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.backgroundElevated,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
        gap: 6,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Icon size={18} color={tone === 'accent' ? theme.accent : theme.info} />
      <ThemedText type="mono" tone={tone === 'accent' ? 'accent' : 'secondary'} style={{ fontSize: 16 }}>
        {value}
      </ThemedText>
      <ThemedText type="caption" tone="secondary" style={{ fontSize: 9 }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function StatRing({ stat, value }: { stat: StatName; value: number }) {
  const { theme } = useAppTheme();
  const Icon = STAT_ICONS[stat];
  const color = STAT_COLORS[stat];
  const size = 34;
  const line = 3;
  const r = (size - line) / 2;
  const c = 2 * Math.PI * r;
  const ratio = Math.min(1, Math.max(0, value / 100));
  const offset = c * (1 - ratio);

  return (
    <View className="items-center" style={{ width: 46 }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.background} strokeWidth={line} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={line}
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View
          style={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={13} color={color} />
        </View>
      </View>
      <ThemedText type="caption" tone="secondary" style={{ fontSize: 7, marginTop: 3 }}>
        {stat.slice(0, 3)}
      </ThemedText>
    </View>
  );
}

function QuoteFooter() {
  const [index, setIndex] = useState(0);
  const fade = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    const id = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 450, useNativeDriver: true }).start(() => {
        setIndex((p) => (p + 1) % QUOTES.length);
        Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
      });
    }, 7000);
    return () => clearInterval(id);
  }, [fade]);

  const next = () => {
    Animated.timing(fade, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setIndex((p) => (p + 1) % QUOTES.length);
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  return (
    <Pressable onPress={next} accessibilityRole="button" style={{ marginTop: 24, paddingHorizontal: 8 }}>
      <Animated.View style={{ opacity: fade }}>
        <ThemedText
          type="caption"
          tone="secondary"
          style={{ fontFamily: FONTS.mono, textAlign: 'center', lineHeight: 18 }}
        >
          “{QUOTES[index]}”
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const profile = useUserStore((state) => state.profile);
  const prayerRecords = usePrayerStore((state) => state.records);
  const habits = useHabitStore((state) => state.habits);
  const logs = useHabitStore((state) => state.logs);
  const latestSession = useSleepStore((state) => state.latestSession);

  const [refreshing, setRefreshing] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const glow = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(glow, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    );
    anim.start();
    return () => anim.stop();
  }, [glow]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        useUserStore.getState().hydrate(),
        useSleepStore.getState().hydrate(),
        useHabitStore.getState().hydrate(),
        useQuestStore.getState().hydrate(),
        useRelationStore.getState().hydrate(),
        useForgeStore.getState().hydrate(),
        useFitnessStore.getState().hydrate(),
        useOracleStore.getState().hydrate(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const xpIn = profile ? xpIntoLevel(profile.totalXp) : 0;
  const xpNext = profile ? xpToNextLevel(profile.totalXp) : 1000;
  const level = profile?.level ?? 1;
  const stats = profile?.stats ?? STARTING_STATS;

  const todayKey = dayKey(new Date());
  const prayersDone = prayerRecords.filter((r) => r.status === 'on-time' || r.status === 'late').length;
  const dueHabits = habits.filter((h) => !h.isArchived && isHabitDueOn(h, new Date()));
  const habitsDone = dueHabits.filter((h) => logs.some((l) => l.habitId === h.id && l.date === todayKey && l.completed)).length;
  const sleepValue = latestSession && latestSession.durationMinutes > 0 ? formatDuration(latestSession.durationMinutes) : '—';

  const glowX = glow.interpolate({ inputRange: [0, 1], outputRange: [-90, 460] });

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerClassName="px-4 pb-12"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
        >
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <ThemedText type="caption" tone="secondary">
                {formatDate()}
              </ThemedText>
              <ThemedText type="title" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} className="mt-0.5">
                {greeting()}, {profile?.name ?? 'Warrior'}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: theme.backgroundElevated,
                borderColor: theme.border,
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Settings size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          {/* Character card */}
          <Pressable
            onPress={() => setCardOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityLabel={`Character card ${cardOpen ? 'collapsed' : 'expanded'}`}
            style={({ pressed }) => ({
              marginBottom: 24,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: theme.borderFocus,
              backgroundColor: theme.backgroundElevated,
              padding: 20,
              opacity: pressed ? 0.97 : 1,
              shadowColor: theme.accent,
              shadowOpacity: 0.14,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 5 },
              elevation: 5,
            })}
          >
            <View className="mb-4 flex-row items-center gap-4">
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: theme.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: theme.accent,
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                <ThemedText type="title" style={{ color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF', fontSize: 24 }}>
                  {(profile?.name ?? 'W')[0]?.toUpperCase()}
                </ThemedText>
              </View>
              <View className="flex-1">
                <ThemedText type="title">{profile?.name ?? 'Unnamed Hero'}</ThemedText>
                <ThemedText type="small" tone="secondary" className="mt-0.5">
                  Level {level} Warrior
                </ThemedText>
              </View>
              <View className="items-end">
                <ThemedText type="mono" tone="accent" style={{ fontSize: 15 }}>
                  {xpIn} / {XP_PER_LEVEL} XP
                </ThemedText>
                <ThemedText type="caption" tone="secondary" className="mt-0.5">
                  {xpNext} XP to {level + 1}
                </ThemedText>
              </View>
            </View>

            {/* XP bar with gloss swipe */}
            <View className="mb-5 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: theme.background }}>
              <View
                style={{
                  width: `${Math.min(100, (xpIn / XP_PER_LEVEL) * 100)}%`,
                  height: '100%',
                  backgroundColor: theme.accent,
                  borderRadius: 999,
                }}
              />
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: 40,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.35)',
                  transform: [{ translateX: glowX }],
                }}
              />
            </View>

            <View className="mb-5 flex-row gap-2">
              {[
                { label: 'Skill', value: `${profile?.skillPoints ?? 0} SP` },
                { label: 'Gold', value: `${profile?.gold ?? 0} \u00A6G` },
                { label: 'Streak', value: `${profile?.currentStreak ?? 0} day` },
              ].map((c) => (
                <View
                  key={c.label}
                  className="flex-1 rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: theme.backgroundSecondary }}
                >
                  <ThemedText type="mono" tone="accent" style={{ fontSize: 15 }}>
                    {c.value}
                  </ThemedText>
                  <ThemedText type="caption" tone="secondary">
                    {c.label}
                  </ThemedText>
                </View>
              ))}
            </View>

            {cardOpen ? (
              <StatsPanel stats={stats} />
            ) : (
              <>
                <View className="mb-3 flex-row justify-center">
                  {STAT_NAMES.slice(0, 5).map((stat) => (
                    <StatRing key={stat} stat={stat} value={stats[stat]} />
                  ))}
                </View>
                <View className="flex-row justify-center">
                  {STAT_NAMES.slice(5).map((stat) => (
                    <StatRing key={stat} stat={stat} value={stats[stat]} />
                  ))}
                </View>
              </>
            )}

            <View className="mt-4 flex-row items-center justify-center gap-1" style={{ opacity: 0.5 }}>
              <ThemedText type="caption" tone="secondary" style={{ fontSize: 9 }}>
                {cardOpen ? 'HIDE STATS' : 'SHOW STATS'}
              </ThemedText>
            </View>
          </Pressable>

          {/* Today at a glance */}
          <View className="mb-6">
            <ThemedText type="caption" tone="accent" className="mb-3">
              TODAY AT A GLANCE
            </ThemedText>
            <View className="flex-row gap-3">
              <GlanceTile icon={Moon} value={`${prayersDone}/5`} label="Prayers" tone="accent" onPress={() => router.push('/sanctum')} />
              <GlanceTile icon={ScrollText} value={`${habitsDone}/${dueHabits.length}`} label="Habits" onPress={() => router.push('/rituals')} />
              <GlanceTile icon={MoonStar} value={sleepValue} label="Sleep" onPress={() => router.push('/slumber')} />
            </View>
          </View>

          {/* Ledger */}
          <Pressable
            onPress={() => router.push('/ledger')}
            accessibilityRole="button"
            style={({ pressed }) => ({
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.backgroundSecondary,
              paddingVertical: 16,
              paddingHorizontal: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View className="flex-1 pr-3">
              <ThemedText type="body" bold>
                The Ledger
              </ThemedText>
              <ThemedText type="small" tone="secondary" className="mt-0.5">
                A unified chronicle of every deed.
              </ThemedText>
            </View>
            <ArrowRight size={18} color={theme.textSecondary} />
          </Pressable>

          <QuoteFooter />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

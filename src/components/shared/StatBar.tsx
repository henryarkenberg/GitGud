import { BookOpen, Footprints, HandHeart, Heart, MessageCircle, Moon, Shield, Sword, Target } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Text, View } from '@/components/tw';
import { STAT_META, type ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { StatName, Stats } from '@/types';

const ICONS: Record<StatName, LucideIcon> = {
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

export function StatBar({
  stat,
  value,
  showIcon = true,
}: {
  stat: StatName;
  value: number;
  showIcon?: boolean;
}) {
  const { theme } = useAppTheme();
  const Icon = ICONS[stat];
  const pct = Math.min(100, Math.max(0, value)) / 100;

  return (
    <View className="flex-row items-center gap-2">
      {showIcon ? <Icon size={13} color={theme.textSecondary} /> : null}
      <View className="flex-1">
        <View className="mb-0.5 flex-row items-center justify-between">
          <BarLabel theme={theme} label={STAT_META[stat].label} />
          <BarLabel theme={theme} label={String(value)} mono />
        </View>
        <View
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: theme.background }}
        >
          <View
            style={{
              width: `${pct * 100}%`,
              height: '100%',
              backgroundColor: theme.accent,
              borderRadius: 999,
            }}
          />
        </View>
      </View>
    </View>
  );
}

function BarLabel({
  theme,
  label,
  mono = false,
}: {
  theme: ThemeColors;
  label: string;
  mono?: boolean;
}) {
  return (
    <Text
      style={{
        color: theme.textSecondary,
        fontSize: 10,
        fontFamily: mono ? 'JetBrainsMono_400Regular' : 'Inter_500Medium',
        textTransform: mono ? undefined : 'uppercase',
        letterSpacing: mono ? 0 : 0.6,
      }}
    >
      {label}
    </Text>
  );
}

export function StatsPanel({ stats, showIcons = true }: { stats: Stats; showIcons?: boolean }) {
  const statsEntries = (Object.keys(stats) as StatName[]).map((stat) => ({ stat, value: stats[stat] }));
  return (
    <View className="gap-2.5">
      {statsEntries.map(({ stat, value }) => (
        <StatBar key={stat} stat={stat} value={value} showIcon={showIcons} />
      ))}
    </View>
  );
}
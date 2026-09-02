import { Alert } from 'react-native';
import { CalendarClock, Check, Pencil, RotateCcw, Trash2, type LucideIcon } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { OBJECTIVE_DIFFICULTIES } from '@/constants/rituals';
import { STAT_META } from '@/constants/theme';
import type { Objective } from '@/types';

export interface QuestCardProps {
  objective: Objective;
  onComplete: () => void;
  onFail: () => void;
  onAbandon: () => void;
  onReopen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function countdown(deadline: string | null): { label: string; overdue: boolean } {
  if (!deadline) return { label: '', overdue: false };
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return { label: '', overdue: false };
  const diff = d.getTime() - Date.now();
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  if (diff < 0) return { label: `Overdue ${Math.abs(days)}d`, overdue: true };
  if (days === 0) return { label: 'Due today', overdue: false };
  return { label: `In ${days}d`, overdue: false };
}

type Tone = 'primary' | 'outline' | 'danger' | 'accent';

function PillButton({
  tone = 'outline',
  flex = false,
  onPress,
  icon: Icon,
  label,
  disabled = false,
}: {
  tone?: Tone;
  flex?: boolean;
  onPress: () => void;
  icon?: LucideIcon;
  label: string;
  disabled?: boolean;
}) {
  const { theme } = useAppTheme();
  const tones: Record<Tone, { bg: string; border: string; color: string }> = {
    primary: { bg: theme.accent, border: theme.accent, color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' },
    outline: { bg: 'transparent', border: theme.border, color: theme.text },
    danger: { bg: 'transparent', border: theme.danger, color: theme.danger },
    accent: { bg: 'transparent', border: theme.borderFocus, color: theme.accent },
  };
  const t = tones[tone];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flex: flex ? 1 : undefined,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: tone === 'primary' ? 0 : 1.5,
        backgroundColor: t.bg,
        borderColor: t.border,
        opacity: pressed ? 0.85 : disabled ? 0.5 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {Icon ? <Icon size={15} color={t.color} /> : null}
      <ThemedText type="small" bold style={{ color: t.color }}>{label}</ThemedText>
    </Pressable>
  );
}

function IconButton({ onPress, icon: Icon, color, label }: { onPress: () => void; icon: LucideIcon; color: string; label: string }) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 42,
        height: 44,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: theme.border,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Icon size={16} color={color} />
    </Pressable>
  );
}

export function QuestCard({ objective, onComplete, onFail, onAbandon, onReopen, onEdit, onDelete }: QuestCardProps) {
  const { theme } = useAppTheme();
  const diff = OBJECTIVE_DIFFICULTIES[objective.difficulty] ?? OBJECTIVE_DIFFICULTIES.medium;
  const cd = countdown(objective.deadline);
  const badgeColor = theme[diff.tone];
  const overdue = cd.overdue;

  const confirmDelete = () => {
    Alert.alert('Delete Quest', `Permanently delete "${objective.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  const isActive = objective.status === 'active';

  return (
    <View
      className="rounded-2xl border p-4"
      style={{
        borderColor: overdue ? theme.danger : diff.tone === 'accent' ? theme.borderFocus : theme.border,
        backgroundColor: theme.backgroundElevated,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <ThemedText type="title" numberOfLines={2}>
            {objective.title}
          </ThemedText>
          {objective.description ? (
            <ThemedText type="small" tone="secondary" className="mt-1">
              {objective.description}
            </ThemedText>
          ) : null}
        </View>
        <View className="items-end gap-1.5">
          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${badgeColor}1f` }}>
            <ThemedText type="caption" bold style={{ color: badgeColor, fontSize: 9 }}>
              {diff.label}
            </ThemedText>
          </View>
          {!isActive ? (
            <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: theme.backgroundSecondary }}>
              <ThemedText type="caption" tone="secondary" style={{ fontSize: 9 }}>
                {objective.status}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>

      {/* Meta */}
      <View className="mt-3 flex-row flex-wrap items-center gap-1.5">
        <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: theme.backgroundSecondary, borderColor: theme.border, borderWidth: 1 }}>
          <ThemedText type="caption" tone="secondary" style={{ fontSize: 9 }}>
            {STAT_META[objective.relatedStat].label}
          </ThemedText>
        </View>
        {objective.tags.map((t) => (
          <View key={t} className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }}>
            <ThemedText type="caption" tone="secondary" style={{ fontSize: 9 }}>
              {t}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Reward + deadline */}
      <View
        className="mt-4 flex-row items-center justify-between"
        style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 }}
      >
        <View className="rounded-xl px-3 py-1.5" style={{ backgroundColor: `${theme.accent}1f` }}>
          <ThemedText type="mono" tone="accent" style={{ fontSize: 13 }}>
            +{objective.xpReward} XP
          </ThemedText>
        </View>
        <View className="flex-row items-center gap-1.5">
          <CalendarClock size={13} color={overdue ? theme.danger : theme.textSecondary} />
          <ThemedText type="caption" tone="secondary" style={{ color: overdue ? theme.danger : theme.textSecondary }}>
            {objective.deadline
              ? overdue
                ? cd.label
                : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(objective.deadline))
              : 'No deadline'}
          </ThemedText>
        </View>
      </View>

      {/* Actions */}
      <View className="mt-4 gap-2">
        {isActive ? (
          <>
            <PillButton tone="primary" onPress={onComplete} icon={Check} label="Complete" />
            <View className="flex-row gap-2">
              <PillButton tone="danger" flex onPress={onFail} label="Fail" />
              <PillButton tone="outline" flex onPress={onAbandon} label="Abandon" />
              <IconButton onPress={onEdit} icon={Pencil} color={theme.textSecondary} label="Edit quest" />
              <IconButton onPress={confirmDelete} icon={Trash2} color={theme.danger} label="Delete quest" />
            </View>
          </>
        ) : (
          <>
            <PillButton tone="accent" onPress={onReopen} icon={RotateCcw} label="Reopen" />
            <View className="flex-row gap-2">
              <PillButton tone="outline" flex onPress={onEdit} label="Edit" />
              <IconButton onPress={confirmDelete} icon={Trash2} color={theme.danger} label="Delete quest" />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

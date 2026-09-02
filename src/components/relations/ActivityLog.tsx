import { Trash2 } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ACTIVITY_META } from '@/constants/relations';
import type { RelationActivity } from '@/types';

function shortDate(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
}

export interface ActivityLogProps {
  activities: RelationActivity[];
  onDelete: (id: string) => void;
}

export function ActivityLog({ activities, onDelete }: ActivityLogProps) {
  const { theme } = useAppTheme();

  if (activities.length === 0) {
    return (
      <View className="rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
        <ThemedText type="small" tone="secondary">No interactions yet. Log the first one to keep the bond alive.</ThemedText>
      </View>
    );
  }

  return (
    <View className="gap-2">
      {activities.map((a) => {
        const meta = ACTIVITY_META[a.type] ?? ACTIVITY_META.text;
        return (
        <View key={a.id} className="flex-row items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <ThemedText type="body" bold>
                {meta.label}
              </ThemedText>
              <ThemedText type="caption" tone="secondary">
                {shortDate(a.date)}
              </ThemedText>
            </View>
            <ThemedText type="caption" tone="secondary" className="mt-0.5">
              +{a.healthRestored} health · +{a.xpEarned} XP
            </ThemedText>
            {a.note ? (
              <ThemedText type="small" tone="secondary" className="mt-0.5">{a.note}</ThemedText>
            ) : null}
          </View>
          <Pressable onPress={() => onDelete(a.id)} style={{ padding: 4 }}>
            <Trash2 size={15} color={theme.danger} />
          </Pressable>
        </View>
        );
      })}
    </View>
  );
}

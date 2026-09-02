import { Pencil, Plus, Trash2 } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Sprint } from '@/types';
import { formatClock, formatDuration } from '@/utils/sleep';

export interface SprintTimelineProps {
  sprints: Sprint[];
  onAdd: () => void;
  onEdit: (sprint: Sprint) => void;
  onDelete: (id: string) => void;
}

export function SprintTimeline({ sprints, onAdd, onEdit, onDelete }: SprintTimelineProps) {
  const { theme } = useAppTheme();

  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <ThemedText type="caption" tone="accent">
          SPRINT LOG · {sprints.length}
        </ThemedText>
        <Button variant="ghost" shape="sharp" size="sm" onPress={onAdd}>
          <Plus size={14} color={theme.accent} />
          Log a sprint
        </Button>
      </View>

      {sprints.length === 0 ? (
        <View className="rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
          <ThemedText type="small" tone="secondary">
            No sprints logged yet. Start the timer or log a past session manually.
          </ThemedText>
        </View>
      ) : (
        <View className="gap-2">
          {sprints.map((s) => (
            <View key={s.id} className="flex-row items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
              <View className="flex-1">
                <ThemedText type="body" bold>
                  {formatDuration(s.durationMinutes)} <ThemedText type="mono" tone="accent">{s.xpEarned} XP</ThemedText>
                </ThemedText>
                <ThemedText type="caption" tone="secondary" className="mt-0.5">
                  {s.startTime ? formatClock(s.startTime) : ''} · {s.isRunning ? 'RUNNING' : 'logged'}
                </ThemedText>
                {s.note ? (
                  <ThemedText type="small" tone="secondary" className="mt-0.5">
                    {s.note}
                  </ThemedText>
                ) : null}
              </View>
              <Pressable onPress={() => onEdit(s)} style={{ padding: 6 }}>
                <Pencil size={15} color={theme.textSecondary} />
              </Pressable>
              <Pressable onPress={() => onDelete(s.id)} style={{ padding: 6 }}>
                <Trash2 size={15} color={theme.danger} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

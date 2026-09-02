import { Plus } from 'lucide-react-native';
import { useState } from 'react';

import { View, Pressable } from '@/components/tw';
import { QuestCard } from '@/components/quests/QuestCard';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { OBJECTIVE_STATUS_META } from '@/constants/rituals';
import type { Objective, ObjectiveStatus } from '@/types';

type Filter = 'all' | ObjectiveStatus;

export interface QuestBoardProps {
  objectives: Objective[];
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  onAbandon: (id: string) => void;
  onReopen: (id: string) => void;
  onEdit: (objective: Objective) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const FILTERS: Filter[] = ['all', 'active', 'completed', 'failed', 'abandoned'];

export function QuestBoard({ objectives, onComplete, onFail, onAbandon, onReopen, onEdit, onDelete, onAdd }: QuestBoardProps) {
  const { theme } = useAppTheme();
  const [filter, setFilter] = useState<Filter>('active');
  const filtered = filter === 'all' ? objectives : objectives.filter((o) => o.status === filter);
  const activeCount = objectives.filter((o) => o.status === 'active').length;

  return (
    <View>
      <SectionHeader
        title={`QUESTS · ${activeCount} LIVE`}
        right={
          <Button variant="ghost" shape="sharp" size="sm" onPress={onAdd}>
            <Plus size={14} color={theme.accent} />
            New
          </Button>
        }
      />

      <View className="mb-3 flex-row flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            className="rounded-lg border px-3 py-1.5"
            style={{ borderColor: filter === f ? theme.borderFocus : theme.border, backgroundColor: filter === f ? theme.accentSoft : theme.background }}
          >
            <ThemedText type="small" bold style={{ color: filter === f ? theme.accent : theme.textSecondary }} tone="secondary">
              {f === 'all' ? 'All' : OBJECTIVE_STATUS_META[f].label}
              {f !== 'all' && f !== 'abandoned' ? ` (${objectives.filter((o) => o.status === f).length})` : ''}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View className="rounded-xl border px-4 py-4" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
          <ThemedText type="small" tone="secondary">
            No objectives here yet. Set a quest to give your day direction.
          </ThemedText>
        </View>
      ) : (
        <View className="gap-2.5">
          {filtered.map((o) => (
            <QuestCard
              key={o.id}
              objective={o}
              onComplete={() => onComplete(o.id)}
              onFail={() => onFail(o.id)}
              onAbandon={() => onAbandon(o.id)}
              onReopen={() => onReopen(o.id)}
              onEdit={() => onEdit(o)}
              onDelete={() => onDelete(o.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

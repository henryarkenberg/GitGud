import { Award, Lock } from 'lucide-react-native';

import { View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { RelationActivity, RelationActivityType, RelationMilestone } from '@/types';

export interface MilestoneTreeProps {
  milestones: RelationMilestone[];
  activities: RelationActivity[];
}

export function MilestoneTree({ milestones, activities }: MilestoneTreeProps) {
  const { theme } = useAppTheme();

  return (
    <View className="gap-2">
      {milestones.map((m) => {
        let req = { countType: 'meet' as RelationActivityType, count: 1 };
        try {
          req = JSON.parse(m.requiredActivities || '{}') as { countType: RelationActivityType; count: number };
        } catch {
          req = { countType: 'meet', count: 1 };
        }
        const count = activities.filter((a) => a.type === req.countType).length;
        const unlocked = m.isUnlocked;
        return (
          <View
            key={m.id}
            className="flex-row items-center gap-3 rounded-xl border px-4 py-3"
            style={{ borderColor: unlocked ? theme.accent : theme.border, backgroundColor: unlocked ? theme.accentSoft : theme.backgroundElevated }}
          >
            <View
              className="h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: unlocked ? theme.accent : theme.background }}
            >
              {unlocked ? <Award size={18} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} /> : <Lock size={18} color={theme.textSecondary} />}
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <ThemedText type="body" bold style={{ color: unlocked ? theme.accent : theme.text }}>
                  {m.title}
                </ThemedText>
                <ThemedText type="caption" tone="accent" style={{ fontSize: 9 }}>LV {m.level}</ThemedText>
              </View>
              <ThemedText type="small" tone="secondary" className="mt-0.5">
                {m.description} · +{m.rewardPoints} {m.rewardStat} · +max health
              </ThemedText>
              {unlocked ? (
                <ThemedText type="caption" tone="success" className="mt-0.5">UNLOCKED</ThemedText>
              ) : (
                <ThemedText type="caption" tone="secondary" className="mt-0.5">
                  {Math.min(count, req.count)}/{req.count} toward unlock
                </ThemedText>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

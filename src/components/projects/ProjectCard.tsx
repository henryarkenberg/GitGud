import { ChevronRight } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { HABIT_ICONS } from '@/constants/rituals';
import type { Project, ProjectStatus } from '@/types';
import { formatDuration } from '@/utils/sleep';

export interface ProjectCardProps {
  project: Project;
  tasksDone: number;
  tasksTotal: number;
  onOpen: () => void;
}

const STATUS_TONE: Record<ProjectStatus, string> = {
  active: '#4ADE80',
  paused: '#FBBF24',
  completed: '#60A5FA',
  archived: '#8A92A5',
};

export function ProjectCard({ project, tasksDone, tasksTotal, onOpen }: ProjectCardProps) {
  const { theme } = useAppTheme();
  const Icon = HABIT_ICONS[project.icon] ?? HABIT_ICONS.hammer;
  const progress = project.targetHours ? Math.min(1, project.totalTimeSpentMinutes / (project.targetHours * 60)) : 0;

  const statusColor = STATUS_TONE[project.status];

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      style={({ pressed }) => ({
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.backgroundElevated,
        padding: 16,
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      })}
    >
      <View>
        <View className="flex-row items-center gap-3">
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: `${project.color}22`, alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color={project.color} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <ThemedText type="body" bold numberOfLines={1} style={{ opacity: project.status === 'archived' ? 0.6 : 1 }}>
                {project.name}
              </ThemedText>
              <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${statusColor}1f` }}>
                <ThemedText type="caption" style={{ color: statusColor, fontSize: 9 }}>
                  {project.status}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="small" tone="secondary" className="mt-0.5" numberOfLines={1}>
              {project.description || 'No description'}
            </ThemedText>
          </View>
          <View className="items-end gap-1">
            {tasksTotal > 0 ? (
              <ThemedText type="mono" tone="accent">
                {tasksDone}/{tasksTotal}
              </ThemedText>
            ) : null}
            <ChevronRight size={16} color={theme.textSecondary} />
          </View>
        </View>

        {project.targetHours ? (
          <View className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: theme.background }}>
            <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: project.color, borderRadius: 999 }} />
          </View>
        ) : null}

        <View className="mt-3 flex-row items-center justify-between">
          <ThemedText type="caption" tone="secondary">
            {formatDuration(project.totalTimeSpentMinutes)} forged
          </ThemedText>
          {project.targetHours ? (
            <ThemedText type="caption" tone="accent">
              {Math.round(progress * 100)}% to target
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

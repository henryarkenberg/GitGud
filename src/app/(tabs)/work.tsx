import { router } from 'expo-router';
import { Hammer, ScrollText, Sparkles } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View } from '@/components/tw';
import { HubCard } from '@/components/ui/HubCard';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useForgeStore } from '@/stores/useForgeStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useOracleStore } from '@/stores/useOracleStore';
import { dayKey, isHabitDueOn } from '@/utils/rituals';

export default function WorkScreen() {
  const { theme } = useAppTheme();
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const projects = useForgeStore((s) => s.projects);
  const runningSprint = useForgeStore((s) => s.runningSprint);
  const quests = useOracleStore((s) => s.quests);

  const todayKey = dayKey(new Date());
  const dueHabits = habits.filter((h) => !h.isArchived && isHabitDueOn(h, new Date()));
  const doneHabits = dueHabits.filter((h) => logs.some((l) => l.habitId === h.id && l.date === todayKey && l.completed)).length;
  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'paused').length;
  const sprintName = runningSprint ? projects.find((p) => p.id === runningSprint.projectId)?.name : null;
  const doneQuests = quests.filter((q) => q.isCompleted).length;

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView contentContainerClassName="px-4 pb-12" showsVerticalScrollIndicator={false}>
          <View className="mb-1">
            <ThemedText type="caption" tone="accent">THE ANVIL AND THE RITUAL</ThemedText>
            <ThemedText type="display" className="mt-0.5">Work</ThemedText>
            <ThemedText type="small" tone="secondary" className="mt-1">
              Forge hours into mastery and let repetition shape who you are.
            </ThemedText>
          </View>

          <View className="mb-6 h-1 w-10 rounded-full" style={{ backgroundColor: theme.accent }} />

          <ThemedText type="caption" tone="accent" className="mb-2">YOUR CRAFT</ThemedText>

          <HubCard
            icon={ScrollText}
            title="Rituals"
            subtitle={dueHabits.length > 0 ? 'Habits due today' : 'Habits & daily quests'}
            value={`${doneHabits}/${dueHabits.length}`}
            onPress={() => router.push('/rituals')}
          />
          <HubCard
            icon={Hammer}
            title="The Forge"
            subtitle={sprintName ? `Sprinting — ${sprintName}` : 'Projects, tasks & sprints'}
            value={activeProjects > 0 ? `${activeProjects} project${activeProjects === 1 ? '' : 's'}` : ''}
            accent={!!runningSprint}
            onPress={() => router.push('/forge')}
          />
          <HubCard
            icon={Sparkles}
            title="Oracle Quests"
            subtitle={quests.length > 0 ? 'AI-generated daily quests' : 'The Oracle will guide you'}
            value={quests.length > 0 ? `${doneQuests}/${quests.length}` : ''}
            onPress={() => router.push('/report')}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

import { router } from 'expo-router';
import { Sprout, Users } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View } from '@/components/tw';
import { HubCard } from '@/components/ui/HubCard';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRelationStore } from '@/stores/useRelationStore';
import { useSkillTreeStore } from '@/stores/useSkillTreeStore';

export default function NetworkScreen() {
  const { theme } = useAppTheme();
  const relations = useRelationStore((s) => s.relations);
  const nodes = useSkillTreeStore((s) => s.nodes);

  const lowBonds = relations.filter((r) => r.health < 40).length;
  const awakened = nodes.filter((n) => n.isUnlocked).length;

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView contentContainerClassName="px-4 pb-12" showsVerticalScrollIndicator={false}>
          <View className="mb-1">
            <ThemedText type="caption" tone="accent">THE BONDS AND THE PATH</ThemedText>
            <ThemedText type="display" className="mt-0.5">Network</ThemedText>
            <ThemedText type="small" tone="secondary" className="mt-1">
              The people who anchor you, and the path only you can walk.
            </ThemedText>
          </View>

          <View className="mb-6 h-1 w-10 rounded-full" style={{ backgroundColor: theme.accent }} />

          <ThemedText type="caption" tone="accent" className="mb-2">YOUR CRAFT</ThemedText>

          <HubCard
            icon={Users}
            title="The Covenant"
            subtitle={lowBonds > 0 ? 'Some bonds are fading' : 'Relations, bonds & milestones'}
            value={relations.length > 0 ? `${relations.length} bond${relations.length === 1 ? '' : 's'}` : ''}
            accent={lowBonds > 0}
            onPress={() => router.push('/covenant')}
          />
          <HubCard
            icon={Sprout}
            title="The Aetherium"
            subtitle="Spend Skill Points to grow your tree"
            value={nodes.length > 0 ? `${awakened}/${nodes.length}` : ''}
            onPress={() => router.push('/aetherium')}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

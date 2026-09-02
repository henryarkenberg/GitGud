import { router } from 'expo-router';
import { Dumbbell, Moon, MoonStar } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View } from '@/components/tw';
import { HubCard } from '@/components/ui/HubCard';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFitnessStore } from '@/stores/useFitnessStore';
import { usePrayerStore } from '@/stores/usePrayerStore';
import { useSleepStore } from '@/stores/useSleepStore';
import { todayISO } from '@/utils/id';
import { formatDuration } from '@/utils/sleep';

export default function FitnessScreen() {
  const { theme } = useAppTheme();
  const records = usePrayerStore((s) => s.records);
  const latestSession = useSleepStore((s) => s.latestSession);
  const debtMinutes = useSleepStore((s) => s.debtMinutes);
  const exercises = useFitnessStore((s) => s.exercises);
  const fitnessDaily = useFitnessStore((s) => s.daily);

  const today = todayISO();
  const prayersDone = records.filter((r) => r.status === 'on-time' || r.status === 'late').length;
  const sleepValue = latestSession && latestSession.durationMinutes > 0 ? formatDuration(latestSession.durationMinutes) : '—';
  const sleepSubtitle = debtMinutes > 0 ? `Debt ${formatDuration(debtMinutes)}` : 'The vessel must rest';
  const exMinutes = exercises.filter((e) => e.date === today).reduce((a, e) => a + e.durationMinutes, 0);
  const water = fitnessDaily?.waterGlasses ?? 0;

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView contentContainerClassName="px-4 pb-12" showsVerticalScrollIndicator={false}>
          <View className="mb-1">
            <ThemedText type="caption" tone="accent">THE TEMPLE AND THE SOUL</ThemedText>
            <ThemedText type="display" className="mt-0.5">Fitness</ThemedText>
            <ThemedText type="small" tone="secondary" className="mt-1">
              The body is a temple, and the soul is its compass.
            </ThemedText>
          </View>

          <View className="mb-6 h-1 w-10 rounded-full" style={{ backgroundColor: theme.accent }} />

          <ThemedText type="caption" tone="accent" className="mb-2">YOUR CRAFT</ThemedText>

          <HubCard
            icon={Moon}
            title="Sanctum"
            subtitle="The soul's compass"
            value={`${prayersDone}/5`}
            onPress={() => router.push('/sanctum')}
          />
          <HubCard
            icon={MoonStar}
            title="Slumber"
            subtitle={sleepSubtitle}
            value={sleepValue}
            onPress={() => router.push('/slumber')}
          />
          <HubCard
            icon={Dumbbell}
            title="The Vessel"
            subtitle="Movement, meals & hydration"
            value={exMinutes > 0 || water > 0 ? `${exMinutes}m` : ''}
            onPress={() => router.push('/vessel')}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

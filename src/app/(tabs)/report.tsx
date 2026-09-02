import { router } from 'expo-router';
import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useOracleStore, hasApiKey } from '@/stores/useOracleStore';
import { DawnReport } from '@/components/quests/DawnReport';
import { DailyQuestCard } from '@/components/quests/DailyQuestCard';
import { RandomEventCard } from '@/components/quests/RandomEventCard';

export default function ReportScreen() {
  const { theme } = useAppTheme();
  const report = useOracleStore((s) => s.report);
  const quests = useOracleStore((s) => s.quests);
  const event = useOracleStore((s) => s.event);
  const loading = useOracleStore((s) => s.loading);
  const initialized = useOracleStore((s) => s.initialized);
  const generateReport = useOracleStore((s) => s.generateReport);
  const completeQuest = useOracleStore((s) => s.completeQuest);
  const completeEvent = useOracleStore((s) => s.completeEvent);
  const dismissEvent = useOracleStore((s) => s.dismissEvent);

  const doneQuests = quests.filter((q) => q.isCompleted).length;

  useEffect(() => {
    if (initialized && !report && !loading && hasApiKey()) {
      generateReport().catch(() => {});
    }
  }, [initialized, report, loading, generateReport]);

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView contentContainerClassName="px-4 pb-12" showsVerticalScrollIndicator={false}>
          <View className="mb-1">
            <ThemedText type="caption" tone="accent">THE ORACLE SPEAKS</ThemedText>
            <ThemedText type="display" className="mt-0.5">Report</ThemedText>
            <ThemedText type="small" tone="secondary" className="mt-1">
              Your strategic dawn report and the quests the Oracle sets before you.
            </ThemedText>
          </View>

          <View className="mb-6 h-1 w-10 rounded-full" style={{ backgroundColor: theme.accent }} />

          {/* Dawn report */}
          {report ? (
            <View className="mb-4">
              <DawnReport
                report={report}
                loading={loading}
                onRegenerate={() => generateReport(true).catch(() => {})}
                onOpenLogs={() => router.push('/oracle-logs')}
              />
            </View>
          ) : (
            <Pressable
              onPress={() => generateReport().catch(() => {})}
              accessibilityRole="button"
              style={({ pressed }) => ({
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.accent,
                backgroundColor: theme.backgroundElevated,
                paddingVertical: 18,
                marginBottom: 20,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <ThemedText type="body" bold tone="accent">
                {loading ? 'Summoning the Oracle…' : 'Summon the Oracle'}
              </ThemedText>
              <ThemedText type="small" tone="secondary" className="mt-1">
                {hasApiKey() ? 'Generate today’s strategy' : 'Add an OpenAI key in Settings to live-summon'}
              </ThemedText>
            </Pressable>
          )}

          {/* Daily quests */}
          {quests.length > 0 ? (
            <View className="mb-4">
              <SectionHeader
                title={`THE ORACLE'S QUESTS · ${doneQuests}/${quests.length}`}
                right={
                  <Button variant="ghost" shape="sharp" size="sm" onPress={() => generateReport(true).catch(() => {})}>
                    <RefreshCw size={13} color={theme.accent} />
                    Regenerate
                  </Button>
                }
              />
              <View className="gap-3">
                {quests.map((q) => (
                  <DailyQuestCard key={q.id} quest={q} onToggle={completeQuest} />
                ))}
              </View>
            </View>
          ) : null}

          {/* Random event */}
          {event ? (
            <View className="mb-4">
              <RandomEventCard event={event} onComplete={completeEvent} onDismiss={dismissEvent} />
            </View>
          ) : null}

          {/* Talk to the oracle */}
          <View className="mt-2">
            <Pressable
              onPress={() => router.push('/oracle-chat')}
              accessibilityRole="button"
              style={({ pressed }) => ({
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.accent,
                backgroundColor: theme.accentSoft,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <ThemedText type="body" bold tone="accent">Talk to the Oracle</ThemedText>
              <ThemedText type="caption" tone="secondary" className="mt-1">
                Ask, act, and let the Realm respond
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

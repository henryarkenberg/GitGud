import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getAiLogs, clearAiLogs, type AiLog } from '@/services/ai/openai';
import { useOracleStore } from '@/stores/useOracleStore';

function shortTime(ts: string): string {
  const d = new Date(ts);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
}

export default function OracleLogsScreen() {
  const { theme } = useAppTheme();
  const [logs, setLogs] = useState<AiLog[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const generateReport = useOracleStore((s) => s.generateReport);

  const reload = () => getAiLogs().then(setLogs).catch(() => {});

  useEffect(() => {
    reload();
  }, []);

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4" edges={['top', 'bottom']}>
        <ScreenHeader title="Oracle Logs" subtitle="The machine&apos;s whispered history" />

        <Button variant="outline" shape="sharp" size="sm" className="mb-3 self-start" onPress={() => generateReport(true).then(reload)}>
          Regenerate today&apos;s report
        </Button>

        <ScrollView contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
          {logs.length === 0 ? (
            <View className="rounded-xl border px-4 py-4" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
              <ThemedText type="small" tone="secondary">No generations yet. Summon the Oracle from your Today dashboard.</ThemedText>
            </View>
          ) : (
            <View className="gap-2">
              {logs.map((log) => (
                <Pressable
                  key={log.id}
                  onPress={() => setExpanded(expanded === log.id ? null : log.id)}
                  className="rounded-xl border px-4 py-3"
                  style={{ borderColor: log.ok ? theme.border : theme.danger, backgroundColor: theme.backgroundElevated }}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <ThemedText type="body" bold>{log.kind}</ThemedText>
                        <ThemedText type="caption" tone={log.ok ? 'success' : 'danger'}>
                          {log.ok ? 'OK' : 'FAILED'}
                        </ThemedText>
                      </View>
                      <ThemedText type="caption" tone="secondary" className="mt-0.5">
                        {shortTime(log.timestamp)} · {log.model}
                      </ThemedText>
                    </View>
                    {!log.ok ? <ThemedText type="caption" tone="danger" style={{ fontSize: 10 }}>{log.note}</ThemedText> : null}
                  </View>

                  {expanded === log.id ? (
                    <View className="mt-3 gap-2">
                      {log.prompt ? (
                        <View className="rounded-lg p-2" style={{ backgroundColor: theme.background }}>
                          <ThemedText type="caption" tone="secondary">PROMPT</ThemedText>
                          <ThemedText type="small" tone="secondary" className="mt-1">{log.prompt}</ThemedText>
                        </View>
                      ) : null}
                      {log.response ? (
                        <View className="rounded-lg p-2" style={{ backgroundColor: theme.background }}>
                          <ThemedText type="caption" tone="accent">RESPONSE</ThemedText>
                          <ThemedText type="small" className="mt-1">{log.response}</ThemedText>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </Pressable>
              ))}
            </View>
          )}

          {logs.length > 0 ? (
            <Button variant="danger" shape="sharp" size="sm" className="mt-4 self-start" onPress={async () => { await clearAiLogs(); reload(); }}>
              <Trash2 size={14} color="#fff" />
              Clear logs
            </Button>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

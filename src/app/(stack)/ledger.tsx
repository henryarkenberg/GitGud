import { useEffect, useState } from 'react';
import { Download } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { MODULE_LABELS } from '@/constants/progression';
import { exportLedger } from '@/utils/exportData';
import { getAllLedgerEntries } from '@/db/repositories/ledgerRepo';
import type { LedgerEntry } from '@/types';

const MODULES = ['sanctum', 'slumber', 'rituals', 'forge', 'vessel', 'covenant'];

function shortTime(ts: string): string {
  const d = new Date(ts);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
}

export default function LedgerScreen() {
  const { theme } = useAppTheme();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [search, setSearch] = useState('');
  const [module, setModule] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getAllLedgerEntries().then(setEntries).catch(() => {});
  }, []);

  const filtered = entries.filter((e) => {
    if (module && e.module !== module) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const hay = `${e.module} ${e.action} ${e.entityId}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4" edges={['top', 'bottom']}>
        <ScreenHeader title="The Ledger" subtitle="A chronicle of every deed" />

        <View className="mb-3">
          <Input label="Search" value={search} onChangeText={setSearch} placeholder="Search actions…" />
        </View>

        <View className="mb-3 flex-row flex-wrap gap-2">
          <Pressable
            onPress={() => setModule(null)}
            className="rounded-lg border px-3 py-1.5"
            style={{ borderColor: module === null ? theme.borderFocus : theme.border, backgroundColor: module === null ? theme.accentSoft : theme.background }}
          >
            <ThemedText type="small" bold style={{ color: module === null ? theme.accent : theme.textSecondary }}>
              All
            </ThemedText>
          </Pressable>
          {MODULES.map((m) => (
            <Pressable
              key={m}
              onPress={() => setModule(m)}
              className="rounded-lg border px-3 py-1.5"
              style={{ borderColor: module === m ? theme.borderFocus : theme.border, backgroundColor: module === m ? theme.accentSoft : theme.background }}
            >
              <ThemedText type="small" bold style={{ color: module === m ? theme.accent : theme.textSecondary }}>
                {MODULE_LABELS[m]}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Button variant="secondary" shape="sharp" size="sm" className="mb-3 self-start" loading={exporting} onPress={async () => { setExporting(true); await exportLedger(); setExporting(false); }}>
          <Download size={14} color={theme.text} />
          Export ledger
        </Button>

        <ScrollView contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View className="rounded-xl border px-4 py-4" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
              <ThemedText type="small" tone="secondary">No ledger entries match. Actions across all modules are recorded here.</ThemedText>
            </View>
          ) : (
            <View className="gap-2">
              {filtered.map((e) => {
                const statKeys = Object.keys(e.statChanges ?? {});
                return (
                  <View key={e.id} className="rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
                    <View className="flex-row items-center gap-3">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <ThemedText type="body" bold>
                            {MODULE_LABELS[e.module] ?? e.module}
                          </ThemedText>
                          <ThemedText type="caption" tone="secondary">
                            {e.action}
                          </ThemedText>
                        </View>
                        <ThemedText type="caption" tone="secondary" className="mt-0.5">
                          {shortTime(e.timestamp)}
                          {statKeys.length > 0 ? ` · ${statKeys.join(', ')}` : ''}
                        </ThemedText>
                      </View>
                      <ThemedText type="mono" tone={e.xpChange > 0 ? 'accent' : 'secondary'}>
                        {e.xpChange > 0 ? `+${e.xpChange}` : e.xpChange} XP
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

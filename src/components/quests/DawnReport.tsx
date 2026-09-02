import { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Sparkles } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { DawnReport as DawnReportType } from '@/types';

export interface DawnReportProps {
  report: DawnReportType;
  loading: boolean;
  onRegenerate: () => void;
  onOpenLogs: () => void;
}

export function DawnReport({ report, loading, onRegenerate, onOpenLogs }: DawnReportProps) {
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(false);

  return (
    <View className="rounded-2xl border p-4" style={{ borderColor: theme.accent, backgroundColor: theme.backgroundElevated }}>
      <Pressable onPress={() => setOpen(!open)} className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Sparkles size={16} color={theme.accent} />
          <ThemedText type="caption" tone="accent">
            DAWN REPORT
          </ThemedText>
        </View>
        {open ? <ChevronUp size={16} color={theme.textSecondary} /> : <ChevronDown size={16} color={theme.textSecondary} />}
      </Pressable>

      <ThemedText type="small" tone="secondary" className="mt-2 italic" style={{ color: theme.accent }}>
        “{report.flavorText}”
      </ThemedText>

      {open ? (
        <View className="mt-3 gap-2.5">
          <View>
            <ThemedText type="caption" tone="secondary">STRATEGIC ADVICE</ThemedText>
            <ThemedText type="small" className="mt-0.5">{report.strategicAdvice}</ThemedText>
          </View>

          <ThemedText type="caption" tone="secondary" className="mt-1">STAT FOCUS</ThemedText>
          <View className="flex-row flex-wrap gap-2">
            {report.statFocus.map((s) => (
              <View key={s} className="rounded-full px-3 py-1" style={{ backgroundColor: theme.accentSoft, borderColor: theme.accent, borderWidth: 1 }}>
                <ThemedText type="caption" tone="accent">{s}</ThemedText>
              </View>
            ))}
          </View>

          <ThemedText type="caption" tone="secondary" className="mt-1">SUMMARY</ThemedText>
          {Object.entries(report.summary).map(([k, v]) => (
            <View key={k} className="flex-row gap-2">
              <ThemedText type="small" tone="accent" style={{ width: 76 }}>{k}</ThemedText>
              <ThemedText type="small" tone="secondary" className="flex-1">{v}</ThemedText>
            </View>
          ))}

          <View className="mt-2 flex-row gap-2">
            <Pressable onPress={onRegenerate} className="flex-1 flex-row items-center justify-center gap-1 rounded-lg border px-3 py-2" style={{ borderColor: theme.border }}>
              <RefreshCw size={14} color={theme.accent} />
              <ThemedText type="caption" tone="accent">{loading ? 'Summoning…' : 'Regenerate'}</ThemedText>
            </Pressable>
            <Pressable onPress={onOpenLogs} className="flex-1 items-center justify-center rounded-lg border px-3 py-2" style={{ borderColor: theme.border }}>
              <ThemedText type="caption" tone="secondary">AI Logs</ThemedText>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

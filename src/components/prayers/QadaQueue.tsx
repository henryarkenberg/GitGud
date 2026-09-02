import { ShieldCheck } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { PRAYER_META } from '@/constants/prayers';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { QadaPrayer } from '@/types';

export interface QadaQueueProps {
  items: QadaPrayer[];
  onComplete: (id: string) => void;
  onCompleteAll: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
}

export function QadaQueue({ items, onComplete, onCompleteAll }: QadaQueueProps) {
  const { theme } = useAppTheme();

  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <ThemedText type="caption" tone="accent">
          QADA QUEUE · {items.length}
        </ThemedText>
        {items.length > 0 ? (
          <Button variant="ghost" shape="sharp" size="sm" onPress={onCompleteAll}>
            <ShieldCheck size={14} color={theme.info} />
            Complete All
          </Button>
        ) : null}
      </View>

      {items.length === 0 ? (
        <View
          className="rounded-xl border px-4 py-3"
          style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}
        >
          <ThemedText type="small" tone="secondary">
            The queue is clear. Every missed prayer has been reclaimed.
          </ThemedText>
        </View>
      ) : (
        <View className="gap-2">
          {items.map((item) => {
            const meta = PRAYER_META[item.prayerName] ?? PRAYER_META.fajr;
            return (
              <View
                key={item.id}
                className="flex-row items-center gap-3 rounded-xl border px-4 py-3"
                style={{
                  borderColor: theme.info,
                  backgroundColor: theme.accentSoft,
                }}
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <meta.icon size={15} color={theme.info} />
                    <ThemedText type="body" bold style={{ color: theme.info }}>
                      {meta.label}
                    </ThemedText>
                  </View>
                  <ThemedText type="caption" tone="secondary" className="mt-0.5">
                    Missed · {formatDate(item.originalDate)}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={() => onComplete(item.id)}
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: theme.info }}
                >
                  <ThemedText type="caption" bold style={{ color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' }}>
                    Pray
                  </ThemedText>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
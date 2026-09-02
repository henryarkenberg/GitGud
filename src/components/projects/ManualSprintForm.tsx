import { useState } from 'react';
import { Modal } from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Sprint } from '@/types';
import { formatDuration } from '@/utils/sleep';

interface Parts {
  day: number;
  hour: number;
  minute: number;
}

function parseParts(iso: string): Parts {
  const d = new Date(iso);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dayStart = new Date(d);
  dayStart.setHours(0, 0, 0, 0);
  return {
    day: Math.min(14, Math.max(0, Math.round((now.getTime() - dayStart.getTime()) / 86400000))),
    hour: d.getHours(),
    minute: d.getMinutes(),
  };
}

function buildISO(parts: Parts): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  now.setDate(now.getDate() - parts.day);
  const d = new Date(now);
  d.setHours(parts.hour, parts.minute, 0, 0);
  return d.toISOString();
}

function Stepper({ value, onChange, min, max, label }: { value: number; onChange: (v: number) => void; min: number; max: number; label: string }) {
  const { theme } = useAppTheme();
  const display = label === 'Day' ? (value === 0 ? 'Today' : value === 1 ? 'Yesterday' : `${value} days ago`) : String(value).padStart(2, '0');
  return (
    <View className="flex-row items-center justify-between">
      <ThemedText type="caption" tone="secondary" style={{ fontSize: 10 }}>
        {label}
      </ThemedText>
      <View className="flex-row items-center gap-2">
        <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={{ padding: 4 }}>
          <Minus size={16} color={theme.textSecondary} />
        </Pressable>
        <ThemedText type="mono" style={{ width: 72, textAlign: 'center', fontSize: 12 }}>
          {display}
        </ThemedText>
        <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={{ padding: 4 }}>
          <Plus size={16} color={theme.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

export interface ManualSprintFormProps {
  visible: boolean;
  initial?: Sprint | null;
  onClose: () => void;
  onSubmit: (input: { startTime: string; endTime: string; note: string }) => void;
}

export function ManualSprintForm({ visible, initial, onClose, onSubmit }: ManualSprintFormProps) {
  const { theme } = useAppTheme();
  const [start, setStart] = useState<Parts>(() => parseParts(initial?.startTime ?? buildISO({ day: 1, hour: 9, minute: 0 })));
  const [end, setEnd] = useState<Parts>(() => parseParts(initial?.endTime ?? buildISO({ day: 1, hour: 12, minute: 0 })));
  const [note, setNote] = useState(initial?.note ?? '');
  const startISO = buildISO(start);
  const endISO = buildISO(end);
  const invalid = new Date(endISO).getTime() <= new Date(startISO).getTime();
  const duration = invalid ? 0 : Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000);

  const submit = () => {
    if (invalid) return;
    onSubmit({ startTime: startISO, endTime: endISO, note: note.trim() });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-t-3xl border-t" style={{ borderColor: theme.border, backgroundColor: theme.background, maxHeight: '85%', overflow: 'hidden' }}>
          <SafeAreaView edges={['bottom']} className="px-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <ThemedText type="title">{initial ? 'Edit Sprint' : 'Log Sprint'}</ThemedText>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <X size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }} contentContainerClassName="pb-3">
              <View className="gap-3">
                <View className="gap-2 rounded-xl border p-3" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
                  <ThemedText type="caption" tone="accent">STARTED</ThemedText>
                  <Stepper label="Day" value={start.day} onChange={(v) => setStart({ ...start, day: v })} min={0} max={14} />
                  <Stepper label="Hour" value={start.hour} onChange={(v) => setStart({ ...start, hour: v })} min={0} max={23} />
                  <Stepper label="Minute" value={start.minute} onChange={(v) => setStart({ ...start, minute: v })} min={0} max={59} />
                </View>

                <View className="gap-2 rounded-xl border p-3" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
                  <ThemedText type="caption" tone="accent">ENDED</ThemedText>
                  <Stepper label="Day" value={end.day} onChange={(v) => setEnd({ ...end, day: v })} min={0} max={14} />
                  <Stepper label="Hour" value={end.hour} onChange={(v) => setEnd({ ...end, hour: v })} min={0} max={23} />
                  <Stepper label="Minute" value={end.minute} onChange={(v) => setEnd({ ...end, minute: v })} min={0} max={59} />
                </View>

                <View className="flex-row items-center justify-between">
                  <ThemedText type="small" tone="secondary">Duration</ThemedText>
                  <ThemedText type="mono" tone="accent">{invalid ? '—' : formatDuration(duration)}</ThemedText>
                </View>

                <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="What did you work on?" />

                {invalid ? <ThemedText type="small" tone="danger">End time must be after start time.</ThemedText> : null}
              </View>
            </ScrollView>

            <View className="pb-6 pt-3">
              <Button variant="primary" size="lg" onPress={submit} disabled={invalid}>
                {initial ? 'Save Changes' : 'Log Sprint'}
              </Button>
            </View>
          </SafeAreaView>
        </View>
      </ThemedView>
    </Modal>
  );
}

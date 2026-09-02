import { useState } from 'react';
import { Modal } from 'react-native';
import { X } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAppTheme } from '@/hooks/useAppTheme';
import { HABIT_COLORS, HABIT_ICON_NAMES, HABIT_ICONS } from '@/constants/rituals';
import { STAT_META } from '@/constants/theme';
import type { Project, ProjectStatus, StatName } from '@/types';

const STATUSES: ProjectStatus[] = ['active', 'paused', 'completed', 'archived'];

export interface ProjectFormProps {
  visible: boolean;
  initial?: Project | null;
  onClose: () => void;
  onSubmit: (input: { name: string; description: string; color: string; icon: string; relatedStat: StatName; targetHours: number | null; status?: ProjectStatus }) => void;
}

export function ProjectForm({ visible, initial, onClose, onSubmit }: ProjectFormProps) {
  const { theme } = useAppTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [color, setColor] = useState(initial?.color ?? HABIT_COLORS[0]);
  const [icon, setIcon] = useState(initial?.icon ?? 'hammer');
  const [stat, setStat] = useState<StatName>(initial?.relatedStat ?? 'focus');
  const [target, setTarget] = useState(initial?.targetHours ? String(initial.targetHours) : '');
  const [hasTarget, setHasTarget] = useState(initial?.targetHours !== null && initial?.targetHours !== undefined);
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'active');
  const [error, setError] = useState('');

  const submit = () => {
    if (!name.trim()) {
      setError('Name the project.');
      return;
    }
    const hours = hasTarget && target.trim() !== '' ? Number(target) : null;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      relatedStat: stat,
      targetHours: Number.isFinite(hours as number) && (hours as number) > 0 ? (hours as number) : null,
      status: initial ? status : undefined,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-t-3xl border-t" style={{ borderColor: theme.border, backgroundColor: theme.background, maxHeight: '85%', overflow: 'hidden' }}>
          <SafeAreaView edges={['bottom']} className="px-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <ThemedText type="title">{initial ? 'Edit Project' : 'New Project'}</ThemedText>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <X size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }} contentContainerClassName="pb-3">
              <View className="gap-3">
                <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Learn Rust" />
                <Input label="Description" value={description} onChangeText={setDescription} placeholder="Optional" multiline />

                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    ICON
                  </ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {HABIT_ICON_NAMES.map((n) => {
                        const IC = HABIT_ICONS[n];
                        const selected = n === icon;
                        return (
                          <Pressable
                            key={n}
                            onPress={() => setIcon(n)}
                            style={{ width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: selected ? color : theme.border, backgroundColor: selected ? theme.accentSoft : theme.background, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <IC size={16} color={selected ? color : theme.textSecondary} />
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>

                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    COLOR
                  </ThemedText>
                  <View className="flex-row flex-wrap gap-2">
                    {HABIT_COLORS.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => setColor(c)}
                        style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c, borderWidth: color === c ? 2 : 0, borderColor: theme.text, alignItems: 'center', justifyContent: 'center' }}
                      >
                        {color === c ? <ThemedText type="caption" bold style={{ color: '#FFF' }}>✓</ThemedText> : null}
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View>
                  <ThemedText type="caption" tone="secondary" className="mb-1.5">
                    RELATED STAT
                  </ThemedText>
                  <View className="flex-row flex-wrap gap-2">
                    {(Object.keys(STAT_META) as StatName[]).map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => setStat(s)}
                        className="rounded-lg border px-3 py-1.5"
                        style={{ borderColor: stat === s ? theme.borderFocus : theme.border, backgroundColor: stat === s ? theme.accentSoft : theme.background }}
                      >
                        <ThemedText type="small" bold style={{ color: stat === s ? theme.accent : theme.textSecondary }}>
                          {STAT_META[s].label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Pressable onPress={() => setHasTarget(!hasTarget)} className="flex-row items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: hasTarget ? theme.borderFocus : theme.border, backgroundColor: theme.background }}>
                  <ThemedText type="body" bold>
                    Estimated target (progress ring)
                  </ThemedText>
                  <ThemedText type="mono" tone="accent">
                    {hasTarget ? 'Yes' : 'No'}
                  </ThemedText>
                </Pressable>

                {hasTarget ? (
                  <Input label="Target hours" value={target} onChangeText={setTarget} placeholder="e.g. 20" keyboardType="numeric" />
                ) : null}

                {initial ? (
                  <View>
                    <ThemedText type="caption" tone="secondary" className="mb-1.5">
                      STATUS
                    </ThemedText>
                    <View className="flex-row flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <Pressable
                          key={s}
                          onPress={() => setStatus(s)}
                          className="rounded-lg border px-3 py-1.5"
                          style={{ borderColor: status === s ? theme.borderFocus : theme.border, backgroundColor: status === s ? theme.accentSoft : theme.background }}
                        >
                          <ThemedText type="small" bold style={{ color: status === s ? theme.accent : theme.textSecondary }}>
                            {s}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}

                {error ? <ThemedText type="small" tone="danger">{error}</ThemedText> : null}
              </View>
            </ScrollView>

            <View className="pb-6 pt-3">
              <Button variant="primary" size="lg" onPress={submit}>
                {initial ? 'Save Changes' : 'Create Project'}
              </Button>
            </View>
          </SafeAreaView>
        </View>
      </ThemedView>
    </Modal>
  );
}

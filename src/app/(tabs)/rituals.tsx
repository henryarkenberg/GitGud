import { useState } from 'react';
import { Modal } from 'react-native';
import { Archive, ArchiveRestore, Pencil, Snowflake, Trash2 } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { RitualGrid } from '@/components/habits/RitualGrid';
import { HabitForm } from '@/components/habits/HabitForm';
import { QuestBoard } from '@/components/quests/QuestBoard';
import { QuestForm } from '@/components/quests/QuestForm';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { STREAK_FREEZE_WINDOW_DAYS } from '@/constants/rituals';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useHabitStore } from '@/stores/useHabitStore';
import { useQuestStore } from '@/stores/useQuestStore';
import type { Habit, Objective } from '@/types';

type Mode = 'rituals' | 'quests';

export default function RitualsScreen() {
  const { theme } = useAppTheme();
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const toggleHabit = useHabitStore((s) => s.toggleHabit);
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const setArchived = useHabitStore((s) => s.setArchived);
  const freezeToday = useHabitStore((s) => s.freezeToday);

  const objectives = useQuestStore((s) => s.objectives);
  const addObjective = useQuestStore((s) => s.addObjective);
  const updateObjective = useQuestStore((s) => s.updateObjective);
  const deleteObjective = useQuestStore((s) => s.deleteObjective);
  const completeQuest = useQuestStore((s) => s.complete);
  const setQuestStatus = useQuestStore((s) => s.setStatus);
  const reopenQuest = useQuestStore((s) => s.reopen);

  const [mode, setMode] = useState<Mode>('rituals');
  const [habitForm, setHabitForm] = useState<{ open: boolean; initial: Habit | null }>({ open: false, initial: null });
  const [habitNonce, setHabitNonce] = useState(0);
  const [questForm, setQuestForm] = useState<{ open: boolean; initial: Objective | null }>({ open: false, initial: null });
  const [questNonce, setQuestNonce] = useState(0);
  const [habitAction, setHabitAction] = useState<Habit | null>(null);

  const archived = habits.filter((h) => h.isArchived);

  const freezeEnabled = (habit: Habit) => {
    if (!habit.lastFreezeDate) return true;
    const last = new Date(habit.lastFreezeDate).getTime();
    const now = new Date().getTime();
    return now - last >= STREAK_FREEZE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  };

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView contentContainerClassName="px-4 pb-12" showsVerticalScrollIndicator={false}>
          <View className="mb-5">
            <ThemedText type="caption" tone="accent">
              THE DISCIPLE&apos;S DISCIPLINE
            </ThemedText>
            <ThemedText type="display" className="mt-0.5">
              Rituals
            </ThemedText>
            <ThemedText type="small" tone="secondary" className="mt-1">
              Repetition forges identity. Purpose drives action.
            </ThemedText>
          </View>

          {/* Segmented control */}
          <View className="mb-5 flex-row rounded-xl border p-1" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
            {(['rituals', 'quests'] as Mode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                className="flex-1 items-center rounded-lg py-2"
                style={{ backgroundColor: mode === m ? theme.accent : 'transparent' }}
              >
                <ThemedText type="small" bold style={{ color: mode === m ? (theme.name === 'dark' ? '#0B0F19' : '#FFFFFF') : theme.textSecondary }}>
                  {m === 'rituals' ? 'Habits' : 'Quests'}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {mode === 'rituals' ? (
            <>
              <RitualGrid
                habits={habits}
                logs={logs}
                onToggle={toggleHabit}
                onEdit={(h) => setHabitAction(h)}
                onAdd={() => { setHabitNonce((n) => n + 1); setHabitForm({ open: true, initial: null }); }}
              />

              {archived.length > 0 ? (
                <View className="mt-6">
                  <SectionHeader title="ARCHIVE" right={<ThemedText type="caption" tone="secondary">{archived.length}</ThemedText>} />
                  <View className="gap-2">
                    {archived.map((h) => (
                      <View key={h.id} className="flex-row items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
                        <View className="flex-1">
                          <ThemedText type="body">{h.title}</ThemedText>
                          <ThemedText type="caption" tone="secondary" className="mt-0.5">
                            Archived
                          </ThemedText>
                        </View>
                        <Button variant="ghost" shape="sharp" size="sm" onPress={() => setArchived(h.id, false)}>
                          <ArchiveRestore size={14} color={theme.accent} />
                          Unarchive
                        </Button>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <QuestBoard
              objectives={objectives}
              onComplete={completeQuest}
              onFail={(id) => setQuestStatus(id, 'failed')}
              onAbandon={(id) => setQuestStatus(id, 'abandoned')}
              onReopen={reopenQuest}
                onEdit={(o) => { setQuestNonce((n) => n + 1); setQuestForm({ open: true, initial: o }); }}
              onDelete={deleteObjective}
                onAdd={() => { setQuestNonce((n) => n + 1); setQuestForm({ open: true, initial: null }); }}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Habit form */}
      <HabitForm
        key={habitNonce}
        visible={habitForm.open}
        initial={habitForm.initial}
        onClose={() => setHabitForm({ open: false, initial: null })}
        onSubmit={async (input) => {
          if (habitForm.initial) {
            await updateHabit(habitForm.initial.id, input);
          } else {
            await addHabit(input);
          }
          setHabitForm({ open: false, initial: null });
        }}
      />

      {/* Quest form */}
      <QuestForm
        key={questNonce}
        visible={questForm.open}
        initial={questForm.initial}
        onClose={() => setQuestForm({ open: false, initial: null })}
        onSubmit={async (input) => {
          if (questForm.initial) {
            await updateObjective(questForm.initial.id, input);
          } else {
            await addObjective(input);
          }
          setQuestForm({ open: false, initial: null });
        }}
      />

      {/* Habit long-press actions */}
      <Modal visible={habitAction !== null} transparent animationType="fade" onRequestClose={() => setHabitAction(null)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          {habitAction ? (
            <View className="w-4/5 rounded-2xl border p-4" style={{ borderColor: theme.borderFocus, backgroundColor: theme.backgroundElevated }}>
              <ThemedText type="title" className="mb-3 text-center">
                {habitAction.title}
              </ThemedText>
              <View className="gap-2">
                <Button variant="secondary" shape="sharp" onPress={() => { setHabitNonce((n) => n + 1); setHabitForm({ open: true, initial: habitAction }); setHabitAction(null); }}>
                  <Pencil size={15} color={theme.text} />
                  Edit
                </Button>
                <Button variant="secondary" shape="sharp" disabled={!freezeEnabled(habitAction)} onPress={() => { freezeToday(habitAction.id); setHabitAction(null); }}>
                  <Snowflake size={15} color={theme.text} />
                  {freezeEnabled(habitAction) ? 'Freeze today (1/wk)' : 'Freeze used this week'}
                </Button>
                <Button variant="secondary" shape="sharp" onPress={() => { setArchived(habitAction.id, !habitAction.isArchived); setHabitAction(null); }}>
                  {habitAction.isArchived ? <ArchiveRestore size={15} color={theme.text} /> : <Archive size={15} color={theme.text} />}
                  {habitAction.isArchived ? 'Unarchive' : 'Archive'}
                </Button>
                <Button variant="danger" shape="sharp" onPress={() => { deleteHabit(habitAction.id); setHabitAction(null); }}>
                  <Trash2 size={15} color="#fff" />
                  Delete
                </Button>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </ThemedView>
  );
}

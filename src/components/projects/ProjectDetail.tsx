import { useMemo, useState } from 'react';
import { Check, ChevronLeft, Flame, Plus, Trash2 } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useForgeStore } from '@/stores/useForgeStore';
import { SprintTimeline } from '@/components/projects/SprintTimeline';
import { TaskForm } from '@/components/projects/TaskForm';
import { ManualSprintForm } from '@/components/projects/ManualSprintForm';
import type { Project, Sprint } from '@/types';
import { formatDuration } from '@/utils/sleep';
import { isTaskDueToday } from '@/utils/forge';

export interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ProgressRing({ ratio, color, size = 84, line = 8 }: { ratio: number; color: string; size?: number; line?: number }) {
  const { theme } = useAppTheme();
  const r = (size - line) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(1, Math.max(0, ratio)));
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.background} strokeWidth={line} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={line}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

export function ProjectDetail({ project, onBack, onEdit, onDelete }: ProjectDetailProps) {  const { theme } = useAppTheme();
  const allTasks = useForgeStore((s) => s.tasks);
  const allSprints = useForgeStore((s) => s.sprints);
  const toggleTask = useForgeStore((s) => s.toggleTask);
  const deleteTask = useForgeStore((s) => s.deleteTask);
  const addTask = useForgeStore((s) => s.addTask);
  const startSprint = useForgeStore((s) => s.startSprint);
  const addManualSprint = useForgeStore((s) => s.addManualSprint);
  const updateSprint = useForgeStore((s) => s.updateSprint);
  const deleteSprint = useForgeStore((s) => s.deleteSprint);

  const [taskOpen, setTaskOpen] = useState(false);
  const [sprintForm, setSprintForm] = useState<{ open: boolean; initial: Sprint | null }>({ open: false, initial: null });

  const tasks = useMemo(() => allTasks.filter((t) => t.projectId === project.id), [allTasks, project.id]);
  const sprints = useMemo(() => allSprints.filter((s) => s.projectId === project.id), [allSprints, project.id]);
  const done = tasks.filter((t) => t.status === 'done').length;
  const ratio = project.targetHours ? project.totalTimeSpentMinutes / (project.targetHours * 60) : 0;
  const xpTotal = sprints.reduce((a, s) => a + s.xpEarned, 0);

  const openSprintForm = (initial: Sprint | null) => setSprintForm({ open: true, initial });

  return (
    <View>
      {/* Header */}
      <View className="mb-4 flex-row items-center gap-3">
        <Pressable onPress={onBack} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: theme.backgroundElevated, borderColor: theme.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={20} color={theme.text} />
        </Pressable>
        <View className="flex-1">
          <ThemedText type="title" numberOfLines={1}>
            {project.name}
          </ThemedText>
          <ThemedText type="small" tone="secondary" className="mt-0.5">
            {project.status} · {formatDuration(project.totalTimeSpentMinutes)} forged
          </ThemedText>
        </View>
        <Pressable onPress={onEdit} style={{ padding: 6 }}>
          <ThemedText type="caption" tone="accent">Edit</ThemedText>
        </Pressable>
        <Pressable onPress={onDelete} style={{ padding: 6 }}>
          <Trash2 size={18} color={theme.danger} />
        </Pressable>
      </View>

      {/* Progress */}
      <View className="mb-4 flex-row items-center gap-4 rounded-2xl border p-4" style={{ borderColor: project.color, backgroundColor: theme.backgroundElevated }}>
        <ProgressRing ratio={ratio} color={project.color} />
        <View className="flex-1">
          <ThemedText type="body" bold>
            {project.targetHours ? `${Math.round(ratio * 100)}% to target` : 'No target set'}
          </ThemedText>
          <ThemedText type="small" tone="secondary" className="mt-0.5">
            {formatDuration(project.totalTimeSpentMinutes)} of {project.targetHours ? `${project.targetHours}h` : '—'}
          </ThemedText>
          <ThemedText type="small" tone="secondary" className="mt-1">
            {xpTotal} XP earned
          </ThemedText>
        </View>
      </View>

      {/* Begin sprint */}
      <View className="mb-5">
        <Pressable
          onPress={() => startSprint(project.id)}
          className="flex-row items-center justify-center gap-2 rounded-xl py-3"
          style={{ backgroundColor: project.color }}
        >
          <Flame size={18} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} />
          <ThemedText type="body" bold style={{ color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' }}>
            Begin a Sprint
          </ThemedText>
        </Pressable>
      </View>

      {/* Tasks */}
      <View className="mb-5">
        <View className="mb-2 flex-row items-center justify-between">
          <ThemedText type="caption" tone="accent">TASKS · {done}/{tasks.length}</ThemedText>
          <Pressable onPress={() => setTaskOpen(true)} className="flex-row items-center gap-1">
            <Plus size={14} color={theme.accent} />
            <ThemedText type="caption" tone="accent">Add</ThemedText>
          </Pressable>
        </View>

        {tasks.length === 0 ? (
          <View className="rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
            <ThemedText type="small" tone="secondary">No tasks. Break the forge into actionable pieces.</ThemedText>
          </View>
        ) : (
          <View className="gap-2">
            {tasks.map((t) => {
              const isDone = t.status === 'done';
              const dueToday = !isDone && isTaskDueToday(t, new Date());
              return (
                <Pressable key={t.id} onPress={() => toggleTask(t.id)} className="flex-row items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
                  <View className="h-6 w-6 items-center justify-center rounded-full border" style={{ borderColor: isDone ? project.color : theme.border, backgroundColor: isDone ? project.color : 'transparent' }}>
                    {isDone ? <Check size={14} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} /> : null}
                  </View>
                  <View className="flex-1">
                    <ThemedText type="body" style={{ textDecorationLine: isDone ? 'line-through' : 'none', color: isDone ? theme.textSecondary : theme.text }}>
                      {t.title}
                    </ThemedText>
                    <ThemedText type="caption" tone="secondary" className="mt-0.5">
                      {t.type === 'recurring' ? 'recurring' : 'once'} · {t.xpReward} XP
                      {t.type === 'recurring' && dueToday ? ' · due' : ''}
                    </ThemedText>
                  </View>
                  <Pressable onPress={() => deleteTask(t.id)} style={{ padding: 4 }}>
                    <Trash2 size={15} color={theme.danger} />
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Sprint log */}
      <SprintTimeline
        sprints={sprints}
        onAdd={() => openSprintForm(null)}
        onEdit={(s) => openSprintForm(s)}
        onDelete={deleteSprint}
      />

      <TaskForm
        visible={taskOpen}
        onClose={() => setTaskOpen(false)}
        onSubmit={async (input) => {
          await addTask({ ...input, projectId: project.id });
          setTaskOpen(false);
        }}
      />

      <ManualSprintForm
        visible={sprintForm.open}
        initial={sprintForm.initial}
        onClose={() => setSprintForm({ open: false, initial: null })}
        onSubmit={async (input) => {
          if (sprintForm.initial) {
            await updateSprint(sprintForm.initial.id, input);
          } else {
            await addManualSprint({ ...input, projectId: project.id });
          }
          setSprintForm({ open: false, initial: null });
        }}
      />
    </View>
  );
}

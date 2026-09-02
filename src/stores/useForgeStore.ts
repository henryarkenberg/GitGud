import * as Haptics from 'expo-haptics';
import { create } from 'zustand';

import {
  deleteProject as deleteProjectRepo,
  deleteSprint as deleteSprintRepo,
  deleteTask as deleteTaskRepo,
  getProjects,
  getSprints,
  getTasks,
  insertProject,
  insertSprint,
  insertTask,
  updateProject,
  updateSprint,
  updateTask,
} from '@/db/repositories/projectRepo';
import type {
  HabitRepeatPattern,
  Project,
  ProjectStatus,
  ProjectTask,
  ProjectTaskType,
  Sprint,
  StatName,
} from '@/types';
import { createId, todayISO } from '@/utils/id';
import { sprintXp } from '@/utils/forge';
import { awardXp } from '@/services/progression';
import { cancelSprintBreak, scheduleSprintBreak } from '@/services/notifications';

interface AddTaskInput {
  projectId: string;
  title: string;
  type: ProjectTaskType;
  repeatPattern?: HabitRepeatPattern;
  deadline?: string | null;
  xpReward: number;
}

interface ForgeState {
  projects: Project[];
  tasks: ProjectTask[];
  sprints: Sprint[];
  runningSprint: Sprint | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addProject: (input: { name: string; description: string; color: string; icon: string; relatedStat: StatName; targetHours: number | null }) => Promise<void>;
  updateProject: (id: string, patch: Partial<Pick<Project, 'name' | 'description' | 'color' | 'icon' | 'relatedStat' | 'targetHours'>>) => Promise<void>;
  setProjectStatus: (id: string, status: ProjectStatus) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (input: AddTaskInput) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  startSprint: (projectId: string) => Promise<void>;
  pauseSprint: (id: string) => Promise<void>;
  resumeSprint: (id: string) => Promise<void>;
  stopSprint: (id: string) => Promise<void>;
  addManualSprint: (input: { projectId: string; startTime: string; endTime: string; note: string }) => Promise<void>;
  updateSprint: (id: string, patch: Partial<Pick<Sprint, 'note' | 'startTime' | 'endTime'>>) => Promise<void>;
  deleteSprint: (id: string) => Promise<void>;
}
export const useForgeStore = create<ForgeState>()((set, get) => {
  async function applyTotals(projects: Project[], sprints: Sprint[]): Promise<Project[]> {
    const sumByProject = new Map<string, number>();
    for (const s of sprints) {
      if (s.isRunning) continue;
      sumByProject.set(s.projectId, (sumByProject.get(s.projectId) ?? 0) + s.durationMinutes);
    }
    const next: Project[] = [];
    for (const p of projects) {
      const total = sumByProject.get(p.id) ?? 0;
      if (total !== p.totalTimeSpentMinutes) {
        await updateProject(p.id, { totalTimeSpentMinutes: total });
        next.push({ ...p, totalTimeSpentMinutes: total });
      } else {
        next.push(p);
      }
    }
    return next;
  }

  async function load() {
    const [projects, tasks, sprints] = await Promise.all([getProjects(), getTasks(), getSprints()]);
    const updated = await applyTotals(projects, sprints);
    set({ projects: updated, tasks, sprints, runningSprint: sprints.find((s) => s.endTime === null) ?? null, hydrated: true });
  }

  function segmentDelta(sprint: Sprint): number {
    const start = new Date(sprint.startTime).getTime();
    if (Number.isNaN(start)) return 0;
    return Math.max(0, Math.floor((Date.now() - start) / 1000));
  }

  return {
    projects: [],
    tasks: [],
    sprints: [],
    runningSprint: null,
    hydrated: false,

    hydrate: async () => {
      try {
        await load();
      } catch (error) {
        console.error('Failed to hydrate forge', error);
        set({ hydrated: true });
      }
    },

    addProject: async (input) => {
      const project: Project = {
        id: createId('proj'),
        name: input.name,
        description: input.description,
        color: input.color,
        icon: input.icon,
        status: 'active',
        totalTimeSpentMinutes: 0,
        targetHours: input.targetHours,
        relatedStat: input.relatedStat,
        createdAt: new Date().toISOString(),
      };
      await insertProject(project);
      await load();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    },

    updateProject: async (id, patch) => {
      await updateProject(id, patch);
      await load();
    },

    setProjectStatus: async (id, status) => {
      await updateProject(id, { status });
      await load();
    },

    deleteProject: async (id) => {
      await deleteProjectRepo(id);
      await load();
    },

    addTask: async (input) => {
      const task: ProjectTask = {
        id: createId('task'),
        projectId: input.projectId,
        title: input.title,
        type: input.type,
        repeatPattern: input.type === 'recurring' ? input.repeatPattern ?? { type: 'daily' } : { type: 'daily' },
        status: 'pending',
        deadline: input.deadline ?? null,
        xpReward: input.xpReward,
        lastCompletedDate: null,
        createdAt: new Date().toISOString(),
      };
      await insertTask(task);
      await load();
    },

    toggleTask: async (id) => {
      const today = todayISO();
      const task = get().tasks.find((t) => t.id === id);
      if (!task) return;
      if (task.type === 'once') {
        if (task.status === 'done') {
          await updateTask(id, { status: 'pending', lastCompletedDate: null });
        } else {
          await updateTask(id, { status: 'done', lastCompletedDate: today });
        }
      } else {
        if (task.status === 'done' && task.lastCompletedDate === today) {
          await updateTask(id, { status: 'pending', lastCompletedDate: null });
        } else {
          await updateTask(id, { status: 'done', lastCompletedDate: today });
        }
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await load();
    },

    deleteTask: async (id) => {
      await deleteTaskRepo(id);
      await load();
    },

    startSprint: async (projectId) => {
      const running = get().runningSprint;
      if (running) {
        await get().stopSprint(running.id);
      }
      const now = new Date().toISOString();
      await insertSprint({
        id: createId('sprint'),
        projectId,
        startTime: now,
        endTime: null,
        durationMinutes: 0,
        note: '',
        isRunning: true,
        accumulatedSeconds: 0,
        xpEarned: 0,
        createdAt: now,
      });
      await load();
      const project = get().projects.find((p) => p.id === projectId);
      void scheduleSprintBreak(project?.name ?? 'The Forge').catch(() => {});
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    },

    pauseSprint: async (id) => {
      const sprint = get().sprints.find((s) => s.id === id);
      if (!sprint) return;
      const accumulated = sprint.accumulatedSeconds + segmentDelta(sprint);
      await updateSprint(id, { isRunning: false, accumulatedSeconds: accumulated });
      void cancelSprintBreak().catch(() => {});
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await load();
    },

    resumeSprint: async (id) => {
      await updateSprint(id, { isRunning: true, startTime: new Date().toISOString() });
      const sprint = get().sprints.find((s) => s.id === id);
      const project = sprint ? get().projects.find((p) => p.id === sprint.projectId) : null;
      void scheduleSprintBreak(project?.name ?? 'The Forge').catch(() => {});
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await load();
    },

    stopSprint: async (id) => {
      const sprint = get().sprints.find((s) => s.id === id);
      if (!sprint) return;
      const accumulated = sprint.accumulatedSeconds + (sprint.isRunning ? segmentDelta(sprint) : 0);
      const duration = Math.round(accumulated / 60);
      const xp = sprintXp(duration);
      await updateSprint(id, {
        isRunning: false,
        accumulatedSeconds: accumulated,
        durationMinutes: duration,
        endTime: new Date().toISOString(),
        xpEarned: xp,
      });
      void awardXp({ module: 'forge', action: 'sprint', entityId: id, xp, statChanges: { focus: Math.floor(duration / 25) } });
      void cancelSprintBreak().catch(() => {});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await load();
    },

    addManualSprint: async ({ projectId, startTime, endTime, note }) => {
      const duration = Math.max(0, Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000));
      await insertSprint({
        id: createId('sprint'),
        projectId,
        startTime,
        endTime,
        durationMinutes: duration,
        note,
        isRunning: false,
        accumulatedSeconds: duration * 60,
        xpEarned: sprintXp(duration),
        createdAt: new Date().toISOString(),
      });
      void awardXp({ module: 'forge', action: 'sprint', entityId: projectId, xp: sprintXp(duration), statChanges: { focus: Math.floor(duration / 25) } });
      await load();
    },

    updateSprint: async (id, patch) => {
      const sprint = get().sprints.find((s) => s.id === id);
      if (!sprint) return;
      const nextStart = patch.startTime ?? sprint.startTime;
      const nextEnd = patch.endTime ?? sprint.endTime;
      const duration =
        patch.startTime !== undefined || patch.endTime !== undefined
          ? nextEnd
            ? Math.max(0, Math.round((new Date(nextEnd).getTime() - new Date(nextStart).getTime()) / 60000))
            : sprint.durationMinutes
          : sprint.durationMinutes;
      await updateSprint(id, {
        note: patch.note,
        startTime: patch.startTime,
        endTime: patch.endTime,
        durationMinutes: duration,
      });
      await load();
    },

    deleteSprint: async (id) => {
      await deleteSprintRepo(id);
      await load();
    },
  };
});

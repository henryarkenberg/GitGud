import * as Haptics from 'expo-haptics';
import { create } from 'zustand';

import { OBJECTIVE_DIFFICULTIES } from '@/constants/rituals';
import { awardXp } from '@/services/progression';
import {
  deleteObjective as deleteObjectiveRepo,
  getObjectives,
  insertObjective,
  updateObjective,
} from '@/db/repositories/objectiveRepo';
import type { Objective, ObjectiveDifficulty, ObjectiveStatus, StatName } from '@/types';
import { createId } from '@/utils/id';
import { objectiveXpAward } from '@/utils/rituals';

interface QuestState {
  objectives: Objective[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addObjective: (input: {
    title: string;
    description: string;
    deadline: string | null;
    difficulty: ObjectiveDifficulty;
    relatedStat: StatName;
    tags: string[];
  }) => Promise<void>;
  updateObjective: (
    id: string,
    patch: Partial<Pick<Objective, 'title' | 'description' | 'deadline' | 'difficulty' | 'tags' | 'relatedStat'>>,
  ) => Promise<void>;
  deleteObjective: (id: string) => Promise<void>;
  complete: (id: string) => Promise<void>;
  setStatus: (id: string, status: ObjectiveStatus) => Promise<void>;
  reopen: (id: string) => Promise<void>;
}

export const useQuestStore = create<QuestState>()((set, get) => ({
  objectives: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const objectives = await getObjectives();
      set({ objectives, hydrated: true });
    } catch (error) {
      console.error('Failed to hydrate quests', error);
      set({ hydrated: true });
    }
  },

  addObjective: async (input) => {
    const xpReward = OBJECTIVE_DIFFICULTIES[input.difficulty].xp;
    const objective: Objective = {
      id: createId('quest'),
      title: input.title,
      description: input.description,
      deadline: input.deadline,
      difficulty: input.difficulty,
      status: 'active',
      tags: input.tags,
      relatedStat: input.relatedStat,
      xpReward,
      createdAt: new Date().toISOString(),
      completedAt: null,
      isGeneratedByAI: false,
    };
    await insertObjective(objective);
    const objectives = await getObjectives();
    set({ objectives });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  updateObjective: async (id, patch) => {
    const current = get().objectives.find((o) => o.id === id);
    if (!current) return;
    const finalPatch =
      patch.difficulty !== undefined && patch.difficulty !== current.difficulty
        ? { ...patch, xpReward: OBJECTIVE_DIFFICULTIES[patch.difficulty].xp }
        : patch;
    await updateObjective(id, finalPatch);
    const objectives = await getObjectives();
    set({ objectives });
  },

  deleteObjective: async (id) => {
    await deleteObjectiveRepo(id);
    const objectives = get().objectives.filter((o) => o.id !== id);
    set({ objectives });
  },

  complete: async (id) => {
    const current = get().objectives.find((o) => o.id === id);
    if (!current) return;
    const completedAt = new Date();
    const award = objectiveXpAward(current, completedAt);
    await updateObjective(id, {
      status: 'completed',
      xpReward: award,
      completedAt: completedAt.toISOString(),
    });
    void awardXp({ module: 'rituals', action: 'objective', entityId: id, xp: award, statChanges: { [current.relatedStat]: 2 } });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const objectives = await getObjectives();
    set({ objectives });
  },

  setStatus: async (id, status) => {
    const current = get().objectives.find((o) => o.id === id);
    if (!current) return;
    await updateObjective(id, { status, completedAt: status === 'completed' ? new Date().toISOString() : current.completedAt });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const objectives = await getObjectives();
    set({ objectives });
  },

  reopen: async (id) => {
    const current = get().objectives.find((o) => o.id === id);
    if (!current) return;
    await updateObjective(id, {
      status: 'active',
      completedAt: null,
      xpReward: OBJECTIVE_DIFFICULTIES[current.difficulty].xp,
    });
    const objectives = await getObjectives();
    set({ objectives });
  },
}));

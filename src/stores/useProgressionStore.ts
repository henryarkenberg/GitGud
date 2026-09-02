import { create } from 'zustand';

export interface LevelUpEvent {
  id: string;
  level: number;
  spGained: number;
  module: string;
}

interface ProgressionState {
  levelUps: LevelUpEvent[];
  pushLevelUp: (input: { level: number; spGained: number; module: string }) => void;
  drainLevelUp: (id: string) => void;
}

export const useProgressionStore = create<ProgressionState>()((set, get) => ({
  levelUps: [],
  pushLevelUp: (input) => {
    const event: LevelUpEvent = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ...input };
    set({ levelUps: [...get().levelUps, event] });
  },
  drainLevelUp: (id) => {
    set({ levelUps: get().levelUps.filter((e) => e.id !== id) });
  },
}));

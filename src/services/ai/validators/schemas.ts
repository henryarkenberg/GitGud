import { z } from 'zod';

import type { DailyQuestCategory, DailyQuestDifficulty } from '@/types';

const STATS = ['faith', 'discipline', 'strength', 'agility', 'vitality', 'wisdom', 'focus', 'charisma', 'empathy'];

export const NodeDiscoverySchema = z.object({
  options: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        nodeType: z.enum(['stat', 'badge', 'ability', 'milestone']),
        rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
        relatedStat: z.enum(STATS as [string, ...string[]]),
        costSp: z.number().int().nonnegative(),
        rewards: z.object({
          stats: z.record(z.string(), z.number()).optional(),
          passive: z.string().optional(),
          ability: z.string().optional(),
        }),
        requirements: z.object({
          minStat: z.string().optional(),
          minValue: z.number().optional(),
          activityProof: z.string().optional(),
        }),
      }),
    )
    .length(3),
});

export type NodeDiscoveryInput = z.infer<typeof NodeDiscoverySchema>;


export const DailyReportSchema = z.object({
  summary: z.object({
    prayer: z.string(),
    sleep: z.string(),
    projects: z.string(),
    fitness: z.string(),
    relations: z.string(),
    habits: z.string(),
  }),
  priorities: z.object({
    urgent: z.array(z.string()),
    important: z.array(z.string()),
    growth: z.array(z.string()),
  }),
  dailyQuests: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      category: z.enum(['prayer', 'sleep', 'project', 'fitness', 'relation', 'habit']),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      xpReward: z.number().int().nonnegative(),
      relatedStat: z.string(),
      isCheckable: z.boolean().optional(),
    }),
  ),
  strategicAdvice: z.string(),
  statFocus: z.array(z.string()),
  flavorText: z.string(),
});

export type DailyReportInput = z.infer<typeof DailyReportSchema>;

export const RandomEventSchema = z.object({
  type: z.string(),
  title: z.string(),
  description: z.string(),
  xpReward: z.number().int().nonnegative(),
  statFocus: z.string(),
});

export type RandomEventInput = z.infer<typeof RandomEventSchema>;

export const QUESTS: DailyQuestCategory[] = ['prayer', 'sleep', 'project', 'fitness', 'relation', 'habit'];
export const DIFFICULTIES: DailyQuestDifficulty[] = ['easy', 'medium', 'hard'];

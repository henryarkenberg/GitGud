import type { DailyQuestCategory } from '@/types';

interface FallbackTemplate {
  category: DailyQuestCategory;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  relatedStat: 'faith' | 'discipline' | 'strength' | 'agility' | 'vitality' | 'wisdom' | 'focus' | 'charisma' | 'empathy';
}

const TEMPLATES: FallbackTemplate[] = [
  { category: 'prayer', title: 'Guard the First Light', description: 'Pray Fajr on time today.', difficulty: 'medium', relatedStat: 'faith' },
  { category: 'sleep', title: 'Repay the Night', description: 'Get at least 7.5 hours of sleep.', difficulty: 'easy', relatedStat: 'vitality' },
  { category: 'habit', title: 'Keep the Chain', description: 'Complete every ritual due today.', difficulty: 'medium', relatedStat: 'discipline' },
  { category: 'fitness', title: 'Move the Vessel', description: 'Log 30+ minutes of exercise.', difficulty: 'easy', relatedStat: 'strength' },
  { category: 'project', title: 'A Hammer Stroke', description: 'Complete one task in a project.', difficulty: 'medium', relatedStat: 'focus' },
  { category: 'relation', title: 'Reach the Hand', description: 'Message or call someone you care for.', difficulty: 'easy', relatedStat: 'empathy' },
];

const DIFFICULTY_XP: Record<FallbackTemplate['difficulty'], number> = { easy: 30, medium: 50, hard: 80 };

export function fallbackQuestTemplates(
  level: number,
  dayOfWeek: number,
): { title: string; description: string; category: DailyQuestCategory; difficulty: 'easy' | 'medium' | 'hard'; xpReward: number; relatedStat: FallbackTemplate['relatedStat'] }[] {
  const rotated = [...TEMPLATES, ...TEMPLATES].slice(dayOfWeek, dayOfWeek + 3);
  const levelBonus = Math.min(level, 10) * 2;
  return rotated.map((t) => ({
    title: t.title,
    description: t.description,
    category: t.category,
    difficulty: t.difficulty,
    xpReward: DIFFICULTY_XP[t.difficulty] + levelBonus,
    relatedStat: t.relatedStat,
  }));
}

import type { SkillRarity } from '@/types';

export const ROOT_NODE = {
  id: 'awakening',
  name: 'Awakening',
  description: 'Where every journey begins. Acknowledging that you are the forge of your own life.',
  nodeType: 'badge' as const,
  costSp: 0,
  rarity: 'legendary' as const,
  relatedStat: 'discipline' as const,
};

export const DISCOVERY_SP_COST = 3;
export const REROLL_GOLD_COST = 25;

export const RARITY_META: Record<SkillRarity, { label: string; colorKey: 'textSecondary' | 'info' | 'warning' | 'accent'; costSp: number }> = {
  common: { label: 'Common', colorKey: 'textSecondary', costSp: 2 },
  rare: { label: 'Rare', colorKey: 'info', costSp: 4 },
  epic: { label: 'Epic', colorKey: 'warning', costSp: 8 },
  legendary: { label: 'Legendary', colorKey: 'accent', costSp: 12 },
};

export const NODE_TYPE_LABELS: Record<'stat' | 'badge' | 'ability' | 'milestone', string> = {
  stat: 'Stat Node',
  badge: 'Badge Node',
  ability: 'Ability Node',
  milestone: 'Milestone Node',
};

export interface NodeTemplate {
  name: string;
  description: string;
  nodeType: 'stat' | 'badge' | 'ability' | 'milestone';
  rarity: SkillRarity;
  relatedStat: ('faith' | 'discipline' | 'strength' | 'agility' | 'vitality' | 'wisdom' | 'focus' | 'charisma' | 'empathy');
  stat?: Partial<Record<string, number>>;
  passive?: string;
  ability?: string;
  requirement?: Partial<Record<string, number>>;
}

export const NODE_TEMPLATES: NodeTemplate[] = [
  { name: 'Iron Spine', description: 'Rigid by choice, not by circumstance.', nodeType: 'stat', rarity: 'common', relatedStat: 'strength', stat: { strength: 3 } },
  { name: 'Dawn Keeper', description: 'The first light is yours to hold.', nodeType: 'badge', rarity: 'common', relatedStat: 'faith', passive: '+1 Faith aura' },
  { name: 'Deep Current', description: 'Calm waters run still under pressure.', nodeType: 'stat', rarity: 'common', relatedStat: 'wisdom', stat: { wisdom: 3 } },
  { name: 'Second Wind', description: 'The body finds strength it forgot it had.', nodeType: 'stat', rarity: 'rare', relatedStat: 'vitality', stat: { vitality: 5 } },
  { name: 'Clarity of Steel', description: 'Sharpen the blade of the mind.', nodeType: 'stat', rarity: 'rare', relatedStat: 'focus', stat: { focus: 5 } },
  { name: 'Gravitas', description: 'Words that carry the weight of a fortress.', nodeType: 'stat', rarity: 'rare', relatedStat: 'charisma', stat: { charisma: 5 } },
  { name: 'Quiet Warmth', description: 'To listen is a gift; to be present is a miracle.', nodeType: 'ability', rarity: 'epic', relatedStat: 'empathy', ability: 'Deep conversations restore +2 bonus' },
  { name: 'The Wall', description: 'Discipline is the wall that holds the storm.', nodeType: 'stat', rarity: 'epic', relatedStat: 'discipline', stat: { discipline: 8 }, requirement: { discipline: 40 } },
  { name: 'Sprint Spirit', description: 'The hour becomes your servant.', nodeType: 'ability', rarity: 'epic', relatedStat: 'focus', ability: 'Sprints grant +5 XP per block' },
  { name: 'Namesake', description: 'A legend in the making, written in your own hand.', nodeType: 'milestone', rarity: 'legendary', relatedStat: 'discipline', stat: { discipline: 12 }, requirement: { discipline: 70 } },
];

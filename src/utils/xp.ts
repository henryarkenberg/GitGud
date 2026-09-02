export const XP_PER_LEVEL = 1000;

export function levelFromXp(totalXp: number): number {
  return Math.max(1, Math.floor(totalXp / XP_PER_LEVEL));
}

export function spPerLevel(level: number): number {
  return 3 + Math.floor(level / 10);
}

export function xpIntoLevel(totalXp: number): number {
  return totalXp % XP_PER_LEVEL;
}

export function xpToNextLevel(totalXp: number): number {
  return XP_PER_LEVEL - xpIntoLevel(totalXp);
}
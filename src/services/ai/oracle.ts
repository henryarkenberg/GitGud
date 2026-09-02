import { getAppState, setAppState } from '@/db/repositories/appStateRepo';
import { deleteDailyQuestsForDate, getDailyQuests, insertDailyQuest } from '@/db/repositories/dailyQuestRepo';
import { getAllLedgerEntries } from '@/db/repositories/ledgerRepo';
import { useForgeStore } from '@/stores/useForgeStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { usePrayerStore } from '@/stores/usePrayerStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useRelationStore } from '@/stores/useRelationStore';
import { useSleepStore } from '@/stores/useSleepStore';
import { useUserStore } from '@/stores/useUserStore';
import type { DailyQuest, DawnReport, RandomEventData } from '@/types';
import { createId, todayISO } from '@/utils/id';
import { isHabitDueOn } from '@/utils/rituals';
import { fallbackQuestTemplates } from '@/services/ai/prompts/fallbackQuests';
import { DAILY_REPORT_SYSTEM, dailyReportPrompt } from '@/services/ai/prompts/dailyReport';
import { RANDOM_EVENT_SYSTEM, randomEventPrompt } from '@/services/ai/prompts/randomEvent';
import { chat, extractJson } from '@/services/ai/openai';
import { notifyReportReady } from '@/services/notifications';
import { DailyReportSchema, RandomEventSchema } from '@/services/ai/validators/schemas';
const REPORT_KEY = 'ai_report';
const REPORT_DATE_KEY = 'ai_report_date';
const EVENT_KEY = 'ai_event';
const DAY_MS = 24 * 60 * 60 * 1000;

export async function buildContext(): Promise<string> {
  const profile = useUserStore.getState().profile;
  const sleep = useSleepStore.getState();
  const prayer = usePrayerStore.getState();
  const habit = useHabitStore.getState();
  const quest = useQuestStore.getState();
  const relation = useRelationStore.getState();
  const forge = useForgeStore.getState();

  const ledger = await getAllLedgerEntries();
  const cutoff = Date.now() - 7 * DAY_MS;
  const week = ledger.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
  const byModule: Record<string, number> = {};
  for (const e of week) byModule[e.module] = (byModule[e.module] ?? 0) + e.xpChange;

  const dueToday = habit.habits.filter((h) => !h.isArchived && isHabitDueOn(h, new Date())).length;
  const doneToday = habit.logs.filter((l) => l.date === todayISO() && l.completed).length;
  const activeQuests = quest.objectives.filter((o) => o.status === 'active').length;
  const lowRelations = relation.relations.filter((r) => r.health < 40 && r.health > 0).length;
  const estranged = relation.relations.filter((r) => r.health <= 0).length;
  const running = forge.runningSprint ? forge.projects.find((p) => p.id === forge.runningSprint?.projectId)?.name : null;

  return JSON.stringify({
    name: profile?.name ?? 'Warrior',
    level: profile?.level ?? 1,
    stats: profile?.stats ?? {},
    currentStreak: profile?.currentStreak ?? 0,
    sleepDebtHours: Math.round((sleep.debtMinutes / 60) * 10) / 10,
    pendingPrayers: prayer.records.filter((r) => r.status === 'pending').length,
    pendingQada: prayer.qada.length,
    dueHabits: dueToday,
    completedHabits: doneToday,
    activeObjectives: activeQuests,
    lowRelations,
    estranged,
    activeProjects: forge.projects.filter((p) => p.status === 'active' || p.status === 'paused').length,
    runningSprint: running,
    last7DaysXpByModule: byModule,
  });
}

export async function getCachedReport(): Promise<{ report: DawnReport; date: string } | null> {
  const date = await getAppState(REPORT_DATE_KEY);
  const raw = await getAppState(REPORT_KEY);
  if (!date || !raw) return null;
  try {
    const report = JSON.parse(raw) as DawnReport;
    return { report, date };
  } catch {
    return null;
  }
}

export async function generateDailyReport(context: string, regenerate = false): Promise<{ report: DawnReport; quests: DailyQuest[]; source: 'ai' | 'fallback' }> {
  const cached = await getCachedReport();
  const today = todayISO();
  if (!regenerate && cached?.date === today) {
    const quests = await getDailyQuests(today);
    return { report: cached.report, quests, source: 'ai' };
  }

  let report: DawnReport | null = null;
  let questInput: { title: string; description: string; category: DailyQuest['category']; difficulty: DailyQuest['difficulty']; xpReward: number; relatedStat: DailyQuest['relatedStat'] }[] = [];
  let usedAi = false;

  const result = await chat({ system: DAILY_REPORT_SYSTEM, user: dailyReportPrompt(context), temperature: 0.7, kind: 'daily_report' });
  if (result.ok && result.content) {
    try {
      const parsed = extractJson(result.content);
      const validated = DailyReportSchema.safeParse(parsed);
      if (validated.success) {
        usedAi = true;
        const { dailyQuests, ...rest } = validated.data;
        report = {
          summary: rest.summary,
          priorities: rest.priorities,
          strategicAdvice: rest.strategicAdvice,
          statFocus: rest.statFocus,
          flavorText: rest.flavorText,
        };
        questInput = dailyQuests.slice(0, 3).map((q) => ({
          title: q.title,
          description: q.description,
          category: q.category,
          difficulty: q.difficulty,
          xpReward: q.xpReward,
          relatedStat: (q.relatedStat as DailyQuest['relatedStat']) || 'discipline',
        }));
      }
    } catch {
      // fall through to fallback
    }
  }

  if (!report) {
    report = buildFallbackReport(context);
  }
  if (questInput.length === 0) {
    fallbackQuestTemplates(useUserStore.getState().profile?.level ?? 1, new Date().getDay()).forEach((q) => questInput.push(q));
  }

  await setAppState(REPORT_KEY, JSON.stringify(report));
  await setAppState(REPORT_DATE_KEY, today);
  await deleteDailyQuestsForDate(today);
  const quests: DailyQuest[] = [];
  for (const q of questInput) {
    const quest: DailyQuest = {
      id: createId('dq'),
      title: q.title,
      description: q.description,
      category: q.category,
      difficulty: q.difficulty,
      xpReward: q.xpReward,
      relatedStat: q.relatedStat,
      isCompleted: false,
      completedAt: null,
      generatedByAI: true,
      date: today,
    };
    await insertDailyQuest(quest);
    quests.push(quest);
  }

  if (usedAi) {
    void notifyReportReady();
  }

  return { report, quests, source: 'fallback' };
}

function buildFallbackReport(context: string): DawnReport {
  let ctx: Record<string, unknown> = {};
  try {
    ctx = JSON.parse(context);
  } catch {
    ctx = {};
  }
  const debt = (ctx.sleepDebtHours as number | undefined) ?? 0;
  const qada = (ctx.pendingQada as number | undefined) ?? 0;
  const advice =
    debt > 3
      ? 'The night calls. Repay your sleep debt before chasing new tasks.'
      : qada > 5
        ? 'The queue of unclaimed prayers grows. Reclaim them first.'
        : 'Small steady strokes beat grand heroics today. Move. Pray. Connect.';
  return {
    summary: {
      prayer: 'The five pillars await their due.',
      sleep: 'The vessel needs its rest woven back.',
      projects: 'The anvil is cool; strike a hammer stroke.',
      fitness: 'Move the body to keep the temple strong.',
      relations: 'Keep the bonds your soul rests upon.',
      habits: 'Repetition forges who you are.',
    },
    priorities: { urgent: [], important: ['Honour the essentials'], growth: [] },
    strategicAdvice: advice,
    statFocus: ['discipline', 'faith'],
    flavorText: 'The dawn is not a time to rise, but a place to arrive.',
  };
}

export async function generateRandomEvent(context: string): Promise<{ event: RandomEventData; createdAt: string } | null> {
  const result = await chat({ system: RANDOM_EVENT_SYSTEM, user: randomEventPrompt(context), temperature: 0.9, kind: 'random_event' });
  if (!result.ok || !result.content) return null;
  try {
    const parsed = extractJson(result.content);
    const validated = RandomEventSchema.safeParse(parsed);
    if (!validated.success) return null;
    const event: RandomEventData = {
      type: validated.data.type,
      title: validated.data.title,
      description: validated.data.description,
      xpReward: validated.data.xpReward,
      statFocus: (validated.data.statFocus as RandomEventData['statFocus']) || 'charisma',
    };
    const createdAt = new Date().toISOString();
    await setAppState(EVENT_KEY, JSON.stringify({ event, createdAt }));
    return { event, createdAt };
  } catch {
    return null;
  }
}

export async function getCachedEvent(): Promise<{ event: RandomEventData; createdAt: string } | null> {
  const raw = await getAppState(EVENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { event: RandomEventData; createdAt: string };
  } catch {
    return null;
  }
}

export async function clearEvent(): Promise<void> {
  await setAppState(EVENT_KEY, '');
}

const LAST_OPEN_KEY = 'last_open_ms';

export async function maybeGenerateEvent(): Promise<void> {
  const profile = useUserStore.getState().profile;
  if (!profile?.aiSettings.apiKey?.trim()) return;
  const today = todayISO();
  const cached = await getCachedEvent();
  if (cached && cached.createdAt.slice(0, 10) === today) return;

  const now = Date.now();
  const lastRaw = await getAppState(LAST_OPEN_KEY);
  await setAppState(LAST_OPEN_KEY, String(now));
  if (!lastRaw) return;
  const hours = (now - Number(lastRaw)) / 3_600_000;
  if (hours < 4) return;
  if (Math.random() < 0.1) {
    const context = await buildContext();
    await generateRandomEvent(context);
  }
}

import { DEFAULT_COORDS } from '@/constants/prayers';
import { RELATION_ACTIVITY_TYPES } from '@/constants/relations';
import { useFitnessStore } from '@/stores/useFitnessStore';
import { useForgeStore } from '@/stores/useForgeStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { usePrayerStore } from '@/stores/usePrayerStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useRelationStore } from '@/stores/useRelationStore';
import { useSkillTreeStore } from '@/stores/useSkillTreeStore';
import { useSleepStore } from '@/stores/useSleepStore';
import { useUserStore } from '@/stores/useUserStore';
import { getPrayerTimesFor, prayerSlotsFor } from '@/utils/prayerTimes';
import { todayISO } from '@/utils/id';
import { isHabitDueOn } from '@/utils/rituals';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
  name?: string;
}

const TIMEOUT_MS = 45000;
const RETRIES = 3;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getConfig(): { apiKey: string; model: string } {
  const p = useUserStore.getState().profile;
  return { apiKey: p?.aiSettings.apiKey?.trim() ?? '', model: p?.aiSettings.model?.trim() || 'gpt-4o-mini' };
}

async function postChat(messages: OpenAIMessage[], tools: unknown[]): Promise<unknown> {
  const { apiKey, model } = getConfig();
  if (!apiKey) throw new Error('No API key set');

  let lastError = 'Unknown error';
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, tools, tool_choice: 'auto', temperature: 0.4 }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        throw new Error(lastError);
      }
      return await res.json();
    } catch (error) {
      clearTimeout(timeout);
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < RETRIES - 1) await delay(2 ** attempt * 1000);
    }
  }
  throw new Error(lastError);
}

function prayerTimes() {
  const profile = useUserStore.getState().profile;
  return getPrayerTimesFor(
    profile?.prayerSettings.location ?? DEFAULT_COORDS,
    new Date(),
    profile?.prayerSettings ?? { method: 'muslim-world-league', madhab: 'hanafi', notificationsEnabled: false },
  );
}

function req(schema: Record<string, unknown>): Record<string, unknown> {
  return { type: 'object', properties: schema, additionalProperties: false };
}

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const RELATION_TYPES = RELATION_ACTIVITY_TYPES.filter((t) => t !== 'custom' && t !== 'reconcile');
const EXERCISE_TYPES = ['strength', 'run', 'walk', 'flexibility', 'sport'];
const MEAL_QUALITIES = ['clean', 'moderate', 'indulgent'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const TOOL_SCHEMAS: Record<string, { name: string; description: string; parameters: Record<string, unknown> }> = {
  get_dashboard: {
    name: 'get_dashboard',
    description: 'Full summary: level, XP, stats, currencies, streak, today\'s prayers, missed, sleep debt, habits due, active objectives, relations, running sprint, fitness, skill tree.',
    parameters: req({}),
  },
  get_stats: { name: 'get_stats', description: 'Get the 9 attribute stats, level, total XP, and streak.', parameters: req({}) },
  get_prayers_today: { name: 'get_prayers_today', description: "Today's 5 prayer statuses and scheduled times.", parameters: req({}) },
  get_missed_prayers: { name: 'get_missed_prayers', description: 'The qada queue: count and list of missed prayers with original dates.', parameters: req({}) },
  get_next_prayer: { name: 'get_next_prayer', description: 'Get the next upcoming prayer name and time remaining.', parameters: req({}) },
  check_prayer: {
    name: 'check_prayer',
    description: 'Check whether a specific prayer is due/checkable right now (returns status, scheduled time, window end, and whether it can still be prayed).',
    parameters: req({ prayer_name: { type: 'string', enum: PRAYERS, description: 'The prayer to check.' } }),
  },
  prayed_prayer: {
    name: 'prayed_prayer',
    description: 'Record that the warrior prayed a specific prayer today.',
    parameters: req({ prayer_name: { type: 'string', enum: PRAYERS } }),
  },
  prayed_qada: {
    name: 'prayed_qada',
    description: 'Record that the warrior made up a missed prayer as qada.',
    parameters: req({ prayer_name: { type: 'string', enum: PRAYERS } }),
  },
  mark_missed: {
    name: 'mark_missed',
    description: 'Mark a prayer as missed (adds to the qada queue).',
    parameters: req({ prayer_name: { type: 'string', enum: PRAYERS } }),
  },
  get_sleep_info: { name: 'get_sleep_info', description: 'Last night duration, sleep debt, daily target, whether currently asleep, average sleep.', parameters: req({}) },
  prepare_sleep: { name: 'prepare_sleep', description: 'Signal the warrior is preparing for sleep (starts in 10 minutes).', parameters: req({}) },
  wake_up: { name: 'wake_up', description: 'Signal the warrior has woken up (logs the sleep).', parameters: req({}) },
  log_manual_sleep: {
    name: 'log_manual_sleep',
    description: 'Log a past sleep session manually.',
    parameters: req({
      duration_minutes: { type: 'number', description: 'Total sleep time in minutes.' },
      quality: { type: 'string', enum: ['poor', 'fair', 'good', 'excellent'], description: 'Optional quality.' },
    }),
  },
  set_sleep_target_hours: {
    name: 'set_sleep_target_hours',
    description: 'Change the daily sleep target in hours (6–12).',
    parameters: req({ hours: { type: 'number', min: 6, max: 12 } }),
  },
  get_habits: { name: 'get_habits', description: 'List all habits with streak, whether due today, and completed today.', parameters: req({}) },
  mark_habit_done: { name: 'mark_habit_done', description: 'Mark a habit completed today (by its title).', parameters: req({ title: { type: 'string' } }) },
  get_active_objectives: { name: 'get_active_objectives', description: 'List active quests with difficulty, deadline, and XP.', parameters: req({}) },
  complete_objective: { name: 'complete_objective', description: 'Complete an active quest (by title).', parameters: req({ title: { type: 'string' } }) },
  fail_objective: { name: 'fail_objective', description: 'Fail an active quest (by title).', parameters: req({ title: { type: 'string' } }) },
  get_projects: { name: 'get_projects', description: 'List projects with status, hours forged, target, and tasks.', parameters: req({}) },
  get_sprint: { name: 'get_sprint', description: 'Get the running/paused sprint project and elapsed time.', parameters: req({}) },
  start_sprint: { name: 'start_sprint', description: 'Start a sprint on a project (by name).', parameters: req({ project_name: { type: 'string' } }) },
  pause_sprint: { name: 'pause_sprint', description: 'Pause the running sprint.', parameters: req({}) },
  resume_sprint: { name: 'resume_sprint', description: 'Resume the paused sprint.', parameters: req({}) },
  stop_sprint: { name: 'stop_sprint', description: 'Stop/end the running or paused sprint.', parameters: req({}) },
  log_manual_sprint: {
    name: 'log_manual_sprint',
    description: 'Log a past sprint session (project name, duration, optional note).',
    parameters: req({ project_name: { type: 'string' }, duration_minutes: { type: 'number' }, note: { type: 'string' } }),
  },
  get_today_fitness: { name: 'get_today_fitness', description: 'Today\'s exercise minutes, water glasses, and meal count.', parameters: req({}) },
  log_exercise: {
    name: 'log_exercise',
    description: 'Log an exercise session.',
    parameters: req({
      type: { type: 'string', enum: EXERCISE_TYPES },
      duration_minutes: { type: 'number' },
      subtype: { type: 'string', description: 'Optional, e.g. "5k run", "Yoga".' },
    }),
  },
  log_meal: {
    name: 'log_meal',
    description: 'Log a meal.',
    parameters: req({
      name: { type: 'string' },
      quality: { type: 'string', enum: MEAL_QUALITIES },
      type: { type: 'string', enum: MEAL_TYPES, description: 'Optional meal type.' },
    }),
  },
  add_water: { name: 'add_water', description: 'Record drinking one glass of water.', parameters: req({}) },
  get_relations: { name: 'get_relations', description: 'List relations with health, level, and estranged status.', parameters: req({}) },
  log_relation_activity: {
    name: 'log_relation_activity',
    description: 'Log an interaction with a relation (by name). Types include meeting, phone call, deep talk, helping, giving a gift, praying together, and quick text.',
    parameters: req({ relation_name: { type: 'string' }, activity_type: { type: 'string', enum: RELATION_TYPES } }),
  },
  reconcile_relation: { name: 'reconcile_relation', description: 'Reconcile an estranged relation (by name).', parameters: req({ relation_name: { type: 'string' } }) },
  get_skill_tree: { name: 'get_skill_tree', description: 'Skill tree progress: nodes total/awakened and available Skill Points.', parameters: req({}) },
};

const TOOLS = Object.values(TOOL_SCHEMAS).map(({ name, description, parameters }) => ({
  type: 'function' as const,
  function: { name, description, parameters },
}));

function findByName<T>(list: T[], key: keyof T, name: string): T | undefined {
  const n = name.toLowerCase();
  return list.find((x) => String(x[key]).toLowerCase() === n) ?? list.find((x) => String(x[key]).toLowerCase().includes(n));
}

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  const prayer = usePrayerStore.getState();
  const sleep = useSleepStore.getState();
  const habit = useHabitStore.getState();
  const quest = useQuestStore.getState();
  const forge = useForgeStore.getState();
  const fitness = useFitnessStore.getState();
  const relation = useRelationStore.getState();
  const tree = useSkillTreeStore.getState();
  const profile = useUserStore.getState().profile;

  try {
    switch (name) {
      case 'get_dashboard':
        return JSON.stringify({
          name: profile?.name,
          level: profile?.level,
          totalXp: profile?.totalXp,
          skillPoints: profile?.skillPoints,
          gold: profile?.gold,
          currentStreak: profile?.currentStreak,
          prayersToday: prayer.records.map((r) => ({ name: r.name, status: r.status })),
          missed: prayer.qada.length,
          sleepDebtMinutes: sleep.debtMinutes,
          habitsDue: habit.habits.filter((h) => !h.isArchived && isHabitDueOn(h, new Date())).map((h) => h.title),
          activeObjectives: quest.objectives.filter((o) => o.status === 'active').map((o) => o.title),
          relations: relation.relations.map((r) => ({ name: r.name, health: r.health })),
          runningSprint: forge.runningSprint ? forge.projects.find((p) => p.id === forge.runningSprint?.projectId)?.name : null,
          fitness: { exerciseMinutes: fitness.exercises.filter((e) => e.date === todayISO()).reduce((a, e) => a + e.durationMinutes, 0), water: fitness.daily?.waterGlasses ?? 0, meals: fitness.meals.filter((m) => m.date === todayISO()).length },
          skillTree: { awakened: tree.nodes.filter((n) => n.isUnlocked).length, total: tree.nodes.length },
        });
      case 'get_stats':
        return JSON.stringify({ level: profile?.level, totalXp: profile?.totalXp, streak: profile?.currentStreak, stats: profile?.stats });
      case 'get_prayers_today':
        return JSON.stringify({ date: todayISO(), records: prayer.records, next: prayerTimes().nextFajr });
      case 'get_missed_prayers':
        return JSON.stringify({ count: prayer.qada.length, list: prayer.qada.map((q) => ({ prayer: q.prayerName, on: q.originalDate })) });
      case 'get_next_prayer':
        return JSON.stringify(prayerTimes());
      case 'check_prayer': {
        const p = args.prayer_name as string;
        const times = prayerTimes();
        const slot = prayerSlotsFor(times).find((s) => s.name === p);
        if (!slot) return JSON.stringify({ ok: false, note: `Unknown prayer ${p}` });
        const now = Date.now();
        const started = now >= slot.time.getTime();
        const withinWindow = now <= slot.windowEnd.getTime();
        return JSON.stringify({ prayer: p, time: slot.time.toISOString(), windowEnd: slot.windowEnd.toISOString(), checkableNow: started && withinWindow, started, withinWindow });
      }
      case 'prayed_prayer':
        await prayer.markPrayed(args.prayer_name as never, prayerTimes());
        return JSON.stringify({ ok: true, note: `Recorded ${args.prayer_name} as prayed.` });
      case 'prayed_qada': {
        const q = prayer.qada.find((x) => x.prayerName === args.prayer_name);
        if (q) {
          await prayer.completeQada(q.id);
          return JSON.stringify({ ok: true, note: `Cleared ${args.prayer_name} from the qada queue.` });
        }
        return JSON.stringify({ ok: false, note: `No missed ${args.prayer_name} prayer currently queued.` });
      }
      case 'mark_missed':
        await prayer.markMissed(args.prayer_name as never);
        return JSON.stringify({ ok: true, note: `Marked ${args.prayer_name} as missed.` });
      case 'get_sleep_info':
        return JSON.stringify({
          lastNightMinutes: sleep.latestSession?.durationMinutes ?? 0,
          sleepDebtMinutes: sleep.debtMinutes,
          targetMinutes: sleep.targetMinutes,
          asleep: !!sleep.activeSleepStart,
          sessions: sleep.sessions.length,
        });
      case 'prepare_sleep':
        await sleep.prepareForSleep();
        return JSON.stringify({ ok: true, note: 'Sleep will begin in 10 minutes.' });
      case 'wake_up':
        await sleep.markAwake();
        return JSON.stringify({ ok: true, note: 'Sleep logged.' });
      case 'log_manual_sleep': {
        const mins = Number(args.duration_minutes);
        const end = new Date();
        const start = new Date(end.getTime() - mins * 60000);
        await sleep.addManualSession({ sleepStart: start.toISOString(), sleepEnd: end.toISOString(), quality: (args.quality as never) ?? undefined });
        return JSON.stringify({ ok: true, note: `Logged ${Math.round(mins / 60 * 10) / 10}h of sleep.` });
      }
      case 'set_sleep_target_hours': {
        const hours = Number(args.hours);
        await sleep.setTarget(Math.round(hours * 60));
        return JSON.stringify({ ok: true, note: `Daily target set to ${hours}h.` });
      }
      case 'get_habits':
        return JSON.stringify({
          habits: habit.habits.filter((h) => !h.isArchived).map((h) => ({ title: h.title, streak: h.streak, dueToday: isHabitDueOn(h, new Date()), doneToday: habit.logs.some((l) => l.habitId === h.id && l.date === todayISO() && l.completed) })),
        });
      case 'mark_habit_done': {
        const h = findByName(habit.habits.filter((x) => !x.isArchived), 'title', String(args.title));
        if (!h) return JSON.stringify({ ok: false, note: `No habit named "${args.title}".` });
        await habit.toggleHabit(h.id);
        return JSON.stringify({ ok: true, note: `Marked "${h.title}" done today.` });
      }
      case 'get_active_objectives':
        return JSON.stringify({ objectives: quest.objectives.filter((o) => o.status === 'active').map((o) => ({ title: o.title, difficulty: o.difficulty, deadline: o.deadline, xp: o.xpReward })) });
      case 'complete_objective': {
        const o = findByName(quest.objectives.filter((x) => x.status === 'active'), 'title', String(args.title));
        if (!o) return JSON.stringify({ ok: false, note: `No active quest named "${args.title}".` });
        await quest.complete(o.id);
        return JSON.stringify({ ok: true, note: `Completed "${o.title}".` });
      }
      case 'fail_objective': {
        const o = findByName(quest.objectives.filter((x) => x.status === 'active'), 'title', String(args.title));
        if (!o) return JSON.stringify({ ok: false, note: `No active quest named "${args.title}".` });
        await quest.setStatus(o.id, 'failed');
        return JSON.stringify({ ok: true, note: `Marked "${o.title}" as failed.` });
      }
      case 'get_projects':
        return JSON.stringify({ projects: forge.projects.map((p) => ({ name: p.name, status: p.status, minutes: p.totalTimeSpentMinutes, targetHours: p.targetHours, tasks: forge.tasks.filter((t) => t.projectId === p.id).length })) });
      case 'get_sprint':
        return JSON.stringify({ sprinting: !!forge.runningSprint, project: forge.runningSprint ? forge.projects.find((p) => p.id === forge.runningSprint?.projectId)?.name : null, running: forge.runningSprint?.isRunning, accumulatedSeconds: forge.runningSprint?.accumulatedSeconds ?? 0 });
      case 'start_sprint': {
        const p = findByName(forge.projects, 'name', String(args.project_name));
        if (!p) return JSON.stringify({ ok: false, note: `No project named "${args.project_name}".` });
        await forge.startSprint(p.id);
        return JSON.stringify({ ok: true, note: `Started a sprint on "${p.name}".` });
      }
      case 'pause_sprint':
        if (!forge.runningSprint) return JSON.stringify({ ok: false, note: 'No sprint running.' });
        await forge.pauseSprint(forge.runningSprint.id);
        return JSON.stringify({ ok: true, note: 'Sprint paused.' });
      case 'resume_sprint':
        if (!forge.runningSprint) return JSON.stringify({ ok: false, note: 'No paused sprint.' });
        await forge.resumeSprint(forge.runningSprint.id);
        return JSON.stringify({ ok: true, note: 'Sprint resumed.' });
      case 'stop_sprint':
        if (!forge.runningSprint) return JSON.stringify({ ok: false, note: 'No sprint running.' });
        await forge.stopSprint(forge.runningSprint.id);
        return JSON.stringify({ ok: true, note: 'Sprint ended and logged.' });
      case 'log_manual_sprint': {
        const p = findByName(forge.projects, 'name', String(args.project_name));
        if (!p) return JSON.stringify({ ok: false, note: `No project named "${args.project_name}".` });
        const mins = Number(args.duration_minutes);
        const end = new Date();
        const start = new Date(end.getTime() - mins * 60000);
        await forge.addManualSprint({ projectId: p.id, startTime: start.toISOString(), endTime: end.toISOString(), note: String(args.note ?? '') });
        return JSON.stringify({ ok: true, note: `Logged ${Math.round((mins / 60) * 10) / 10}h on "${p.name}".` });
      }
      case 'get_today_fitness':
        return JSON.stringify({
          exerciseMinutes: fitness.exercises.filter((e) => e.date === todayISO()).reduce((a, e) => a + e.durationMinutes, 0),
          water: fitness.daily?.waterGlasses ?? 0,
          meals: fitness.meals.filter((m) => m.date === todayISO()).map((m) => ({ name: m.name, quality: m.quality })),
        });
      case 'log_exercise':
        await fitness.logExercise({ type: (args.type as never), subtype: String(args.subtype ?? ''), durationMinutes: Number(args.duration_minutes) });
        return JSON.stringify({ ok: true, note: `Logged ${args.duration_minutes} min of ${args.type}.` });
      case 'log_meal':
        await fitness.logMeal({ name: String(args.name), type: (args.type as never) ?? 'snack', quality: (args.quality as never) ?? 'moderate', calories: null, protein: null, carbs: null, fat: null });
        return JSON.stringify({ ok: true, note: `Logged "${args.name}".` });
      case 'add_water':
        await fitness.addWater();
        return JSON.stringify({ ok: true, note: '1 glass of water recorded.' });
      case 'get_relations':
        return JSON.stringify({ relations: relation.relations.map((r) => ({ name: r.name, health: r.health, level: r.level, estranged: r.health <= 0 })) });
      case 'log_relation_activity': {
        const r = findByName(relation.relations, 'name', String(args.relation_name));
        if (!r) return JSON.stringify({ ok: false, note: `No relation named "${args.relation_name}".` });
        if (r.health <= 0 && args.activity_type !== 'reconcile') return JSON.stringify({ ok: false, note: `${r.name} is estranged — reconcile first.` });
        await relation.logActivity(r.id, args.activity_type as never);
        return JSON.stringify({ ok: true, note: `Logged ${args.activity_type} with ${r.name}.` });
      }
      case 'reconcile_relation': {
        const r = findByName(relation.relations.filter((x) => x.health <= 0), 'name', String(args.relation_name));
        if (!r) return JSON.stringify({ ok: false, note: `No estranged relation named "${args.relation_name}".` });
        await relation.logActivity(r.id, 'reconcile');
        return JSON.stringify({ ok: true, note: `${r.name} reconciled.` });
      }
      case 'get_skill_tree':
        return JSON.stringify({ awakened: tree.nodes.filter((n) => n.isUnlocked).length, total: tree.nodes.length, availableSp: profile?.skillPoints ?? 0 });
      default:
        return JSON.stringify({ ok: false, note: `Unknown tool ${name}` });
    }
  } catch (error) {
    return JSON.stringify({ ok: false, note: error instanceof Error ? error.message : String(error) });
  }
}

export interface ToolIntent {
  id: string;
  name: string;
  args: Record<string, unknown>;
  label: string;
}

export interface PlanResult {
  toolCalls: ToolIntent[] | null;
  reply: string | null;
  lead: string;
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function labelFor(name: string, args: Record<string, unknown>): string {
  const n = String(args.prayer_name ?? '');
  switch (name) {
    case 'prayed_prayer': return `Pray ${cap(n)}`;
    case 'prayed_qada': return `Pray ${cap(n)} as Qada`;
    case 'mark_missed': return `Mark ${cap(n)} missed`;
    case 'check_prayer': return `Check ${cap(n)}`;
    case 'prepare_sleep': return 'Prepare for sleep';
    case 'wake_up': return 'Log waking up';
    case 'log_manual_sleep': return `Log ${args.duration_minutes ?? '?'} min of sleep`;
    case 'set_sleep_target_hours': return `Set sleep target to ${args.hours}h`;
    case 'mark_habit_done': return `Complete habit "${args.title}"`;
    case 'complete_objective': return `Complete quest "${args.title}"`;
    case 'fail_objective': return `Fail quest "${args.title}"`;
    case 'start_sprint': return `Start sprint on "${args.project_name}"`;
    case 'pause_sprint': return 'Pause the sprint';
    case 'resume_sprint': return 'Resume the sprint';
    case 'stop_sprint': return 'End the sprint';
    case 'log_manual_sprint': return `Log ${args.duration_minutes ?? '?'} min on "${args.project_name}"`;
    case 'log_exercise': return `Log ${args.duration_minutes ?? '?'} min of ${args.type}`;
    case 'log_meal': return `Log meal "${args.name}"`;
    case 'add_water': return 'Drink a glass of water';
    case 'log_relation_activity': return `${cap(String(args.activity_type ?? 'activity'))} with ${args.relation_name}`;
    case 'reconcile_relation': return `Reconcile with ${args.relation_name}`;
    default: return name;
  }
}

function withSystem(msgs: OpenAIMessage[]): OpenAIMessage[] {
  return [{ role: 'system', content: systemPrompt() }, ...msgs];
}

export async function planTurn(wire: OpenAIMessage[]): Promise<{ wire: OpenAIMessage[]; result: PlanResult }> {
  const data = (await postChat(withSystem(wire), TOOLS)) as {
    choices?: { message?: { content?: string | null; tool_calls?: OpenAIMessage['tool_calls'] } }[];
  };
  const msg = data.choices?.[0]?.message;
  if (!msg) return { wire, result: { toolCalls: null, reply: 'The Oracle is silent. Add your API key in Settings.', lead: '' } };

  const assistantMsg: OpenAIMessage = {
    role: 'assistant',
    content: msg.content ?? '',
    tool_calls: msg.tool_calls,
  };
  const nextWire = [...wire, assistantMsg];

  if (msg.tool_calls && msg.tool_calls.length > 0) {
    const toolCalls: ToolIntent[] = msg.tool_calls.map((tc) => {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments || '{}');
      } catch {
        args = {};
      }
      return { id: tc.id, name: tc.function.name, args, label: labelFor(tc.function.name, args) };
    });
    return { wire: nextWire, result: { toolCalls, reply: null, lead: msg.content ?? '' } };
  }

  return { wire: nextWire, result: { toolCalls: null, reply: msg.content?.trim() || 'The Oracle is silent.', lead: '' } };
}

export interface ToolDecision {
  id: string;
  name: string;
  args: Record<string, unknown>;
  accepted: boolean;
}

export async function confirmTools(
  wire: OpenAIMessage[],
  decisions: ToolDecision[],
): Promise<{ wire: OpenAIMessage[]; reply: string }> {
  const feed = [...wire];
  for (const d of decisions) {
    const content = d.accepted
      ? await executeTool(d.name, d.args)
      : JSON.stringify({ ok: false, note: 'Denied by the warrior.' });
    feed.push({ role: 'tool', tool_call_id: d.id, name: d.name, content });
  }

  for (let round = 0; round < 8; round++) {
    const data = (await postChat(withSystem(feed), TOOLS)) as {
      choices?: { message?: { content?: string | null; tool_calls?: OpenAIMessage['tool_calls'] } }[];
    };
    const msg = data.choices?.[0]?.message;
    if (!msg) return { wire: feed, reply: 'The Oracle is silent.' };
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      feed.push({ role: 'assistant', content: msg.content ?? '', tool_calls: msg.tool_calls });
      for (const tc of msg.tool_calls) {
        feed.push({ role: 'tool', tool_call_id: tc.id, name: tc.function.name, content: await executeTool(tc.function.name, JSON.parse(tc.function.arguments || '{}')) });
      }
      continue;
    }
    return { wire: feed, reply: msg.content?.trim() || 'The Oracle is silent.' };
  }
  return { wire: feed, reply: 'The Oracle has reached the limit of its reasoning. Let us speak again.' };
}

function systemPrompt(): string {
  const profile = useUserStore.getState().profile;
  const ctx = JSON.stringify({ name: profile?.name ?? 'Warrior', level: profile?.level, totalXp: profile?.totalXp });
  return [
    'You are the Oracle of GitGud, a wise, warm strategist who serves the warrior. You speak concisely, warmly, and poetically.',
    'You have tools to act on the warrior\'s behalf and to inspect their life. A single sentence may require MULTIPLE tool calls — e.g. "I met Sufyan and we prayed Isha together" should call log_relation_activity(meet), log_relation_activity(prayed), and prayed_prayer(isha).',
    'Rules for actions:',
    '  - Before recording a prayer, first call check_prayer. Only record it if checkableNow is true; if it\'s not time yet or the window has passed, tell the user and do not record it.',
    '  - Use safe defaults: dates default to today, quality/meal-type/notes are optional.',
    '  - If a required field (a name, a duration, a prayer, a relation, a project, a habit) is missing, ask for it — but only the MINIMUM, one thing at a time.',
    '  - If a tool returns ok:false (e.g. no such habit/project/relation), politely tell the user and suggest what\'s available.',
    '  - Only mutate when the user clearly intends it; confirm in one short line after a successful action.',
    'Rules for questions:',
    '  - To answer factual questions ("how many fajrs have i missed", "how am i doing", "what\'s my streak", "did i sleep enough"), call the matching getter first, then answer from the returned data. Never invent numbers.',
    'Greet them briefly; your opening line is: "What can I do for you my lord?" Keep replies short and warm.',
    `Warrior context: ${ctx}`,
  ].join('\n');
}

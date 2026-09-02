# Aetheria: Life OS — Complete Design Specification

> **A gamified life-management application built in React Native (Expo Go) with local-first architecture, AI-driven dynamic progression, and a serious RPG aesthetic.**

---

## 1. Vision & Core Philosophy

Aetheria treats your life as a character sheet. Every action you take — spiritual, physical, social, or professional — feeds into a unified progression system. The app does not merely track; it *responds*. An onboard AI analyzes your patterns, generates contextual challenges, and grows a unique Skill Tree tailored specifically to your journey.

**Core Pillars:**
1. **Tawakkul & Tracking** — Prayer and sleep are sacred anchors.
2. **Mastery Through Repetition** — Habits and projects build compound interest.
3. **Social Capital** — Relationships are living systems requiring maintenance.
4. **Embodiment** — Fitness and diet ground the mind.
5. **Strategic Intelligence** — AI turns raw data into daily executable strategy.

**Tone:** Serious, elegant, tactile. Not cartoonish. Think *Darkest Dungeon* meets *Notion* — dark wood, gold leaf, ink, and slate. Light mode uses parchment, charcoal, and navy.

---

## 2. Visual Design System

### 2.1 Design Tokens

| Token | Dark Theme | Light Theme |
|-------|-----------|-------------|
| **Background Primary** | `#0B0F19` (Obsidian) | `#F5F1EB` (Parchment) |
| **Background Secondary** | `#151B2B` (Deep Slate) | `#E8E2D9` (Warm Stone) |
| **Background Elevated** | `#1E2636` (Slate) | `#FFFFFF` (Pure White) |
| **Text Primary** | `#E8E2D9` (Bone) | `#1A1A2E` (Ink) |
| **Text Secondary** | `#8A92A5` (Ash) | `#5A5A6E` (Graphite) |
| **Accent Gold** | `#D4AF37` (Aureate) | `#B8860B` (Dark Goldenrod) |
| **Accent Success** | `#4ADE80` (Jade) | `#16A34A` (Emerald) |
| **Accent Danger** | `#F87171` (Crimson) | `#DC2626` (Ruby) |
| **Accent Warning** | `#FBBF24` (Amber) | `#D97706` (Topaz) |
| **Accent Info** | `#60A5FA` (Cerulean) | `#2563EB` (Sapphire) |
| **Border Subtle** | `#2A3447` | `#D1CCC5` |
| **Border Focus** | `#D4AF37` | `#B8860B` |

### 2.2 Typography
- **Display:** `Cinzel` or similar serif for headers, titles, and RPG elements.
- **Body:** `Inter` or `System` font for readability.
- **Mono:** `JetBrains Mono` for timestamps, stats, and JSON debug views.

### 2.3 UI Language
- **Cards:** Elevated with subtle inner glow (dark) or soft shadow (light). Rounded corners `12px`.
- **Buttons:** Pill-shaped for primary actions, rectangular with sharp corners for destructive/serious actions.
- **Progress Bars:** Segmented or fluid with texture (striped animation when active).
- **Icons:** Lucide-React-Native. Consistent `24px` default.
- **Animations:** React Native Reanimated. Subtle spring physics. No bounce — weight and momentum.

---

## 3. Technical Architecture

### 3.1 Stack
| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo SDK 50+) |
| Navigation | React Navigation (Native Stack + Bottom Tabs) |
| State Management | Zustand (global) + React Query-like patterns for local cache |
| Storage | `expo-sqlite` (primary relational data) + `AsyncStorage` (config/auth tokens) |
| Styling | NativeWind (Tailwind for RN) or Styled Components |
| Animations | React Native Reanimated 3 |
| Background Tasks | `expo-background-fetch` (for midnight resets) + `expo-notifications` |
| Timer | `expo-av` or custom `setInterval` with AppState handling |
| AI | Direct OpenAI API calls (`fetch`) |
| Prayer Times | `adhan` npm package (local calculation, no API needed) or Aladhan API |
| Charts | `react-native-gifted-charts` or `victory-native` |

### 3.2 Storage Strategy
Since the app is local-only, data integrity is paramount.

- **`expo-sqlite`**: All relational data (prayers, habits, projects, sprints, relations, objectives, fitness logs).
- **`AsyncStorage`**: User preferences, theme, AI API key, last sync timestamp, onboarding status.
- **Backup/Export**: JSON dump functionality to file system (manual export/import).

### 3.3 AI Integration
- **Provider**: OpenAI GPT-4o-mini (cost-effective) or GPT-4o.
- **Key Storage**: Hardcoded in `constants/ai.ts` (user request: personal use).
- **Prompt Engineering**: All prompts are versioned in `prompts/` directory.
- **Response Format**: Strict JSON with Zod validation before use.
- **Rate Limiting**: Max 1 daily generation run + on-demand skill tree generation. Queue system for retries.

---

## 4. Universal Game Systems

These systems cut across all modules.

### 4.1 Stats (Primary Attributes)
Your character has 9 core stats. Everything you do influences them.

| Stat | Icon | Description | Primary Sources |
|------|------|-------------|-----------------|
| **Faith** | 🕌 | Spiritual discipline and connection | Prayers, Quran reading, Dhikr |
| **Discipline** | ⛓️ | Ability to adhere to schedule and commitments | Sleep consistency, streaks, deadlines met |
| **Strength** | ⚔️ | Physical power and endurance | Weightlifting, intense exercise |
| **Agility** | 🏃 | Speed, flexibility, and recovery | Running, walking, yoga |
| **Vitality** | ❤️ | Overall health and energy reserves | Sleep quality, diet quality, hydration |
| **Wisdom** | 📜 | Knowledge, reflection, and planning | Project completion, reading, journaling |
| **Focus** | 🎯 | Deep work capacity and attention span | Sprint duration, project consistency |
| **Charisma** | 🗣️ | Social magnetism and influence | Relation activities, public speaking |
| **Empathy** | 🤝 | Depth of connection and understanding | Meaningful relation milestones, helping others |

**Stat Range:** 0–100 per stat. Soft-cap at 100; can exceed with rare buffs.

### 4.2 Currencies

| Currency | Symbol | Earned By | Spent On |
|----------|--------|-----------|----------|
| **XP** | ✦ | Completing any action | Leveling up (global level) |
| **Skill Points (SP)** | ◈ | Leveling up, rare achievements | Unlocking Skill Tree nodes |
| **Gold** | 🜚 | Perfect days, rare achievements, selling old gear (metaphorical) | Cosmetic themes, node re-rolls |

### 4.3 Leveling Formula
```
Level = floor(XP / 1000)
SP Gained per Level = 3 + floor(Level / 10)
```

### 4.4 Streak System
- **Daily Streak**: Consecutive days with >80% daily quests completed.
- **Module Streaks**: Per-habit, per-prayer, per-relation streaks.
- **Streak Bonus**: +5% XP per day of streak, capped at +50%.
- **Streak Freeze**: 1 per week (auto-used if day missed due to illness/travel — manually declared).

### 4.5 The Ledger (Global History)
A unified chronological feed of every action taken in the app. Filterable by module, stat, or date. This feeds the AI context.

---

## 5. Module Specifications

---

### 5.1 Module: Sanctum (Prayer Tracker)

**Purpose:** Track the 5 daily prayers and Qada (missed) prayers.

#### Data Model
```typescript
interface Prayer {
  id: string;
  name: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  date: string; // YYYY-MM-DD
  scheduledTime: string; // ISO timestamp
  status: 'pending' | 'on_time' | 'late' | 'missed' | 'qada';
  prayedAt?: string; // ISO timestamp
  rakaat?: number; // Optional tracking
  location?: { latitude: number; longitude: number };
  xpEarned: number;
}

interface QadaPrayer {
  id: string;
  originalDate: string;
  prayerName: Prayer['name'];
  prayedAt: string;
  xpEarned: number; // 50% of normal
}
```

#### Prayer Time Calculation
- Use the `adhan` npm package for local calculation.
- Requires user to set calculation method (Muslim World League, ISNA, etc.) and Madhab (Hanafi/Shafi) in onboarding.
- Auto-updates daily at midnight.

#### Gamification
- **On-Time Prayer**: +50 XP, +3 Faith, +2 Discipline.
- **Late Prayer** (within window but after preferred time): +30 XP, +1 Faith.
- **Qada Prayer**: +25 XP, +2 Faith (reduced but meaningful — the app celebrates making it up).
- **Perfect Day** (all 5 on-time): +100 bonus XP, "Guardian of the Day" micro-badge.
- **Fajr Streak**: Special multiplier. 7-day Fajr streak grants +10 Discipline.

#### UI/UX
- **Main View**: 5 vertical pillars representing each prayer. Filled with gold when completed. Cracked stone when missed. Glowing when pending.
- **Qada Queue**: A separate "Debt" list. Swipe to mark as done. Visual: chains breaking.
- **Notification**: 15 min before each prayer. Custom adhan sound option.

---

### 5.2 Module: Slumber (Sleep Tracker)

**Purpose:** Track sleep cycles without wearables. User-initiated logging.

#### Data Model
```typescript
interface SleepSession {
  id: string;
  sleepStart: string; // ISO timestamp (auto: sleepSignal + 10min)
  sleepEnd: string;   // ISO timestamp (wakeSignal)
  durationMinutes: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent'; // Self-rated or AI-inferred
  sleepDebtMinutes: number; // Calculated against 8h target
  source: 'tracked' | 'manual';
}
```

#### Flow
1. **Wake Signal**: User opens app and taps "I am awake." Records `sleepEnd`.
2. **Sleep Signal**: User taps "Preparing for sleep." App sets `sleepStart` = now + 10 minutes.
3. **Manual Entry**: User can add/edit past sessions (e.g., "I slept 2pm–4pm yesterday").

#### Gamification
- **Optimal Sleep** (7.5–9h): +40 XP, +5 Vitality, +3 Discipline.
- **Sleep Debt Repaid**: If current sleep > 8h and debt exists, bonus XP.
- **Consistent Schedule**: Sleeping within 1h of previous day's sleep time = +10 Discipline.
- **All-Nighter Penalty**: -20 Vitality, -10 Discipline (recoverable through good sleep).

#### UI/UX
- **Sleep Arc**: A circular visualization of the last 24h. Sleep = dark blue arc, wake = gold arc.
- **Debt Meter**: A red bar that fills when under-slept. Satisfying depletion when catching up.
- **Streak**: Consecutive days with 7h+ sleep.

---

### 5.3 Module: Quests (Objectives)

**Purpose:** One-time missions with deadlines.

#### Data Model
```typescript
interface Objective {
  id: string;
  title: string;
  description?: string;
  deadline?: string; // ISO timestamp
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'epic';
  status: 'active' | 'completed' | 'failed' | 'abandoned';
  tags: string[]; // e.g., 'work', 'spiritual', 'health'
  relatedStat: StatName;
  xpReward: number;
  createdAt: string;
  completedAt?: string;
  isGeneratedByAI: boolean;
}
```

#### Gamification
- **Base XP**: Trivial(+10), Easy(+25), Medium(+50), Hard(+100), Epic(+250).
- **Deadline Bonus**: Completed 24h early = +20% XP. On-time = standard. Late = -30% XP.
- **Overdue**: Turns red. Daily -5 XP until completed or abandoned.

#### UI/UX
- **Quest Board**: Kanban-style board (Active | Completed | Failed).
- **Card Design**: Looks like a parchment scroll. Difficulty indicated by border thickness and color intensity.
- **AI Suggestion**: "Based on your Projects, consider adding: [Objective]"

---

### 5.4 Module: Rituals (Habits)

**Purpose:** Repetitive actions that build identity.

#### Data Model
```typescript
type RepeatPattern = 
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] } // 0=Sun, 6=Sat
  | { type: 'monthly'; days: number[] } // 1-31
  | { type: 'interval'; everyNDays: number }
  | { type: 'custom'; cronLike: string }; // For power users

interface Habit {
  id: string;
  title: string;
  description?: string;
  repeatPattern: RepeatPattern;
  relatedStat: StatName;
  baseXp: number;
  color: string;
  icon: string; // Lucide icon name
  streak: number;
  longestStreak: number;
  createdAt: string;
  isArchived: boolean;
}

interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  xpEarned: number;
}
```

#### Gamification
- **Base Completion**: Base XP + related stat.
- **Streak Multiplier**: 1.0 → 1.5 over 30 days.
- **Milestone Badges**: 7, 30, 100, 365 days.
- **Broken Streak**: Visual "fracture" effect. Can be repaired with a "Renewal" ritual (complete 3 days in a row).

#### UI/UX
- **Ritual Grid**: Masonry grid of habits. Tap to complete. Long-press for details.
- **Streak Flame**: Animated flame icon. Size grows with streak length.
- **Missed Indicator**: Greyed out with a subtle pulse if due today and pending.

---

### 5.5 Module: Forge (Projects)

**Purpose:** Complex endeavors with tasks, time tracking, and sprints.

#### Data Model
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  totalTimeSpentMinutes: number;
  createdAt: string;
  relatedStat: StatName;
}

interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  type: 'one_time' | 'recurring';
  repeatPattern?: RepeatPattern; // If recurring
  status: 'pending' | 'in_progress' | 'completed';
  deadline?: string;
  xpReward: number;
}

interface Sprint {
  id: string;
  projectId: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number; // Calculated or manual
  note?: string;
  isRunning: boolean;
  xpEarned: number;
}
```

#### Sprint System
- **Active Timer**: Tap "Enter the Forge" to start. Background timer with notification.
- **Manual Sprint**: "I worked 3 hours yesterday" — quick add.
- **Sprint Note**: Attach learnings, blockers, or wins.
- **Focus Mode**: When sprint is active, app enters DND-style UI (minimal, timer-centric).

#### Gamification
- **Sprint XP**: +5 XP per 25 min (Pomodoro unit). +2 Focus per hour.
- **Project Completion**: +200 XP, +10 related stat, +1 Wisdom.
- **Deep Work**: 4h uninterrupted = "Flow State" badge, +50 bonus XP.
- **Consistency**: 5 days of sprints on same project = +10% XP multiplier.

#### UI/UX
- **Project Hall**: List of active projects with progress rings (time spent vs. estimated).
- **Sprint Anvil**: Central timer. Tapping starts a hammering animation. Background darkens.
- **Sprint History**: Timeline view per project.

---

### 5.6 Module: Vessel (Fitness)

**Purpose:** Log physical activity and nutrition.

#### Data Model
```typescript
interface Exercise {
  id: string;
  type: 'strength' | 'cardio_run' | 'cardio_walk' | 'flexibility' | 'sport';
  subtype?: string; // e.g., 'bench_press', '5k_run'
  durationMinutes: number;
  distanceKm?: number;
  caloriesBurned?: number;
  date: string;
  xpEarned: number;
}

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  quality: 'clean' | 'moderate' | 'indulgent';
  date: string;
  xpEarned: number; // Clean eating bonus
}

interface DailyFitness {
  date: string;
  totalExerciseMinutes: number;
  totalCaloriesIn?: number;
  totalCaloriesOut?: number;
  waterGlasses: number;
}
```

#### Gamification
- **Strength Training**: +10 XP per 15 min, +3 Strength.
- **Run**: +15 XP per 5km, +4 Agility.
- **Walk**: +5 XP per 30 min, +2 Vitality.
- **Clean Meal**: +10 XP, +2 Vitality.
- **Indulgent Meal**: +0 XP, but no penalty (this is not a diet app — it's honest tracking).
- **Hydration**: +2 XP per glass, caps at +20/day.

#### UI/UX
- **Body Diagram**: Stylized silhouette. Tap regions to log (chest day, leg day, etc.).
- **Activity Rings**: Three rings — Move (calories), Exercise (minutes), Stand/Stretch (hourly).
- **Food Log**: Quick-add tiles for common meals. Photo attachment optional.

---

### 5.7 Module: Covenant (Relations Tracker)

**Purpose:** Maintain and deepen relationships through intentional action.

#### Data Model
```typescript
interface Relation {
  id: string;
  name: string;
  relationType: 'family' | 'friend' | 'mentor' | 'colleague' | 'spouse' | 'child' | 'other';
  health: number; // 0-100
  maxHealth: number; // Starts at 100, can increase
  level: number; // Relation level
  xp: number; // Relation XP
  lastInteraction: string;
  avatar?: string; // Initials or image
  createdAt: string;
}

interface RelationActivity {
  id: string;
  relationId: string;
  type: 'call' | 'meet' | 'gift' | 'help' | 'deep_talk' | 'prayer_together' | 'custom';
  durationMinutes?: number;
  note?: string;
  date: string;
  healthRestored: number;
  xpEarned: number;
}

interface RelationMilestone {
  id: string;
  relationId: string;
  title: string;
  description: string;
  requiredActivities: { type: string; count: number }[];
  rewardStat: StatName;
  rewardPoints: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}
```

#### Health Decay System
- Health decays by -2 per day if no interaction.
- Health caps at `maxHealth`.
- If health hits 0: "Estranged" status. Requires special "Reconciliation" activity to restore.

#### Activities & Restoration
| Activity | Health Restored | XP | Stat Bonus |
|----------|----------------|-----|------------|
| Quick Text | +1 | +2 | — |
| Phone Call (15m+) | +5 | +10 | +1 Charisma |
| In-Person Meet | +10 | +25 | +2 Charisma, +1 Empathy |
| Deep Talk | +15 | +40 | +3 Empathy |
| Helped with Problem | +12 | +30 | +2 Wisdom, +2 Empathy |
| Gift | +8 | +15 | +1 Charisma |
| Prayed Together | +20 | +50 | +3 Faith, +3 Empathy |

#### Tech Tree (Per Relation)
Each relation has unlockable milestones:
- **Level 1**: "First Blood" — Meet 3 times. Reward: +5 Charisma.
- **Level 2**: "Confidant" — 2 Deep Talks. Reward: +5 Empathy, maxHealth +10.
- **Level 3**: "Brother-in-Arms" — Help each other 3 times. Reward: Badge, +10 both stats.
- **AI-Generated**: Higher levels generated by AI based on relation context.

#### UI/UX
- **Constellation Map**: Relations as stars. Lines connect you. Brighter = healthier.
- **Health Bar**: Heart/soul bar under each name. Pulsing when low.
- **Activity Log**: Shared timeline of memories with that person.

---

## 6. AI System Architecture

### 6.1 The Oracle (AI Agent)
The AI is not just a chatbot. It is a background processor that generates content, analyzes patterns, and writes strategy.

#### 6.1.1 Daily Morning Run (The Dawn Report)
**Trigger:** User-defined time (default: 30 min after Fajr or 7:00 AM).
**Process:**
1. Collect last 7 days of all module data (JSON dump).
2. Send to GPT with system prompt: *"You are the Oracle of Aetheria. Analyze the user's life data and generate a strategic daily briefing."*
3. AI returns structured JSON:

```json
{
  "summary": {
    "prayer": "You prayed 4/5 on time yesterday. Fajr was missed. Qada queue: 1.",
    "sleep": "6.5h sleep. Debt accumulating. Prioritize rest tonight.",
    "projects": "Project 'App Build' has 3 pending tasks. Sprint yesterday: 2h.",
    "fitness": "No exercise in 2 days. Body is asking for movement.",
    "relations": "Mother's health is at 60%. 3 days since last call.",
    "habits": "Reading streak: 12 days. Meditation: broken yesterday."
  },
  "priorityScore": {
    "urgent": ["Call Mother", "Qada Fajr"],
    "important": ["Sleep by 10 PM", "30m Run"],
    "growth": ["Complete API integration task"]
  },
  "dailyQuests": [
    {
      "id": "dq_001",
      "title": "The Reconnection",
      "description": "Call your mother. Ask about her day. Listen more than you speak.",
      "category": "relations",
      "difficulty": "easy",
      "xpReward": 35,
      "relatedStat": "Empathy",
      "isCheckable": true,
      "generatedByAI": true
    },
    {
      "id": "dq_002",
      "title": "Debt of Dawn",
      "description": "Pray your missed Fajr before Dhuhr. The soul remembers.",
      "category": "prayer",
      "difficulty": "easy",
      "xpReward": 25,
      "relatedStat": "Faith",
      "isCheckable": true,
      "generatedByAI": true
    },
    {
      "id": "dq_003",
      "title": "Iron Renewal",
      "description": "Run 3km today. Your Agility has stagnated for 3 days.",
      "category": "fitness",
      "difficulty": "medium",
      "xpReward": 50,
      "relatedStat": "Agility",
      "isCheckable": true,
      "generatedByAI": true
    }
  ],
  "strategicAdvice": "You are over-invested in Projects and under-invested in Relations. Today's theme is BALANCE. Complete the Reconnection quest before any Project sprints.",
  "statFocus": ["Empathy", "Vitality"],
  "flavorText": "The anvil cools when the smith neglects the hearth. Tend to your fires."
}
```

**Display:** Rendered as cards in the "Today" tab. Checkable. Completing grants XP and marks quest done.

#### 6.1.2 Skill Tree Node Generation
**Trigger:** User spends SP to "Unlock Next Node."
**Process:**
1. Collect last 30 days of activity patterns.
2. Identify dominant stat and behaviors.
3. AI generates a unique node:

```json
{
  "node": {
    "id": "node_gen_001",
    "name": "The Dedication Badge",
    "description": "For 15 consecutive days, you have sprinted on your projects. Your focus is becoming legendary.",
    "type": "badge",
    "costSp": 5,
    "requirements": { "minFocus": 40, "projectStreakDays": 15 },
    "rewards": {
      "stats": { "Focus": 8, "Wisdom": 3 },
      "passive": "Project sprint XP +10%"
    },
    "rarity": "rare",
    "visualDescription": "A golden quill burning with blue flame"
  }
}
```

**Display:** Node appears on the Skill Tree. User can accept or "Re-roll" (costs Gold).

#### 6.1.3 Random Events
**Trigger:** 10% chance when opening app after 4+ hours.
**Example:**
```json
{
  "event": {
    "title": "A Stranger's Request",
    "description": "You encounter an opportunity to help someone unexpectedly today.",
    "quest": {
      "title": "Unexpected Charity",
      "action": "Help a stranger or donate to someone in need.",
      "xpReward": 60,
      "stat": "Faith"
    },
    "expiresAt": "23:59"
  }
}
```

### 6.2 Prompt Engineering Standards
- All prompts include the user's current stats, recent history, and active quests.
- Temperature: 0.7 for creative generation (skill tree, events), 0.3 for analysis (daily report).
- Max tokens: 2000 for daily report, 500 for skill tree node.
- Retry logic: 3 attempts with exponential backoff.

---

## 7. The Skill Tree (Aetherium)

### 7.1 Structure
- **Not fixed.** Starts with a single root node: "Awakening."
- **Branches:** Each stat has its own branch (Faith, Strength, etc.).
- **Node Types:**
  - **Stat Node**: +X to a stat.
  - **Badge Node**: Cosmetic + small passive.
  - **Ability Node**: Unlocks app feature (e.g., "Lucid Dreamer" — advanced sleep insights).
  - **Milestone Node**: Major achievements requiring IRL proof (e.g., "Marathon" — log a 42km run).

### 7.2 Dynamic Generation Rules
1. User taps "Discover Next Node" (costs 3 SP).
2. App sends activity context to AI.
3. AI proposes 3 node options.
4. User selects one. It materializes on the tree.
5. Adjacent nodes have connection lines. The tree grows organically — no two users will have the same tree.

### 7.3 UI/UX
- **Infinite Canvas**: Pan and zoom skill tree.
- **Node Visuals**: Glowing orbs of varying sizes. Legendary nodes have particle effects.
- **Path Lines**: Pulsing energy connections. Dormant = grey, Active = gold.
- **Unlock Animation**: Node shatters from stone into crystal.

---

## 8. Daily Dashboard (The Today Tab)

This is the home screen. It aggregates everything.

### Layout (Top to Bottom)
1. **Header**: Date, Global Level, Total XP, Streak.
2. **Character Card**: Avatar (customizable silhouette), 9 stat bars (mini).
3. **The Dawn Report**: AI summary card (collapsible).
4. **Prayer Pillars**: Horizontal 5-pillar status.
5. **Active Sprint**: If running, show Forge timer. If not, show "Enter the Forge" button.
6. **Daily Quests**: Horizontal scroll of 3 AI-generated quest cards.
7. **Habit Rituals**: Grid of due habits for today.
8. **Critical Objectives**: Top 3 objectives by deadline.
9. **Relation Alerts**: Anyone below 40% health.
10. **Sleep Debt**: If any, prominent warning.

---

## 9. Navigation Structure

```
Bottom Tabs:
├── 🏠 Today (Dashboard)
├── 🕌 Sanctum (Prayers)
├── ⚔️ Forge (Projects + Sprints)
├── 📜 Rituals (Habits + Objectives)
├── 🌳 Aetherium (Skill Tree)

Top-Level Screens (Stack):
├── Settings
├── Vessel (Fitness) — accessible from Today or drawer
├── Covenant (Relations) — accessible from Today or drawer
├── Slumber (Sleep) — accessible from Today or drawer
├── Oracle AI Logs — history of all AI generations
├── Ledger (Global History)
└── Onboarding
```

---

## 10. Data Models (Complete Reference)

### 10.1 User Profile
```typescript
interface UserProfile {
  id: string;
  name: string;
  level: number;
  totalXp: number;
  skillPoints: number;
  gold: number;
  stats: Record<StatName, number>;
  currentStreak: number;
  longestStreak: number;
  prayerSettings: {
    method: string;
    madhab: string;
    notificationsEnabled: boolean;
    customOffsets?: Record<PrayerName, number>;
  };
  aiSettings: {
    apiKey: string;
    model: string;
    dailyReportTime: string;
    enabledModules: string[];
  };
  theme: 'dark' | 'light' | 'system';
  onboardingComplete: boolean;
}
```

### 10.2 Unified Action Log
```typescript
interface LedgerEntry {
  id: string;
  timestamp: string;
  module: ModuleName;
  action: string;
  entityId: string;
  xpChange: number;
  statChanges: Partial<Record<StatName, number>>;
  metadata: Record<string, any>;
}
```

---

## 11. Background Processes & Notifications

| Task | Frequency | Action |
|------|-----------|--------|
| Midnight Reset | Daily at 00:00 | Generate new habit instances, decay relation health, reset prayer status, calculate sleep debt |
| Prayer Notifications | Per prayer time | Local notification 15 min before |
| Daily AI Run | User-defined morning time | Fetch AI daily report, cache result |
| Streak Check | Daily at 23:00 | Warn if daily quests incomplete |
| Relation Decay | Daily at 00:00 | -2 health to all relations |
| Sprint Reminder | Every 25 min during active sprint | Pomodoro-style break reminder |

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Weeks 1–2)
- [ ] Expo project setup with NativeWind
- [ ] SQLite schema creation
- [ ] Theme system (Dark/Light)
- [ ] Navigation shell
- [ ] User profile & onboarding

### Phase 2: Core Systems (Weeks 3–4)
- [ ] Prayer tracker with `adhan` package
- [ ] Sleep tracker (basic logging)
- [ ] Habit system with repeat patterns
- [ ] Objective (Quest) system
- [ ] XP/Stat engine

### Phase 3: Advanced Modules (Weeks 5–6)
- [ ] Projects & Sprint timer
- [ ] Fitness logging
- [ ] Relations tracker with health decay
- [ ] Ledger (unified history)

### Phase 4: AI Integration (Weeks 7–8)
- [ ] OpenAI service layer
- [ ] Daily report generation & parsing
- [ ] Daily quest card system
- [ ] Random event system

### Phase 5: Skill Tree & Polish (Weeks 9–10)
- [ ] Dynamic skill tree canvas
- [ ] AI node generation
- [ ] Badge system
- [ ] Animations & haptics
- [ ] Export/backup functionality

### Phase 6: Testing & Deployment (Weeks 11–12)
- [ ] Offline mode testing
- [ ] Background task reliability
- [ ] Performance optimization
- [ ] Personal deployment via Expo Go

---

## 13. File Structure

```
aetheria/
├── app/
│   ├── (tabs)/
│   │   ├── today.tsx
│   │   ├── sanctum.tsx
│   │   ├── forge.tsx
│   │   ├── rituals.tsx
│   │   └── aetherium.tsx
│   ├── (stack)/
│   │   ├── vessel.tsx
│   │   ├── covenant.tsx
│   │   ├── slumber.tsx
│   │   ├── settings.tsx
│   │   ├── onboarding.tsx
│   │   └── ledger.tsx
│   ├── _layout.tsx
│   └── index.tsx
├── components/
│   ├── ui/           # Buttons, Cards, Inputs
│   ├── prayers/      # PrayerPillar, QadaQueue
│   ├── sleep/        # SleepArc, DebtMeter
│   ├── habits/       # RitualGrid, StreakFlame
│   ├── projects/     # SprintTimer, ProjectCard
│   ├── fitness/      # BodyDiagram, ActivityRing
│   ├── relations/    # ConstellationMap, HealthBar
│   ├── skilltree/    # TreeCanvas, NodeOrb
│   ├── quests/       # QuestCard, DawnReport
│   └── shared/       # StatBar, XPBubble, LevelBadge
├── hooks/
│   ├── usePrayerTimes.ts
│   ├── useSprintTimer.ts
│   ├── useDailyReset.ts
│   └── useAI.ts
├── stores/
│   ├── useUserStore.ts (Zustand)
│   ├── usePrayerStore.ts
│   ├── useProjectStore.ts
│   └── ...
├── db/
│   ├── schema.ts
│   ├── migrations/
│   └── repositories/
├── services/
│   ├── ai/
│   │   ├── openai.ts
│   │   ├── prompts/
│   │   │   ├── dailyReport.ts
│   │   │   ├── skillTreeNode.ts
│   │   │   └── randomEvent.ts
│   │   └── validators/
│   ├── prayerTimes.ts
│   └── notifications.ts
├── constants/
│   ├── theme.ts
│   ├── stats.ts
│   └── ai.ts          # API key here
├── types/
│   └── index.ts
├── utils/
│   ├── xpCalculator.ts
│   ├── dateHelpers.ts
│   └── statHelpers.ts
└── assets/
    ├── fonts/
    ├── sounds/        # Adhan, level-up, sprint complete
    └── images/
```

---

## 14. Example AI Prompts

### 14.1 Daily Report Prompt
```
You are the Oracle of Aetheria, a wise strategist analyzing a warrior's daily ledger.

USER CONTEXT:
- Current Stats: {{stats}}
- Last 7 Days Activity: {{ledger}}
- Active Objectives: {{objectives}}
- Pending Qada Prayers: {{qadaCount}}
- Sleep Debt: {{sleepDebt}} hours
- Relation Health Warnings: {{lowRelations}}
- Project Status: {{projects}}
- Current Streak: {{streak}} days

Generate a JSON response matching the DawnReport schema.
Rules:
- Be concise but poetic.
- Identify exactly 3 daily quests: one easy, one medium, one hard (or relation-focused).
- Quests must be specific and actionable.
- Include strategic advice that connects the dots between modules.
- If sleep debt > 3h, prioritize rest.
- If relation health < 40, prioritize that relation.
```

### 14.2 Skill Tree Node Prompt
```
The user has spent 3 Skill Points to discover a new node.

CONTEXT:
- Dominant Stat (30 days): {{dominantStat}}
- Recent Activities: {{activities}}
- Existing Nodes: {{unlockedNodes}}
- Current Level: {{level}}

Generate 3 unique node options as JSON.
Each node must:
- Have a creative name fitting the RPG theme
- Provide meaningful but balanced rewards
- Require the user to have earned it through their actions
- Include a visual description for UI rendering
```

---

## 15. Edge Cases & Rules

1. **Prayer Time Conflicts**: If user marks sleep after a prayer time has passed, auto-mark that prayer as missed (unless already done).
2. **Overlapping Sprints**: Only one sprint can be active at a time. Starting a new one pauses the old.
3. **AI Failure**: If OpenAI fails, fall back to template-based daily quests (pre-written generic quests).
4. **Midnight Ambiguity**: Sleep sessions crossing midnight are split at midnight for daily stats but kept as one session in the log.
5. **Backdating**: User can backdate habits and prayers up to 3 days. Older requires manual ledger edit.
6. **Stat Cap**: Base cap is 100. Certain legendary nodes can raise cap to 120.
7. **Data Corruption**: SQLite WAL mode. Weekly auto-export prompt.

---

## 16. Future Enhancements (Post-MVP)

- [ ] Wearable integration (Apple Health, Google Fit)
- [ ] Quran reading tracker with AI reflection
- [ ] Dhikr counter with tasbih simulation
- [ ] Multiplayer mode (accountability partner, guilds)
- [ ] Location-based prayer tracking (mosque visits)
- [ ] Voice-to-text for sprint notes
- [ ] AI-generated relation activity suggestions ("Ask your father about his childhood")

---

*Document Version: 1.0*
*Aetheria: Life OS — Design Specification*
*"Forge your life with intent."*

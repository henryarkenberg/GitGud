# GitGud: Life OS — Sequential Development Roadmap

> **10-version sequential build plan for a gamified life-management RPG built in React Native (Expo SDK 57) with local-first architecture, AI-driven progression, and a serious RPG aesthetic.**

---

## Global Context

- **Framework:** React Native via Expo SDK 57
- **Storage:** `expo-sqlite` (primary) + `AsyncStorage` (config)
- **State:** Zustand
- **Styling:** NativeWind (Tailwind for RN)
- **Animations:** React Native Reanimated 3
- **Navigation:** React Navigation (Native Stack + Bottom Tabs)
- **AI:** OpenAI GPT-4o-mini via direct `fetch` calls
- **Name:** GitGud
- **Themes:** Dark (Obsidian + Aureate Gold) & Light (Parchment + Dark Goldenrod)

Each version is a **complete, shippable increment**. You build Version 1, verify it works, then move to Version 2. No version depends on future versions.

---

## Version 1: The Foundation

> *"Before the hero embarks, the world must exist."*

### Goal
A working Expo SDK 57 app with navigation, theming, local database, user profile, and onboarding. This is your skeleton.

### Features
1. **Expo SDK 57 Project Setup**
   - Initialize with `create-expo-app` using SDK 57
   - Configure NativeWind, Reanimated, Navigation
   - Set up `expo-sqlite` and `AsyncStorage`

2. **Theme System**
   - Dark theme: `#0B0F19` background, `#D4AF37` accent
   - Light theme: `#F5F1EB` background, `#B8860B` accent
   - System-level theme switching with persistent preference
   - Typography: Cinzel (headers), Inter (body), JetBrains Mono (data)

3. **Navigation Shell**
   - Bottom tabs: Today, Sanctum, Forge, Rituals, Aetherium
   - Stack screens: Settings, Onboarding, Slumber, Vessel, Covenant, Ledger
   - Custom tab bar with RPG styling

4. **SQLite Schema (Core Tables)**
   - `user_profile` — name, level, xp, sp, gold, stats JSON, preferences
   - `ledger` — unified action log
   - `app_state` — onboarding status, last reset, theme

5. **Onboarding Flow**
   - Welcome screen with app lore
   - Name input
   - Prayer calculation method selection (Muslim World League, ISNA, etc.)
   - Madhab selection (Hanafi/Shafi)
   - AI API key input (hardcoded path option)
   - Theme preference
   - Tutorial skip/enable

6. **Today Dashboard (Skeleton)**
   - Header with date, level placeholder, XP placeholder
   - Empty state cards for each module
   - "No data yet" prompts with onboarding guidance

7. **Settings Screen**
   - Theme toggle
   - Prayer settings edit
   - AI key update
   - Export database (JSON dump)
   - Reset all data (with confirmation)

### Deliverable
An installable app via Expo Go that opens to a themed dashboard, lets you complete onboarding, and persists your profile in SQLite.

### File Structure Added
```
gitgud/
├── app/
│   ├── (tabs)/
│   │   └── _layout.tsx
│   ├── (stack)/
│   │   ├── onboarding.tsx
│   │   └── settings.tsx
│   ├── _layout.tsx
│   └── index.tsx
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── db/
│   ├── schema.ts
│   └── init.ts
├── stores/
│   └── useUserStore.ts
├── constants/
│   └── theme.ts
└── types/
    └── index.ts
```

---

## Version 2: The Sanctum (Prayer Tracker)

> *"The first pillar. The soul's compass."*

### Goal
Complete prayer tracking for the 5 daily prayers with automatic time calculation, status tracking, and Qada (missed prayer) management.

### Features
1. **Prayer Time Calculation**
   - Integrate `adhan` npm package for local calculation
   - Use user's selected method & madhab from onboarding
   - Auto-calculate Fajr, Dhuhr, Asr, Maghrib, Isha for current location
   - Handle timezone and DST automatically

2. **Prayer Tracking UI**
   - 5 vertical pillars on Sanctum tab
   - Pending = soft glow
   - On-time = filled gold
   - Late = filled amber
   - Missed = cracked grey stone
   - Qada = blue ethereal fill

3. **Prayer Actions**
   - Tap pillar to mark as prayed (records current time)
   - Auto-determines if on-time or late based on scheduled time
   - Swipe or long-press to mark as missed
   - Undo within 5 minutes

4. **Qada (Missed Prayer) System**
   - Auto-queue missed prayers with original date
   - Separate Qada list view
   - Mark Qada as prayed (50% XP, different visual)
   - Bulk Qada completion option
   - Qada counter badge on Sanctum tab

5. **Prayer Notifications**
   - Local notification 15 minutes before each prayer
   - Custom notification sound option
   - Notification actions: "Prayed", "Snooze", "Dismiss"

6. **Daily Prayer Summary**
   - Show on Today tab: X/5 prayers completed
   - Perfect day indicator (all 5 on-time)

7. **Database Tables**
   - `prayers` — id, name, date, scheduledTime, status, prayedAt, xpEarned
   - `qada_prayers` — id, originalDate, prayerName, prayedAt, xpEarned

### Deliverable
Open the app, see accurate prayer times for your location, mark prayers as complete, see missed prayers accumulate in Qada queue, and receive notifications.

### New Files
```
├── components/
│   └── prayers/
│       ├── PrayerPillar.tsx
│       ├── QadaQueue.tsx
│       └── PrayerSummary.tsx
├── hooks/
│   └── usePrayerTimes.ts
├── services/
│   └── notifications.ts
└── db/
    └── repositories/
        └── prayerRepo.ts
```

---

## Version 3: The Slumber (Sleep Tracker)

> *"The body is the vessel of the soul. It must rest."*

### Goal
Manual sleep tracking with wake/sleep signals, sleep debt calculation, and visual sleep arcs.

### Features
1. **Sleep Signals**
   - "I am awake" button — records sleep end time
   - "Preparing for sleep" button — sets sleep start = now + 10 minutes
   - Both accessible from Today tab and dedicated Slumber screen

2. **Manual Sleep Entry**
   - Add past sleep sessions with start/end times
   - Edit existing sessions
   - Delete incorrect entries
   - Multi-day sleep support (session crossing midnight)

3. **Sleep Debt Calculation**
   - Target: 8 hours (configurable in settings)
   - Daily debt = max(0, 480 - sleepMinutes)
   - Cumulative debt tracker
   - Debt repayment detection (sleep > 8h while debt exists)

4. **Visualizations**
   - 24-hour circular arc showing sleep vs wake periods
   - 7-day sleep history bar chart
   - Sleep debt meter (red when in debt, gold when repaid)
   - Average sleep duration stat

5. **Sleep Quality**
   - Optional self-rating after waking: Poor / Fair / Good / Excellent
   - Quality affects Vitality gains (future version)

6. **Database Tables**
   - `sleep_sessions` — id, sleepStart, sleepEnd, durationMinutes, quality, sleepDebtMinutes, source

7. **Today Tab Integration**
   - Sleep status card: last night's duration
   - Debt warning if > 2 hours accumulated
   - Quick-action buttons for wake/sleep

### Deliverable
Track your sleep by tapping buttons when you wake and sleep. See debt accumulate and visualize your patterns.

### New Files
```
├── components/
│   └── sleep/
│       ├── SleepArc.tsx
│       ├── SleepDebtMeter.tsx
│       └── SleepHistoryChart.tsx
├── app/
│   └── (stack)/
│       └── slumber.tsx
└── db/
    └── repositories/
        └── sleepRepo.ts
```

---

## Version 4: Rituals & Quests (Habits + Objectives)

> *"Repetition forges identity. Purpose drives action."*

### Goal
Full habit tracking with flexible repetition and one-time objective management.

### Features

#### Rituals (Habits)
1. **Habit Creation**
   - Title, description, color, icon (Lucide)
   - Related stat selection (Faith, Discipline, etc.)
   - Repeat patterns:
     - Daily
     - Weekly (select days: Mon, Wed, Fri)
     - Monthly (select dates: 1st, 15th)
     - Interval (every N days)
     - Custom (advanced cron-like)

2. **Habit Tracking**
   - Grid view of today's due habits
   - Tap to complete (with haptic feedback)
   - Long-press for details/edit
   - Streak counter with animated flame
   - Longest streak record

3. **Streak System**
   - Consecutive completions increase streak
   - Broken streak visual fracture effect
   - "Renewal" — complete 3 days in a row to heal fracture
   - Streak freeze (1 per week, manual activation)

4. **Habit Archive**
   - Archive habits without deleting history
   - Unarchive to reactivate

#### Quests (Objectives)
1. **Objective Creation**
   - Title, description, deadline (optional)
   - Difficulty: Trivial / Easy / Medium / Hard / Epic
   - Related stat, tags
   - XP reward auto-calculated from difficulty

2. **Objective Management**
   - Kanban board: Active | Completed | Failed | Abandoned
   - Drag to change status
   - Deadline countdown
   - Overdue objectives turn red, daily -5 XP penalty

3. **Completion Flow**
   - Mark complete → XP awarded → moved to Completed
   - Early completion bonus (+20% XP if 24h before deadline)
   - Late completion penalty (-30% XP)

4. **Database Tables**
   - `habits` — id, title, description, repeatPattern, relatedStat, baseXp, color, icon, streak, longestStreak, isArchived
   - `habit_logs` — id, habitId, date, completed, completedAt, xpEarned
   - `objectives` — id, title, description, deadline, difficulty, status, tags, relatedStat, xpReward, createdAt, completedAt

### Deliverable
Create habits with custom schedules, complete them daily, watch streaks grow. Create one-time quests with deadlines and track them on a board.

### New Files
```
├── components/
│   ├── habits/
│   │   ├── RitualGrid.tsx
│   │   ├── StreakFlame.tsx
│   │   ├── HabitCard.tsx
│   │   └── HabitForm.tsx
│   └── quests/
│       ├── QuestBoard.tsx
│       ├── QuestCard.tsx
│       └── QuestForm.tsx
├── app/
│   └── (tabs)/
│       └── rituals.tsx
└── db/
    └── repositories/
        ├── habitRepo.ts
        └── objectiveRepo.ts
```

---

## Version 5: The Forge (Projects & Sprints)

> *"The anvil does not lie. Hours become mastery."*

### Goal
Project management with task tracking, active sprint timer, and time logging.

### Features
1. **Project Creation**
   - Name, description, color, icon
   - Related stat (Focus, Wisdom, etc.)
   - Status: Active / Paused / Completed / Archived

2. **Project Tasks**
   - One-time tasks: title, deadline, status, XP reward
   - Recurring tasks: same repeat patterns as habits
   - Task completion marks project progress

3. **Sprint Timer**
   - "Enter the Forge" button starts active sprint
   - Live timer display (HH:MM:SS)
   - Background timer with notification
   - Pause/resume functionality
   - Only one active sprint at a time (starting new pauses old)
   - Auto-save progress every minute

4. **Manual Sprint Entry**
   - "I worked 3 hours yesterday" — quick add with date, duration, note
   - Edit past sprints
   - Attach notes to any sprint

5. **Focus Mode**
   - Minimal full-screen timer when sprint active
   - DND-style UI: large timer, project name, pause button
   - Pomodoro-style break reminders every 25 minutes

6. **Project Visualizations**
   - Progress ring: time spent vs estimated (if set)
   - Sprint history timeline per project
   - Total time spent counter
   - Recent activity feed

7. **Database Tables**
   - `projects` — id, name, description, color, icon, status, totalTimeSpentMinutes, relatedStat
   - `project_tasks` — id, projectId, title, type, repeatPattern, status, deadline, xpReward
   - `sprints` — id, projectId, startTime, endTime, durationMinutes, note, isRunning

### Deliverable
Create projects, add tasks, start a sprint timer that runs in background, log manual time entries, and see project progress.

### New Files
```
├── components/
│   └── projects/
│       ├── ProjectCard.tsx
│       ├── ProjectDetail.tsx
│       ├── SprintTimer.tsx
│       ├── FocusMode.tsx
│       └── SprintTimeline.tsx
├── app/
│   └── (tabs)/
│       └── forge.tsx
├── hooks/
│   └── useSprintTimer.ts
└── db/
    └── repositories/
        └── projectRepo.ts
```

---

## Version 6: The Vessel & Covenant (Fitness + Relations)

> *"The body is a temple. Bonds are its pillars."*

### Goal
Fitness logging and relationship health tracking with decay mechanics.

### Features

#### Vessel (Fitness)
1. **Exercise Logging**
   - Type: Strength / Cardio (Run) / Cardio (Walk) / Flexibility / Sport
   - Duration, distance (for run/walk), calories (optional)
   - Subtype selection (bench press, 5k run, etc.)
   - Quick-add templates for common exercises

2. **Meal Logging**
   - Meal name, type (breakfast/lunch/dinner/snack)
   - Optional macros: calories, protein, carbs, fat
   - Quality rating: Clean / Moderate / Indulgent
   - Quick-add tiles for common meals
   - Photo attachment

3. **Hydration**
   - Water glass counter (+1 per tap)
   - Daily goal: 8 glasses
   - Visual fill animation

4. **Fitness Dashboard**
   - Activity rings (move, exercise, stand)
   - 7-day exercise history
   - Calorie in/out chart (if tracked)
   - Body diagram for muscle group tracking

5. **Database Tables**
   - `exercises` — id, type, subtype, durationMinutes, distanceKm, caloriesBurned, date
   - `meals` — id, name, type, calories, protein, carbs, fat, quality, date
   - `daily_fitness` — date, totalExerciseMinutes, totalCaloriesIn, totalCaloriesOut, waterGlasses

#### Covenant (Relations)
1. **Relation Creation**
   - Name, type (family/friend/mentor/colleague/spouse/child/other)
   - Avatar (initials or image)
   - Starting health: 100

2. **Health Decay System**
   - Daily auto-decay: -2 health at midnight
   - Health cap = maxHealth (starts at 100)
   - If health hits 0: "Estranged" status
   - Estranged requires "Reconciliation" activity to restore

3. **Relation Activities**
   - Quick Text (+1 health, +2 XP)
   - Phone Call 15m+ (+5 health, +10 XP)
   - In-Person Meet (+10 health, +25 XP)
   - Deep Talk (+15 health, +40 XP)
   - Helped with Problem (+12 health, +30 XP)
   - Gift (+8 health, +15 XP)
   - Prayed Together (+20 health, +50 XP)
   - Custom activity (user-defined health/XP)

4. **Relation Milestones (Tech Tree)**
   - Level 1: "First Blood" — Meet 3 times
   - Level 2: "Confidant" — 2 Deep Talks
   - Level 3: "Brother-in-Arms" — Help 3 times
   - Each level: +maxHealth, +stat rewards

5. **Visualizations**
   - Constellation map: relations as stars, brightness = health
   - Health bar per relation (pulsing when low)
   - Shared activity timeline
   - Relation level badges

6. **Database Tables**
   - `relations` — id, name, relationType, health, maxHealth, level, xp, lastInteraction, avatar
   - `relation_activities` — id, relationId, type, durationMinutes, note, date, healthRestored, xpEarned
   - `relation_milestones` — id, relationId, title, description, requiredActivities, rewardStat, rewardPoints, isUnlocked

### Deliverable
Log workouts and meals. Track water. Add relations, log interactions, watch health decay and restore. Unlock milestones with people.

### New Files
```
├── components/
│   ├── fitness/
│   │   ├── BodyDiagram.tsx
│   │   ├── ActivityRing.tsx
│   │   ├── ExerciseForm.tsx
│   │   ├── MealForm.tsx
│   │   └── WaterTracker.tsx
│   └── relations/
│       ├── ConstellationMap.tsx
│       ├── RelationCard.tsx
│       ├── HealthBar.tsx
│       ├── ActivityLog.tsx
│       └── MilestoneTree.tsx
├── app/
│   └── (stack)/
│       ├── vessel.tsx
│       └── covenant.tsx
└── db/
    └── repositories/
        ├── fitnessRepo.ts
        └── relationRepo.ts
```

---

## Version 7: The Core Engine (Gamification)

> *"Numbers become meaning. Progress becomes power."*

### Goal
Wire all modules into the unified progression system: stats, XP, levels, streaks, and the global ledger.

### Features
1. **XP Engine**
   - Prayer on-time: +50 XP
   - Prayer late: +30 XP
   - Qada prayer: +25 XP
   - Perfect prayer day: +100 bonus XP
   - Optimal sleep (7.5–9h): +40 XP
   - Habit completion: base XP + streak multiplier
   - Objective completion: difficulty-based + deadline modifiers
   - Sprint: +5 XP per 25 min
   - Exercise: type-based XP
   - Clean meal: +10 XP
   - Relation activity: activity-based XP
   - Daily quest completion: quest-specific XP

2. **Stat System (9 Attributes)**
   - Faith, Discipline, Strength, Agility, Vitality, Wisdom, Focus, Charisma, Empathy
   - Range: 0–100 (soft cap)
   - Every action contributes to relevant stats
   - Stat bars on profile and Today tab

3. **Leveling Formula**
   - `Level = floor(XP / 1000)`
   - `SP per level = 3 + floor(Level / 10)`
   - Level-up animation (screen flash, sound, stat reveal)

4. **Currencies**
   - XP: earned by everything, drives leveling
   - SP (Skill Points): earned on level-up, spent on skill tree
   - Gold: rare drops from perfect days and achievements

5. **Global Streak**
   - Daily streak: consecutive days with >80% daily quests completed
   - Streak bonus: +5% XP per day, capped at +50%
   - Streak freeze: 1 per week, manual activation
   - Streak break animation (screen crack effect)

6. **The Ledger (Unified History)**
   - Every action creates a ledger entry
   - Chronological feed of all life actions
   - Filter by module, stat, date range
   - Search functionality
   - Export ledger to JSON

7. **Today Dashboard (Fully Populated)**
   - Header: Level, XP to next level, streak
   - Character card: 9 mini stat bars
   - Prayer pillars: live status
   - Active sprint: if running, show timer
   - Due habits: today's ritual grid
   - Critical objectives: top 3 by deadline
   - Relation alerts: anyone below 40% health
   - Sleep debt warning (if applicable)
   - Fitness summary: today's exercise/meals/water

8. **Background Processes**
   - Midnight reset: generate habit instances, decay relation health, reset prayers, calculate sleep debt
   - Daily streak check at 23:00
   - Prayer notifications (already in V2, now reliable)

9. **Database Tables**
   - `ledger_entries` — id, timestamp, module, action, entityId, xpChange, statChanges, metadata

### Deliverable
Every action across all modules now awards XP and stats. You can see your character grow. The Today dashboard is alive with real data.

### New Files
```
├── components/
│   ├── shared/
│   │   ├── StatBar.tsx
│   │   ├── XPBubble.tsx
│   │   ├── LevelBadge.tsx
│   │   └── LedgerEntry.tsx
│   └── today/
│       ├── CharacterCard.tsx
│       ├── TodayDashboard.tsx
│       └── StreakBanner.tsx
├── app/
│   └── (stack)/
│       └── ledger.tsx
├── hooks/
│   └── useDailyReset.ts
├── utils/
│   ├── xpCalculator.ts
│   └── statHelpers.ts
└── db/
    └── repositories/
        └── ledgerRepo.ts
```

---

## Version 8: The Oracle (AI Integration)

> *"The machine sees patterns the eye cannot."*

### Goal
Integrate OpenAI to generate daily strategic reports, daily quests, and random events based on user's actual data.

### Features
1. **AI Service Layer**
   - Direct `fetch` calls to OpenAI API
   - Configurable model (default: gpt-4o-mini)
   - API key from user profile
   - Request/response logging
   - Retry logic: 3 attempts with exponential backoff
   - Timeout handling
   - Fallback to template system if AI fails

2. **Daily Morning Run (The Dawn Report)**
   - Trigger: user-defined time (default: 30 min after Fajr or 7:00 AM)
   - Collects last 7 days of all module data
   - Sends structured prompt to AI
   - Receives JSON: summary, priorities, daily quests, strategic advice, stat focus, flavor text
   - Caches result for the day
   - Displays as collapsible card on Today tab

3. **Daily Quests (AI-Generated)**
   - 3 quests generated by AI each morning
   - Rendered as checkable cards on Today tab
   - Categories: prayer, sleep, project, fitness, relation, habit
   - Difficulty: easy/medium/hard
   - XP rewards and stat bonuses
   - Completing marks done and awards XP
   - Progress: X/3 completed shown prominently

4. **Random Events**
   - 10% chance on app open after 4+ hours
   - AI-generated one-time opportunities
   - Example: "A Stranger's Request — Help someone today"
   - Expires at midnight
   - Bonus XP for completion

5. **Prompt Engineering**
   - Versioned prompts in `services/ai/prompts/`
   - Daily report prompt includes all user context
   - Strict JSON schema with Zod validation
   - Temperature: 0.7 for creative, 0.3 for analysis

6. **AI Logs Screen**
   - History of all AI generations
   - View raw prompts and responses
   - Regenerate today's report (manual)
   - Mark AI as "helpful" or "not helpful" for fine-tuning

7. **Fallback System**
   - If AI fails or no internet: use template quests
   - Templates rotate based on day of week and user level
   - Ensures app is never broken without AI

### Deliverable
Wake up, open app, see AI-generated daily strategy with 3 personalized quests. Complete them for bonus XP. Occasional random events add unpredictability.

### New Files
```
├── services/
│   └── ai/
│       ├── openai.ts
│       ├── prompts/
│       │   ├── dailyReport.ts
│       │   ├── randomEvent.ts
│       │   └── fallbackQuests.ts
│       └── validators/
│           └── schemas.ts
├── components/
│   └── quests/
│       ├── DailyQuestCard.tsx
│       └── DawnReport.tsx
├── app/
│   └── (stack)/
│       └── oracle-logs.tsx
└── hooks/
    └── useAI.ts
```

---

## Version 9: The Aetherium (Skill Tree)

> *"Your path is yours alone. The tree grows where you walk."*

### Goal
Dynamic skill tree that generates unique nodes based on user's activity patterns, spendable with Skill Points.

### Features
1. **Skill Tree Canvas**
   - Infinite pan/zoom canvas
   - Root node: "Awakening" (unlocked at start)
   - Nodes as glowing orbs of varying sizes
   - Connection lines: dormant (grey) or active (gold)
   - Legendary nodes have particle effects

2. **Node Types**
   - **Stat Node**: +X to a specific stat
   - **Badge Node**: Cosmetic title + small passive bonus
   - **Ability Node**: Unlocks app feature (e.g., "Lucid Dreamer" — advanced sleep insights)
   - **Milestone Node**: Major IRL achievement requirement

3. **Dynamic Node Generation**
   - User taps "Discover Next Node" (costs 3 SP)
   - App sends 30-day activity context to AI
   - AI proposes 3 node options
   - User selects one → it materializes on tree
   - Option to "Re-roll" (costs Gold)
   - Node positioned near related stat branch

4. **Node Unlocking**
   - Pay SP to unlock discovered node
   - Unlock animation: stone shatters into crystal
   - Rewards applied immediately
   - Passive bonuses active forever

5. **Stat Branches**
   - 9 branches radiating from center, one per stat
   - Tree grows organically based on user's dominant activities
   - No two users have identical trees

6. **Node Requirements**
   - Some nodes require minimum stat levels
   - Some require specific achievements (e.g., "Pray Fajr 30 days in a row")
   - Requirements shown before unlocking

7. **Database Tables**
   - `skill_tree_nodes` — id, name, description, type, costSp, requirements, rewards, rarity, visualDescription, positionX, positionY, isUnlocked, unlockedAt
   - `node_connections` — fromNodeId, toNodeId

### Deliverable
A living skill tree that grows based on your life. Spend SP to discover and unlock nodes that make your character unique.

### New Files
```
├── components/
│   └── skilltree/
│       ├── TreeCanvas.tsx
│       ├── NodeOrb.tsx
│       ├── ConnectionLine.tsx
│       ├── NodeDiscovery.tsx
│       └── UnlockAnimation.tsx
├── app/
│   └── (tabs)/
│       └── aetherium.tsx
└── db/
    └── repositories/
        └── skillTreeRepo.ts
```

---

## Version 10: The Ascension (Polish & Release)

> *"The masterwork is in the details."*

### Goal
Production polish: notifications, haptics, animations, data safety, and final QA.

### Features
1. **Notification System**
   - Prayer reminders (already in V2, now polished)
   - Streak warning (23:00 if quests incomplete)
   - Relation health warning (if anyone < 30%)
   - Sprint break reminders (Pomodoro)
   - Daily report ready notification
   - Custom notification sounds per type
   - Notification grouping by module

2. **Haptics & Feedback**
   - Haptic on habit completion (light)
   - Haptic on prayer mark (medium)
   - Haptic on level-up (heavy + pattern)
   - Haptic on streak break (error pattern)
   - Button press feedback throughout

3. **Animations**
   - Level-up: screen flash, particle burst, stat number count-up
   - Prayer complete: pillar fill animation
   - Streak flame: grows with streak length
   - Skill tree unlock: crystal shatter effect
   - Page transitions: slide + fade
   - Pull-to-refresh: custom spinner

4. **Data Safety**
   - Weekly auto-export reminder
   - Manual export: full JSON dump to file system
   - Manual import: restore from JSON
   - SQLite WAL mode for corruption resistance
   - Auto-backup before import/reset

5. **Performance**
   - SQLite query optimization with indexes
   - Lazy loading for ledger history
   - Image caching for relation avatars
   - Reanimated worklet optimization
   - Reduced re-renders with Zustand selectors

6. **Accessibility**
   - Screen reader labels on all interactive elements
   - Sufficient color contrast (WCAG AA)
   - Dynamic font size support
   - Reduced motion option

7. **Final Integrations**
   - Today tab fully wired with all modules
   - All stack screens reachable and functional
   - Settings complete with all options
   - Onboarding flow tested end-to-end
   - Offline mode fully functional (AI gracefully degrades)

8. **Testing Checklist**
   - [ ] Prayer times accurate across timezones
   - [ ] Sleep tracking handles midnight crossing
   - [ ] Habit repeat patterns work correctly
   - [ ] Sprint timer survives app backgrounding
   - [ ] Relation decay fires at midnight
   - [ ] XP/stats update in real-time
   - [ ] AI generation works and falls back gracefully
   - [ ] Skill tree nodes generate and position correctly
   - [ ] Export/import preserves all data
   - [ ] App works offline completely
   - [ ] Both themes render correctly
   - [ ] Notifications fire reliably

### Deliverable
A complete, polished, personal life OS. Install via Expo Go, use daily, watch your character grow.

### New Files
```
├── components/
│   └── shared/
│       ├── LevelUpModal.tsx
│       ├── ExportData.tsx
│       └── ImportData.tsx
├── assets/
│   └── sounds/
│       ├── level-up.mp3
│       ├── prayer-complete.mp3
│       ├── streak-break.mp3
│       └── sprint-complete.mp3
└── utils/
    └── haptics.ts
```

---

## Appendix A: Complete Database Schema

```sql
-- Core
CREATE TABLE user_profile (
  id TEXT PRIMARY KEY,
  name TEXT,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  skill_points INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,
  stats TEXT, -- JSON: {faith: 10, discipline: 10, ...}
  prayer_settings TEXT, -- JSON
  ai_settings TEXT, -- JSON
  theme TEXT DEFAULT 'dark',
  onboarding_complete INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TEXT
);

-- Prayers
CREATE TABLE prayers (
  id TEXT PRIMARY KEY,
  name TEXT,
  date TEXT,
  scheduled_time TEXT,
  status TEXT,
  prayed_at TEXT,
  xp_earned INTEGER DEFAULT 0
);

CREATE TABLE qada_prayers (
  id TEXT PRIMARY KEY,
  original_date TEXT,
  prayer_name TEXT,
  prayed_at TEXT,
  xp_earned INTEGER DEFAULT 0
);

-- Sleep
CREATE TABLE sleep_sessions (
  id TEXT PRIMARY KEY,
  sleep_start TEXT,
  sleep_end TEXT,
  duration_minutes INTEGER,
  quality TEXT,
  sleep_debt_minutes INTEGER DEFAULT 0,
  source TEXT
);

-- Habits
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  repeat_pattern TEXT, -- JSON
  related_stat TEXT,
  base_xp INTEGER,
  color TEXT,
  icon TEXT,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  created_at TEXT
);

CREATE TABLE habit_logs (
  id TEXT PRIMARY KEY,
  habit_id TEXT,
  date TEXT,
  completed INTEGER DEFAULT 0,
  completed_at TEXT,
  xp_earned INTEGER DEFAULT 0
);

-- Objectives
CREATE TABLE objectives (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  deadline TEXT,
  difficulty TEXT,
  status TEXT DEFAULT 'active',
  tags TEXT, -- JSON array
  related_stat TEXT,
  xp_reward INTEGER,
  created_at TEXT,
  completed_at TEXT,
  is_generated_by_ai INTEGER DEFAULT 0
);

-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  color TEXT,
  icon TEXT,
  status TEXT DEFAULT 'active',
  total_time_spent_minutes INTEGER DEFAULT 0,
  related_stat TEXT,
  created_at TEXT
);

CREATE TABLE project_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  title TEXT,
  type TEXT,
  repeat_pattern TEXT,
  status TEXT DEFAULT 'pending',
  deadline TEXT,
  xp_reward INTEGER
);

CREATE TABLE sprints (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  start_time TEXT,
  end_time TEXT,
  duration_minutes INTEGER,
  note TEXT,
  is_running INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0
);

-- Fitness
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  type TEXT,
  subtype TEXT,
  duration_minutes INTEGER,
  distance_km REAL,
  calories_burned INTEGER,
  date TEXT,
  xp_earned INTEGER DEFAULT 0
);

CREATE TABLE meals (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  quality TEXT,
  date TEXT,
  xp_earned INTEGER DEFAULT 0
);

-- Relations
CREATE TABLE relations (
  id TEXT PRIMARY KEY,
  name TEXT,
  relation_type TEXT,
  health INTEGER DEFAULT 100,
  max_health INTEGER DEFAULT 100,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  last_interaction TEXT,
  avatar TEXT,
  created_at TEXT
);

CREATE TABLE relation_activities (
  id TEXT PRIMARY KEY,
  relation_id TEXT,
  type TEXT,
  duration_minutes INTEGER,
  note TEXT,
  date TEXT,
  health_restored INTEGER,
  xp_earned INTEGER DEFAULT 0
);

CREATE TABLE relation_milestones (
  id TEXT PRIMARY KEY,
  relation_id TEXT,
  title TEXT,
  description TEXT,
  required_activities TEXT, -- JSON
  reward_stat TEXT,
  reward_points INTEGER,
  is_unlocked INTEGER DEFAULT 0,
  unlocked_at TEXT
);

-- Skill Tree
CREATE TABLE skill_tree_nodes (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  node_type TEXT,
  cost_sp INTEGER,
  requirements TEXT, -- JSON
  rewards TEXT, -- JSON
  rarity TEXT,
  visual_description TEXT,
  position_x REAL,
  position_y REAL,
  is_unlocked INTEGER DEFAULT 0,
  unlocked_at TEXT
);

-- Ledger
CREATE TABLE ledger_entries (
  id TEXT PRIMARY KEY,
  timestamp TEXT,
  module TEXT,
  action TEXT,
  entity_id TEXT,
  xp_change INTEGER DEFAULT 0,
  stat_changes TEXT, -- JSON
  metadata TEXT -- JSON
);

-- Daily Quests (AI-generated)
CREATE TABLE daily_quests (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  xp_reward INTEGER,
  related_stat TEXT,
  is_completed INTEGER DEFAULT 0,
  completed_at TEXT,
  generated_by_ai INTEGER DEFAULT 1,
  date TEXT
);

-- Indexes for performance
CREATE INDEX idx_prayers_date ON prayers(date);
CREATE INDEX idx_habit_logs_date ON habit_logs(date);
CREATE INDEX idx_ledger_timestamp ON ledger_entries(timestamp);
CREATE INDEX idx_sleep_start ON sleep_sessions(sleep_start);
CREATE INDEX idx_objectives_status ON objectives(status);
CREATE INDEX idx_sprints_project ON sprints(project_id);
CREATE INDEX idx_relation_activities_date ON relation_activities(date);
CREATE INDEX idx_daily_quests_date ON daily_quests(date);
```

---

## Appendix B: Version Dependency Map

```
Version 1 (Foundation)
    │
    ├── Version 2 (Sanctum) ──┐
    │                         │
    ├── Version 3 (Slumber) ──┤
    │                         │
    ├── Version 4 (Rituals) ──┤
    │                         │
    ├── Version 5 (Forge) ────┤
    │                         │
    ├── Version 6 (Vessel) ───┤
    │                         │
    └── Version 6 (Covenant) ─┘
                              │
                    Version 7 (Gamification)
                              │
                    Version 8 (AI / Oracle)
                              │
                    Version 9 (Skill Tree)
                              │
                    Version 10 (Polish)
```

Versions 2–6 are parallelizable once Version 1 is complete. However, the recommended path is sequential as listed for focus and momentum.

---

## Appendix C: AI Prompt Templates

### Daily Report Prompt
```
You are the Oracle of GitGud, a wise strategist analyzing a warrior's daily ledger.

USER CONTEXT:
- Name: {{name}}
- Level: {{level}}
- Current Stats: {{stats}}
- Last 7 Days Ledger: {{ledger}}
- Active Objectives: {{objectives}}
- Pending Qada: {{qadaCount}}
- Sleep Debt: {{sleepDebt}} hours
- Low Relations (health < 50): {{lowRelations}}
- Active Projects: {{projects}}
- Current Streak: {{streak}} days
- Due Habits Today: {{dueHabits}}
- Yesterday's Summary: {{yesterdaySummary}}

Generate a JSON response with:
1. "summary": Object with keys: prayer, sleep, projects, fitness, relations, habits — each 1-2 sentences.
2. "priorityScore": Object with urgent[], important[], growth[] arrays.
3. "dailyQuests": Array of 3 quests. Each: id, title, description, category, difficulty, xpReward, relatedStat, isCheckable.
4. "strategicAdvice": One paragraph connecting the dots.
5. "statFocus": Array of 2 stats to prioritize today.
6. "flavorText": One poetic line.

Rules:
- If sleep debt > 3h, prioritize rest.
- If relation health < 40, prioritize that relation.
- If Qada > 5, prioritize Qada.
- Make quests specific and actionable.
- Be concise but poetic.
```

### Skill Tree Node Prompt
```
The user has spent 3 Skill Points to discover a new node in GitGud.

CONTEXT:
- Dominant Stat (30 days): {{dominantStat}}
- Top Activities: {{topActivities}}
- Existing Nodes: {{unlockedNodes}}
- Current Level: {{level}}
- Current Stats: {{stats}}

Generate 3 unique node options as JSON array.
Each node:
- name: Creative RPG name (2-4 words)
- description: 1-2 sentences explaining the lore
- type: "stat" | "badge" | "ability" | "milestone"
- costSp: 3-7
- requirements: { minStat?: string, minValue?: number, activityProof?: string }
- rewards: { stats?: {}, passive?: string, ability?: string }
- rarity: "common" | "rare" | "epic" | "legendary"
- visualDescription: For UI rendering

Balance: Common nodes give +3-5 stats. Rare give +5-8 + passive. Epic give +8-12 + ability. Legendary require proof.
```

---

## Appendix D: Color Reference

### Dark Theme
| Element | Hex |
|---------|-----|
| Background Primary | `#0B0F19` |
| Background Secondary | `#151B2B` |
| Background Elevated | `#1E2636` |
| Text Primary | `#E8E2D9` |
| Text Secondary | `#8A92A5` |
| Accent Gold | `#D4AF37` |
| Accent Success | `#4ADE80` |
| Accent Danger | `#F87171` |
| Accent Warning | `#FBBF24` |
| Accent Info | `#60A5FA` |
| Border Subtle | `#2A3447` |
| Border Focus | `#D4AF37` |

### Light Theme
| Element | Hex |
|---------|-----|
| Background Primary | `#F5F1EB` |
| Background Secondary | `#E8E2D9` |
| Background Elevated | `#FFFFFF` |
| Text Primary | `#1A1A2E` |
| Text Secondary | `#5A5A6E` |
| Accent Gold | `#B8860B` |
| Accent Success | `#16A34A` |
| Accent Danger | `#DC2626` |
| Accent Warning | `#D97706` |
| Accent Info | `#2563EB` |
| Border Subtle | `#D1CCC5` |
| Border Focus | `#B8860B` |

---

*Document Version: 1.0*
*GitGud: Life OS — Sequential Development Roadmap*
*"Forge your life with intent."*

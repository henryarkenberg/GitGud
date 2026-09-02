# GitGud — Life OS

A gamified life-management RPG built in React Native (Expo SDK 57) with a local-first architecture.
Every prayer, sprint, meal, and conversation feeds your character — stats rise, skills unlock, and an
AI Oracle turns your days into strategy.

> "Forge your life with intent."

## Status: Version 1 — The Foundation

- Expo SDK 57 project (works in Expo Go), expo-router navigation with 5 RPG-styled bottom tabs
  (Today, Sanctum, Forge, Rituals, Aetherium) + stack screens (Settings, Onboarding, Slumber, Vessel, Covenant, Ledger)
- NativeWind v5 + Tailwind CSS v4 (CSS-first, no babel config) with design tokens for
  Obsidian/Parchment themes — dark wooden gold-leaf aesthetic (Darkest Dungeon meets Notion)
- Cinzel (display), Inter (body), JetBrains Mono (data) fonts
- SQLite (`expo-sqlite`) with `user_profile`, `ledger_entries`, `app_state` tables (WAL mode)
- Zustand stores + AsyncStorage for theme preference
- Onboarding flow: hero name, prayer calculation method, madhab, theme, optional OpenAI key
- Today dashboard: character card with 9 stat bars, level/XP/SP/gold/streak, module empty-states
- Settings: theme switch, prayer settings, AI key, JSON backup export (share sheet), full data reset

See `GitGud_Life_OS_Development_Roadmap.md` for the 10-version build plan (next: **V2 Sanctum — Prayer Tracker**).

## Development

```bash
npm install
npx expo start        # scan QR with Expo Go (SDK 57)
npm run lint          # expo lint
npx tsc --noEmit      # typecheck
npx expo export       # verify bundling
```

## Layout

```
src/
├── app/            # expo-router routes: (tabs)/ + (stack)/
├── components/     # tw/ (CSS-enabled wrappers), ui/, shared/
├── constants/      # theme tokens, AI config
├── db/             # schema, database init, repositories
├── hooks/          # useAppTheme
├── stores/         # useUserStore (SQLite-backed), useThemeStore (AsyncStorage)
├── types/          # domain types
└── utils/          # id, xp, exportData
```
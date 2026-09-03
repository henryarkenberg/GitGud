<p align="center">
  <img src="assets/images/mainLogo.png" alt="GitGud" width="220" />
</p>

<h1 align="center">GitGud Life OS</h1>

<p align="center">
  A gamified life-management RPG. Every prayer, sleep, sprint, meal, and conversation feeds your character. Stats grow, skills unlock, and an AI Oracle turns your daily habits into strategy.
</p>

<p align="center">
  <em>Forge your life with intent.</em>
</p>

---

## Download and test

A built Android preview is available as an internal release. Install it on your device and start building your character.

<p align="center">
  <a href="https://expo.dev/accounts/henryarkenberg/projects/gitgud/builds/bdda303b-3868-4fa8-a85e-e1bf169dfe4b">
    <img src="https://api.iconify.design/ion/logo-google-playstore.svg?color=%23ffffff" alt="Download" width="24" />
    &nbsp;<b>Get the build</b>
  </a>
</p>

---

## What it does

GitGud is a local-first app that turns real life into an RPG. It has ten connected systems that all feed one character:

- **Sanctum** - track prayers with a countdown, sunrise gauge, and Qada backlog.
- **Slumber** - log sleep and wake windows to keep your rest on target.
- **Forge** - manage projects and run focus sprints with a live timer.
- **Rituals & Quests** - build daily habits with streaks and long-term objectives.
- **Vessel** - lift, run, and eat. Every workout and meal counts toward your body.
- **Covenant** - maintain the people in your life; relationships decay if you neglect them.
- **Oracle** - an AI friend that writes your daily report, sets quests, and chats with you to plan your day.
- **Aetherium** - a skill tree where you spend skill points to become more powerful.
- **Core Engine** - XP, levels, gold, streak, and a full ledger behind every action.

Everything lives on your device in SQLite. There are no accounts and no servers (except the optional AI).

---

## Built with

<p align="center">
  <img src="https://api.iconify.design/ion/logo-react.svg?color=%23ffffff" alt="React Native" width="26" />
  <img src="https://api.iconify.design/ion/logo-javascript.svg?color=%23ffffff" alt="TypeScript" width="26" />
  <img src="https://api.iconify.design/ion/logo-nodejs.svg?color=%23ffffff" alt="Node" width="26" />
  <img src="https://api.iconify.design/ion/logo-npm.svg?color=%23ffffff" alt="npm" width="26" />
  <img src="https://api.iconify.design/ion/logo-github.svg?color=%23ffffff" alt="Git" width="26" />
  <img src="https://api.iconify.design/ion/logo-android.svg?color=%23ffffff" alt="Android" width="26" />
  <img src="https://api.iconify.design/ion/logo-apple.svg?color=%23ffffff" alt="iOS" width="26" />
</p>

<p align="center">
  Expo SDK 57, React Native, TypeScript &middot; expo-router, expo-sqlite &middot; Zustand stores &middot; NativeWind (Tailwind CSS) &middot; OpenAI-powered Oracle
</p>

---

## Run it yourself

```bash
npm install
npx expo start        # scan the QR code with Expo Go (SDK 57)
npm run lint          # lint check
npx tsc --noEmit      # typecheck
npx expo export       # verify the bundle
```

This is a fully local app, so it works in Expo Go with no configuration. Add an OpenAI API key in Settings to activate the Oracle.

---

## Project layout

```
src/
├── app/            # expo-router routes: (tabs) + (stack)
├── components/     # UI, shared, and CSS-enabled (tw) wrappers
├── constants/      # theme tokens, AI config
├── db/             # schema, database init, repositories
├── hooks/          # shared hooks
├── services/       # AI, progression, notifications, backup
├── stores/         # Zustand state (SQLite-backed)
├── types/          # domain types
└── utils/          # ids, xp, formatting
```

See `GitGud_Life_OS_Development_Roadmap.md` for the full 10-version build plan.

export const DAILY_REPORT_SYSTEM =
  'You are the Oracle of GitGud, a wise strategist analyzing a warrior\'s daily ledger. Respond ONLY with valid JSON matching the requested schema. No commentary, no markdown.';

export function dailyReportPrompt(context: string): string {
  return `
Generate a daily strategic report as JSON. Schema:
{
  "summary": { "prayer": "", "sleep": "", "projects": "", "fitness": "", "relations": "", "habits": "" },
  "priorities": { "urgent": [], "important": [], "growth": [] },
  "dailyQuests": [
    { "id": "q1", "title": "", "description": "", "category": "prayer|sleep|project|fitness|relation|habit", "difficulty": "easy|medium|hard", "xpReward": 30, "relatedStat": "discipline", "isCheckable": true }
  ],
  "strategicAdvice": "",
  "statFocus": [],
  "flavorText": ""
}

Rules:
- Generate EXACTLY 3 dailyQuests, each specific and actionable.
- XP rewards: easy 20-40, medium 40-70, hard 70-120.
- If sleep debt > 3h, prioritize rest. If relation health < 40, prioritize that relation. If pending Qada > 5, prioritize Qada.
- statFocus has exactly 2 stats. flavorText is one poetic line. Be concise but poetic.

USER CONTEXT:
${context}
`;
}

export const NODE_DISCOVERY_SYSTEM =
  'You are the Oracle of the Aetherium, a mystical skill tree that grows with a warrior\'s life. Respond ONLY with valid JSON matching the schema. No commentary.';

export function nodeDiscoveryPrompt(context: string): string {
  return `
Generate 3 unique skill tree node options as JSON. Schema:
{
  "options": [
    {
      "name": "",
      "description": "",
      "nodeType": "stat|badge|ability|milestone",
      "rarity": "common|rare|epic|legendary",
      "relatedStat": "faith|discipline|strength|agility|vitality|wisdom|focus|charisma|empathy",
      "costSp": 3,
      "rewards": { "stats": { "discipline": 3 }, "passive": "", "ability": "" },
      "requirements": { "minStat": "discipline", "minValue": 40, "activityProof": "" }
    }
  ]
}

Rules:
- Exactly 3 options. Name them with RPG flavor (2-4 words).
- stat nodes give +3-5 to one stat (common), badge give a passive, ability gives an app-relevant ability, milestone is a major achievement.
- Balance: common costSp 2-3, rare 4-5, epic 8, legendary 12.
- costSp matches rarity. Keep relatedStat aligned with the warrior's dominant stat or activities.

USER CONTEXT:
${context}
`;
}

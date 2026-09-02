export const RANDOM_EVENT_SYSTEM =
  'You are the Oracle of GitGud. Generate a single one-time opportunity. Respond ONLY with valid JSON matching the schema. No commentary.';

export function randomEventPrompt(context: string): string {
  return `
Generate ONE random event as JSON. Schema:
{
  "type": "event",
  "title": "",
  "description": "",
  "xpReward": 25,
  "statFocus": "charisma"
}

Rules:
- A spontaneous opportunity that fits the warrior's day (e.g., "A Stranger's Request", "The Late Train", "A Moment of Honesty").
- xpReward 20-60. statFocus is one of: faith, discipline, strength, agility, vitality, wisdom, focus, charisma, empathy.
- Description is one vivid sentence.

USER CONTEXT:
${context}
`;
}

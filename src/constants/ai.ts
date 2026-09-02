/**
 * AI configuration.
 * Personal-use build: the OpenAI API key is stored here (or pasted in Settings).
 * The app never ships this to a store.
 */
export const AI = {
  defaultModel: 'gpt-4o-mini',
  defaultApiKey: '',
  dailyReportTime: '07:00',
  maxTokens: 2000,
  temperatureAnalysis: 0.3,
  temperatureCreative: 0.7,
} as const;
import { GoogleGenAI } from '@google/genai';
import { GEMINI_CONFIG } from '../config';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  if (customApiKey && customApiKey.trim()) {
    try {
      return new GoogleGenAI({ apiKey: customApiKey.trim() });
    } catch {
      return null;
    }
  }

  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// In-memory cooldown tracker to gracefully bypass rate-limited/429 models
const modelCooldownUntil: Record<string, number> = {};

export function isModelCoolingDown(model: string): boolean {
  const until = modelCooldownUntil[model];
  if (!until) return false;
  if (Date.now() > until) {
    delete modelCooldownUntil[model];
    return false;
  }
  return true;
}

export function recordModelQuotaExhausted(model: string, seconds = GEMINI_CONFIG.COOLDOWN_SECONDS) {
  modelCooldownUntil[model] = Date.now() + seconds * 1000;
}

export const RECOMMENDED_MODELS = GEMINI_CONFIG.RECOMMENDED_MODELS;

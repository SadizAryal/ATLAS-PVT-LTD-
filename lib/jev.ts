"use client";

import { OPEN_QUESTION } from "./config";

export type JudgeResult = { label: "safe" | "unsafe" | "unclear"; confidence: number; fallback: boolean };

export async function judgeSafety(text: string): Promise<JudgeResult> {
  const fallback: JudgeResult = { label: "unclear", confidence: 0.45, fallback: true };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch("/api/judge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return fallback;
    const data = (await res.json()) as { label: string; confidence: number };
    if (data.label !== "safe" && data.label !== "unsafe" && data.label !== "unclear") return fallback;
    const confident = data.confidence >= 0.7;
    return { label: data.label, confidence: data.confidence, fallback: !confident };
  } catch {
    return fallback;
  }
}

export function feedbackFor(result: JudgeResult): string {
  if (result.fallback) return OPEN_QUESTION.modelAnswer;
  if (result.label === "safe") return "Correct thinking. " + OPEN_QUESTION.modelAnswer;
  if (result.label === "unsafe") return "Not safe. Never use a blocked exit or shift heavy pallets alone. " + OPEN_QUESTION.modelAnswer;
  return OPEN_QUESTION.modelAnswer;
}

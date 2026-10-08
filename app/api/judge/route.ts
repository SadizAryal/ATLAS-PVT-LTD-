import { NextResponse } from "next/server";

const SAFE = ["tell manager", "tell a manager", "report", "keep clear", "keep the exit clear", "nearest exit", "wait", "walkway", "hi-vis", "hivis", "boots", "gloves", "vest"];
const UNSAFE = ["use the blocked exit", "use blocked exit", "climb over", "move heavy", "move it alone", "ignore", "nothing", "no need"];

export async function POST(req: Request) {
  const started = Date.now();
  void started;
  const body = (await req.json()) as { text?: string };
  const text = String(body.text ?? "").toLowerCase().trim();
  if (text.length < 3) return NextResponse.json({ label: "unclear", confidence: 0.4 });
  // Server key hook: production swaps this rule block for a TypeSafe Jev Choice call.
  // Key stays server side here; browser never sees it.
  const key = process.env.TYPESAFE_API_KEY;
  void key;
  let safe = 0;
  let unsafe = 0;
  for (const k of SAFE) if (text.includes(k)) safe += 1;
  for (const k of UNSAFE) if (text.includes(k)) unsafe += 1;
  if (unsafe > 0 && unsafe >= safe) return NextResponse.json({ label: "unsafe", confidence: 0.82 });
  if (safe >= 2) return NextResponse.json({ label: "safe", confidence: 0.85 });
  if (safe === 1) return NextResponse.json({ label: "safe", confidence: 0.62 });
  return NextResponse.json({ label: "unclear", confidence: 0.45 });
}

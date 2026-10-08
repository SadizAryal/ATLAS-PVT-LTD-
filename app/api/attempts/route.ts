import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "data", "attempts.json");

function readAll(): unknown[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf-8")) as unknown[];
  } catch {
    return [];
  }
}

export async function GET() {
  return NextResponse.json({ attempts: readAll() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Record<string, unknown>;
  const name = String(body.name ?? "").trim().slice(0, 80);
  const score = Math.max(0, Math.min(100, Number(body.score ?? 0)));
  if (name.length < 2) return NextResponse.json({ error: "name required" }, { status: 400 });
  const row = {
    name,
    score,
    passed: score >= 70,
    date: new Date().toISOString(),
    needsReview: Boolean(body.needsReview),
    openLabel: String(body.openLabel ?? ""),
  };
  const cur = readAll();
  cur.push(row);
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(cur, null, 2));
  return NextResponse.json({ ok: true, attempt: row });
}

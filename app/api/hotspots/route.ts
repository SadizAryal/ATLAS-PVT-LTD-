import { NextResponse } from "next/server";
import { CONFIG } from "@/lib/config";
import fs from "node:fs";
import path from "node:path";

export type AdminHotspot = {
  id: string;
  label: string;
  yaw: number;
  pitch: number;
  hazard: string;
  fix: string;
  roleTag: string;
  active: boolean;
};

const FILE = path.join(process.cwd(), "data", "hotspots.json");

function base(): AdminHotspot[] {
  return (CONFIG.HOTSPOTS as readonly unknown[]).map((h, i) => {
    const s = h as Record<string, unknown>;
    const tags = ["all", "all", "all", "forklift-driver", "picker"];
    return {
      id: String(s.id ?? `hs-${i}`),
      label: String(s.label ?? `Point ${i + 1}`),
      yaw: Number(s.yaw ?? 0),
      pitch: Number(s.pitch ?? 0),
      hazard: String(s.hazard ?? ""),
      fix: String(s.fix ?? ""),
      roleTag: tags[i % tags.length],
      active: true,
    };
  });
}

function readAdmin(): AdminHotspot[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf-8")) as AdminHotspot[];
  } catch {
    return [];
  }
}

export async function GET() {
  const merged = new Map<string, AdminHotspot>();
  for (const h of base()) merged.set(h.id, h);
  for (const h of readAdmin()) merged.set(h.id, h);
  const list = [...merged.values()].filter((h) => h.active);
  return NextResponse.json({ hotspots: list, total: list.length });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<AdminHotspot>;
  if (!body.label || !body.hazard || !body.fix) {
    return NextResponse.json({ error: "label, hazard and fix are required" }, { status: 400 });
  }
  const yaw = Math.max(-180, Math.min(180, Number(body.yaw ?? 0)));
  const pitch = Math.max(-90, Math.min(90, Number(body.pitch ?? 0)));
  const item: AdminHotspot = {
    id: (body.id || body.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")).slice(0, 40),
    label: String(body.label).slice(0, 60),
    yaw,
    pitch,
    hazard: String(body.hazard).slice(0, 240),
    fix: String(body.fix).slice(0, 240),
    roleTag: String(body.roleTag || "all").slice(0, 30),
    active: body.active !== false,
  };
  const cur = readAdmin().filter((h) => h.id !== item.id);
  cur.push(item);
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(cur, null, 2));
  return NextResponse.json({ ok: true, hotspot: item });
}

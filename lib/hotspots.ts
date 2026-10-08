"use client";

import { useEffect, useState } from "react";
import { CONFIG } from "./config";

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

const KEY = "atlas-hotspots-admin-v1";

export function baseHotspots(): AdminHotspot[] {
  return (CONFIG.HOTSPOTS as readonly unknown[]).map((h) => {
    const s = h as Record<string, string | number | boolean>;
    return {
      id: String(s.id),
      label: String(s.label),
      yaw: Number(s.yaw),
      pitch: Number(s.pitch),
      hazard: String(s.hazard),
      fix: String(s.fix),
      roleTag: String(s.roleTag ?? "all"),
      active: Boolean(s.active ?? true),
    };
  });
}

export function useHotspots() {
  const [spots, setSpots] = useState<AdminHotspot[]>(baseHotspots);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/hotspots", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { hotspots: AdminHotspot[] };
          if (!cancelled && data.hotspots?.length) {
            setSpots(data.hotspots);
            window.localStorage.setItem(KEY, JSON.stringify(data.hotspots));
          }
        } else throw new Error("api");
      } catch {
        try {
          const saved = window.localStorage.getItem(KEY);
          if (!cancelled && saved) setSpots(JSON.parse(saved) as AdminHotspot[]);
        } catch {
          /* base stays */
        }
      }
      if (!cancelled) setReady(true);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);
  return { spots: spots.filter((s) => s.active), all: spots, ready };
}

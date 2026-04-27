import type { NaicsCode } from '@/types/naics';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export function getSectors(versionYear = 2022): Promise<NaicsCode[]> {
  return get(`/naics-codes?level=SECTOR&versionYear=${versionYear}&isActive=true`);
}

export function getChildren(id: string): Promise<NaicsCode[]> {
  return get(`/naics-codes/${id}/children`);
}

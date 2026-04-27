import type { NaicsCode } from '@/types/naics';
import api from './api';

export function getSectors(versionYear = 2022): Promise<NaicsCode[]> {
  return api
    .get<NaicsCode[]>('/naics-codes', {
      params: { level: 'SECTOR', versionYear, isActive: true },
    })
    .then((r) => r.data);
}

export function getChildren(id: string): Promise<NaicsCode[]> {
  return api.get<NaicsCode[]>(`/naics-codes/${id}/children`).then((r) => r.data);
}

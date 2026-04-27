export type NaicsLevel =
  | 'SECTOR'
  | 'SUBSECTOR'
  | 'INDUSTRY_GROUP'
  | 'NAICS_INDUSTRY'
  | 'NATIONAL_INDUSTRY';

export interface NaicsCode {
  id: string;
  code: string;
  versionYear: number;
  title: string;
  description: string | null;
  level: NaicsLevel;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const NAICS_LEVEL_LABEL: Record<NaicsLevel, string> = {
  SECTOR: 'Sector',
  SUBSECTOR: 'Subsector',
  INDUSTRY_GROUP: 'Industry Group',
  NAICS_INDUSTRY: 'NAICS Industry',
  NATIONAL_INDUSTRY: 'National Industry',
};

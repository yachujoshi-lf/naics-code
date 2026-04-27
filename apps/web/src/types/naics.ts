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

export interface NaicsCodeWithRelations extends NaicsCode {
  parent: NaicsCode | null;
  children: NaicsCode[];
}

export const NAICS_LEVEL_LABEL: Record<NaicsLevel, string> = {
  SECTOR: 'Sector',
  SUBSECTOR: 'Subsector',
  INDUSTRY_GROUP: 'Industry Group',
  NAICS_INDUSTRY: 'NAICS Industry',
  NATIONAL_INDUSTRY: 'National Industry',
};

export const LEVEL_COLORS: Record<NaicsLevel, string> = {
  SECTOR:            'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  SUBSECTOR:         'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  INDUSTRY_GROUP:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  NAICS_INDUSTRY:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  NATIONAL_INDUSTRY: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

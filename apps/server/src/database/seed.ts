import * as ExcelJS from 'exceljs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { NaicsCode, NaicsLevel } from '../naics-code/naics-code.entity';
import AppDataSource from './data-source';

const VERSION_YEAR = 2022;
const XLSX_PATH = join(__dirname, '../naics-code/2022-naics-codes.xlsx');
const SHEET_NAME = 'Two-Six Digit NAICS';

// 3-digit subsector prefix → the range-code sector it belongs to
const RANGE_SECTOR_MAP: Record<string, string> = {
  '31': '31-33',
  '32': '31-33',
  '33': '31-33',
  '44': '44-45',
  '45': '44-45',
  '48': '48-49',
  '49': '48-49',
};

interface ParsedRow {
  code: string;
  title: string;
  description: string | null;
  level: NaicsLevel;
  sortOrder: number;
}

function extractTitle(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'richText' in v) {
    const parts = (v as ExcelJS.CellRichTextValue).richText;
    const full = parts
      .map((r) => r.text)
      .join('')
      .trim();
    // Strip trailing 'T' footnote marker from Census Bureau Excel format
    return full.endsWith('T') ? full.slice(0, -1).trim() : full;
  }
  return String(v ?? '').trim();
}

function extractDescription(cell: ExcelJS.Cell): string | null {
  const v = cell.value;
  if (!v || v === 'NULL') return null;
  const s = typeof v === 'string' ? v.trim() : String(v).trim();
  return s || null;
}

function levelAndOrder(code: string): { level: NaicsLevel; sortOrder: number } {
  if (code.includes('-')) return { level: NaicsLevel.SECTOR, sortOrder: 0 };
  switch (code.length) {
    case 2:
      return { level: NaicsLevel.SECTOR, sortOrder: 0 };
    case 3:
      return { level: NaicsLevel.SUBSECTOR, sortOrder: 1 };
    case 4:
      return { level: NaicsLevel.INDUSTRY_GROUP, sortOrder: 2 };
    case 5:
      return { level: NaicsLevel.NAICS_INDUSTRY, sortOrder: 3 };
    case 6:
      return { level: NaicsLevel.NATIONAL_INDUSTRY, sortOrder: 4 };
    default:
      throw new Error(`Unexpected code "${code}"`);
  }
}

function parentCodeFor(code: string): string | null {
  // Range-sector codes (31-33, 44-45, 48-49) have no parent
  if (code.includes('-') || code.length <= 2) return null;

  // 3-digit codes: check if their 2-digit prefix belongs to a range sector
  if (code.length === 3) {
    const prefix = code.slice(0, 2);
    return RANGE_SECTOR_MAP[prefix] ?? prefix;
  }

  return code.slice(0, -1);
}

async function parseSheet(): Promise<ParsedRow[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const sheet = wb.getWorksheet(SHEET_NAME);
  if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found in workbook`);

  const rows: ParsedRow[] = [];

  sheet.eachRow((row, rn) => {
    if (rn === 1) return; // skip header

    const codeRaw = row.getCell(2).value;
    const code = String(codeRaw ?? '').trim();
    if (!code) return;

    // Accept numeric codes and the three known range-sector codes
    const isRangeSector = code.includes('-');
    if (!isRangeSector && isNaN(Number(code))) return;

    const { level, sortOrder } = levelAndOrder(code);

    rows.push({
      code,
      title: extractTitle(row.getCell(3)),
      description: extractDescription(row.getCell(4)),
      level,
      sortOrder,
    });
  });

  // Insert sectors before subsectors before industry groups, etc.
  rows.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code),
  );
  return rows;
}

async function run(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(NaicsCode);

  const existing = await repo.count({ where: { versionYear: VERSION_YEAR } });
  if (existing > 0) {
    console.log(
      `Skipping seed — ${existing} records already exist for ${VERSION_YEAR}.`,
    );
    return;
  }

  const rows = await parseSheet();
  console.log(`Parsed ${rows.length} rows from "${SHEET_NAME}".`);

  // code → saved entity; used for parent_id resolution
  const codeMap = new Map<string, NaicsCode>();
  let inserted = 0;

  for (const row of rows) {
    const parentCode = parentCodeFor(row.code);
    const parent = parentCode ? (codeMap.get(parentCode) ?? null) : null;

    if (parentCode && !parent) {
      console.warn(
        `  WARN: parent "${parentCode}" not found for code "${row.code}" — inserting with null parent`,
      );
    }

    const entity = repo.create({
      code: row.code,
      versionYear: VERSION_YEAR,
      title: row.title,
      description: row.description,
      level: row.level,
      parentId: parent?.id ?? null,
      isActive: true,
    });

    const saved = await repo.save(entity);
    codeMap.set(row.code, saved);
    inserted++;
  }

  console.log(`Done. Inserted ${inserted} NAICS ${VERSION_YEAR} records.`);
}

async function main(): Promise<void> {
  await AppDataSource.initialize();
  try {
    await run(AppDataSource);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

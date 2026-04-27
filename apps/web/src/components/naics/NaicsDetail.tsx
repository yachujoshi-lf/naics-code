import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronRight, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOne } from '@/services/naics';
import { LEVEL_COLORS, NAICS_LEVEL_LABEL } from '@/types/naics';
import type { NaicsCode, NaicsLevel } from '@/types/naics';

/* ── Constants ── */

const LEVELS: NaicsLevel[] = [
  'SECTOR', 'SUBSECTOR', 'INDUSTRY_GROUP', 'NAICS_INDUSTRY', 'NATIONAL_INDUSTRY',
];

const LEVEL_SHORT = ['Sector', 'Sub', 'Group', 'Ind.', 'Nat.'];

const LEVEL_DOT: Record<NaicsLevel, string> = {
  SECTOR:            'bg-violet-500',
  SUBSECTOR:         'bg-blue-500',
  INDUSTRY_GROUP:    'bg-emerald-500',
  NAICS_INDUSTRY:    'bg-amber-500',
  NATIONAL_INDUSTRY: 'bg-rose-500',
};

const CHILD_SECTION_LABEL: Partial<Record<NaicsLevel, string>> = {
  SECTOR:         'Subsectors',
  SUBSECTOR:      'Industry Groups',
  INDUSTRY_GROUP: 'NAICS Industries',
  NAICS_INDUSTRY: 'National Industries',
};

/* ── Level depth indicator ── */

function LevelDepth({ level }: { level: NaicsLevel }) {
  const currentIdx = LEVELS.indexOf(level);

  return (
    <div
      className="flex items-start mb-5"
      aria-label={`Hierarchy level ${currentIdx + 1} of 5: ${NAICS_LEVEL_LABEL[level]}`}
    >
      {LEVELS.map((l, i) => (
        <div key={l} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'w-2 h-2 rounded-full transition-colors duration-200',
                i <= currentIdx ? LEVEL_DOT[l] : 'bg-muted-foreground/20',
              )}
            />
            <span
              className={cn(
                'text-[9px] leading-none whitespace-nowrap transition-colors',
                i === currentIdx
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground/35',
              )}
            >
              {LEVEL_SHORT[i]}
            </span>
          </div>
          {i < LEVELS.length - 1 && (
            <div
              className={cn(
                'w-7 sm:w-10 h-px mb-3 mx-1',
                i < currentIdx ? 'bg-muted-foreground/25' : 'bg-muted-foreground/10',
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Copy button ── */

function CopyBtn({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy code"
      aria-label="Copy NAICS code"
      className={cn(
        'p-1.5 rounded-md transition-all duration-150 cursor-pointer shrink-0',
        'text-muted-foreground hover:text-foreground hover:bg-muted',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

/* ── Children display ── */

function ChildrenGrid({
  children,
  parentLevel,
  onNavigate,
}: {
  children: NaicsCode[];
  parentLevel: NaicsLevel;
  onNavigate: (id: string) => void;
}) {
  const useGrid = parentLevel === 'SECTOR' || parentLevel === 'SUBSECTOR';

  if (useGrid) {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => onNavigate(child.id)}
            className={cn(
              'flex flex-col items-start p-3 rounded-lg text-left cursor-pointer group',
              'border border-border/60 bg-card',
              'hover:bg-muted/50 hover:border-border',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            )}
          >
            <span
              className={cn(
                'shrink-0 font-mono text-[11px] font-medium px-1.5 py-0.5 rounded mb-2',
                LEVEL_COLORS[child.level],
              )}
            >
              {child.code}
            </span>
            <span className="text-[12px] leading-snug text-foreground min-w-0">
              {child.title}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {children.map((child) => (
        <button
          key={child.id}
          onClick={() => onNavigate(child.id)}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer',
            'text-left transition-colors duration-150 group',
            'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          )}
        >
          <span
            className={cn(
              'shrink-0 font-mono text-[11px] font-medium px-1.5 py-0.5 rounded',
              LEVEL_COLORS[child.level],
            )}
          >
            {child.code}
          </span>
          <span className="text-[13px] flex-1 min-w-0 truncate text-foreground">
            {child.title}
          </span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
        </button>
      ))}
    </div>
  );
}

/* ── Main component ── */

interface NaicsDetailProps {
  nodeId: string;
  onNavigate: (id: string) => void;
}

export function NaicsDetail({ nodeId, onNavigate }: NaicsDetailProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['naics-detail', nodeId],
    queryFn: () => getOne(nodeId),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-destructive">Failed to load details.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">

      {/* ── Hero card ── */}
      <div className="relative rounded-xl border border-border/70 overflow-hidden bg-card mb-6 p-5">
        {/* Background watermark */}
        <div
          aria-hidden="true"
          className="absolute right-2 bottom-0 font-mono font-black select-none pointer-events-none leading-none text-foreground opacity-[0.04]"
          style={{ fontSize: 'clamp(3.5rem, 12vw, 7rem)' }}
        >
          {data.code}
        </div>

        {/* Level depth dots */}
        <LevelDepth level={data.level} />

        {/* Breadcrumb */}
        {data.parent && (
          <nav className="flex items-center gap-1 text-[11px] text-muted-foreground mb-3">
            <button
              className="font-mono hover:text-foreground transition-colors cursor-pointer"
              onClick={() => onNavigate(data.parent!.id)}
            >
              {data.parent.code}
            </button>
            <ChevronRight className="h-2.5 w-2.5 shrink-0" />
            <span className="font-mono text-foreground font-medium">{data.code}</span>
          </nav>
        )}

        {/* Code + badge + copy */}
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-[2.75rem] leading-none font-mono font-bold tracking-tight text-foreground">
            {data.code}
          </span>
          <CopyBtn code={data.code} />
          <span
            className={cn(
              'ml-auto self-start text-[11px] font-medium px-2 py-1 rounded-md',
              LEVEL_COLORS[data.level],
            )}
          >
            {NAICS_LEVEL_LABEL[data.level]}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-[15px] font-semibold leading-snug text-foreground">
          {data.title}
        </h2>
      </div>

      {/* ── Description ── */}
      {data.description && (
        <div className="mb-6 px-4 py-3.5 rounded-lg bg-muted/40 border-l-2 border-muted-foreground/20 text-[13px] text-muted-foreground leading-relaxed">
          {data.description}
        </div>
      )}

      {/* ── Children ── */}
      {data.children && data.children.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {CHILD_SECTION_LABEL[data.level] ?? 'Entries'}
            </span>
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">
              {data.children.length}
            </span>
          </div>
          <ChildrenGrid
            children={data.children}
            parentLevel={data.level}
            onNavigate={onNavigate}
          />
        </section>
      )}

      {/* ── Leaf node marker ── */}
      {data.level === 'NATIONAL_INDUSTRY' && (
        <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground/60">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400/60 shrink-0" />
          Most granular classification level
        </div>
      )}
    </div>
  );
}

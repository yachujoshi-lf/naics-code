import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronRight, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOne } from '@/services/naics';
import { LEVEL_COLORS, NAICS_LEVEL_LABEL } from '@/types/naics';
import type { NaicsCode, NaicsLevel } from '@/types/naics';

const CHILD_LEVEL: Partial<Record<NaicsLevel, string>> = {
  SECTOR: 'Subsectors',
  SUBSECTOR: 'Industry Groups',
  INDUSTRY_GROUP: 'NAICS Industries',
  NAICS_INDUSTRY: 'National Industries',
};

interface NaicsDetailProps {
  nodeId: string;
  onNavigate: (id: string) => void;
}

export function NaicsDetail({ nodeId, onNavigate }: NaicsDetailProps) {
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['naics-detail', nodeId],
    queryFn: () => getOne(nodeId),
    staleTime: Infinity,
  });

  const copyCode = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
      {/* Level badge */}
      <div className="mb-5">
        <span
          className={cn(
            'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md',
            LEVEL_COLORS[data.level],
          )}
        >
          {NAICS_LEVEL_LABEL[data.level]}
        </span>
      </div>

      {/* Parent breadcrumb */}
      {data.parent && (
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <button
            className="font-mono hover:text-foreground transition-colors cursor-pointer"
            onClick={() => onNavigate(data.parent!.id)}
          >
            {data.parent.code}
          </button>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-mono text-foreground font-medium">{data.code}</span>
        </nav>
      )}

      {/* Code + copy button */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl font-mono font-bold tracking-tight text-foreground">
          {data.code}
        </span>
        <button
          onClick={copyCode}
          title="Copy code"
          aria-label="Copy NAICS code"
          className={cn(
            'p-1.5 rounded-md transition-colors duration-150 cursor-pointer',
            'text-muted-foreground hover:text-foreground hover:bg-muted',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          )}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold leading-snug mb-5 text-foreground">
        {data.title}
      </h2>

      {/* Description */}
      {data.description && (
        <div className="mb-6 p-4 rounded-lg bg-muted/40 border border-border/60 text-sm text-muted-foreground leading-relaxed">
          {data.description}
        </div>
      )}

      {/* Children list */}
      {data.children && data.children.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {CHILD_LEVEL[data.level] ?? 'Entries'}
            </h3>
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {data.children.length}
            </span>
          </div>

          <div className="space-y-0.5">
            {data.children.map((child: NaicsCode) => (
              <button
                key={child.id}
                onClick={() => onNavigate(child.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer',
                  'text-left transition-colors duration-150 group',
                  'hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
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
                <span className="text-sm flex-1 min-w-0 truncate text-foreground">
                  {child.title}
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Leaf node indicator */}
      {data.level === 'NATIONAL_INDUSTRY' && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-rose-400/70 inline-block shrink-0" />
          Most granular classification level
        </div>
      )}
    </div>
  );
}

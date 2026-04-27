import { useEffect, useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getChildren, getSectors } from '@/services/naics';
import type { NaicsCode, NaicsLevel } from '@/types/naics';
import { NAICS_LEVEL_LABEL } from '@/types/naics';
import { cn } from '@/lib/utils';

const LEVEL_COLORS: Record<NaicsLevel, string> = {
  SECTOR:            'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  SUBSECTOR:         'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  INDUSTRY_GROUP:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  NAICS_INDUSTRY:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  NATIONAL_INDUSTRY: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

interface NaicsNodeProps {
  node: NaicsCode;
  depth: number;
}

function NaicsNode({ node, depth }: NaicsNodeProps) {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<NaicsCode[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLeaf = node.level === 'NATIONAL_INDUSTRY';

  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && children === null) {
      setLoading(true);
      setError(null);
      try {
        setChildren(await getChildren(node.id));
      } catch {
        setError('Failed to load. Try again.');
      } finally {
        setLoading(false);
      }
    }
  }

  const trigger = (
    <div className={cn(
      'flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md transition-colors',
      'hover:bg-muted/60',
      open && 'bg-muted/40',
    )}>
      <span className="shrink-0 w-4 flex items-center justify-center">
        {!isLeaf && (
          <ChevronRight className={cn(
            'h-3.5 w-3.5 text-muted-foreground transition-transform duration-150',
            open && 'rotate-90',
          )} />
        )}
      </span>

      <span className={cn(
        'shrink-0 font-mono text-[11px] font-medium px-1.5 py-0.5 rounded',
        LEVEL_COLORS[node.level],
      )}>
        {node.code}
      </span>

      <span className="text-sm leading-snug">{node.title}</span>

      <span className="ml-auto shrink-0 text-[10px] text-muted-foreground hidden sm:block">
        {NAICS_LEVEL_LABEL[node.level]}
      </span>
    </div>
  );

  if (isLeaf) {
    return <div>{trigger}</div>;
  }

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger asChild>
        <button className="w-full">{trigger}</button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className={cn(
          'ml-6 mt-0.5 mb-0.5 space-y-0.5',
          depth < 4 && 'border-l border-border/60 pl-2',
        )}>
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading…
            </div>
          )}
          {error && (
            <div className="px-3 py-2 text-sm text-destructive">{error}</div>
          )}
          {children?.map((child) => (
            <NaicsNode key={child.id} node={child} depth={depth + 1} />
          ))}
          {!loading && !error && children?.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground italic">No entries.</div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface NaicsAccordionProps {
  versionYear?: number;
}

export function NaicsAccordion({ versionYear = 2022 }: NaicsAccordionProps) {
  const [sectors, setSectors] = useState<NaicsCode[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSectors(versionYear)
      .then(setSectors)
      .catch(() => setError('Failed to load sectors.'))
      .finally(() => setLoading(false));
  }, [versionYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading sectors…</span>
      </div>
    );
  }

  if (error) {
    return <div className="py-8 text-center text-sm text-destructive">{error}</div>;
  }

  if (!sectors?.length) {
    return <div className="py-8 text-center text-sm text-muted-foreground">No sectors found.</div>;
  }

  return (
    <div className="space-y-0.5">
      {sectors.map((sector) => (
        <NaicsNode key={sector.id} node={sector} depth={0} />
      ))}
    </div>
  );
}

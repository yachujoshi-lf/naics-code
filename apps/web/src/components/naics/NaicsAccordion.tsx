import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Loader2 } from 'lucide-react';
import { getChildren, getSectors, searchNaics } from '@/services/naics';
import { cn } from '@/lib/utils';
import type { NaicsCode, NaicsLevel } from '@/types/naics';
import { LEVEL_COLORS, NAICS_LEVEL_LABEL } from '@/types/naics';

/* ── Debounce hook ── */

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ── Level-specific selection styles ── */

const LEVEL_SELECTED_BORDER: Record<NaicsLevel, string> = {
  SECTOR:            'border-l-2 border-violet-500  rounded-l-none bg-violet-50/70  dark:bg-violet-950/25',
  SUBSECTOR:         'border-l-2 border-blue-500    rounded-l-none bg-blue-50/70    dark:bg-blue-950/25',
  INDUSTRY_GROUP:    'border-l-2 border-emerald-500 rounded-l-none bg-emerald-50/70 dark:bg-emerald-950/25',
  NAICS_INDUSTRY:    'border-l-2 border-amber-500   rounded-l-none bg-amber-50/70   dark:bg-amber-950/25',
  NATIONAL_INDUSTRY: 'border-l-2 border-rose-500    rounded-l-none bg-rose-50/70    dark:bg-rose-950/25',
};

/* ── Tree node ── */

interface NaicsNodeProps {
  node: NaicsCode;
  depth: number;
  selectedId?: string | null;
  onSelect?: (node: NaicsCode) => void;
}

function NaicsNode({ node, depth, selectedId, onSelect }: NaicsNodeProps) {
  const [open, setOpen] = useState(false);
  const isLeaf = node.level === 'NATIONAL_INDUSTRY';
  const isSelected = node.id === selectedId;

  const { data: children, isFetching, isError } = useQuery({
    queryKey: ['naics-children', node.id],
    queryFn: () => getChildren(node.id),
    enabled: open && !isLeaf,
    staleTime: Infinity,
  });

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer select-none',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          isSelected
            ? LEVEL_SELECTED_BORDER[node.level]
            : 'hover:bg-muted/60',
        )}
        onClick={() => onSelect?.(node)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect?.(node);
          if (e.key === 'ArrowRight' && !isLeaf) setOpen(true);
          if (e.key === 'ArrowLeft') setOpen(false);
        }}
      >
        {/* Expand/collapse toggle */}
        <button
          aria-label={open ? 'Collapse' : 'Expand'}
          tabIndex={-1}
          className={cn(
            'shrink-0 w-4 h-4 flex items-center justify-center rounded',
            'hover:bg-black/5 dark:hover:bg-white/10 transition-colors',
            isLeaf && 'pointer-events-none',
          )}
          onClick={(e) => {
            if (isLeaf) return;
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          {!isLeaf ? (
            <ChevronRight
              className={cn(
                'h-3 w-3 text-muted-foreground/60 transition-transform duration-150',
                open && 'rotate-90',
              )}
            />
          ) : (
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30 block" />
          )}
        </button>

        {/* Code badge */}
        <span
          className={cn(
            'shrink-0 font-mono text-[10px] font-medium px-1.5 py-0.5 rounded',
            LEVEL_COLORS[node.level],
          )}
        >
          {node.code}
        </span>

        {/* Title */}
        <span className="text-[13px] leading-snug flex-1 min-w-0 truncate text-foreground/90">
          {node.title}
        </span>
      </div>

      {/* Children */}
      {!isLeaf && open && (
        <div
          className={cn(
            'ml-4 mt-0.5 space-y-0.5',
            depth < 4 && 'border-l border-border/50 pl-1.5',
          )}
        >
          {isFetching && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading…
            </div>
          )}
          {isError && (
            <div className="px-2 py-1.5 text-[11px] text-destructive">
              Failed to load.
            </div>
          )}
          {!isFetching && !isError && children?.length === 0 && (
            <div className="px-2 py-1.5 text-[11px] text-muted-foreground italic">
              No entries.
            </div>
          )}
          {children?.map((child) => (
            <NaicsNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Search results (flat, grouped by level) ── */

interface SearchResultsProps {
  results: NaicsCode[];
  selectedId?: string | null;
  onSelect?: (node: NaicsCode) => void;
}

function SearchResults({ results, selectedId, onSelect }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-[13px] text-muted-foreground">
        No results found.
      </div>
    );
  }

  const levelOrder: NaicsLevel[] = [
    'SECTOR', 'SUBSECTOR', 'INDUSTRY_GROUP', 'NAICS_INDUSTRY', 'NATIONAL_INDUSTRY',
  ];

  const grouped = results.reduce<Partial<Record<NaicsLevel, NaicsCode[]>>>((acc, item) => {
    (acc[item.level] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {levelOrder.map((level) => {
        const items = grouped[level];
        if (!items?.length) return null;
        return (
          <div key={level}>
            <div className="px-2 pb-1 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              {NAICS_LEVEL_LABEL[level]}s
            </div>
            <div className="space-y-0.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    selectedId === item.id
                      ? LEVEL_SELECTED_BORDER[item.level]
                      : 'hover:bg-muted/60',
                  )}
                  onClick={() => onSelect?.(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onSelect?.(item);
                  }}
                >
                  <span
                    className={cn(
                      'shrink-0 font-mono text-[10px] font-medium px-1.5 py-0.5 rounded',
                      LEVEL_COLORS[item.level],
                    )}
                  >
                    {item.code}
                  </span>
                  <span className="text-[13px] flex-1 min-w-0 truncate text-foreground/90">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Root export ── */

interface NaicsAccordionProps {
  versionYear?: number;
  selectedId?: string | null;
  onSelect?: (node: NaicsCode) => void;
  searchQuery?: string;
}

export function NaicsAccordion({
  versionYear = 2022,
  selectedId,
  onSelect,
  searchQuery = '',
}: NaicsAccordionProps) {
  const debouncedQuery = useDebounce(searchQuery.trim(), 300);
  const isSearchMode = debouncedQuery.length > 0;

  const { data: sectors, isLoading: sectorsLoading, isError: sectorsError } = useQuery({
    queryKey: ['naics-sectors', versionYear],
    queryFn: () => getSectors(versionYear),
  });

  const { data: searchResults, isFetching: searchFetching, isError: searchError } = useQuery({
    queryKey: ['naics-search', debouncedQuery, versionYear],
    queryFn: () => searchNaics(debouncedQuery, versionYear),
    enabled: isSearchMode,
    staleTime: 30_000,
  });

  if (isSearchMode) {
    if (searchFetching) {
      return (
        <div className="flex items-center gap-1.5 px-2 py-4 text-[13px] text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Searching…
        </div>
      );
    }
    if (searchError) {
      return (
        <div className="px-2 py-4 text-[13px] text-destructive">
          Search failed. Try again.
        </div>
      );
    }
    return (
      <SearchResults
        results={searchResults ?? []}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    );
  }

  if (sectorsLoading) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-4 text-[13px] text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading sectors…
      </div>
    );
  }

  if (sectorsError) {
    return (
      <div className="px-2 py-4 text-[13px] text-destructive">
        Failed to load sectors.
      </div>
    );
  }

  if (!sectors?.length) {
    return (
      <div className="px-2 py-4 text-[13px] text-muted-foreground">
        No sectors found.
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <div className="px-2 pb-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
        Sectors ({sectors.length})
      </div>
      {sectors.map((sector) => (
        <NaicsNode
          key={sector.id}
          node={sector}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

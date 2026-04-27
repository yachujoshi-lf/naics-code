import { useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { NaicsAccordion } from '@/components/naics/NaicsAccordion';
import { NaicsDetail } from '@/components/naics/NaicsDetail';
import { cn } from '@/lib/utils';
import type { NaicsCode, NaicsLevel } from '@/types/naics';
import { LEVEL_COLORS, NAICS_LEVEL_LABEL } from '@/types/naics';
import { getSectors } from '@/services/naics';

const NAICS_STATS: { count: number; label: string; level: NaicsLevel; dot: string }[] = [
  { count: 20,    label: 'Sectors',    level: 'SECTOR',            dot: 'bg-violet-500' },
  { count: 99,    label: 'Subsectors', level: 'SUBSECTOR',         dot: 'bg-blue-500'   },
  { count: 311,   label: 'Groups',     level: 'INDUSTRY_GROUP',    dot: 'bg-emerald-500'},
  { count: 709,   label: 'Industries', level: 'NAICS_INDUSTRY',    dot: 'bg-amber-500'  },
  { count: 1_012, label: 'National',   level: 'NATIONAL_INDUSTRY', dot: 'bg-rose-500'   },
];

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (node: NaicsCode) => setSelectedId(node.id);
  const handleNavigate = (id: string) => setSelectedId(id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-left min-h-0">
      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between px-5 h-12 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold tracking-tight leading-none text-foreground">
              NAICS Browser
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 hidden sm:block">
              North American Industry Classification
            </span>
          </div>
        </div>

        {/* Stats strip — desktop only */}
        <div className="hidden lg:flex items-center gap-5 text-[11px] text-muted-foreground">
          {NAICS_STATS.map(({ count, label, dot }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
              <span className="font-mono font-medium text-foreground tabular-nums">
                {count.toLocaleString()}
              </span>{' '}
              {label}
            </span>
          ))}
        </div>

        <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground border border-border/60">
          2022
        </span>
      </header>

      {/* ── Two-column body ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left — sidebar / tree */}
        <aside className="w-64 sm:w-72 xl:w-80 shrink-0 flex flex-col border-r border-border overflow-hidden bg-background">
          {/* Search bar */}
          <div className="shrink-0 p-2.5 border-b border-border bg-card/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
              <input
                type="search"
                placeholder="Search codes or titles…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full h-8 pl-8 pr-3 text-[13px] rounded-md',
                  'border border-input bg-background text-foreground',
                  'focus:outline-none focus:ring-1 focus:ring-ring',
                  'placeholder:text-muted-foreground/50',
                  'transition-colors duration-150',
                )}
              />
            </div>
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto py-2 px-1.5 naics-scrollbar">
            <NaicsAccordion
              versionYear={2022}
              selectedId={selectedId}
              onSelect={handleSelect}
              searchQuery={searchQuery}
            />
          </div>
        </aside>

        {/* Right — detail / overview */}
        <main className="flex-1 overflow-y-auto naics-scrollbar">
          {selectedId ? (
            <NaicsDetail nodeId={selectedId} onNavigate={handleNavigate} />
          ) : (
            <EmptyOverview onNavigate={handleNavigate} />
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyOverview({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { data: sectors } = useQuery({
    queryKey: ['naics-sectors', 2022],
    queryFn: () => getSectors(2022),
    staleTime: Infinity,
  });

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1.5">
          Browse NAICS 2022
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
          The North American Industry Classification System organizes the economy into
          20 sectors and 1,012 national industries. Select a sector to explore.
        </p>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-5 gap-2 mb-10">
        {NAICS_STATS.map(({ count, label, level, dot }) => (
          <div
            key={level}
            className="flex flex-col items-center text-center p-3 rounded-lg bg-card border border-border/70 gap-1"
          >
            <div className={cn('w-2 h-2 rounded-full', dot)} />
            <span className="text-xl font-mono font-bold tabular-nums text-foreground">
              {count.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* Sector grid */}
      {sectors && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Sectors
            </span>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', LEVEL_COLORS.SECTOR)}>
              {sectors.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {sectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => onNavigate(sector.id)}
                className={cn(
                  'flex items-start gap-3 p-3.5 rounded-lg text-left cursor-pointer group',
                  'border border-border/60 bg-card',
                  'hover:border-violet-300/60 hover:bg-violet-50/40 dark:hover:bg-violet-950/20',
                  'transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                )}
              >
                <span className="shrink-0 font-mono text-base font-bold text-muted-foreground/60 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-tight mt-0.5 w-7">
                  {sector.code}
                </span>
                <span className="text-[13px] leading-snug text-foreground min-w-0">
                  {sector.title}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;

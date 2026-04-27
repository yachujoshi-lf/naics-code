import { useState } from 'react';
import { Search } from 'lucide-react';
import { NaicsAccordion } from '@/components/naics/NaicsAccordion';
import { NaicsDetail } from '@/components/naics/NaicsDetail';
import { cn } from '@/lib/utils';
import type { NaicsCode } from '@/types/naics';

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (node: NaicsCode) => setSelectedId(node.id);
  const handleNavigate = (id: string) => setSelectedId(id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-left min-h-0">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 h-13 border-b border-border bg-card">
        <div className="flex items-center gap-2.5">
          <div>
            <p className="text-sm font-semibold leading-tight tracking-tight text-foreground">
              NAICS Code Browser
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              North American Industry Classification System
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
          2022
        </span>
      </header>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left panel — tree navigator */}
        <aside className="w-72 sm:w-80 xl:w-88 shrink-0 flex flex-col border-r border-border overflow-hidden bg-background">
          {/* Search */}
          <div className="shrink-0 p-2.5 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search codes or titles…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full h-8 pl-8 pr-3 text-sm rounded-md',
                  'border border-input bg-background text-foreground',
                  'focus:outline-none focus:ring-1 focus:ring-ring',
                  'placeholder:text-muted-foreground',
                  'transition-colors duration-150',
                )}
              />
            </div>
          </div>

          {/* Tree scroll area */}
          <div className="flex-1 overflow-y-auto py-2 px-1.5">
            <NaicsAccordion
              versionYear={2022}
              selectedId={selectedId}
              onSelect={handleSelect}
              searchQuery={searchQuery}
            />
          </div>
        </aside>

        {/* Right panel — detail view */}
        <main className="flex-1 overflow-y-auto bg-muted/15">
          {selectedId ? (
            <NaicsDetail nodeId={selectedId} onNavigate={handleNavigate} />
          ) : (
            <EmptyDetail />
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Select a NAICS code</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click any code in the tree to view its details
        </p>
      </div>
    </div>
  );
}

export default App;

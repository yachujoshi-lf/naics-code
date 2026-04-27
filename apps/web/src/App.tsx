import { NaicsAccordion } from '@/components/naics/NaicsAccordion';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">NAICS Code Browser</h1>
          <p className="text-sm text-muted-foreground mt-1">
            2022 North American Industry Classification System — click a sector to expand.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-2">
          <NaicsAccordion versionYear={2022} />
        </div>
      </div>
    </div>
  );
}

export default App;

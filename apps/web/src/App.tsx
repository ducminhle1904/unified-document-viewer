import { useState } from "react";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { Database, ShieldCheck, Circuitry } from "@phosphor-icons/react";
import { DocumentResults } from "@/components/DocumentResults";
import { VinSearchForm } from "@/components/VinSearchForm";
import { searchDocumentsByVin } from "@/lib/api";

const fallbackClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

function UnifiedDocumentViewer() {
  const [lastVin, setLastVin] = useState<string | null>(null);
  const [searchRun, setSearchRun] = useState(0);
  const searchMutation = useMutation({
    mutationFn: searchDocumentsByVin
  });

  function handleSearch(vin: string) {
    setLastVin(vin);
    setSearchRun((value) => value + 1);
    searchMutation.mutate(vin);
  }

  const resultTransitionKey = searchMutation.isPending
    ? `loading-${searchRun}`
    : searchMutation.data?.requestId ?? searchMutation.error?.message ?? "idle";

  return (
    <main className="min-h-[100dvh]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="reveal-in industrial-panel relative overflow-hidden p-5 lg:p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
          <div className="absolute right-5 top-5 hidden text-primary/10 lg:block">
            <Circuitry size={112} weight="thin" aria-hidden="true" />
          </div>
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="section-label flex items-center gap-2 text-primary">
              <Database size={16} weight="regular" aria-hidden="true" />
              Scenario D / Operate / Vehicle documents
            </div>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              Unified Document Viewer
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Search once by VIN and review documents from mocked Sales and Service systems in one operational view.
            </p>
          </div>
          <div className="flex items-center gap-2 border border-border bg-white/70 px-3 py-2 text-sm text-muted-foreground">
            <ShieldCheck size={16} weight="regular" className="text-primary" aria-hidden="true" />
            Source-labelled audit view
          </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(320px,390px)_1fr] lg:items-start">
          <div className="space-y-4">
            <VinSearchForm isLoading={searchMutation.isPending} onSubmit={handleSearch} />
            {lastVin ? (
              <p className="mono-value reveal-in border border-border bg-card p-3 text-muted-foreground">
                Last submitted VIN: <span className="text-foreground">{lastVin}</span>
              </p>
            ) : null}
          </div>
          <div key={resultTransitionKey} className="result-transition">
            <DocumentResults
              data={searchMutation.data}
              error={searchMutation.error}
              isLoading={searchMutation.isPending}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export function App() {
  return (
    <QueryClientProvider client={fallbackClient}>
      <UnifiedDocumentViewer />
    </QueryClientProvider>
  );
}

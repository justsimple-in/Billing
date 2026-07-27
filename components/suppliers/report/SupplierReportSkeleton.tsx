export function SupplierReportSkeleton() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f6f8fc]">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-100 via-transparent to-transparent" />
      <div className="mx-auto flex max-w-[210mm] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="sticky top-0 z-10 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-full bg-slate-100" />
        </div>

        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl bg-sky-50" />
          <div className="h-28 animate-pulse rounded-2xl bg-cyan-50" />
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </section>
      </div>
    </main>
  );
}
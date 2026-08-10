export default function SiteLoading() {
  return (
    <div className="mx-auto min-h-[45vh] max-w-5xl px-4 py-14" role="status" aria-live="polite">
      <div className="h-3 w-24 animate-pulse rounded-full bg-secondary" />
      <div className="mt-4 h-9 w-64 max-w-full animate-pulse rounded-lg bg-muted" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-2xl border bg-card" />
        <div className="h-32 animate-pulse rounded-2xl border bg-card" />
      </div>
      <span className="sr-only">ページを読み込んでいます</span>
    </div>
  );
}

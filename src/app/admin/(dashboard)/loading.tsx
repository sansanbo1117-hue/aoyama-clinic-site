export default function AdminLoading() {
  return (
    <div className="space-y-5" role="status" aria-live="polite">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="h-16 animate-pulse border-b bg-muted/50" />
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      </div>
      <span className="sr-only">受付画面を読み込んでいます</span>
    </div>
  );
}

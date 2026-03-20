export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
      <p className="text-sm font-medium text-muted">Завантаження...</p>
    </div>
  );
}

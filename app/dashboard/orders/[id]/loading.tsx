export default function Loading() {
  return (
    <div
      className="flex flex-col gap-6 px-4 py-6 lg:px-6"
      aria-label="Chargement de la commande"
      role="status"
    >
      <div className="flex items-center gap-4">
        <div className="size-8 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-64 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
      <div className="h-96 animate-pulse rounded-xl bg-muted" />
      <span className="sr-only">Chargement de la commande...</span>
    </div>
  );
}

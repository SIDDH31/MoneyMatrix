/**
 * Skeleton loading components for the dashboard.
 * Each skeleton matches the shape of its corresponding dashboard section.
 */

export function CardSkeleton() {
  return (
    <div className="p-6 border rounded-xl bg-card animate-pulse">
      <div className="h-3 w-24 bg-muted rounded mb-3" />
      <div className="h-7 w-32 bg-muted rounded mb-2" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 'h-72' }: { height?: string }) {
  return (
    <div className={`border rounded-xl bg-card p-6 animate-pulse`}>
      <div className="h-4 w-40 bg-muted rounded mb-4" />
      <div className={`${height} bg-muted/50 rounded-lg`} />
    </div>
  );
}

export function GoalsSkeleton() {
  return (
    <div className="border rounded-xl bg-card p-6 animate-pulse space-y-4">
      <div className="h-4 w-32 bg-muted rounded" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 bg-muted rounded" />
            <div className="h-2 w-full bg-muted rounded-full" />
          </div>
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export function HealthScoreSkeleton() {
  return (
    <div className="border rounded-xl bg-card p-6 animate-pulse">
      <div className="h-4 w-40 bg-muted rounded mb-6" />
      <div className="flex items-center justify-center mb-6">
        <div className="h-32 w-32 rounded-full bg-muted" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-2 w-full bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <div className="border rounded-xl bg-card p-6 animate-pulse space-y-4">
      <div className="h-4 w-28 bg-muted rounded" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <div className="h-3 w-32 bg-muted rounded" />
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-3/4 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

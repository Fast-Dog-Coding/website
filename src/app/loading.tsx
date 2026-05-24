/**
 * Root Loading Skeleton
 */

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="h-12 w-3/4 max-w-lg animate-pulse rounded-lg bg-surface" />
      <div className="h-6 w-1/2 max-w-md animate-pulse rounded-lg bg-surface" />
      <div className="mt-4 h-12 w-48 animate-pulse rounded-lg bg-surface" />
    </div>
  );
}

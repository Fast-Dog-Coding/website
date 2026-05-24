/**
 * Page-Level Loading Skeleton
 */

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="h-10 w-2/3 max-w-lg animate-pulse rounded-lg bg-surface" />
      <div className="h-6 w-1/2 max-w-md animate-pulse rounded-lg bg-surface" />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
        <div className="h-48 animate-pulse rounded-lg bg-surface" />
        <div className="h-48 animate-pulse rounded-lg bg-surface" />
        <div className="h-48 animate-pulse rounded-lg bg-surface" />
      </div>
    </div>
  );
}

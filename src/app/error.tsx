/**
 * Root Error Boundary
 */

"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <h2 className="text-3xl font-bold text-primary">Something went wrong</h2>
      <p className="text-secondary max-w-md">
        An unexpected error occurred. Please try again later.
        {error.digest && (
          <span className="block mt-2 text-xs opacity-50">
            Error ID: {error.digest}
          </span>
        )}
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center justify-center rounded-lg bg-accent px-6 h-10 text-sm font-semibold text-background transition-colors hover:bg-accent-hover"
      >
        Try again
      </button>
    </div>
  );
}

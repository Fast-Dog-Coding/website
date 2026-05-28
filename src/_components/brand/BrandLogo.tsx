import { cn } from "@/lib/cn";

/** Shared sizing for mark, wordmark, and lockup variants */
const sizes = {
  sm: {
    mark: "text-sm",
    wordmark: "text-sm",
    accent: "h-[2px] -bottom-px",
    gap: "gap-2",
  },
  md: {
    mark: "text-lg",
    wordmark: "text-lg",
    accent: "h-[3px] -bottom-0.5",
    gap: "gap-2.5",
  },
  lg: {
    mark: "text-2xl",
    wordmark: "text-xl",
    accent: "h-[3px] -bottom-0.5",
    gap: "gap-3",
  },
  xl: {
    mark: "text-4xl",
    wordmark: "text-3xl",
    accent: "h-1 -bottom-1",
    gap: "gap-4",
  },
} as const;

export type BrandLogoSize = keyof typeof sizes;
export type BrandLogoVariant = "mark" | "wordmark" | "lockup";

export interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  className?: string;
}

/** FDC monogram with gold accent under the D — matches favicon / OG system */
export function FdcMark({
  size = "md",
  className,
}: Pick<BrandLogoProps, "size" | "className">) {
  const s = sizes[size];

  return (
    <span
      className={cn(
        "items-baseline font-mono font-semibold leading-none tracking-tight text-primary",
        s.mark,
        className ?? "inline-flex"
      )}
      aria-hidden
    >
      <span>F</span>
      <span className="relative inline-block">
        <span>D</span>
        <span
          className={cn(
            "absolute left-0 right-0 block rounded-sm bg-accent",
            s.accent
          )}
        />
      </span>
      <span>C</span>
    </span>
  );
}

/** Full name with the same accent on the D in “Dog” */
export function BrandWordmark({
  size = "md",
  className,
}: Pick<BrandLogoProps, "size" | "className">) {
  const s = sizes[size];

  return (
    <span
      className={cn(
        "items-baseline font-mono font-semibold leading-none tracking-tight text-primary",
        s.wordmark,
        className ?? "inline-flex"
      )}
    >
      <span>Fast{"\u00a0"}</span>
      <span className="relative inline-block">
        <span>D</span>
        <span
          className={cn(
            "absolute left-0 right-0 block rounded-sm bg-accent",
            s.accent
          )}
        />
      </span>
      <span>og Coding</span>
    </span>
  );
}

/**
 * Brand mark + wordmark.
 * Lockup: FDC below `sm`, full name from `sm` up (avoids redundant double label).
 */
export function BrandLogo({
  variant = "lockup",
  size = "md",
  className,
}: BrandLogoProps) {
  const s = sizes[size];

  if (variant === "mark") {
    return (
      <span className={className} aria-label="Fast Dog Coding">
        <FdcMark size={size} />
      </span>
    );
  }

  if (variant === "wordmark") {
    return (
      <span className={className} aria-label="Fast Dog Coding">
        <BrandWordmark size={size} />
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center", s.gap, className)}
      aria-label="Fast Dog Coding"
    >
      <FdcMark size={size} className="inline-flex sm:hidden" />
      <BrandWordmark size={size} className="hidden sm:inline-flex" />
    </span>
  );
}

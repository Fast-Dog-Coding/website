/**
 * Tag Atom
 *
 * Tech stack pill label.
 * Used by CuratedExhibitPlaque and GalleryGrid.
 */

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export function Tag({ children, className = "" }: TagProps) {
  return (
    <span
      className={`rounded-md bg-surface px-3 py-1 text-sm font-medium text-secondary ${className}`}
    >
      {children}
    </span>
  );
}

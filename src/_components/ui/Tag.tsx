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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary ${className}`}
    >
      {children}
    </span>
  );
}

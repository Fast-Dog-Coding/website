/**
 * Card Atom
 *
 * Bordered surface card with lift-on-hover.
 * Used by GalleryGrid for project cards.
 */

import Link from "next/link";

interface CardProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export function Card({ children, href, className = "" }: CardProps) {
  const classes = `group block rounded-lg border border-border bg-background p-6 md:p-8 transition-all duration-200 hover:border-accent hover:shadow-lift ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}

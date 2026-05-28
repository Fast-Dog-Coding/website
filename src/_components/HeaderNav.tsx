/**
 * HeaderNav — Client Component
 *
 * Handles interactive navigation behavior:
 *   - Active link highlighting via usePathname()
 *   - Mobile hamburger menu (slide-out)
 */

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavPageRecord } from "@/types";

interface HeaderNavProps {
  navPages: NavPageRecord[];
}

export function HeaderNav({ navPages }: HeaderNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const mobileMenu =
    mobileOpen && mounted ? (
      <div className="fixed inset-0 top-16 z-40 bg-background md:hidden">
        <nav className="flex flex-col items-center gap-6 pt-12">
          {(navPages || []).map((page) => {
            const href = `/${page.slug}`;
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={page.slug}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`text-xl font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-accent"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {page.navLabel}
              </Link>
            );
          })}
        </nav>
      </div>
    ) : null;

  return (
    <>
      {/* Desktop Nav */}
      <nav className="hidden items-center gap-6 md:flex">
        {(navPages || []).map((page) => {
          const href = `/${page.slug}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={page.slug}
              href={href}
              className={`text-base font-medium transition-colors duration-150 ${
                isActive
                  ? "text-accent"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {page.navLabel}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="flex items-center justify-center md:hidden h-10 w-10 rounded-md text-secondary hover:text-primary transition-colors"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? (
          // X icon
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Hamburger icon
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {mobileMenu && createPortal(mobileMenu, document.body)}
    </>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SiteHeader } from "@/_components/SiteHeader";
import { SiteFooter } from "@/_components/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://fastdogcoding.com"
  ),
  title: {
    default: "Fast Dog Coding — Principal-Level Architecture",
    template: "%s | Fast Dog Coding",
  },
  description:
    "Fast Dog Coding delivers principal-level software architecture and development for enterprise systems. Explore showcases of robust, scalable solutions built for impact.",
  keywords: [
    "Software Architecture",
    "Principal Engineer",
    "Enterprise Systems",
    "React",
    "Next.js",
    "Node.js",
    "TypeScript",
    "GraphQL",
  ],
  authors: [{ name: "Grant Lindsay" }],
  creator: "Grant Lindsay",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Fast Dog Coding — Principal-Level Architecture",
    description:
      "Fast Dog Coding delivers principal-level software architecture and development for enterprise systems.",
    siteName: "Fast Dog Coding",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fast Dog Coding — Principal-Level Architecture",
    description:
      "Fast Dog Coding delivers principal-level software architecture and development for enterprise systems.",
    creator: "@fastdogcoding",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-primary font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}


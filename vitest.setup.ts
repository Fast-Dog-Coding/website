import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("@/lib/gql/fetch", () => ({
  gqlFetch: vi.fn().mockResolvedValue({ pages: [] }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) =>
    React.createElement("a", { href, ...props }, children),
}));

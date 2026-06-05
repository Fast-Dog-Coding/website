import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// React 19 + Testing Library expect act in a test environment.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

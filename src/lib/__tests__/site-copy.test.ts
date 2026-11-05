import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { HOME_HERO, HOME_HERO_HEADING_TEXT } from "@/lib/site-copy";

describe("home hero copy", () => {
  it("matches the public home hero wording", () => {
    expect(HOME_HERO.heading).toBe(
      "Listen\u00a0carefully. Think\u00a0deeply. Build\u00a0deliberately."
    );
    expect(HOME_HERO_HEADING_TEXT).toBe(
      "Listen carefully. Think deeply. Build deliberately."
    );
    expect(HOME_HERO.subheading).toBe(
      "We focus on solving your problems the right way."
    );
  });

  it("is what the Open Graph image and the home hero seed render", () => {
    const image = readFileSync(
      path.join(process.cwd(), "src/app/opengraph-image.tsx"),
      "utf8"
    );
    const seed = readFileSync(
      path.join(process.cwd(), "prisma/seed-content.ts"),
      "utf8"
    );

    expect(image).toContain("HOME_HERO.heading");
    expect(image).toContain("HOME_HERO.subheading");
    expect(image).toContain("HOME_HERO_HEADING_TEXT");
    expect(image).not.toContain("Principal-Level Architecture");
    expect(image).not.toContain("Enterprise-Grade Execution");

    expect(seed).toContain("heading: HOME_HERO.heading");
    expect(seed).toContain("subheading: HOME_HERO.subheading");
  });
});

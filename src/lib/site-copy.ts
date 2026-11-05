/**
 * Public copy shared by the home hero seed and the Open Graph image.
 *
 * The strings are the home hero already seeded as `hero-home`
 * (prisma/seed-content.ts): the headline visitors see, not a separate
 * tagline. Non-breaking spaces keep each imperative phrase on one line
 * in the Open Graph card.
 */
export const HOME_HERO = {
  heading: "Listen\u00a0carefully. Think\u00a0deeply. Build\u00a0deliberately.",
  subheading: "We focus on solving your problems the right way.",
} as const;

/** Plain-text form of the home hero headline (normal spaces). */
export const HOME_HERO_HEADING_TEXT = HOME_HERO.heading.replaceAll(
  "\u00a0",
  " "
);

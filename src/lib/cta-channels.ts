/**
 * CTA channel link attributes
 *
 * Stored channel rows only carry content fields (label, href, etc.).
 * Callers enrich channels at fetch time so UI components render target/rel
 * without embedding link-classification logic.
 */

import type { CtaChannel, EnrichedCtaChannel } from "@/types";

const FIRST_PARTY_HOST = "fastdogcoding.com";

/** Protocols that delegate to an external app and are treated as third-party. */
const EXTERNAL_APP_PROTOCOLS = new Set(["mailto:", "tel:"]);

function isFirstPartyHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === FIRST_PARTY_HOST || host.endsWith(`.${FIRST_PARTY_HOST}`);
}

/**
 * Whether a href should receive rel="noopener noreferrer".
 * All CTA channels open in a new tab; only third-party destinations get rel.
 */
export function isThirdPartyHref(href: string): boolean {
  for (const protocol of EXTERNAL_APP_PROTOCOLS) {
    if (href.startsWith(protocol)) return true;
  }

  if (href.startsWith("/") || href.startsWith("#")) {
    return false;
  }

  try {
    const { hostname } = new URL(href);
    return !isFirstPartyHostname(hostname);
  } catch {
    return true;
  }
}

/** Resolved link attributes for a CTA channel href. */
export function getCtaChannelLinkAttributes(href: string): {
  target: "_blank";
  rel?: "noopener noreferrer";
} {
  const attributes: { target: "_blank"; rel?: "noopener noreferrer" } = {
    target: "_blank",
  };

  if (isThirdPartyHref(href)) {
    attributes.rel = "noopener noreferrer";
  }

  return attributes;
}

export function enrichCtaChannel(channel: CtaChannel): EnrichedCtaChannel {
  return {
    ...channel,
    ...getCtaChannelLinkAttributes(channel.href),
  };
}

/** Enrich channels inside a CTA section's JSON data blob. */
export function enrichCtaSectionData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const { channels } = data;
  if (!Array.isArray(channels)) return data;

  return {
    ...data,
    channels: channels.map((channel) =>
      enrichCtaChannel(channel as CtaChannel)
    ),
  };
}

/** Enrich section records whose type is `cta`. */
export function enrichSectionRecord<S extends Record<string, unknown>>(
  section: S
): S {
  if (section.type !== "cta" || !section.data || typeof section.data !== "object") {
    return section;
  }

  return {
    ...section,
    data: enrichCtaSectionData(section.data as Record<string, unknown>),
  };
}

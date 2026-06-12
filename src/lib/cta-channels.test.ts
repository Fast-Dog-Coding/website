import { describe, expect, it } from "vitest";
import {
  enrichCtaChannel,
  enrichCtaSectionData,
  getCtaChannelLinkAttributes,
  isThirdPartyHref,
} from "./cta-channels";

describe("isThirdPartyHref", () => {
  it("treats LinkedIn as third-party", () => {
    expect(isThirdPartyHref("https://www.linkedin.com/in/grant-lindsay-us/")).toBe(
      true
    );
  });

  it("treats mailto as third-party", () => {
    expect(isThirdPartyHref("mailto:info@fastdogcoding.com")).toBe(true);
  });

  it("treats Cal.com as third-party", () => {
    expect(isThirdPartyHref("https://cal.com/grant-lindsay-7wiujq/25min")).toBe(
      true
    );
  });

  it("treats Fast Dog Coding apps as first-party", () => {
    expect(
      isThirdPartyHref("https://candidate-concierge.fastdogcoding.com/")
    ).toBe(false);
    expect(isThirdPartyHref("https://fastdogcoding.com/gallery")).toBe(false);
  });

  it("treats same-site paths as first-party", () => {
    expect(isThirdPartyHref("/gallery")).toBe(false);
  });
});

describe("getCtaChannelLinkAttributes", () => {
  it("opens third-party links in a new tab with noopener noreferrer", () => {
    expect(getCtaChannelLinkAttributes("https://www.linkedin.com/in/grant-lindsay-us/")).toEqual({
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });

  it("opens mailto links in a new tab with noopener noreferrer", () => {
    expect(getCtaChannelLinkAttributes("mailto:info@fastdogcoding.com")).toEqual({
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });

  it("opens first-party apps in a new tab without rel", () => {
    expect(
      getCtaChannelLinkAttributes("https://candidate-concierge.fastdogcoding.com/")
    ).toEqual({
      target: "_blank",
    });
  });
});

describe("enrichCtaSectionData", () => {
  it("adds link attributes to each channel", () => {
    const data = {
      heading: "Let's Connect",
      channels: [
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/grant-lindsay-us/",
          icon: "linkedin",
          micro_copy: "Network",
        },
        {
          label: "Candidate Concierge",
          href: "https://candidate-concierge.fastdogcoding.com/",
          icon: "ai",
          micro_copy: "Ask questions",
        },
      ],
    };

    const enriched = enrichCtaSectionData(data);

    expect(enriched.channels).toEqual([
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/grant-lindsay-us/",
        icon: "linkedin",
        micro_copy: "Network",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      {
        label: "Candidate Concierge",
        href: "https://candidate-concierge.fastdogcoding.com/",
        icon: "ai",
        micro_copy: "Ask questions",
        target: "_blank",
      },
    ]);
  });
});

describe("enrichCtaChannel", () => {
  it("preserves existing channel fields", () => {
    expect(
      enrichCtaChannel({
        label: "Email",
        short_label: "Email",
        href: "mailto:info@fastdogcoding.com",
        icon: "email",
        micro_copy: "Write us",
      })
    ).toMatchObject({
      short_label: "Email",
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });
});

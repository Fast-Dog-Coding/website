import { describe, expect, it } from "vitest";
import { pgPoolConfig, prismaDbPushUrl } from "./pg-config";

const LOCAL_DATABASE_URL = "postgresql://localhost:5432/fdc_website";
const NEON_URL =
  "postgresql://u:p%40ss@ep-example.neon.tech/neondb?channel_binding=require&sslmode=require";

describe("pgPoolConfig", () => {
  it("rewrites sslmode=require to verify-full", () => {
    expect(
      pgPoolConfig("postgresql://u:p@host/db?sslmode=require"),
    ).toEqual({
      connectionString: "postgresql://u:p@host/db?sslmode=verify-full",
    });
  });

  it("rewrites sslmode=prefer and sslmode=verify-ca to verify-full", () => {
    expect(pgPoolConfig("postgresql://u:p@host/db?sslmode=prefer")).toEqual({
      connectionString: "postgresql://u:p@host/db?sslmode=verify-full",
    });
    expect(pgPoolConfig("postgresql://u:p@host/db?sslmode=verify-ca")).toEqual({
      connectionString: "postgresql://u:p@host/db?sslmode=verify-full",
    });
  });

  it("leaves sslmode=verify-full unchanged", () => {
    const connectionString =
      "postgresql://u:p@host/db?sslmode=verify-full&application_name=fdc";
    expect(pgPoolConfig(connectionString)).toEqual({ connectionString });
  });

  it("leaves sslmode=disable and sslmode=allow unchanged", () => {
    const disable = "postgresql://u:p@host/db?sslmode=disable";
    const allow = "postgresql://u:p@host/db?sslmode=allow";
    expect(pgPoolConfig(disable)).toEqual({ connectionString: disable });
    expect(pgPoolConfig(allow)).toEqual({ connectionString: allow });
  });

  it("leaves a URL with no sslmode unchanged", () => {
    expect(pgPoolConfig(LOCAL_DATABASE_URL)).toEqual({
      connectionString: LOCAL_DATABASE_URL,
    });
  });

  it("sets enableChannelBinding when channel_binding=require and keeps the param", () => {
    expect(pgPoolConfig(NEON_URL)).toEqual({
      connectionString:
        "postgresql://u:p%40ss@ep-example.neon.tech/neondb?channel_binding=require&sslmode=verify-full",
      enableChannelBinding: true,
    });
  });

  it("preserves other query params and does not treat channel_binding=disable as require", () => {
    const connectionString =
      "postgresql://u:p@host/db?application_name=fdc&channel_binding=disable&sslmode=require&connect_timeout=10";
    expect(pgPoolConfig(connectionString)).toEqual({
      connectionString:
        "postgresql://u:p@host/db?application_name=fdc&channel_binding=disable&sslmode=verify-full&connect_timeout=10",
    });
  });

  it("returns unset and empty input without throwing", () => {
    expect(pgPoolConfig(undefined)).toEqual({ connectionString: undefined });
    expect(pgPoolConfig(null)).toEqual({ connectionString: undefined });
    expect(pgPoolConfig("")).toEqual({ connectionString: "" });
  });

  it("returns invalid input unchanged", () => {
    expect(pgPoolConfig("not a url")).toEqual({ connectionString: "not a url" });
  });
});

describe("prismaDbPushUrl", () => {
  it("appends sslaccept=strict with & when the URL already has a query", () => {
    expect(prismaDbPushUrl(NEON_URL)).toBe(`${NEON_URL}&sslaccept=strict`);
    expect(
      prismaDbPushUrl("postgresql://u:p@host/db?sslmode=require"),
    ).toBe("postgresql://u:p@host/db?sslmode=require&sslaccept=strict");
  });

  it("uses ? when sslmode=require is present but the string has no query marker", () => {
    expect(prismaDbPushUrl("postgresql://u:p@host/db&sslmode=require")).toBe(
      "postgresql://u:p@host/db&sslmode=require?sslaccept=strict",
    );
  });

  it("does not override an existing sslaccept", () => {
    const strict =
      "postgresql://u:p@host/db?sslmode=require&sslaccept=strict";
    const loose =
      "postgresql://u:p@host/db?sslaccept=accept_invalid_certs&sslmode=require";
    expect(prismaDbPushUrl(strict)).toBe(strict);
    expect(prismaDbPushUrl(loose)).toBe(loose);
  });

  it("leaves URLs without sslmode=require unchanged", () => {
    expect(prismaDbPushUrl(LOCAL_DATABASE_URL)).toBe(LOCAL_DATABASE_URL);
    expect(
      prismaDbPushUrl("postgresql://u:p@host/db?sslmode=verify-full"),
    ).toBe("postgresql://u:p@host/db?sslmode=verify-full");
    expect(prismaDbPushUrl("postgresql://u:p@host/db?sslmode=prefer")).toBe(
      "postgresql://u:p@host/db?sslmode=prefer",
    );
    expect(prismaDbPushUrl("postgresql://u:p@host/db?sslmode=disable")).toBe(
      "postgresql://u:p@host/db?sslmode=disable",
    );
  });

  it("returns unset and empty input unchanged", () => {
    expect(prismaDbPushUrl(undefined)).toBe("");
    expect(prismaDbPushUrl(null)).toBe("");
    expect(prismaDbPushUrl("")).toBe("");
  });

  it("keeps sslmode=require so quaint does not treat verify-full as prefer", () => {
    const url = prismaDbPushUrl(
      "postgresql://u:p@host/db?channel_binding=require&sslmode=require",
    );
    expect(url).toContain("sslmode=require");
    expect(url).not.toContain("sslmode=verify-full");
    expect(url.endsWith("&sslaccept=strict")).toBe(true);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockGetResume = vi.fn();
const mockSyncResume = vi.fn();
const mockRevalidatePath = vi.fn();

vi.mock("@fastdogcoding/resume-master", () => ({
  getResume: (...args: unknown[]) => mockGetResume(...args),
}));

vi.mock("@/lib/sync-resume", () => ({
  syncResume: (...args: unknown[]) => mockSyncResume(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { tag: "prisma-singleton" },
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

import { POST } from "../route";

function callSync(authorization?: string) {
  const headers = new Headers();
  if (authorization !== undefined) {
    headers.set("authorization", authorization);
  }
  return POST(
    new NextRequest("http://localhost/api/sync", {
      method: "POST",
      headers,
    })
  );
}

describe("POST /api/sync", () => {
  beforeEach(() => {
    mockGetResume.mockReset();
    mockSyncResume.mockReset();
    mockRevalidatePath.mockReset();
    process.env.REVALIDATION_SECRET = "test-secret";
    process.env.RESUME_API_KEY = "resume-key";
    delete process.env.RESUME_API_KEY_PORTFOLIO;
    mockGetResume.mockResolvedValue({ projects: [], references: [] });
    mockSyncResume.mockResolvedValue({
      exhibits: ["exhibit-portfolio-website"],
      testimonials: ["testimonial-andrew"],
    });
  });

  it("rejects a missing or wrong bearer token", async () => {
    const missing = await callSync();
    expect(missing.status).toBe(401);

    const wrong = await callSync("Bearer wrong-token");
    expect(wrong.status).toBe(401);
    expect(mockGetResume).not.toHaveBeenCalled();
  });

  it("reports that revalidation is not configured when the secret is missing", async () => {
    delete process.env.REVALIDATION_SECRET;
    const response = await callSync("Bearer test-secret");
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Revalidation is not configured",
    });
    expect(mockGetResume).not.toHaveBeenCalled();
  });

  it("reports that resume sync is not configured without an API key", async () => {
    delete process.env.RESUME_API_KEY;
    const response = await callSync("Bearer test-secret");
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Resume sync is not configured",
    });
  });

  it("falls back to RESUME_API_KEY_PORTFOLIO", async () => {
    delete process.env.RESUME_API_KEY;
    process.env.RESUME_API_KEY_PORTFOLIO = "portfolio-fallback-key";

    const response = await callSync("Bearer test-secret");
    expect(response.status).toBe(200);
    expect(mockGetResume).toHaveBeenCalledWith("portfolio-fallback-key");
  });

  it("syncs the projection and revalidates the layout", async () => {
    const response = await callSync("Bearer test-secret");
    expect(response.status).toBe(200);
    const body = await response.json();

    expect(mockGetResume).toHaveBeenCalledWith("resume-key");
    expect(mockSyncResume).toHaveBeenCalledWith(
      { tag: "prisma-singleton" },
      { projects: [], references: [] }
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(body).toMatchObject({
      synced: true,
      exhibits: ["exhibit-portfolio-website"],
      testimonials: ["testimonial-andrew"],
      revalidated: true,
    });
    expect(body.timestamp).toEqual(expect.any(String));
  });

  it("does not revalidate or echo the API key when the sync fails", async () => {
    mockGetResume.mockRejectedValue(
      new Error("resume-master request failed and resume-key was not included")
    );
    const response = await callSync("Bearer test-secret");
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Resume sync failed");
    expect(body.details).not.toContain("resume-key");
    expect(body.details).toContain("[redacted]");
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});

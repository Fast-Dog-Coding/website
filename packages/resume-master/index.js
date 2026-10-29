"use strict";

/**
 * resume-master v1.3.0 HTTP client.
 *
 * Post-Phase 4 surface only: resolve the service origin and POST /v1/resume.
 * Projections never include exhibitSlug; callers key projects by id.
 */

const DEFAULT_RESUME_SERVICE_URL = "https://resume-master-nu.vercel.app";

const OPTION_KEYS = ["projectIds", "workIds", "keywords", "mode", "cutOffDate"];

function assertApiKey(apiKey) {
  if (typeof apiKey !== "string" || apiKey.trim() === "") {
    throw new Error("resume-master API key must be a non-empty string.");
  }
  return apiKey.trim();
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim() !== "";
}

function stripTrailingSlashes(value) {
  return value.trim().replace(/\/+$/, "");
}

function resolveHost(baseUrl) {
  if (nonEmpty(baseUrl)) return stripTrailingSlashes(baseUrl);
  if (nonEmpty(process.env.RESUME_SERVICE_URL)) {
    return stripTrailingSlashes(process.env.RESUME_SERVICE_URL);
  }
  return DEFAULT_RESUME_SERVICE_URL;
}

function definedOptions(options) {
  if (options == null) return {};
  if (typeof options !== "object" || Array.isArray(options)) {
    throw new Error("resume-master options must be an object.");
  }
  const body = {};
  for (const key of OPTION_KEYS) {
    if (options[key] !== undefined) {
      body[key] = options[key];
    }
  }
  return body;
}

function redact(message, apiKey) {
  if (!message) return "";
  let redacted = message;
  if (apiKey) {
    redacted = redacted.split(apiKey).join("[redacted]");
    redacted = redacted.split(`Bearer ${apiKey}`).join("Bearer [redacted]");
  }
  return redacted;
}

function httpError(status, body, apiKey) {
  const snippet = redact((body || "").trim().slice(0, 300), apiKey);
  if (!snippet) {
    return `resume-master request failed with HTTP ${status}.`;
  }
  return `resume-master request failed with HTTP ${status}: ${snippet}`;
}

async function getResume(apiKey, options, baseUrl) {
  const key = assertApiKey(apiKey);
  const host = resolveHost(baseUrl);
  const url = `${host}/v1/resume`;
  const body = definedOptions(options);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "network error";
    throw new Error(
      `resume-master request failed: ${redact(reason, key)}`
    );
  }

  const text = await response.text();
  if (!response.ok) {
    throw new Error(httpError(response.status, text, key));
  }

  if (!text.trim()) {
    throw new Error("resume-master returned invalid JSON (empty body).");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const snippet = redact(text.trim().slice(0, 120), key);
    throw new Error(
      `resume-master returned invalid JSON${snippet ? ` (${snippet})` : ""}.`
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("resume-master returned an unexpected payload.");
  }

  return parsed;
}

module.exports = {
  DEFAULT_RESUME_SERVICE_URL,
  getResume,
};

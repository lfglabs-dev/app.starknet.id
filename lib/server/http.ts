import type { NextApiRequest, NextApiResponse } from "next";

export const UPSTREAM_TIMEOUT_MS = 12_000;

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function applySameOriginCors(
  request: NextApiRequest,
  response: NextApiResponse
): boolean {
  const origin = firstHeader(request.headers.origin);
  const host =
    firstHeader(request.headers["x-forwarded-host"]) ??
    firstHeader(request.headers.host);
  const forwardedProtocol = firstHeader(request.headers["x-forwarded-proto"]);

  response.setHeader("Vary", "Origin");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (!origin) return true;
  if (!host) return false;

  try {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) return false;
    if (forwardedProtocol && originUrl.protocol !== `${forwardedProtocol}:`) return false;
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return true;
  } catch {
    return false;
  }
}

export async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = UPSTREAM_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export function copyOperationalHeaders(source: Response, response: NextApiResponse): void {
  for (const header of [
    "retry-after",
    "x-request-id",
    "x-ratelimit-limit",
    "x-ratelimit-remaining",
    "x-starkscan-rpc-class",
  ]) {
    const value = source.headers.get(header);
    if (value) response.setHeader(header, value);
  }
}

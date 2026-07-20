import type { NextApiRequest, NextApiResponse } from "next";
import {
  applySameOriginCors,
  copyOperationalHeaders,
  fetchWithTimeout,
} from "@/lib/server/http";
import {
  canUseNoSubmitFallback,
  canUseReadFallback,
  isRetryableReadFailure,
  redactSecret,
  validateRpcPayload,
} from "@/lib/server/rpc-policy";

const STARKSCAN_RPC_URL = "https://api.starkscan.co/v1/SN_MAIN/rpc";
const CARTRIDGE_MAINNET_RPC =
  "https://api.cartridge.gg/x/starknet/mainnet";

async function parseUpstream(response: Response, secret?: string): Promise<unknown> {
  const raw = redactSecret(await response.text(), secret);
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("RPC upstream returned malformed JSON");
  }
}

async function forward(
  url: string,
  body: unknown,
  apiKey?: string
): Promise<Response> {
  return fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "X-Starkscan-Api-Key": apiKey } : {}),
    },
    body: JSON.stringify(body),
  });
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
): Promise<void> {
  if (!applySameOriginCors(request, response)) {
    response.status(403).json({ error: "Cross-origin requests are not allowed" });
    return;
  }
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  let requests;
  try {
    requests = validateRpcPayload(request.body);
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "Invalid JSON-RPC payload",
    });
    return;
  }

  const key = process.env.STARKSCAN_API_KEY?.trim();
  const readFallbackAllowed = canUseReadFallback(requests);
  const noSubmitFallbackAllowed = canUseNoSubmitFallback(requests);

  try {
    if (!key) {
      if (!readFallbackAllowed) {
        response.status(503).json({ error: "Mainnet simulation provider is not configured" });
        return;
      }
      const fallback = await forward(CARTRIDGE_MAINNET_RPC, request.body);
      copyOperationalHeaders(fallback, response);
      response.status(fallback.status).json(await parseUpstream(fallback));
      return;
    }

    const upstream = await forward(STARKSCAN_RPC_URL, request.body, key);
    const body = await parseUpstream(upstream, key);
    if (
      noSubmitFallbackAllowed &&
      (upstream.status === 429 || upstream.status === 503 || isRetryableReadFailure(body))
    ) {
      const fallback = await forward(CARTRIDGE_MAINNET_RPC, request.body);
      copyOperationalHeaders(fallback, response);
      response.status(fallback.status).json(await parseUpstream(fallback));
      return;
    }

    copyOperationalHeaders(upstream, response);
    response.status(upstream.status).json(body);
  } catch (error) {
    if (noSubmitFallbackAllowed) {
      try {
        const fallback = await forward(CARTRIDGE_MAINNET_RPC, request.body);
        copyOperationalHeaders(fallback, response);
        response.status(fallback.status).json(await parseUpstream(fallback));
        return;
      } catch {
        // Return the generic error below.
      }
    }
    const timedOut = error instanceof Error && error.name === "AbortError";
    response.status(timedOut ? 504 : 502).json({
      error: timedOut ? "RPC upstream timed out" : "RPC upstream is unavailable",
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "256kb",
    },
  },
};

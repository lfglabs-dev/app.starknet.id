import type { NextApiRequest, NextApiResponse } from "next";
import { SN_MAIN } from "@/lib/chain/manifest";
import { normalizeAddress, normalizeTokenId } from "@/lib/core/address";
import {
  parseIdentityAcquisitions,
  parseIdentityDomainsFromTransaction,
  parseIdentityTransferPage,
  STARKSCAN_CURSOR_PATTERN,
} from "@/lib/server/identity-indexer";
import {
  applySameOriginCors,
  copyOperationalHeaders,
  fetchWithTimeout,
} from "@/lib/server/http";

const STARKSCAN_API = "https://api.starkscan.co";

function oneQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? undefined : value;
}

function transferUrl(
  owner: string,
  direction: "any" | "in",
  cursor?: string
): URL {
  const url = new URL(
    `/v1/SN_MAIN/address/${owner}/transfers`,
    STARKSCAN_API
  );
  url.searchParams.set("direction", direction);
  url.searchParams.set("token", SN_MAIN.contracts.identity.address);
  url.searchParams.set("limit", "100");
  if (cursor) url.searchParams.set("cursor", cursor);
  return url;
}

function parseResolveIds(value: string | undefined): string[] {
  if (!value) return [];
  const values = value.split(",");
  if (!values.length || values.length > 50) {
    throw new Error("resolve must contain between 1 and 50 identity IDs");
  }
  return Array.from(new Set(values.map((tokenId) => normalizeTokenId(tokenId))));
}

async function mapWithConcurrency<T>(
  values: readonly T[],
  limit: number,
  mapper: (value: T) => Promise<void>
): Promise<void> {
  let next = 0;
  async function worker(): Promise<void> {
    while (next < values.length) {
      const index = next++;
      await mapper(values[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, () => worker())
  );
}

async function resolveIdentityDomains(
  owner: string,
  tokenIds: string[],
  key: string
): Promise<{
  domainsByTokenId: Record<string, string[]>;
  resolvedTokenIds: string[];
  source: "starkscan";
}> {
  const requested = new Set(tokenIds);
  const acquisitions = new Map<string, string>();
  let cursor: string | undefined;

  for (let pageIndex = 0; pageIndex < 10; pageIndex += 1) {
    const upstream = await fetchWithTimeout(
      transferUrl(owner, "in", cursor).toString(),
      { headers: { "X-Starkscan-Api-Key": key } }
    );
    if (!upstream.ok) throw new Error("Identity domain discovery is unavailable");
    const body = await upstream.json();
    const page = parseIdentityTransferPage(body);
    const pageAcquisitions = parseIdentityAcquisitions(body, owner, requested);
    for (const [tokenId, txHash] of pageAcquisitions) {
      if (!acquisitions.has(tokenId)) acquisitions.set(tokenId, txHash);
    }
    if (acquisitions.size === requested.size || !page.nextCursor) break;
    cursor = page.nextCursor;
  }

  const domains = new Map<string, Set<string>>();
  const resolved = new Set<string>();
  await mapWithConcurrency(Array.from(acquisitions), 6, async ([tokenId, txHash]) => {
    try {
      const upstream = await fetchWithTimeout(
        new URL(`/v1/SN_MAIN/tx/${txHash}`, STARKSCAN_API).toString(),
        { headers: { "X-Starkscan-Api-Key": key } }
      );
      if (!upstream.ok) return;
      const hints = parseIdentityDomainsFromTransaction(
        await upstream.json(),
        requested
      );
      resolved.add(tokenId);
      for (const [hintedId, hintedDomains] of Object.entries(hints)) {
        const current = domains.get(hintedId) ?? new Set<string>();
        hintedDomains.forEach((domain) => current.add(domain));
        domains.set(hintedId, current);
      }
    } catch {
      // Keep partial results and retry unresolved IDs on a later refresh.
    }
  });

  return {
    domainsByTokenId: Object.fromEntries(
      Array.from(domains, ([tokenId, values]) => [tokenId, Array.from(values)])
    ),
    resolvedTokenIds: Array.from(resolved),
    source: "starkscan",
  };
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
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET, OPTIONS");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  let owner: string;
  const rawOwner = oneQueryValue(request.query.owner);
  const cursor = oneQueryValue(request.query.cursor);
  const rawResolve = oneQueryValue(request.query.resolve);
  let resolveTokenIds: string[];
  try {
    if (!rawOwner) throw new Error("owner is required");
    owner = normalizeAddress(rawOwner);
    if (cursor && !STARKSCAN_CURSOR_PATTERN.test(cursor)) {
      throw new Error("cursor is invalid");
    }
    resolveTokenIds = parseResolveIds(rawResolve);
    if (cursor && resolveTokenIds.length) {
      throw new Error("cursor cannot be combined with resolve");
    }
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "Invalid identity query",
    });
    return;
  }

  const key = process.env.STARKSCAN_API_KEY?.trim();
  if (!key) {
    response.status(503).json({ error: "Identity discovery is not configured" });
    return;
  }

  try {
    if (resolveTokenIds.length) {
      response.status(200).json(
        await resolveIdentityDomains(owner, resolveTokenIds, key)
      );
      return;
    }

    const upstream = await fetchWithTimeout(transferUrl(owner, "any", cursor).toString(), {
      headers: { "X-Starkscan-Api-Key": key },
    });
    copyOperationalHeaders(upstream, response);
    if (!upstream.ok) {
      response.status(upstream.status).json({ error: "Identity discovery is unavailable" });
      return;
    }
    const page = parseIdentityTransferPage(await upstream.json());
    response.status(200).json(page);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    response.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? "Identity discovery timed out"
        : "Identity discovery is unavailable",
    });
  }
}

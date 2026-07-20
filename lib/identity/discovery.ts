import {
  normalizeAddress,
  normalizeTokenId,
  sameAddress,
} from "@/lib/core/address";
import type {
  IdentityCacheV1,
  IdentityDomainDiscoveryResponse,
  IdentityDiscoveryResponse,
  IdentitySource,
  OwnedIdentity,
} from "@/lib/core/types";
import {
  readDomainId as readDomainIdOnchain,
  readMainId as readMainIdOnchain,
  readOwnerOf as readOwnerOfOnchain,
  readReverseDomain as readReverseDomainOnchain,
  readUserData as readUserDataOnchain,
  STARKNET_FIELD,
} from "@/lib/chain/contracts";
import { normalizeDomain } from "@/lib/chain/domain";
import { rememberIdentity as rememberIdentityInCache } from "@/lib/identity/cache";

export type DiscoveryReaders = {
  readDomainId: typeof readDomainIdOnchain;
  readMainId: typeof readMainIdOnchain;
  readOwnerOf: typeof readOwnerOfOnchain;
  readUserData: typeof readUserDataOnchain;
};

const DEFAULT_DISCOVERY_READERS: DiscoveryReaders = {
  readDomainId: readDomainIdOnchain,
  readMainId: readMainIdOnchain,
  readOwnerOf: readOwnerOfOnchain,
  readUserData: readUserDataOnchain,
};

export type ImportDependencies = {
  readDomainId: typeof readDomainIdOnchain;
  readOwnerOf: typeof readOwnerOfOnchain;
  rememberIdentity: typeof rememberIdentityInCache;
};

const DEFAULT_IMPORT_DEPENDENCIES: ImportDependencies = {
  readDomainId: readDomainIdOnchain,
  readOwnerOf: readOwnerOfOnchain,
  rememberIdentity: rememberIdentityInCache,
};

export type CandidateSources = Map<string, Set<IdentitySource>>;

export async function fetchIdentityCandidates(
  owner: string,
  cursor?: string | null
): Promise<IdentityDiscoveryResponse> {
  const query = new URLSearchParams({ owner: normalizeAddress(owner) });
  if (cursor) query.set("cursor", cursor);
  const response = await fetch(`/api/indexer/identities?${query.toString()}`);
  if (!response.ok) throw new Error("Starkscan identity discovery is unavailable");
  const payload = (await response.json()) as IdentityDiscoveryResponse;
  if (
    payload.source !== "starkscan" ||
    !Array.isArray(payload.candidateTokenIds) ||
    (payload.nextCursor !== null && typeof payload.nextCursor !== "string")
  ) {
    throw new Error("Identity discovery returned malformed data");
  }
  return {
    candidateTokenIds: payload.candidateTokenIds.map((id) => normalizeTokenId(id)),
    nextCursor: payload.nextCursor,
    source: "starkscan",
  };
}

export type IdentityCandidatePageReader = (
  owner: string,
  cursor?: string | null
) => Promise<IdentityDiscoveryResponse>;

export async function fetchAllIdentityCandidates(
  owner: string,
  startCursor: string | null = null,
  maxPages = 50,
  readPage: IdentityCandidatePageReader = fetchIdentityCandidates
): Promise<IdentityDiscoveryResponse> {
  if (!Number.isSafeInteger(maxPages) || maxPages < 1 || maxPages > 100) {
    throw new Error("Identity discovery page limit is invalid");
  }
  const ids = new Set<string>();
  const seenCursors = new Set<string>();
  let cursor = startCursor;

  for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
    const page = await readPage(owner, cursor);
    for (const tokenId of page.candidateTokenIds) ids.add(normalizeTokenId(tokenId));
    if (!page.nextCursor) {
      return {
        candidateTokenIds: Array.from(ids),
        nextCursor: null,
        source: "starkscan",
      };
    }
    if (seenCursors.has(page.nextCursor)) {
      throw new Error("Identity discovery returned a repeated cursor");
    }
    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }

  return {
    candidateTokenIds: Array.from(ids),
    nextCursor: cursor,
    source: "starkscan",
  };
}

export async function fetchIdentityDomainHints(
  owner: string,
  tokenIds: readonly string[]
): Promise<IdentityDomainDiscoveryResponse> {
  const normalizedIds = Array.from(new Set(tokenIds.map((id) => normalizeTokenId(id))));
  if (!normalizedIds.length || normalizedIds.length > 50) {
    throw new Error("Domain discovery requires between 1 and 50 identity IDs");
  }
  const query = new URLSearchParams({
    owner: normalizeAddress(owner),
    resolve: normalizedIds.join(","),
  });
  const response = await fetch(`/api/indexer/identities?${query.toString()}`);
  if (!response.ok) throw new Error("Starkscan domain discovery is unavailable");
  const payload = (await response.json()) as Partial<IdentityDomainDiscoveryResponse>;
  if (
    payload.source !== "starkscan" ||
    !payload.domainsByTokenId ||
    typeof payload.domainsByTokenId !== "object" ||
    Array.isArray(payload.domainsByTokenId) ||
    !Array.isArray(payload.resolvedTokenIds)
  ) {
    throw new Error("Domain discovery returned malformed data");
  }
  const requested = new Set(normalizedIds);
  const domainsByTokenId: Record<string, string[]> = {};
  for (const [rawTokenId, rawDomains] of Object.entries(payload.domainsByTokenId)) {
    const tokenId = normalizeTokenId(rawTokenId);
    if (!requested.has(tokenId) || !Array.isArray(rawDomains) || rawDomains.length > 64) {
      throw new Error("Domain discovery returned unexpected data");
    }
    domainsByTokenId[tokenId] = Array.from(
      new Set(rawDomains.map((domain) => normalizeDomain(String(domain))))
    );
  }
  const resolvedTokenIds = Array.from(
    new Set(payload.resolvedTokenIds.map((id) => normalizeTokenId(String(id))))
  );
  if (resolvedTokenIds.some((id) => !requested.has(id))) {
    throw new Error("Domain discovery returned an unexpected identity");
  }
  return { domainsByTokenId, resolvedTokenIds, source: "starkscan" };
}

export function addCandidate(
  candidates: CandidateSources,
  tokenId: string,
  source: IdentitySource
): void {
  const normalized = normalizeTokenId(tokenId);
  const sources = candidates.get(normalized) ?? new Set<IdentitySource>();
  sources.add(source);
  candidates.set(normalized, sources);
}

export function addCacheCandidates(
  candidates: CandidateSources,
  cache: IdentityCacheV1
): void {
  for (const entry of Object.values(cache.entries)) {
    addCandidate(candidates, entry.tokenId, "cache");
  }
}

async function mapWithConcurrency<T, R>(
  values: readonly T[],
  limit: number,
  mapper: (value: T) => Promise<R>
): Promise<R[]> {
  const output: R[] = new Array(values.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < values.length) {
      const index = next++;
      output[index] = await mapper(values[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, () => worker())
  );
  return output;
}

export async function validateIdentityCandidates(
  owner: string,
  candidates: CandidateSources,
  cache: IdentityCacheV1,
  reverseDomain = "",
  mainId?: string,
  readers: DiscoveryReaders = DEFAULT_DISCOVERY_READERS
): Promise<OwnedIdentity[]> {
  const normalizedOwner = normalizeAddress(owner);
  const authoritativeMain = mainId ?? (await readers.readMainId(normalizedOwner));
  const rows = await mapWithConcurrency(
    Array.from(candidates.entries()),
    6,
    async ([tokenId, sources]): Promise<OwnedIdentity | null> => {
      const actualOwner = await readers.readOwnerOf(tokenId);
      if (!actualOwner || !sameAddress(actualOwner, normalizedOwner)) return null;
      const cachedDomains = cache.entries[tokenId]?.domains ?? [];
      const [target, linkedDomains] = await Promise.all([
        readers.readUserData(tokenId, STARKNET_FIELD),
        Promise.all(
          cachedDomains.map(async (domain) =>
            (await readers.readDomainId(domain)) === tokenId ? domain : null
          )
        ),
      ]);
      const domains = linkedDomains.filter((domain): domain is string => domain !== null);
      if (reverseDomain && tokenId === authoritativeMain) domains.push(reverseDomain);
      return {
        tokenId,
        owner: actualOwner,
        isMain: tokenId === authoritativeMain,
        target,
        importedDomains: Array.from(new Set(domains)),
        sources: Array.from(sources),
      };
    }
  );
  return rows.filter((row): row is OwnedIdentity => row !== null);
}

export async function addAuthoritativeCandidates(
  owner: string,
  candidates: CandidateSources
): Promise<{ mainId: string; reverseDomain: string }> {
  const normalizedOwner = normalizeAddress(owner);
  const [mainId, reverseDomain] = await Promise.all([
    readMainIdOnchain(normalizedOwner),
    readReverseDomainOnchain(normalizedOwner),
  ]);
  if (mainId !== "0") addCandidate(candidates, mainId, "main");
  if (reverseDomain) {
    const reverseId = await readDomainIdOnchain(reverseDomain);
    if (reverseId !== "0") addCandidate(candidates, reverseId, "main");
  }
  return { mainId, reverseDomain };
}

export async function importOwnedIdentity(
  owner: string,
  input: string,
  storage?: Storage,
  dependencies: ImportDependencies = DEFAULT_IMPORT_DEPENDENCIES
): Promise<{ tokenId: string; domain?: string }> {
  const normalizedOwner = normalizeAddress(owner);
  let tokenId: string;
  let domain: string | undefined;
  const trimmed = input.trim();

  if (!/^(?:0x[0-9a-fA-F]+|[0-9]+)$/.test(trimmed)) {
    domain = normalizeDomain(trimmed);
    tokenId = await dependencies.readDomainId(domain);
    if (tokenId === "0") throw new Error("That domain is not linked to an identity");
  } else {
    tokenId = normalizeTokenId(trimmed);
  }

  const actualOwner = await dependencies.readOwnerOf(tokenId);
  if (!actualOwner || !sameAddress(actualOwner, normalizedOwner)) {
    throw new Error("The connected account does not own that identity");
  }
  dependencies.rememberIdentity(
    normalizedOwner,
    tokenId,
    domain ? [domain] : [],
    "manual",
    storage
  );
  return { tokenId, domain };
}

export function missingIdentityCount(discovered: number, balance: bigint): bigint {
  if (!Number.isSafeInteger(discovered) || discovered < 0) {
    throw new Error("Discovered identity count is invalid");
  }
  const count = BigInt(discovered);
  return balance > count ? balance - count : 0n;
}

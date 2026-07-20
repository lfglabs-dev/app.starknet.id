import { SN_MAIN } from "@/lib/chain/manifest";
import {
  normalizeAddress,
  normalizeTokenId,
} from "@/lib/core/address";
import type {
  IdentityCacheEntryV1,
  IdentityCacheHint,
  IdentityCacheV1,
  IdentitySource,
} from "@/lib/core/types";
import { isValidStarkDomain, normalizeDomain } from "@/lib/chain/domain";

const CACHE_PREFIX = "starknet-id:identity-cache:v1";
const VALID_SOURCES = new Set<IdentitySource>([
  "starkscan",
  "main",
  "cache",
  "manual",
  "local",
]);

function storageOrNull(storage?: Storage): Storage | null {
  if (storage) return storage;
  return typeof window === "undefined" ? null : window.localStorage;
}

export function identityCacheKey(account: string): string {
  return `${CACHE_PREFIX}:${SN_MAIN.chain}:${normalizeAddress(account)}`;
}

export function emptyIdentityCache(account: string): IdentityCacheV1 {
  return {
    version: 1,
    chainId: "SN_MAIN",
    account: normalizeAddress(account),
    entries: {},
  };
}

function parseEntry(value: unknown): IdentityCacheEntryV1 | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entry = value as Partial<IdentityCacheEntryV1>;
  let tokenId: string;
  try {
    tokenId = normalizeTokenId(String(entry.tokenId));
  } catch {
    return null;
  }
  if (!Array.isArray(entry.domains) || !Array.isArray(entry.sources)) return null;
  const domains: string[] = [];
  for (const candidate of entry.domains.slice(0, 64)) {
    if (typeof candidate !== "string") return null;
    try {
      const domain = normalizeDomain(candidate);
      if (!isValidStarkDomain(domain)) return null;
      domains.push(domain);
    } catch {
      return null;
    }
  }
  const sources = entry.sources.filter(
    (source): source is IdentitySource =>
      typeof source === "string" && VALID_SOURCES.has(source as IdentitySource)
  );
  if (sources.length !== entry.sources.length) return null;
  if (
    typeof entry.updatedAt !== "number" ||
    !Number.isSafeInteger(entry.updatedAt) ||
    entry.updatedAt < 0
  ) {
    return null;
  }
  if (
    entry.domainCheckedAt !== undefined &&
    (typeof entry.domainCheckedAt !== "number" ||
      !Number.isSafeInteger(entry.domainCheckedAt) ||
      entry.domainCheckedAt < 0)
  ) {
    return null;
  }
  return {
    tokenId,
    domains: Array.from(new Set(domains)),
    sources: Array.from(new Set(sources)),
    updatedAt: entry.updatedAt,
    ...(entry.domainCheckedAt !== undefined
      ? { domainCheckedAt: entry.domainCheckedAt }
      : {}),
  };
}

export function loadIdentityCache(
  account: string,
  storage?: Storage
): IdentityCacheV1 {
  const normalizedAccount = normalizeAddress(account);
  const targetStorage = storageOrNull(storage);
  if (!targetStorage) return emptyIdentityCache(normalizedAccount);
  const key = identityCacheKey(normalizedAccount);
  const raw = targetStorage.getItem(key);
  if (!raw) return emptyIdentityCache(normalizedAccount);

  try {
    const value = JSON.parse(raw) as Partial<IdentityCacheV1>;
    if (
      value.version !== 1 ||
      value.chainId !== "SN_MAIN" ||
      value.account !== normalizedAccount ||
      !value.entries ||
      typeof value.entries !== "object" ||
      Array.isArray(value.entries)
    ) {
      throw new Error("Invalid cache envelope");
    }
    const entries: Record<string, IdentityCacheEntryV1> = {};
    const rawEntries = Object.entries(value.entries).slice(0, 256);
    for (const [keyTokenId, rawEntry] of rawEntries) {
      const entry = parseEntry(rawEntry);
      if (!entry || entry.tokenId !== normalizeTokenId(keyTokenId)) {
        throw new Error("Invalid cache entry");
      }
      entries[entry.tokenId] = entry;
    }
    return { version: 1, chainId: "SN_MAIN", account: normalizedAccount, entries };
  } catch {
    targetStorage.removeItem(key);
    return emptyIdentityCache(normalizedAccount);
  }
}

export function saveIdentityCache(
  cache: IdentityCacheV1,
  storage?: Storage
): void {
  const targetStorage = storageOrNull(storage);
  if (!targetStorage) return;
  targetStorage.setItem(identityCacheKey(cache.account), JSON.stringify(cache));
}

export function rememberIdentity(
  account: string,
  tokenId: string,
  domains: string[] = [],
  source: IdentitySource = "local",
  storage?: Storage
): IdentityCacheV1 {
  const normalizedId = normalizeTokenId(tokenId);
  const cache = loadIdentityCache(account, storage);
  const current = cache.entries[normalizedId];
  const normalizedDomains = domains.map(normalizeDomain);
  cache.entries[normalizedId] = {
    tokenId: normalizedId,
    domains: Array.from(new Set([...(current?.domains ?? []), ...normalizedDomains])),
    sources: Array.from(new Set([...(current?.sources ?? []), source])),
    updatedAt: Date.now(),
    ...(current?.domainCheckedAt !== undefined
      ? { domainCheckedAt: current.domainCheckedAt }
      : {}),
  };
  saveIdentityCache(cache, storage);
  return cache;
}

export function markIdentityDomainChecked(
  account: string,
  tokenId: string,
  domains: string[] = [],
  storage?: Storage
): IdentityCacheV1 {
  const normalizedId = normalizeTokenId(tokenId);
  const cache = loadIdentityCache(account, storage);
  const current = cache.entries[normalizedId];
  cache.entries[normalizedId] = {
    tokenId: normalizedId,
    domains: Array.from(
      new Set([...(current?.domains ?? []), ...domains.map(normalizeDomain)])
    ),
    sources: Array.from(
      new Set<IdentitySource>([...(current?.sources ?? []), "starkscan"])
    ),
    updatedAt: Date.now(),
    domainCheckedAt: Date.now(),
  };
  saveIdentityCache(cache, storage);
  return cache;
}

export function removeIdentity(
  account: string,
  tokenId: string,
  storage?: Storage
): void {
  const cache = loadIdentityCache(account, storage);
  delete cache.entries[normalizeTokenId(tokenId)];
  saveIdentityCache(cache, storage);
}

export function applyIdentityCacheHints(
  account: string,
  hints: readonly IdentityCacheHint[] | undefined,
  storage?: Storage
): void {
  for (const hint of hints ?? []) {
    if (hint.action === "remove") {
      removeIdentity(account, hint.tokenId, storage);
    } else {
      rememberIdentity(
        account,
        hint.tokenId,
        hint.domains ?? [],
        hint.source ?? "local",
        storage
      );
    }
  }
}

export function pruneIdentityCache(
  account: string,
  ownedTokenIds: ReadonlySet<string>,
  storage?: Storage
): IdentityCacheV1 {
  const cache = loadIdentityCache(account, storage);
  for (const tokenId of Object.keys(cache.entries)) {
    if (!ownedTokenIds.has(tokenId)) delete cache.entries[tokenId];
  }
  saveIdentityCache(cache, storage);
  return cache;
}

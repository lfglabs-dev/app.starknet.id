import { hash } from "starknet";
import { SN_MAIN } from "@/lib/chain/manifest";
import { decodeDomain } from "@/lib/chain/domain";
import {
  normalizeAddress,
  normalizeTokenId,
  sameAddress,
} from "@/lib/core/address";
import type { IdentityDiscoveryResponse } from "@/lib/core/types";

export const STARKSCAN_CURSOR_PATTERN = /^[0-9]+:[0-9]+:[0-9]+:[0-9]+$/;
export const STARKSCAN_TX_HASH_PATTERN = /^0x[0-9a-f]{1,64}$/;

const DOMAIN_TRANSFER_SELECTOR = BigInt(hash.getSelectorFromName("DomainTransfer"));
const DOMAIN_MINT_SELECTOR = BigInt(hash.getSelectorFromName("DomainMint"));

type TransferItem = {
  tokenId?: unknown;
  rawValue?: unknown;
  amount?: unknown;
  toAddress?: unknown;
  txHash?: unknown;
};

function transferTokenId(item: TransferItem): string | null {
  const tokenId = item.tokenId ?? item.rawValue ?? item.amount;
  if (typeof tokenId !== "string" && typeof tokenId !== "number") return null;
  try {
    return normalizeTokenId(String(tokenId));
  } catch {
    return null;
  }
}

export function parseIdentityTransferPage(value: unknown): IdentityDiscoveryResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Malformed identity transfer response");
  }
  const page = value as { items?: unknown; nextCursor?: unknown };
  if (!Array.isArray(page.items)) {
    throw new Error("Malformed identity transfer items");
  }
  if (
    page.nextCursor !== null &&
    page.nextCursor !== undefined &&
    (typeof page.nextCursor !== "string" ||
      !STARKSCAN_CURSOR_PATTERN.test(page.nextCursor))
  ) {
    throw new Error("Malformed identity transfer cursor");
  }

  const ids = new Set<string>();
  for (const rawItem of page.items) {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem)) continue;
    const item = rawItem as TransferItem;
    // Starkscan's current transfer index labels legacy Starknet ID transfers as
    // ERC-20 rows. Those rows carry the identity ID in rawValue/amount instead
    // of tokenId. The route is already restricted to the identity contract, so
    // both representations are valid discovery candidates and are still
    // verified against owner_of before the client displays them.
    const tokenId = transferTokenId(item);
    if (tokenId) ids.add(tokenId);
  }

  return {
    candidateTokenIds: Array.from(ids),
    nextCursor: (page.nextCursor as string | null | undefined) ?? null,
    source: "starkscan",
  };
}

export function parseIdentityAcquisitions(
  value: unknown,
  owner: string,
  requestedTokenIds: ReadonlySet<string>
): Map<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Malformed identity transfer response");
  }
  const page = value as { items?: unknown };
  if (!Array.isArray(page.items)) {
    throw new Error("Malformed identity transfer items");
  }
  const normalizedOwner = normalizeAddress(owner);
  const acquisitions = new Map<string, string>();
  for (const rawItem of page.items) {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem)) continue;
    const item = rawItem as TransferItem;
    const tokenId = transferTokenId(item);
    if (!tokenId || !requestedTokenIds.has(tokenId) || acquisitions.has(tokenId)) {
      continue;
    }
    if (
      typeof item.toAddress !== "string" ||
      !sameAddress(item.toAddress, normalizedOwner) ||
      typeof item.txHash !== "string" ||
      !STARKSCAN_TX_HASH_PATTERN.test(item.txHash)
    ) {
      continue;
    }
    acquisitions.set(tokenId, item.txHash);
  }
  return acquisitions;
}

type StarkscanLog = {
  address?: unknown;
  keys?: unknown;
  data?: unknown;
};

export function parseIdentityDomainsFromTransaction(
  value: unknown,
  requestedTokenIds: ReadonlySet<string>
): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Malformed Starkscan transaction detail");
  }
  const logs = (value as { logs?: unknown }).logs;
  if (!Array.isArray(logs)) throw new Error("Malformed Starkscan transaction logs");
  const domains = new Map<string, Set<string>>();

  for (const rawLog of logs.slice(0, 1_000)) {
    if (!rawLog || typeof rawLog !== "object" || Array.isArray(rawLog)) continue;
    const log = rawLog as StarkscanLog;
    if (
      typeof log.address !== "string" ||
      !sameAddress(log.address, SN_MAIN.contracts.naming.address) ||
      !Array.isArray(log.keys) ||
      !Array.isArray(log.data) ||
      !log.keys.every((value) => typeof value === "string") ||
      !log.data.every((value) => typeof value === "string")
    ) {
      continue;
    }
    const keys = log.keys as string[];
    const data = log.data as string[];
    if (!keys.length) continue;

    try {
      const selector = BigInt(keys[0]);
      let tokenId: string;
      let encodedDomain: string[];
      if (selector === DOMAIN_TRANSFER_SELECTOR) {
        const length = Number(BigInt(keys[1] ?? "-1"));
        if (!Number.isSafeInteger(length) || length < 1 || length > 64) continue;
        tokenId = normalizeTokenId(data[1]);
        encodedDomain = keys.slice(2, length + 2);
        if (encodedDomain.length !== length) continue;
      } else if (selector === DOMAIN_MINT_SELECTOR) {
        tokenId = normalizeTokenId(data[0]);
        encodedDomain = [keys[1]];
      } else {
        continue;
      }
      if (!requestedTokenIds.has(tokenId)) continue;
      const domain = decodeDomain(encodedDomain);
      const current = domains.get(tokenId) ?? new Set<string>();
      current.add(domain);
      domains.set(tokenId, current);
    } catch {
      // Ignore malformed or unrelated logs. Domain hints are verified on-chain.
    }
  }

  return Object.fromEntries(
    Array.from(domains, ([tokenId, values]) => [tokenId, Array.from(values)])
  );
}

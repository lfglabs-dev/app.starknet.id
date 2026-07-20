import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { readDomainId, readIdentityBalance } from "@/lib/chain/contracts";
import type {
  IdentitySource,
  OwnedIdentity,
} from "@/lib/core/types";
import {
  addAuthoritativeCandidates,
  addCacheCandidates,
  addCandidate,
  CandidateSources,
  fetchAllIdentityCandidates,
  fetchIdentityDomainHints,
  importOwnedIdentity,
  validateIdentityCandidates,
} from "@/lib/identity/discovery";
import {
  loadIdentityCache,
  markIdentityDomainChecked,
  pruneIdentityCache,
} from "@/lib/identity/cache";

const DOMAIN_LOOKUP_TTL_MS = 60 * 60 * 1_000;

export type OwnedIdentityState = {
  identities: OwnedIdentity[];
  balance: bigint;
  nextCursor: string | null;
  loading: boolean;
  warning: string;
  error: string;
  refresh: () => void;
  loadMore: () => Promise<void>;
  importIdentity: (value: string) => Promise<void>;
};

export function useOwnedIdentities(enabled = true): OwnedIdentityState {
  const { address } = useAccount();
  const [identities, setIdentities] = useState<OwnedIdentity[]>([]);
  const [balance, setBalance] = useState(0n);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const candidatesRef = useRef<CandidateSources>(new Map());
  const authoritativeRef = useRef({ mainId: "0", reverseDomain: "" });

  const hydrate = useCallback(
    async (candidates: CandidateSources): Promise<void> => {
      if (!address) return;
      const cache = loadIdentityCache(address);
      const owned = await validateIdentityCandidates(
        address,
        candidates,
        cache,
        authoritativeRef.current.reverseDomain,
        authoritativeRef.current.mainId
      );
      const ownedSet = new Set(owned.map((identity) => identity.tokenId));
      pruneIdentityCache(address, ownedSet);
      const idsToResolve = owned
        .filter((identity) => {
          const checkedAt = cache.entries[identity.tokenId]?.domainCheckedAt ?? 0;
          return Date.now() - checkedAt >= DOMAIN_LOOKUP_TTL_MS;
        })
        .map((identity) => identity.tokenId);

      if (idsToResolve.length) {
        try {
          const hints = await fetchIdentityDomainHints(address, idsToResolve);
          const validDomains = new Map<string, string[]>();
          await Promise.all(
            Object.entries(hints.domainsByTokenId).flatMap(([tokenId, domains]) =>
              domains.map(async (domain) => {
                if ((await readDomainId(domain)) !== tokenId) return;
                const current = validDomains.get(tokenId) ?? [];
                current.push(domain);
                validDomains.set(tokenId, current);
              })
            )
          );
          for (const tokenId of hints.resolvedTokenIds) {
            markIdentityDomainChecked(
              address,
              tokenId,
              validDomains.get(tokenId) ?? []
            );
          }
          for (const identity of owned) {
            const domains = validDomains.get(identity.tokenId);
            if (domains?.length) {
              identity.importedDomains = Array.from(
                new Set([...identity.importedDomains, ...domains])
              );
            }
          }
        } catch {
          // Identity ownership remains usable when optional domain enrichment fails.
        }
      }
      setIdentities(owned.sort((left, right) => Number(right.isMain) - Number(left.isMain)));
    },
    [address]
  );

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      if (!enabled) return;
      if (!address) {
        setIdentities([]);
        setBalance(0n);
        setNextCursor(null);
        setWarning("");
        setError("");
        return;
      }
      setLoading(true);
      setError("");
      const candidates: CandidateSources = new Map();
      try {
        const cache = loadIdentityCache(address);
        addCacheCandidates(candidates, cache);
        const [authoritative, ownedBalance] = await Promise.all([
          addAuthoritativeCandidates(address, candidates),
          readIdentityBalance(address),
        ]);
        authoritativeRef.current = authoritative;
        let page: Awaited<ReturnType<typeof fetchAllIdentityCandidates>> | null = null;
        try {
          page = await fetchAllIdentityCandidates(address);
          for (const tokenId of page.candidateTokenIds) {
            addCandidate(candidates, tokenId, "starkscan");
          }
          if (!cancelled) setWarning("");
        } catch {
          if (!cancelled) {
            setWarning("Starkscan discovery is unavailable. Cached and manual imports still work.");
          }
        }
        if (cancelled) return;
        candidatesRef.current = candidates;
        setBalance(ownedBalance);
        setNextCursor(page?.nextCursor ?? null);
        await hydrate(candidates);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load identities");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [address, enabled, hydrate, refreshIndex]);

  useEffect(() => {
    const refresh = () => setRefreshIndex((value) => value + 1);
    window.addEventListener("starknet-id:transaction-accepted", refresh);
    return () => window.removeEventListener("starknet-id:transaction-accepted", refresh);
  }, []);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!enabled || !address || !nextCursor) return;
    setLoading(true);
    try {
      const page = await fetchAllIdentityCandidates(address, nextCursor);
      for (const tokenId of page.candidateTokenIds) {
        addCandidate(candidatesRef.current, tokenId, "starkscan" as IdentitySource);
      }
      setNextCursor(page.nextCursor);
      await hydrate(candidatesRef.current);
    } finally {
      setLoading(false);
    }
  }, [address, enabled, hydrate, nextCursor]);

  const importIdentity = useCallback(
    async (value: string): Promise<void> => {
      if (!enabled || !address) throw new Error("Connect Braavos first");
      const imported = await importOwnedIdentity(address, value);
      addCandidate(candidatesRef.current, imported.tokenId, "manual");
      await hydrate(candidatesRef.current);
    },
    [address, enabled, hydrate]
  );

  return {
    identities,
    balance,
    nextCursor,
    loading,
    warning,
    error,
    refresh: () => setRefreshIndex((value) => value + 1),
    loadMore,
    importIdentity,
  };
}

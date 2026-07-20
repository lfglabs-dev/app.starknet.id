import type { Call } from "starknet";

export type IdentitySource = "starkscan" | "main" | "cache" | "manual" | "local";

export type IdentityDiscoveryResponse = {
  candidateTokenIds: string[];
  nextCursor: string | null;
  source: "starkscan";
};

export type IdentityDomainDiscoveryResponse = {
  domainsByTokenId: Record<string, string[]>;
  resolvedTokenIds: string[];
  source: "starkscan";
};

export type OwnedIdentity = {
  tokenId: string;
  owner: string;
  isMain: boolean;
  target: string;
  importedDomains: string[];
  sources: IdentitySource[];
};

export type TransactionKind =
  | "mint"
  | "register"
  | "renew"
  | "set-target"
  | "set-main"
  | "transfer"
  | "subdomain";

export type IdentityCacheHint = {
  action: "remember" | "remove";
  tokenId: string;
  domains?: string[];
  source?: IdentitySource;
};

export type TransactionIntent = {
  kind: TransactionKind;
  calls: Call[];
  expectedEffects: string[];
  expectedContracts: string[];
  expectedSelectors: string[];
  cacheHints?: IdentityCacheHint[];
};

export type SimulationReport = {
  ok: boolean;
  estimatedFee: string | null;
  traceSummary: string | null;
  revertReason: string | null;
};

export type IdentityCacheEntryV1 = {
  tokenId: string;
  domains: string[];
  sources: IdentitySource[];
  updatedAt: number;
  domainCheckedAt?: number;
};

export type IdentityCacheV1 = {
  version: 1;
  chainId: "SN_MAIN";
  account: string;
  entries: Record<string, IdentityCacheEntryV1>;
};

export type SubmittedTransaction = {
  hash: string;
  account: string;
  kind: TransactionKind;
  status: "pending" | "accepted" | "reverted";
  submittedAt: number;
  revertReason?: string;
  cacheHints?: IdentityCacheHint[];
};

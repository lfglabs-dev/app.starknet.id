import type { OwnedIdentity } from "@/lib/core/types";

export type IdentityView = {
  tokenId: string;
  owner: string;
  isMain: boolean;
  targetAddress: string;
  domain?: string;
  domainExpiry?: number;
};

export function ownedIdentityToView(identity: OwnedIdentity): IdentityView {
  return {
    tokenId: identity.tokenId,
    owner: identity.owner,
    isMain: identity.isMain,
    targetAddress: BigInt(identity.target) === 0n ? identity.owner : identity.target,
    domain: identity.importedDomains[0],
  };
}

export function shortAddress(value: string): string {
  if (!value) return "";
  return `${value.substring(0, 4)}...${value.substring(value.length - 3)}`.toLowerCase();
}

export function shortDomain(value: string, max = 25): string {
  if (value.length <= max) return value.toLowerCase();
  return `${value.substring(0, 4)}...${value.substring(value.length - 3)}`.toLowerCase();
}

export function identitySerial(tokenId: string): string {
  return tokenId.padStart(12, "0");
}

export function readableDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp * 1_000));
}

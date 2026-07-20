import { SN_MAIN } from "@/lib/chain/manifest";
import {
  asciiToFelt,
  fromUint256,
  normalizeAddress,
  normalizeTokenId,
  sameAddress,
  toUint256,
} from "@/lib/core/address";
import {
  assertDurationDays,
  decodeDomain,
  domainLength,
  encodeDomain,
  spanCalldata,
} from "@/lib/chain/domain";
import { callContract, RpcClientError } from "@/lib/chain/rpc";

export const STARKNET_FIELD = asciiToFelt("starknet");

export async function readOwnerOf(tokenId: string): Promise<string | null> {
  const normalized = normalizeTokenId(tokenId);
  const [low, high] = toUint256(normalized);
  try {
    const [owner] = await callContract(
      SN_MAIN.contracts.identity.address,
      "owner_of",
      [low, high]
    );
    return normalizeAddress(owner);
  } catch (error) {
    if (error instanceof RpcClientError && error.code === 40) return null;
    throw error;
  }
}

export async function readIdentityBalance(owner: string): Promise<bigint> {
  const result = await callContract(
    SN_MAIN.contracts.identity.address,
    "balance_of",
    [normalizeAddress(owner)]
  );
  if (result.length < 2) throw new Error("Malformed identity balance");
  return fromUint256(result[0], result[1]);
}

export async function readMainId(owner: string): Promise<string> {
  const [tokenId = "0"] = await callContract(
    SN_MAIN.contracts.identity.address,
    "get_main_id",
    [normalizeAddress(owner)]
  );
  return normalizeTokenId(tokenId, true);
}

export async function readUserData(
  tokenId: string,
  field: string
): Promise<string> {
  const [value = "0x0"] = await callContract(
    SN_MAIN.contracts.identity.address,
    "get_user_data",
    [normalizeTokenId(tokenId), field, "0"]
  );
  return `0x${BigInt(value).toString(16)}`;
}

export async function readDomainExpiry(domain: string): Promise<bigint> {
  const encoded = encodeDomain(domain);
  const [expiry = "0"] = await callContract(
    SN_MAIN.contracts.naming.address,
    "domain_to_expiry",
    spanCalldata(encoded)
  );
  return BigInt(expiry);
}

export async function readDomainId(domain: string): Promise<string> {
  const encoded = encodeDomain(domain);
  const [tokenId = "0"] = await callContract(
    SN_MAIN.contracts.naming.address,
    "domain_to_id",
    spanCalldata(encoded)
  );
  return normalizeTokenId(tokenId, true);
}

export async function readReverseDomain(owner: string): Promise<string> {
  const result = await callContract(
    SN_MAIN.contracts.naming.address,
    "address_to_domain",
    [normalizeAddress(owner), "0"]
  );
  const length = Number(result[0] ?? 0);
  if (!length) return "";
  if (!Number.isSafeInteger(length) || length < 0 || result.length < length + 1) {
    throw new Error("Malformed reverse domain response");
  }
  return decodeDomain(result.slice(1, length + 1));
}

export type PriceResult = {
  tokenAddress: string;
  amount: bigint;
};

export function decodePriceResult(result: readonly string[]): PriceResult {
  if (result.length < 3) throw new Error("Malformed price response");
  return {
    tokenAddress: normalizeAddress(result[0]),
    amount: fromUint256(result[1], result[2]),
  };
}

export async function readPrice(
  kind: "buy" | "renew",
  domain: string,
  days: number
): Promise<PriceResult> {
  const result = decodePriceResult(
    await callContract(
      SN_MAIN.contracts.pricing.address,
      kind === "buy" ? "compute_buy_price" : "compute_renew_price",
      [domainLength(domain), assertDurationDays(days)]
    )
  );
  if (!sameAddress(result.tokenAddress, SN_MAIN.contracts.eth.address)) {
    throw new Error("The pricing contract did not return ETH");
  }
  return result;
}

export async function requireIdentityOwner(
  tokenId: string,
  expectedOwner: string
): Promise<string> {
  const owner = await readOwnerOf(tokenId);
  if (!owner || !sameAddress(owner, expectedOwner)) {
    throw new Error("The connected account does not own this identity");
  }
  return owner;
}

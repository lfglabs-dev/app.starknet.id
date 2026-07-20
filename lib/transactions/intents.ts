import type { Call } from "starknet";
import { SN_MAIN } from "@/lib/chain/manifest";
import {
  assertDurationDays,
  encodeDomain,
  isDomainAvailable,
  isRootDomain,
  normalizeDomain,
  spanCalldata,
} from "@/lib/chain/domain";
import {
  readDomainExpiry,
  readDomainId,
  readMainId,
  readOwnerOf,
  readPrice,
  readReverseDomain,
  readUserData,
  requireIdentityOwner,
  STARKNET_FIELD,
} from "@/lib/chain/contracts";
import { selector } from "@/lib/chain/rpc";
import {
  normalizeAddress,
  normalizeTokenId,
  sameAddress,
  toUint256,
} from "@/lib/core/address";
import type {
  IdentityCacheHint,
  TransactionIntent,
  TransactionKind,
} from "@/lib/core/types";
import { findAvailableIdentityId } from "@/lib/identity/random";

const ZERO = "0";

function call(
  contractAddress: string,
  entrypoint: string,
  calldata: readonly (string | number | bigint)[] = []
): Call {
  return {
    contractAddress,
    entrypoint,
    calldata: calldata.map((value) => value.toString()),
  };
}

function intent(
  kind: TransactionKind,
  calls: Call[],
  expectedEffects: string[],
  cacheHints?: IdentityCacheHint[]
): TransactionIntent {
  return {
    kind,
    calls,
    expectedEffects,
    expectedContracts: calls.map((item) => item.contractAddress),
    expectedSelectors: calls.map((item) => selector(item.entrypoint)),
    ...(cacheHints ? { cacheHints } : {}),
  };
}

function approveEth(amount: bigint): Call {
  if (amount < 0n) throw new Error("Approval amount cannot be negative");
  return call(SN_MAIN.contracts.eth.address, "approve", [
    SN_MAIN.contracts.naming.address,
    ...toUint256(amount),
  ]);
}

export function buildMintIntent(tokenId: string): TransactionIntent {
  const id = normalizeTokenId(tokenId);
  return intent(
    "mint",
    [call(SN_MAIN.contracts.identity.address, "mint", [id])],
    [`Mint Starknet identity #${id}`],
    [{ action: "remember", tokenId: id, source: "local" }]
  );
}

export type RegisterIntentInput = {
  domain: string;
  days: number;
  tokenId: string;
  price: bigint;
  mintIdentity: boolean;
  setMain: boolean;
  resetReverse?: boolean;
  clearMainTarget?: boolean;
};

export function buildRegisterIntent(input: RegisterIntentInput): TransactionIntent {
  const domain = normalizeDomain(input.domain);
  if (!isRootDomain(domain)) throw new Error("Only root .stark domains can be registered");
  const days = assertDurationDays(input.days);
  const tokenId = normalizeTokenId(input.tokenId);
  const encoded = encodeDomain(domain);
  const calls: Call[] = [];
  if (input.mintIdentity) {
    calls.push(call(SN_MAIN.contracts.identity.address, "mint", [tokenId]));
  }
  calls.push(
    approveEth(input.price),
    call(SN_MAIN.contracts.naming.address, "buy", [
      tokenId,
      encoded[0],
      days,
      ZERO,
      ZERO,
      ZERO,
      ZERO,
    ])
  );
  if (input.setMain) {
    if (input.resetReverse) {
      calls.push(call(SN_MAIN.contracts.naming.address, "reset_address_to_domain"));
    }
    if (input.clearMainTarget) {
      calls.push(
        call(SN_MAIN.contracts.identity.address, "set_user_data", [
          tokenId,
          STARKNET_FIELD,
          ZERO,
          ZERO,
        ])
      );
    }
    calls.push(call(SN_MAIN.contracts.identity.address, "set_main_id", [tokenId]));
  }
  return intent(
    "register",
    calls,
    [
      ...(input.mintIdentity ? [`Mint identity #${tokenId}`] : []),
      `Approve exactly ${input.price.toString()} wei of ETH`,
      `Register ${domain} for ${days} days`,
      ...(input.resetReverse ? ["Reset the previous reverse domain record"] : []),
      ...(input.clearMainTarget ? ["Clear the incompatible custom Starknet target"] : []),
      ...(input.setMain ? [`Set identity #${tokenId} as the main ID`] : []),
    ],
    [{ action: "remember", tokenId, domains: [domain], source: "local" }]
  );
}

export function buildRenewIntent(input: {
  domain: string;
  days: number;
  tokenId: string;
  price: bigint;
}): TransactionIntent {
  const domain = normalizeDomain(input.domain);
  if (!isRootDomain(domain)) throw new Error("Only root .stark domains can be renewed");
  const days = assertDurationDays(input.days);
  const tokenId = normalizeTokenId(input.tokenId);
  const encoded = encodeDomain(domain);
  return intent(
    "renew",
    [
      approveEth(input.price),
      call(SN_MAIN.contracts.naming.address, "renew", [
        encoded[0],
        days,
        ZERO,
        ZERO,
        ZERO,
      ]),
    ],
    [
      `Approve exactly ${input.price.toString()} wei of ETH`,
      `Renew ${domain} for ${days} days`,
    ],
    [{ action: "remember", tokenId, domains: [domain], source: "local" }]
  );
}

export function buildSetTargetIntent(tokenId: string, target: string): TransactionIntent {
  const id = normalizeTokenId(tokenId);
  const address = normalizeAddress(target);
  return intent(
    "set-target",
    [
      call(SN_MAIN.contracts.identity.address, "set_user_data", [
        id,
        STARKNET_FIELD,
        address,
        ZERO,
      ]),
    ],
    [`Set identity #${id} Starknet target to ${address}`]
  );
}

export function buildSetMainIntent(input: {
  tokenId: string;
  resetReverse: boolean;
  clearTarget: boolean;
  migrateDomain?: string;
}): TransactionIntent {
  const tokenId = normalizeTokenId(input.tokenId);
  const calls: Call[] = [];
  if (input.resetReverse) {
    calls.push(call(SN_MAIN.contracts.naming.address, "reset_address_to_domain"));
  }
  if (input.clearTarget) {
    calls.push(
      call(SN_MAIN.contracts.identity.address, "set_user_data", [
        tokenId,
        STARKNET_FIELD,
        ZERO,
        ZERO,
      ])
    );
  }
  if (input.migrateDomain) {
    calls.push(
      call(
        SN_MAIN.contracts.naming.address,
        "migrate_domain",
        spanCalldata(encodeDomain(input.migrateDomain))
      )
    );
  }
  calls.push(call(SN_MAIN.contracts.identity.address, "set_main_id", [tokenId]));
  return intent(
    "set-main",
    calls,
    [
      ...(input.resetReverse ? ["Reset the current reverse domain record"] : []),
      ...(input.clearTarget ? ["Clear the incompatible custom Starknet target"] : []),
      ...(input.migrateDomain ? [`Migrate ${normalizeDomain(input.migrateDomain)}`] : []),
      `Set identity #${tokenId} as the main ID`,
    ]
  );
}

export function buildTransferIntent(
  tokenId: string,
  from: string,
  to: string
): TransactionIntent {
  const id = normalizeTokenId(tokenId);
  const sender = normalizeAddress(from);
  const recipient = normalizeAddress(to);
  if (sameAddress(sender, recipient)) throw new Error("Choose a different destination");
  return intent(
    "transfer",
    [
      call(SN_MAIN.contracts.identity.address, "transfer_from", [
        sender,
        recipient,
        ...toUint256(id),
      ]),
    ],
    [`Transfer identity #${id} to ${recipient}`],
    [{ action: "remove", tokenId: id }]
  );
}

export function buildSubdomainIntent(input: {
  subdomain: string;
  targetTokenId: string;
  mintIdentity: boolean;
}): TransactionIntent {
  const domain = normalizeDomain(input.subdomain);
  if (isRootDomain(domain)) throw new Error("Enter a subdomain, not a root domain");
  const targetId = normalizeTokenId(input.targetTokenId);
  const calls: Call[] = [];
  if (input.mintIdentity) {
    calls.push(call(SN_MAIN.contracts.identity.address, "mint", [targetId]));
  }
  calls.push(
    call(
      SN_MAIN.contracts.naming.address,
      "transfer_domain",
      [...spanCalldata(encodeDomain(domain)), targetId]
    )
  );
  return intent(
    "subdomain",
    calls,
    [
      ...(input.mintIdentity ? [`Mint identity #${targetId}`] : []),
      `Create ${domain} on identity #${targetId}`,
    ],
    [{ action: "remember", tokenId: targetId, domains: [domain], source: "local" }]
  );
}

export async function prepareMintIntent(candidateTokenId?: string): Promise<TransactionIntent> {
  const tokenId =
    candidateTokenId ?? (await findAvailableIdentityId(readOwnerOf));
  if (await readOwnerOf(tokenId)) {
    throw new Error("The selected random identity ID is already owned");
  }
  return buildMintIntent(tokenId);
}

export async function prepareRegisterIntent(input: {
  owner: string;
  domain: string;
  days: number;
  tokenId?: string;
  mintIdentity: boolean;
  setMain: boolean;
}): Promise<TransactionIntent> {
  const owner = normalizeAddress(input.owner);
  const domain = normalizeDomain(input.domain);
  if (!isRootDomain(domain)) throw new Error("Only root .stark domains can be registered");
  const days = assertDurationDays(input.days);
  const expiry = await readDomainExpiry(domain);
  if (!isDomainAvailable(expiry)) throw new Error("That domain is not available");

  let tokenId = input.tokenId;
  if (input.mintIdentity) {
    tokenId = tokenId ?? (await findAvailableIdentityId(readOwnerOf));
    if (await readOwnerOf(tokenId)) throw new Error("The selected random identity ID collided");
  } else {
    if (!tokenId) throw new Error("Select an owned identity");
    await requireIdentityOwner(tokenId, owner);
  }
  const price = await readPrice("buy", domain, days);
  let setMain = input.setMain;
  let resetReverse = false;
  let clearMainTarget = false;
  if (setMain) {
    const [currentMain, reverseDomain, currentTarget] = await Promise.all([
      readMainId(owner),
      readReverseDomain(owner),
      input.mintIdentity
        ? Promise.resolve("0x0")
        : readUserData(tokenId, STARKNET_FIELD),
    ]);
    setMain = currentMain !== normalizeTokenId(tokenId);
    if (setMain) {
      resetReverse = Boolean(reverseDomain);
      clearMainTarget =
        BigInt(currentTarget) !== 0n && !sameAddress(currentTarget, owner);
    }
  }
  return buildRegisterIntent({
    domain,
    days,
    tokenId,
    price: price.amount,
    mintIdentity: input.mintIdentity,
    setMain,
    resetReverse,
    clearMainTarget,
  });
}

export async function prepareRenewIntent(input: {
  owner: string;
  domain: string;
  days: number;
}): Promise<TransactionIntent> {
  const owner = normalizeAddress(input.owner);
  const domain = normalizeDomain(input.domain);
  if (!isRootDomain(domain)) throw new Error("Only root .stark domains can be renewed");
  const tokenId = await readDomainId(domain);
  if (tokenId === "0") throw new Error(`${domain} is not registered`);
  // Do not reject based on a browser-side expiry calculation. The naming
  // contract's current rules are authoritative, and the wallet preflight below
  // will report any contract-level renewal restriction with the exact domain.
  try {
    await requireIdentityOwner(tokenId, owner);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Cannot renew ${domain}: ${message}`);
  }
  const days = assertDurationDays(input.days);
  const price = await readPrice("renew", domain, days);
  return buildRenewIntent({ domain, days, tokenId, price: price.amount });
}

export async function prepareRenewManyIntent(input: {
  owner: string;
  domains: string[];
  days: number;
}): Promise<TransactionIntent> {
  const domains = Array.from(new Set(input.domains.map(normalizeDomain)));
  if (!domains.length) throw new Error("Select at least one domain to renew");
  const intents = await Promise.all(
    domains.map((domain) =>
      prepareRenewIntent({ owner: input.owner, domain, days: input.days })
    )
  );
  return {
    kind: "renew",
    calls: intents.flatMap((item) => item.calls),
    expectedEffects: intents.flatMap((item) => item.expectedEffects),
    expectedContracts: intents.flatMap((item) => item.expectedContracts),
    expectedSelectors: intents.flatMap((item) => item.expectedSelectors),
    cacheHints: intents.flatMap((item) => item.cacheHints ?? []),
  };
}

export async function prepareSetTargetIntent(
  owner: string,
  tokenId: string,
  target: string
): Promise<TransactionIntent> {
  await requireIdentityOwner(tokenId, owner);
  return buildSetTargetIntent(tokenId, target);
}

export async function prepareSetMainIntent(
  owner: string,
  tokenId: string,
  migrationDomain = ""
): Promise<TransactionIntent> {
  const normalizedOwner = normalizeAddress(owner);
  await requireIdentityOwner(tokenId, normalizedOwner);
  const [currentMain, reverseDomain, target] = await Promise.all([
    readMainId(normalizedOwner),
    readReverseDomain(normalizedOwner),
    readUserData(tokenId, STARKNET_FIELD),
  ]);
  if (currentMain === normalizeTokenId(tokenId)) {
    throw new Error("That identity is already the main ID");
  }
  let migrateDomain: string | undefined;
  if (migrationDomain.trim()) {
    const normalizedDomain = normalizeDomain(migrationDomain);
    const linkedId = await readDomainId(normalizedDomain);
    if (linkedId === "0") {
      migrateDomain = normalizedDomain;
    } else if (linkedId !== normalizeTokenId(tokenId)) {
      throw new Error("That domain is linked to a different identity");
    }
  }
  return buildSetMainIntent({
    tokenId,
    resetReverse: Boolean(reverseDomain),
    clearTarget: BigInt(target) !== 0n && !sameAddress(target, normalizedOwner),
    migrateDomain,
  });
}

export async function prepareTransferIntent(
  owner: string,
  tokenId: string,
  destination: string
): Promise<TransactionIntent> {
  const actualOwner = await requireIdentityOwner(tokenId, owner);
  return buildTransferIntent(tokenId, actualOwner, destination);
}

export async function prepareSubdomainIntent(input: {
  owner: string;
  rootDomain: string;
  label: string;
  targetTokenId?: string;
  mintIdentity: boolean;
}): Promise<TransactionIntent> {
  const owner = normalizeAddress(input.owner);
  const root = normalizeDomain(input.rootDomain);
  if (!isRootDomain(root)) throw new Error("Choose an owned root domain");
  const rootId = await readDomainId(root);
  if (rootId === "0") throw new Error("The root domain is not registered");
  await requireIdentityOwner(rootId, owner);

  const domain = normalizeDomain(`${input.label.trim().toLowerCase()}.${root}`);
  if ((await readDomainId(domain)) !== "0") throw new Error("That subdomain already exists");

  let targetTokenId = input.targetTokenId;
  if (input.mintIdentity) {
    targetTokenId =
      targetTokenId ?? (await findAvailableIdentityId(readOwnerOf));
    if (await readOwnerOf(targetTokenId)) {
      throw new Error("The selected random identity ID collided");
    }
  } else {
    if (!targetTokenId) throw new Error("Select an owned target identity");
    await requireIdentityOwner(targetTokenId, owner);
  }
  return buildSubdomainIntent({
    subdomain: domain,
    targetTokenId,
    mintIdentity: input.mintIdentity,
  });
}

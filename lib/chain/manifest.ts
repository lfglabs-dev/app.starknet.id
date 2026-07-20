export type ManifestAbiFunction = {
  readonly type: "function";
  readonly name: string;
  readonly inputs: readonly {
    readonly name: string;
    readonly type: string;
  }[];
  readonly outputs: readonly {
    readonly type: string;
  }[];
  readonly state_mutability: "view" | "external";
};

const fn = (
  name: string,
  inputs: readonly { name: string; type: string }[],
  outputs: readonly { type: string }[],
  state_mutability: "view" | "external"
): ManifestAbiFunction => ({ type: "function", name, inputs, outputs, state_mutability });

const u128 = "core::integer::u128";
const u256 = "core::integer::u256";
const address = "core::starknet::contract_address::ContractAddress";
const felt = "core::felt252";
const span = "core::array::Span::<core::felt252>";

export const IDENTITY_ABI = [
  fn("balance_of", [{ name: "account", type: address }], [{ type: u256 }], "view"),
  fn("owner_of", [{ name: "token_id", type: u256 }], [{ type: address }], "view"),
  fn("get_main_id", [{ name: "user", type: address }], [{ type: u128 }], "view"),
  fn(
    "get_user_data",
    [
      { name: "id", type: u128 },
      { name: "field", type: felt },
      { name: "domain", type: "core::integer::u32" },
    ],
    [{ type: felt }],
    "view"
  ),
  fn("mint", [{ name: "id", type: u128 }], [], "external"),
  fn("set_main_id", [{ name: "id", type: u128 }], [], "external"),
  fn("reset_main_id", [], [], "external"),
  fn(
    "set_user_data",
    [
      { name: "id", type: u128 },
      { name: "field", type: felt },
      { name: "data", type: felt },
      { name: "domain", type: "core::integer::u32" },
    ],
    [],
    "external"
  ),
  fn(
    "transfer_from",
    [
      { name: "from", type: address },
      { name: "to", type: address },
      { name: "token_id", type: u256 },
    ],
    [],
    "external"
  ),
] as const;

export const NAMING_ABI = [
  fn("domain_to_expiry", [{ name: "domain", type: span }], [{ type: "core::integer::u64" }], "view"),
  fn("domain_to_id", [{ name: "domain", type: span }], [{ type: u128 }], "view"),
  fn(
    "address_to_domain",
    [
      { name: "address", type: address },
      { name: "hint", type: span },
    ],
    [{ type: span }],
    "view"
  ),
  fn(
    "buy",
    [
      { name: "id", type: u128 },
      { name: "domain", type: felt },
      { name: "days", type: "core::integer::u16" },
      { name: "resolver", type: address },
      { name: "sponsor", type: address },
      { name: "discount_id", type: felt },
      { name: "metadata", type: felt },
    ],
    [],
    "external"
  ),
  fn(
    "renew",
    [
      { name: "domain", type: felt },
      { name: "days", type: "core::integer::u16" },
      { name: "sponsor", type: address },
      { name: "discount_id", type: felt },
      { name: "metadata", type: felt },
    ],
    [],
    "external"
  ),
  fn(
    "transfer_domain",
    [
      { name: "domain", type: span },
      { name: "target_id", type: u128 },
    ],
    [],
    "external"
  ),
  fn("set_address_to_domain", [{ name: "domain", type: span }, { name: "hint", type: span }], [], "external"),
  fn("reset_address_to_domain", [], [], "external"),
  fn("migrate_domain", [{ name: "domain", type: span }], [], "external"),
] as const;

export const PRICING_ABI = [
  fn(
    "compute_buy_price",
    [
      { name: "domain_len", type: "core::integer::u32" },
      { name: "days", type: "core::integer::u16" },
    ],
    [{ type: `(${address}, ${u256})` }],
    "view"
  ),
  fn(
    "compute_renew_price",
    [
      { name: "domain_len", type: "core::integer::u32" },
      { name: "days", type: "core::integer::u16" },
    ],
    [{ type: `(${address}, ${u256})` }],
    "view"
  ),
] as const;

export const ERC20_ABI = [
  fn("balance_of", [{ name: "account", type: address }], [{ type: u256 }], "view"),
  fn(
    "approve",
    [
      { name: "spender", type: address },
      { name: "amount", type: u256 },
    ],
    [{ type: "core::bool" }],
    "external"
  ),
] as const;

export const SN_MAIN = {
  chain: "SN_MAIN",
  chainId: "0x534e5f4d41494e",
  rpcPath: "/api/rpc",
  contracts: {
    identity: {
      address: "0x05dbdedc203e92749e2e746e2d40a768d966bd243df04a6b712e222bc040a9af",
      abi: IDENTITY_ABI,
    },
    naming: {
      address: "0x06ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678",
      abi: NAMING_ABI,
    },
    pricing: {
      address: "0x035f2ca59fe00ef8968b98ea4b79de0e82a8dac4cbc0f48e93f3de90e65ae568",
      abi: PRICING_ABI,
    },
    eth: {
      address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      abi: ERC20_ABI,
    },
    multicall: {
      address: "0x034ffb8f4452df7a613a0210824d6414dbadcddce6c6e19bf4ddc9e22ce5f970",
      abi: [] as const,
      optional: true,
    },
  },
} as const;

export const SN_MAIN_CHAIN = {
  id: BigInt(SN_MAIN.chainId),
  name: "Starknet",
  network: "mainnet",
  nativeCurrency: {
    address: SN_MAIN.contracts.eth.address,
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [SN_MAIN.rpcPath] },
    public: { http: [SN_MAIN.rpcPath] },
  },
  paymasterRpcUrls: {
    avnu: { http: ["https://starknet.paymaster.avnu.fi/"] },
  },
  explorers: {
    starkscan: ["https://starkscan.co"],
  },
} as const;

export function validateManifest(manifest: typeof SN_MAIN = SN_MAIN): true {
  if (manifest.chain !== "SN_MAIN" || manifest.chainId !== "0x534e5f4d41494e") {
    throw new Error("The chain manifest must be fixed to Starknet mainnet");
  }

  const addresses = Object.values(manifest.contracts).map((contract) => contract.address);
  if (new Set(addresses).size !== addresses.length) {
    throw new Error("Contract addresses in SN_MAIN must be unique");
  }
  for (const contractAddress of addresses) {
    if (!/^0x[0-9a-f]{1,64}$/.test(contractAddress) || BigInt(contractAddress) === 0n) {
      throw new Error(`Invalid contract address in SN_MAIN: ${contractAddress}`);
    }
  }
  return true;
}

validateManifest();

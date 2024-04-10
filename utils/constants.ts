export const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";
export const bigAlphabet = "这来";
export const totalAlphabet = basicAlphabet + bigAlphabet;
export const UINT_128_MAX = (BigInt(1) << BigInt(128)) - BigInt(1);
export const MONTH_IN_SECONDS = 30 * 24 * 60 * 60;
export const swissVatRate = 0.077;

export const PFP_WL_CONTRACTS_TESTNET = [
  "0x041e1382e604688da7f22e7fbb6113ba3649b84a87b58f4dc1cf5bfa96dfc2cf",
  "0x0154520b48b692bb8b926434bbd24d797e806704af28b6cdcea30ea7db6a996b",
];

export const PFP_WL_CONTRACTS_MAINNET = [
  "0x03859bf9178b48a4ba330d6872ab5a6d3895b64d6631197beefde6293bc172cd",
  "0x0727a63f78ee3f1bd18f78009067411ab369c31dece1ae22e16f567906409905",
  "0x2d679a171589777bc996fb27767ff9a2e44c7e07967760dea3df31704ab398a",
  "0x012f8e318fe04a1fe8bffe005ea4bbd19cb77a656b4f42682aab8a0ed20702f0",
  "0x01435498bf393da86b4733b9264a86b58a42b31f8d8b8ba309593e5c17847672",
  "0x76503062d78f4481be03c9145022d6a4a71ec0719aa07756f79a2384dc7ef16",
];

export const NftCollections = [
  {
    imageUri:
      "https://api.briq.construction/v1/preview/starknet-mainnet/0x42f5fc1f7b1845b307807fa05672177c9c5483cd4b7cb847000000000000000.png",
    name: "Ducks everywhere",
    externalLink:
      "https://unframed.co/collection/0x04fa864a706e3403fd17ac8df307f22eafa21b778b73353abf69a622e47a2003",
  },
  {
    imageUri:
      "https://storage.nfte.ai/asset/collection/featured/c6fc5552-1051-4f68-87c9-fcd6ddc1f026.jpeg",
    name: "Blobert",
    externalLink: "https://element.market/collections/blobert",
  },
  {
    imageUri:
      "https://static.argent.net/unframed/images/0x03ab1124ef9ec3a2f2b1d9838f9066f9a894483d40b33390dda8d85c01a315a3_full.png",
    name: "Starkurabu",
    externalLink: "https://element.market/collections/starkurabu",
  },
];

export const ourNfts = [
  {
    imageUri: "/pfpCollections/starknetQuest.webp",
    name: "Starknet quest",
    infoPage:
      process.env.NEXT_PUBLIC_IS_TESTNET === "true"
        ? `https://sepolia.starknet.quest/`
        : "https://starknet.quest/",
  },
];

export enum NotificationType {
  TRANSACTION = "TRANSACTION",
}

export enum TransactionType {
  MINT_IDENTITY = "MINT_IDENTITY",
  BUY_DOMAIN = "BUY_DOMAIN",
  RENEW_DOMAIN = "RENEW_DOMAIN",
  ENABLE_AUTORENEW = "ENABLE_AUTORENEW",
  DISABLE_AUTORENEW = "DISABLE_AUTORENEW",
  CHANGE_ADDRESS = "CHANGE_ADDRESS",
  TRANSFER_IDENTITY = "TRANSFER_IDENTITY",
  VERIFIER_POP = "VERIFIER_POP",
  VERIFIER_TWITTER = "VERIFIER_TWITTER",
  VERIFIER_DISCORD = "VERIFIER_DISCORD",
  VERIFIER_GITHUB = "VERIFIER_GITHUB",
  MAIN_DOMAIN = "MAIN_DOMAIN",
  SUBDOMAIN_CREATION = "SUBDOMAIN_CREATION",
  SET_PFP = "SET_PFP",
  CLAIM_SOL = "CLAIM_SOL",
}

export const PENDING_TRANSACTION = "Transaction pending...";
export const FAILED_TRANSACTION = "Transaction failed";

export const notificationTitle: Record<TransactionType, string> = {
  [TransactionType.MINT_IDENTITY]: "Identity minted",
  [TransactionType.BUY_DOMAIN]: "Domain purchased",
  [TransactionType.RENEW_DOMAIN]: "Domain renewed",
  [TransactionType.ENABLE_AUTORENEW]: "Auto renewal enabled",
  [TransactionType.DISABLE_AUTORENEW]: "Auto renewal disabled",
  [TransactionType.CHANGE_ADDRESS]: "Address changed",
  [TransactionType.TRANSFER_IDENTITY]: "Domain transferred",
  [TransactionType.VERIFIER_POP]: "Proof of personhood verified",
  [TransactionType.VERIFIER_TWITTER]: "Twitter verified",
  [TransactionType.VERIFIER_DISCORD]: "Discord verified",
  [TransactionType.VERIFIER_GITHUB]: "Github verified",
  [TransactionType.MAIN_DOMAIN]: "Main domain set",
  [TransactionType.SUBDOMAIN_CREATION]: "Subdomain created",
  [TransactionType.SET_PFP]: "New profile picture set",
  [TransactionType.CLAIM_SOL]: "Claimed Solana subdomain on Starknet",
};

export const notificationLinkText: Record<NotificationType, string> = {
  [NotificationType.TRANSACTION]: "See transaction",
};

export enum CurrencyType {
  ETH = "ETH",
  STRK = "STRK",
  // USDC = "USDC",
  // USDT = "USDT",
}

export enum CurrenciesIcon {
  ETH = "/currencies/eth.svg",
  STRK = "/currencies/strk.svg",
  // USDC = "/currencies/usdc.svg",
  // USDT = "/currencies/usdt.svg",
}

export enum CurrenciesRange {
  ETH = "0",
  STRK = "0.3",
  // USDC = "0.1",
  // USDT = "0.1",
}

export enum ERC20Contract {
  ETH = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  STRK = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  // USDC = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
  // USDT = "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
}

export const AutoRenewalContracts = {
  ETH: process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
  STRK: process.env.NEXT_PUBLIC_RENEWAL_STRK_CONTRACT as string,
  // USDC = "0x0",
  // USDT = "0x0",
};
export type AutoRenewalContracts =
  (typeof AutoRenewalContracts)[keyof typeof AutoRenewalContracts];

export enum FormType {
  REGISTER = "Your Registration",
  RENEW = "Your Renewal",
}

export const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";
export const bigAlphabet = "这来";
export const totalAlphabet = basicAlphabet + bigAlphabet;
export const UINT_128_MAX = (BigInt(1) << BigInt(128)) - BigInt(1);
export const MONTH_IN_SECONDS = 30 * 24 * 60 * 60;

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
};

export const notificationLinkText: Record<NotificationType, string> = {
  [NotificationType.TRANSACTION]: "See transaction",
};

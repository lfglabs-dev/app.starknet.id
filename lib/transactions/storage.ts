import { normalizeAddress } from "@/lib/core/address";
import type { SubmittedTransaction, TransactionKind } from "@/lib/core/types";

const TX_PREFIX = "starknet-id:transactions:v1";
const TRANSACTION_KINDS = new Set<TransactionKind>([
  "mint",
  "register",
  "renew",
  "set-target",
  "set-main",
  "transfer",
  "subdomain",
]);

function key(account: string): string {
  return `${TX_PREFIX}:SN_MAIN:${normalizeAddress(account)}`;
}

export function loadSubmittedTransactions(
  account: string,
  storage: Storage = window.localStorage
): SubmittedTransaction[] {
  try {
    const parsed = JSON.parse(storage.getItem(key(account)) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is SubmittedTransaction =>
          item &&
          typeof item === "object" &&
          typeof item.hash === "string" &&
          /^0x[0-9a-fA-F]{1,64}$/.test(item.hash) &&
          item.account === normalizeAddress(account) &&
          ["pending", "accepted", "reverted"].includes(item.status) &&
          TRANSACTION_KINDS.has(item.kind) &&
          Number.isSafeInteger(item.submittedAt) &&
          item.submittedAt >= 0
      )
      .slice(-50);
  } catch {
    return [];
  }
}

export function saveSubmittedTransactions(
  account: string,
  transactions: SubmittedTransaction[],
  storage: Storage = window.localStorage
): void {
  storage.setItem(key(account), JSON.stringify(transactions.slice(-50)));
}

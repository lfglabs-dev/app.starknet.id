import { describe, expect, test } from "bun:test";
import { classifyReceipt } from "@/lib/transactions/receipt";
import {
  loadSubmittedTransactions,
  saveSubmittedTransactions,
} from "@/lib/transactions/storage";
import type { SubmittedTransaction } from "@/lib/core/types";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe("transaction receipt reconciliation", () => {
  test("classifies pending, accepted, rejected, and malformed receipts", () => {
    expect(classifyReceipt({ finality_status: "RECEIVED" })).toEqual({ status: "pending" });
    expect(classifyReceipt({
      execution_status: "SUCCEEDED",
      finality_status: "ACCEPTED_ON_L2",
    })).toEqual({ status: "accepted" });
    expect(classifyReceipt({
      execution_status: "REVERTED",
      finality_status: "ACCEPTED_ON_L2",
      revert_reason: "assert failed",
    })).toEqual({ status: "reverted", revertReason: "assert failed" });
    expect(classifyReceipt({ finality_status: "REJECTED" })).toEqual({
      status: "reverted",
      revertReason: "Transaction reverted",
    });
    expect(() => classifyReceipt(null)).toThrow("Malformed");
  });

  test("persists transactions per normalized account and rejects malformed rows", () => {
    const storage = new MemoryStorage();
    const transaction: SubmittedTransaction = {
      hash: "0xabc",
      account: "0x123",
      kind: "mint",
      status: "pending",
      submittedAt: 1,
    };
    saveSubmittedTransactions("0x123", [transaction], storage);
    expect(loadSubmittedTransactions("0x123", storage)).toEqual([transaction]);
    expect(loadSubmittedTransactions("0x124", storage)).toEqual([]);

    const key = storage.key(0)!;
    storage.setItem(key, JSON.stringify([{ ...transaction, kind: "legacy-subscription" }]));
    expect(loadSubmittedTransactions("0x123", storage)).toEqual([]);
  });
});

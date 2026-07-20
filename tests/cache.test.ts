import { describe, expect, test } from "bun:test";
import {
  identityCacheKey,
  loadIdentityCache,
  markIdentityDomainChecked,
  rememberIdentity,
} from "@/lib/identity/cache";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe("IdentityCacheV1", () => {
  test("isolates accounts and remembers imported domains", () => {
    const storage = new MemoryStorage();
    rememberIdentity("0x123", "42", ["alice.stark"], "manual", storage);
    expect(loadIdentityCache("0x123", storage).entries["42"].domains).toEqual(["alice.stark"]);
    expect(loadIdentityCache("0x124", storage).entries).toEqual({});
  });

  test("rejects a tampered cache envelope", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      identityCacheKey("0x123"),
      JSON.stringify({
        version: 1,
        chainId: "SN_MAIN",
        account: "0x999",
        entries: { "42": { tokenId: "42", domains: [], sources: ["manual"], updatedAt: 1 } },
      })
    );
    expect(loadIdentityCache("0x123", storage).entries).toEqual({});
    expect(storage.getItem(identityCacheKey("0x123"))).toBeNull();
  });

  test("records successful empty and populated domain lookups", () => {
    const storage = new MemoryStorage();
    markIdentityDomainChecked("0x123", "42", [], storage);
    const empty = loadIdentityCache("0x123", storage).entries["42"];
    expect(empty.domains).toEqual([]);
    expect(empty.domainCheckedAt).toBeNumber();

    markIdentityDomainChecked("0x123", "42", ["alice.stark"], storage);
    expect(loadIdentityCache("0x123", storage).entries["42"].domains).toEqual([
      "alice.stark",
    ]);
  });
});

import { describe, expect, test } from "bun:test";
import { emptyIdentityCache, loadIdentityCache, rememberIdentity } from "@/lib/identity/cache";
import {
  addCandidate,
  fetchAllIdentityCandidates,
  importOwnedIdentity,
  missingIdentityCount,
  validateIdentityCandidates,
  type CandidateSources,
} from "@/lib/identity/discovery";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe("authoritative identity discovery", () => {
  test("keeps only RPC-validated ownership and deduplicates sources", async () => {
    const candidates: CandidateSources = new Map();
    addCandidate(candidates, "42", "starkscan");
    addCandidate(candidates, "0x2a", "cache");
    addCandidate(candidates, "43", "starkscan");

    const owned = await validateIdentityCandidates(
      "0x123",
      candidates,
      emptyIdentityCache("0x123"),
      "alice.stark",
      "42",
      {
        readDomainId: async () => "42",
        readMainId: async () => "42",
        readOwnerOf: async (tokenId) => tokenId === "42" ? "0x123" : "0x999",
        readUserData: async () => "0x123",
      }
    );

    expect(owned).toHaveLength(1);
    expect(owned[0]).toMatchObject({
      tokenId: "42",
      isMain: true,
      importedDomains: ["alice.stark"],
      sources: ["starkscan", "cache"],
    });
  });

  test("imports hexadecimal IDs and domains only after ownership validation", async () => {
    const storage = new MemoryStorage();
    const dependencies = {
      readDomainId: async (domain: string) => domain === "alice.stark" ? "43" : "0",
      readOwnerOf: async (tokenId: string) => ["42", "43"].includes(tokenId) ? "0x123" : null,
      rememberIdentity,
    };

    await expect(
      importOwnedIdentity("0x123", "0x2a", storage, dependencies)
    ).resolves.toEqual({ tokenId: "42", domain: undefined });
    await expect(
      importOwnedIdentity("0x123", "alice.stark", storage, dependencies)
    ).resolves.toEqual({ tokenId: "43", domain: "alice.stark" });
    expect(loadIdentityCache("0x123", storage).entries).toMatchObject({
      "42": { tokenId: "42", domains: [] },
      "43": { tokenId: "43", domains: ["alice.stark"] },
    });
    await expect(
      importOwnedIdentity("0x123", "44", storage, dependencies)
    ).rejects.toThrow("does not own");
  });

  test("reports the missing identity count without underflow", () => {
    expect(missingIdentityCount(4, 7n)).toBe(3n);
    expect(missingIdentityCount(8, 7n)).toBe(0n);
    expect(() => missingIdentityCount(-1, 7n)).toThrow("invalid");
  });

  test("automatically exhausts Starkscan cursor pages and deduplicates candidates", async () => {
    const cursors: Array<string | null | undefined> = [];
    const result = await fetchAllIdentityCandidates(
      "0x123",
      null,
      10,
      async (_owner, cursor) => {
        cursors.push(cursor);
        if (!cursor) {
          return {
            candidateTokenIds: ["42", "43"],
            nextCursor: "10:2:3:4",
            source: "starkscan" as const,
          };
        }
        return {
          candidateTokenIds: ["0x2b", "44"],
          nextCursor: null,
          source: "starkscan" as const,
        };
      }
    );

    expect(cursors).toEqual([null, "10:2:3:4"]);
    expect(result).toEqual({
      candidateTokenIds: ["42", "43", "44"],
      nextCursor: null,
      source: "starkscan",
    });
  });

  test("rejects repeated Starkscan cursors", async () => {
    await expect(
      fetchAllIdentityCandidates("0x123", null, 10, async () => ({
        candidateTokenIds: [],
        nextCursor: "10:2:3:4",
        source: "starkscan" as const,
      }))
    ).rejects.toThrow("repeated cursor");
  });
});

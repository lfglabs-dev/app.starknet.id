import { describe, expect, test } from "bun:test";
import {
  assertDurationDays,
  decodeDomain,
  domainLength,
  encodeDomain,
  isDomainAvailable,
  isRootDomain,
  normalizeDomain,
  renewableDomains,
  spanCalldata,
} from "@/lib/chain/domain";

describe("domain encoding and rules", () => {
  test("matches deployed Starknet ID encoding", () => {
    expect(encodeDomain("alice.stark").map(String)).toEqual(["8462258"]);
    expect(encodeDomain("sub.alice.stark").map(String)).toEqual(["2222", "8462258"]);
    expect(decodeDomain([2222n, 8462258n])).toBe("sub.alice.stark");
  });

  test("normalizes and classifies root domains", () => {
    expect(normalizeDomain(" Alice ")).toBe("alice.stark");
    expect(isRootDomain("alice.stark")).toBe(true);
    expect(isRootDomain("sub.alice.stark")).toBe(false);
    expect(domainLength("alice.stark")).toBe(5);
  });

  test("only exposes root domains for renewal", () => {
    expect(
      renewableDomains([
        "alice.stark",
        "sub.alice.stark",
        "alice.stark",
        "bob.stark",
      ])
    ).toEqual(["alice.stark", "bob.stark"]);
  });

  test("applies expiry and duration boundaries", () => {
    expect(isDomainAvailable(100, 100)).toBe(true);
    expect(isDomainAvailable(101, 100)).toBe(false);
    expect(assertDurationDays(1)).toBe(1);
    expect(assertDurationDays(65_535)).toBe(65_535);
    expect(() => assertDurationDays(65_536)).toThrow();
  });

  test("encodes Cairo spans", () => {
    expect(spanCalldata([1n, 2n])).toEqual(["2", "1", "2"]);
  });
});

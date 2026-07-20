import { describe, expect, test } from "bun:test";
import { SN_MAIN, validateManifest } from "@/lib/chain/manifest";

describe("SN_MAIN manifest", () => {
  test("is fixed to mainnet and validates", () => {
    expect(validateManifest()).toBe(true);
    expect(SN_MAIN.chainId).toBe("0x534e5f4d41494e");
    expect(SN_MAIN.rpcPath).toBe("/api/rpc");
  });

  test("contains only unique nonzero production addresses", () => {
    const addresses = Object.values(SN_MAIN.contracts).map((item) => item.address);
    expect(new Set(addresses).size).toBe(addresses.length);
    expect(addresses.every((address) => BigInt(address) > 0n)).toBe(true);
  });

  test("ships the required live selectors", () => {
    expect(SN_MAIN.contracts.identity.abi.map((item) => item.name)).toContain("owner_of");
    expect(SN_MAIN.contracts.naming.abi.map((item) => item.name)).toContain("address_to_domain");
    expect(SN_MAIN.contracts.pricing.abi.map((item) => item.name)).toEqual([
      "compute_buy_price",
      "compute_renew_price",
    ]);
  });
});

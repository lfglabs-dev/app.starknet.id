import { describe, expect, test } from "bun:test";
import {
  fromUint256,
  normalizeAddress,
  toUint256,
  UINT128_MAX,
} from "@/lib/core/address";
import {
  findAvailableIdentityId,
  generateIdentityId,
} from "@/lib/identity/random";

describe("integer and random identity handling", () => {
  test("round trips uint256 values", () => {
    const value = (1n << 240n) + 12345n;
    const [low, high] = toUint256(value);
    expect(fromUint256(low, high)).toBe(value);
  });

  test("normalizes Starknet address formats", () => {
    expect(normalizeAddress("0x000abc")).toBe("0xabc");
  });

  test("generates a full nonzero u128", () => {
    const id = generateIdentityId((bytes) => {
      bytes.fill(0xff);
      return bytes;
    });
    expect(BigInt(id)).toBe(UINT128_MAX);
  });

  test("retries zero and collisions", async () => {
    const values = ["0", "42", "43"];
    const checked: string[] = [];
    const id = await findAvailableIdentityId(
      async (candidate) => {
        checked.push(candidate);
        return candidate === "42" ? "0x123" : null;
      },
      () => values.shift() ?? "43"
    );
    expect(id).toBe("43");
    expect(checked).toEqual(["42", "43"]);
  });
});

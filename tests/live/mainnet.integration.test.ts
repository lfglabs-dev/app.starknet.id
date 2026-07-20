import { describe, expect, test } from "bun:test";
import { hash } from "starknet";
import { SN_MAIN } from "@/lib/chain/manifest";

const enabled =
  process.env.RUN_LIVE_MAINNET_TESTS === "true" &&
  Boolean(process.env.STARKSCAN_API_KEY);
const endpoint = "https://api.starkscan.co/v1/SN_MAIN/rpc";

async function liveRpc(method: string, params: unknown[] = []): Promise<any> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Starkscan-Api-Key": process.env.STARKSCAN_API_KEY!,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  expect(response.ok).toBe(true);
  const body = await response.json();
  if (body.error) throw new Error(body.error.message);
  return body.result;
}

describe.skipIf(!enabled)("live Starkscan mainnet", () => {
  test("reports mainnet and a current block", async () => {
    expect(await liveRpc("starknet_chainId")).toBe(SN_MAIN.chainId);
    expect(BigInt(await liveRpc("starknet_blockNumber"))).toBeGreaterThan(0n);
  });

  test("serves configured contract classes and a known call", async () => {
    for (const contract of Object.values(SN_MAIN.contracts)) {
      expect(
        await liveRpc("starknet_getClassHashAt", ["latest", contract.address])
      ).toMatch(/^0x[0-9a-f]+$/);
    }
    const result = await liveRpc("starknet_call", [
      {
        contract_address: SN_MAIN.contracts.identity.address,
        entry_point_selector: hash.getSelectorFromName("balance_of"),
        calldata: ["0x1"],
      },
      "latest",
    ]);
    expect(result).toHaveLength(2);
  });

  test("supports bounded batch reads", async () => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Starkscan-Api-Key": process.env.STARKSCAN_API_KEY!,
      },
      body: JSON.stringify([
        { jsonrpc: "2.0", id: 1, method: "starknet_chainId", params: [] },
        { jsonrpc: "2.0", id: 2, method: "starknet_blockNumber", params: [] },
      ]),
    });
    expect(response.ok).toBe(true);
    expect((await response.json()).length).toBe(2);
  });
});

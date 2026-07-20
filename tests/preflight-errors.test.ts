import { describe, expect, test } from "bun:test";
import type { AccountInterface } from "starknet";
import { rpcRequest, RpcClientError } from "@/lib/chain/rpc";
import { decodeError } from "@/lib/chain/errors";
import { buildMintIntent } from "@/lib/transactions/intents";
import { preflightIntent } from "@/lib/transactions/preflight";

describe("simulation and error mapping", () => {
  test("runs fee estimation and simulation without validation", async () => {
    const calls: unknown[] = [];
    const account = {
      estimateInvokeFee: async (_intent: unknown, options: unknown) => {
        calls.push(["estimate", options]);
        return { overall_fee: 123n };
      },
      simulateTransaction: async (_intent: unknown, options: unknown) => {
        calls.push(["simulate", options]);
        return [{ transaction_trace: { execute_invocation: {} } }];
      },
    } as unknown as AccountInterface;
    const report = await preflightIntent(account, buildMintIntent("42"));
    expect(report).toEqual({
      ok: true,
      estimatedFee: "123",
      traceSummary: "Invoke simulation succeeded for 1 call",
      revertReason: null,
    });
    expect(calls).toEqual([
      ["estimate", { skipValidate: true, tip: 0 }],
      ["simulate", { skipValidate: true, tip: 0 }],
    ]);
  });

  test("decodes nested Cairo revert data", () => {
    const error = new RpcClientError("Contract error", 200, 40, {
      revert_error: {
        error:
          "0x4552433732313a20696e76616c696420746f6b656e204944",
      },
    });
    expect(decodeError(error)).toContain("ERC721: invalid token ID");
  });

  test("maps timeout, authentication, rate limit, service, wallet, and revert errors", () => {
    for (const [status, text] of [
      [401, "authentication rejected"],
      [429, "rate limit exceeded"],
      [503, "service unavailable"],
      [504, "RPC timeout"],
    ] as const) {
      expect(decodeError(new RpcClientError(text, status))).toContain(text);
    }
    expect(decodeError(new Error("User rejected wallet request"))).toContain("rejected");
    expect(decodeError(new Error("Transaction reverted"))).toContain("reverted");
  });

  test("unwraps concise provider errors from SDK RPC wrappers", () => {
    const wrapped = Object.assign(new Error("verbose SDK wrapper"), {
      baseError: { code: 61, message: "Unsupported transaction version" },
    });
    expect(decodeError(wrapped)).toBe("Unsupported transaction version");
  });

  test("returns failed simulation reports", async () => {
    const account = {
      estimateInvokeFee: async () => {
        throw new RpcClientError("RPC timeout", 504);
      },
    } as unknown as AccountInterface;
    expect(await preflightIntent(account, buildMintIntent("42"))).toEqual({
      ok: false,
      estimatedFee: null,
      traceSummary: null,
      revertReason: "RPC timeout",
    });
  });

  test("rejects malformed RPC responses", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response("not-json", { status: 502 })) as typeof fetch;
    try {
      await expect(rpcRequest("starknet_blockNumber")).rejects.toThrow("malformed JSON");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

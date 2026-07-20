import { describe, expect, test } from "bun:test";
import {
  canUseReadFallback,
  canUseNoSubmitFallback,
  isRetryableReadFailure,
  MAX_RPC_BATCH,
  redactSecret,
  validateRpcPayload,
} from "@/lib/server/rpc-policy";
import {
  parseIdentityAcquisitions,
  parseIdentityDomainsFromTransaction,
  parseIdentityTransferPage,
} from "@/lib/server/identity-indexer";
import { SN_MAIN } from "@/lib/chain/manifest";
import { toRpcFelt } from "@/lib/chain/rpc";
import { applySameOriginCors, fetchWithTimeout } from "@/lib/server/http";
import type { NextApiRequest, NextApiResponse } from "next";

const request = (method: string, params: unknown[] = []) => ({
  jsonrpc: "2.0" as const,
  id: 1,
  method,
  params,
});

describe("RPC API defenses", () => {
  test("serializes decimal calldata as canonical hexadecimal felts", () => {
    expect(toRpcFelt("209603940093")).toBe("0x30cd5e4efd");
    expect(toRpcFelt("0x2a")).toBe("0x2a");
    expect(() => toRpcFelt(-1)).toThrow("negative");
  });

  test("accepts bounded reads and simulations", () => {
    expect(validateRpcPayload(request("starknet_call")).length).toBe(1);
    expect(validateRpcPayload(request("starknet_simulateTransactions")).length).toBe(1);
  });

  test("rejects writes, traces, websockets, unknown methods, and chains", () => {
    for (const method of [
      "starknet_addInvokeTransaction",
      "starknet_traceTransaction",
      "starknet_subscribeNewHeads",
      "pathfinder_getProof",
    ]) {
      expect(() => validateRpcPayload(request(method))).toThrow("Unsupported");
    }
    expect(() =>
      validateRpcPayload(request("starknet_call", [{ chainId: "SN_SEPOLIA" }]))
    ).toThrow("SN_MAIN");
  });

  test("enforces batch and body bounds", () => {
    expect(() =>
      validateRpcPayload(
        Array.from({ length: MAX_RPC_BATCH + 1 }, () => request("starknet_blockNumber"))
      )
    ).toThrow("25");
    expect(() =>
      validateRpcPayload(request("starknet_call", ["x".repeat(257 * 1024)]))
    ).toThrow("256 KiB");
  });

  test("uses fallback only for idempotent reads", () => {
    expect(canUseReadFallback(validateRpcPayload(request("starknet_getEvents")))).toBe(true);
    expect(
      canUseReadFallback(validateRpcPayload(request("starknet_estimateFee")))
    ).toBe(false);
  });

  test("allows operational fallback for no-submit preflight calls", () => {
    expect(
      canUseNoSubmitFallback(validateRpcPayload(request("starknet_estimateFee")))
    ).toBe(true);
    expect(
      canUseNoSubmitFallback(validateRpcPayload(request("starknet_simulateTransactions")))
    ).toBe(true);
  });

  test("recognizes Starkscan's HTTP-200 upstream availability error", () => {
    expect(
      isRetryableReadFailure({
        error: {
          code: -32005,
          message: "Upstream Starknet RPC temporarily unavailable",
          data: { code: "upstream_unavailable" },
        },
      })
    ).toBe(true);
    expect(
      isRetryableReadFailure({
        error: { code: 40, message: "Contract error" },
      })
    ).toBe(false);
  });

  test("redacts secrets from upstream text", () => {
    expect(redactSecret("failure for private-key", "private-key")).toBe(
      "failure for [redacted]"
    );
  });
});

describe("same-origin and timeout defenses", () => {
  function cors(origin: string, host = "app.starknet.id", protocol = "https") {
    const headers = new Map<string, string>();
    const request = {
      headers: { origin, host, "x-forwarded-proto": protocol },
    } as unknown as NextApiRequest;
    const response = {
      setHeader(name: string, value: string) { headers.set(name, value); },
    } as unknown as NextApiResponse;
    return { allowed: applySameOriginCors(request, response), headers };
  }

  test("allows only matching host and scheme", () => {
    const matching = cors("https://app.starknet.id");
    expect(matching.allowed).toBe(true);
    expect(matching.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://app.starknet.id"
    );
    expect(cors("https://evil.example").allowed).toBe(false);
    expect(cors("http://app.starknet.id").allowed).toBe(false);
  });

  test("aborts a stalled upstream", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = ((_input: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        });
      })) as typeof fetch;
    try {
      await expect(fetchWithTimeout("https://upstream.invalid", {}, 1)).rejects.toMatchObject({
        name: "AbortError",
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe("identity discovery response", () => {
  test("deduplicates incoming and outgoing candidates and skips malformed rows", () => {
    expect(
      parseIdentityTransferPage({
        items: [
          { tokenId: "42", fromAddress: "0x1", toAddress: "0x2" },
          { tokenId: "0x2a", fromAddress: "0x2", toAddress: "0x1" },
          { tokenId: null, rawValue: "43", standard: "erc20" },
          { tokenId: null, amount: "0x2c", standard: "erc20" },
          { tokenId: null },
          { tokenId: "-1" },
        ],
        nextCursor: "10:2:3:4",
      })
    ).toEqual({
      candidateTokenIds: ["42", "43", "44"],
      nextCursor: "10:2:3:4",
      source: "starkscan",
    });
  });

  test("rejects cursor injection and malformed item envelopes", () => {
    expect(() =>
      parseIdentityTransferPage({ items: [], nextCursor: "1:2:3:4&owner=evil" })
    ).toThrow("cursor");
    expect(() => parseIdentityTransferPage({ items: {}, nextCursor: null })).toThrow("items");
  });

  test("extracts bounded inbound acquisition transactions", () => {
    expect(
      Array.from(
        parseIdentityAcquisitions(
          {
            items: [
              { tokenId: "0x2a", toAddress: "0x123", txHash: "0xabc" },
              { tokenId: "43", toAddress: "0x999", txHash: "0xdef" },
              { tokenId: "44", toAddress: "0x123", txHash: "bad" },
            ],
          },
          "0x123",
          new Set(["42", "43", "44"])
        )
      )
    ).toEqual([["42", "0xabc"]]);
  });

  test("decodes naming domain transfers from transaction logs", () => {
    expect(
      parseIdentityDomainsFromTransaction(
        {
          logs: [
            {
              address: SN_MAIN.contracts.naming.address,
              keys: [
                "0x27187f330d709a3c2287ffa09c18814fc5ed2b5a8066e713273eca273cc5c02",
                "0x2",
                "0x1ce",
                "0x15d246f6c1b",
              ],
              data: ["0x0", "0x263df52e5c"],
            },
          ],
        },
        new Set(["164248235612"])
      )
    ).toEqual({ "164248235612": ["gm.fricoben.stark"] });
  });
});

import { hash } from "starknet";
import { SN_MAIN } from "@/lib/chain/manifest";

export class RpcClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: number,
    readonly data?: unknown
  ) {
    super(message);
    this.name = "RpcClientError";
  }
}

let requestId = 0;

export async function rpcRequest<T>(
  method: string,
  params: unknown = [],
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(SN_MAIN.rpcPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: ++requestId,
      method,
      params,
    }),
    signal,
  });
  let payload: any;
  try {
    payload = await response.json();
  } catch {
    throw new RpcClientError("RPC returned malformed JSON", response.status);
  }
  if (!response.ok) {
    throw new RpcClientError(
      typeof payload?.error === "string"
        ? payload.error
        : payload?.error?.message ?? `RPC request failed with HTTP ${response.status}`,
      response.status,
      payload?.error?.code,
      payload?.error?.data
    );
  }
  if (payload?.error) {
    throw new RpcClientError(
      payload.error.message ?? "RPC request failed",
      response.status,
      payload.error.code,
      payload.error.data
    );
  }
  if (!payload || !("result" in payload)) {
    throw new RpcClientError("RPC response did not include a result", response.status);
  }
  return payload.result as T;
}

export function selector(name: string): string {
  return hash.getSelectorFromName(name);
}

export function toRpcFelt(value: string | number | bigint): string {
  const parsed = BigInt(value);
  if (parsed < 0n) throw new Error("RPC calldata felts cannot be negative");
  return `0x${parsed.toString(16)}`;
}

export function callContract(
  contractAddress: string,
  entrypoint: string,
  calldata: readonly (string | number | bigint)[] = [],
  blockId: string | { block_number: number } | { block_hash: string } = "latest"
): Promise<string[]> {
  return rpcRequest<string[]>("starknet_call", [
    {
      contract_address: contractAddress,
      entry_point_selector: selector(entrypoint),
      // JSON-RPC FELTs are 0x-prefixed hex strings. Bare decimal text is
      // interpreted as hexadecimal by Starknet nodes (for example, "42"
      // means 0x42), which silently queried the wrong identity IDs.
      calldata: calldata.map(toRpcFelt),
    },
    blockId,
  ]);
}

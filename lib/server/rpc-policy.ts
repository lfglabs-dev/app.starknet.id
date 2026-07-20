import { SN_MAIN } from "@/lib/chain/manifest";

export const MAX_RPC_BYTES = 256 * 1024;
export const MAX_RPC_BATCH = 25;

export const ALLOWED_RPC_METHODS = new Set([
  "starknet_chainId",
  "starknet_specVersion",
  "starknet_blockNumber",
  "starknet_blockHashAndNumber",
  "starknet_syncing",
  "starknet_call",
  "starknet_getStorageAt",
  "starknet_getStorageProof",
  "starknet_getClass",
  "starknet_getClassHashAt",
  "starknet_getClassAt",
  "starknet_getCompiledCasm",
  "starknet_getNonce",
  "starknet_getBlockWithTxHashes",
  "starknet_getBlockWithTxs",
  "starknet_getBlockWithReceipts",
  "starknet_getTransactionByHash",
  "starknet_getTransactionByBlockIdAndIndex",
  "starknet_getBlockTransactionCount",
  "starknet_getTransactionReceipt",
  "starknet_getTransactionStatus",
  "starknet_getEvents",
  "starknet_getStateUpdate",
  "starknet_getMessagesStatus",
  "starknet_estimateFee",
  "starknet_estimateMessageFee",
  "starknet_simulateTransactions",
]);

export const READ_FALLBACK_METHODS = new Set([
  "starknet_chainId",
  "starknet_specVersion",
  "starknet_blockNumber",
  "starknet_blockHashAndNumber",
  "starknet_syncing",
  "starknet_call",
  "starknet_getStorageAt",
  "starknet_getStorageProof",
  "starknet_getClass",
  "starknet_getClassHashAt",
  "starknet_getClassAt",
  "starknet_getCompiledCasm",
  "starknet_getNonce",
  "starknet_getBlockWithTxHashes",
  "starknet_getBlockWithTxs",
  "starknet_getBlockWithReceipts",
  "starknet_getTransactionByHash",
  "starknet_getTransactionByBlockIdAndIndex",
  "starknet_getBlockTransactionCount",
  "starknet_getTransactionReceipt",
  "starknet_getTransactionStatus",
  "starknet_getEvents",
  "starknet_getStateUpdate",
  "starknet_getMessagesStatus",
]);

const NO_SUBMIT_FALLBACK_METHODS = new Set([
  ...READ_FALLBACK_METHODS,
  "starknet_estimateFee",
  "starknet_estimateMessageFee",
  "starknet_simulateTransactions",
]);

export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
};

function containsUnknownChain(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsUnknownChain);
  if (!value || typeof value !== "object") return false;
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (
      (key === "chainId" || key === "chain_id") &&
      nested !== SN_MAIN.chain &&
      nested !== SN_MAIN.chainId
    ) {
      return true;
    }
    if (containsUnknownChain(nested)) return true;
  }
  return false;
}

export function validateRpcPayload(body: unknown): JsonRpcRequest[] {
  let serialized: string;
  try {
    serialized = JSON.stringify(body);
  } catch {
    throw new Error("JSON-RPC body must be serializable");
  }
  if (new TextEncoder().encode(serialized).byteLength > MAX_RPC_BYTES) {
    throw new Error("JSON-RPC payload exceeds 256 KiB");
  }

  const batch = Array.isArray(body) ? body : [body];
  if (batch.length === 0) throw new Error("JSON-RPC batch cannot be empty");
  if (batch.length > MAX_RPC_BATCH) {
    throw new Error("JSON-RPC batch cannot exceed 25 requests");
  }

  for (const item of batch) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("Each JSON-RPC request must be an object");
    }
    const request = item as Partial<JsonRpcRequest>;
    if (request.jsonrpc !== "2.0" || typeof request.method !== "string") {
      throw new Error("Malformed JSON-RPC request");
    }
    if (!ALLOWED_RPC_METHODS.has(request.method)) {
      throw new Error(`Unsupported JSON-RPC method: ${request.method}`);
    }
    if (containsUnknownChain(request.params)) {
      throw new Error("Only SN_MAIN requests are allowed");
    }
  }
  return batch as JsonRpcRequest[];
}

export function canUseReadFallback(requests: readonly JsonRpcRequest[]): boolean {
  return requests.every((request) => READ_FALLBACK_METHODS.has(request.method));
}

/**
 * These methods cannot submit or broadcast a transaction. They may safely
 * use the secondary RPC only after the authenticated primary is configured
 * but temporarily unavailable.
 */
export function canUseNoSubmitFallback(
  requests: readonly JsonRpcRequest[]
): boolean {
  return requests.every((request) => NO_SUBMIT_FALLBACK_METHODS.has(request.method));
}

/**
 * Starkscan can report an unavailable upstream as a JSON-RPC error while
 * keeping the HTTP response successful. Treat only that operational failure
 * as retryable; contract reverts and other JSON-RPC failures must be returned
 * to the caller unchanged.
 */
export function isRetryableReadFailure(payload: unknown): boolean {
  const responses = Array.isArray(payload) ? payload : [payload];
  return responses.some((response) => {
    if (!response || typeof response !== "object") return false;
    const error = (response as { error?: unknown }).error;
    if (!error || typeof error !== "object") return false;
    const details = error as {
      code?: unknown;
      message?: unknown;
      data?: { code?: unknown };
    };
    const message = typeof details.message === "string" ? details.message.toLowerCase() : "";
    return (
      details.data?.code === "upstream_unavailable" ||
      (details.code === -32005 && /upstream.*unavailable|temporarily unavailable/.test(message))
    );
  });
}

export function redactSecret(value: string, secret: string | undefined): string {
  return secret ? value.split(secret).join("[redacted]") : value;
}

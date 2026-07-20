import { RpcClientError } from "@/lib/chain/rpc";

function decodeHexText(value: string): string | null {
  if (!/^0x[0-9a-fA-F]+$/.test(value) || value.length % 2 !== 0) return null;
  try {
    const bytes = value
      .slice(2)
      .match(/.{2}/g)
      ?.map((pair) => Number.parseInt(pair, 16));
    if (!bytes?.length) return null;
    const text = new TextDecoder().decode(new Uint8Array(bytes));
    return /^[\x20-\x7e\n\r\t]+$/.test(text) ? text : null;
  } catch {
    return null;
  }
}

function collectMessages(value: unknown, output: string[]): void {
  if (typeof value === "string") {
    const decoded = decodeHexText(value);
    output.push(decoded ?? value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectMessages(item, output));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (["error", "message", "revert_error", "revert_reason"].includes(key)) {
        collectMessages(nested, output);
      } else if (typeof nested === "object") {
        collectMessages(nested, output);
      }
    }
  }
}

export function decodeError(error: unknown): string {
  const messages: string[] = [];
  if (error instanceof RpcClientError) {
    messages.push(error.message);
    collectMessages(error.data, messages);
  } else if (error instanceof Error) {
    const baseError = (error as Error & { baseError?: unknown }).baseError;
    if (baseError) {
      collectMessages(baseError, messages);
    } else {
      messages.push(error.message);
    }
  } else if (typeof error === "string") {
    messages.push(error);
  }

  const unique = Array.from(new Set(messages.map((item) => item.trim()).filter(Boolean)));
  const useful = unique.find((item) => /revert|invalid|owner|balance|fee|reject|timeout/i.test(item));
  return (useful ?? unique[unique.length - 1] ?? "Unknown transaction error").slice(0, 500);
}

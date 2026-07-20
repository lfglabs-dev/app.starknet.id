export type ReceiptState =
  | { status: "pending" }
  | { status: "accepted" }
  | { status: "reverted"; revertReason: string };

type ReceiptLike = {
  execution_status?: unknown;
  finality_status?: unknown;
  revert_reason?: unknown;
};

export function classifyReceipt(value: unknown): ReceiptState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Malformed transaction receipt");
  }
  const receipt = value as ReceiptLike;
  const execution = receipt.execution_status;
  const finality = receipt.finality_status;
  if (execution !== undefined && typeof execution !== "string") {
    throw new Error("Malformed transaction receipt execution status");
  }
  if (finality !== undefined && typeof finality !== "string") {
    throw new Error("Malformed transaction receipt finality status");
  }

  if (execution === "REVERTED" || finality === "REJECTED") {
    return {
      status: "reverted",
      revertReason:
        typeof receipt.revert_reason === "string" && receipt.revert_reason.trim()
          ? receipt.revert_reason.slice(0, 500)
          : "Transaction reverted",
    };
  }
  if (
    execution === "SUCCEEDED" &&
    (finality === "ACCEPTED_ON_L2" || finality === "ACCEPTED_ON_L1")
  ) {
    return { status: "accepted" };
  }
  return { status: "pending" };
}

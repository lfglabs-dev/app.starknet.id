import {
  TransactionType as StarknetTransactionType,
  type AccountInterface,
} from "starknet";
import type {
  SimulationReport,
  TransactionIntent,
} from "@/lib/core/types";
import { decodeError } from "@/lib/chain/errors";

function feeFrom(value: any): string | null {
  const fee =
    value?.overall_fee ??
    value?.overallFee ??
    value?.fee_estimation?.overall_fee ??
    value?.fee_estimation?.overallFee;
  return fee === undefined || fee === null ? null : BigInt(fee).toString(10);
}

type SimulationCapableAccount = AccountInterface & {
  simulateTransaction: (
    invocations: unknown[],
    options: { skipValidate: boolean; tip: number }
  ) => Promise<unknown>;
};

export async function preflightIntent(
  account: AccountInterface,
  intent: TransactionIntent
): Promise<SimulationReport> {
  try {
    const estimate = await account.estimateInvokeFee(intent.calls, {
      skipValidate: true,
      tip: 0,
    });
    const simulationAccount = account as SimulationCapableAccount;
    if (typeof simulationAccount.simulateTransaction !== "function") {
      throw new Error("The connected wallet does not support transaction simulation");
    }
    const simulation = await simulationAccount.simulateTransaction(
      [
        {
          type: StarknetTransactionType.INVOKE,
          payload: intent.calls,
        },
      ],
      { skipValidate: true, tip: 0 }
    );
    const firstSimulation = Array.isArray(simulation) ? simulation[0] : simulation;
    const estimatedFee = feeFrom(estimate) ?? feeFrom(firstSimulation);
    if (!estimatedFee) throw new Error("Simulation did not return a fee estimate");
    const trace = (firstSimulation as any)?.transaction_trace ?? (firstSimulation as any)?.trace;
    return {
      ok: true,
      estimatedFee,
      traceSummary: trace
        ? `Invoke simulation succeeded for ${intent.calls.length} call${intent.calls.length === 1 ? "" : "s"}`
        : `Simulation succeeded for ${intent.calls.length} call${intent.calls.length === 1 ? "" : "s"}`,
      revertReason: null,
    };
  } catch (error) {
    return {
      ok: false,
      estimatedFee: null,
      traceSummary: null,
      revertReason: decodeError(error),
    };
  }
}

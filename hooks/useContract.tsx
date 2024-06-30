import { useAccount } from "@starknet-react/core";
import { useState } from "react";
import { Call, InvokeFunctionResponse } from "starknet";

export const useContractWrite = ({ calls }: { calls: Call[] }) => {
  const { account } = useAccount();
  const [txData, setTxData] = useState<InvokeFunctionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  return {
    data: txData,
    writeAsync: async () =>
      account
        ? account
            .execute(calls)
            .then((tx) => setTxData(tx))
            .catch((e) => setError(e))
        : null,
    error,
  };
};

import { useCallback, useEffect, useState } from "react";
import {
  fetchAccountCompatibility,
  fetchAccountsRewards,
  GaslessCompatibility,
  PaymasterReward,
  getGasFeesInGasToken,
  GasTokenPrice,
  fetchGasTokenPrices,
  fetchGaslessStatus,
  executeCalls,
} from "@avnu/gasless-sdk";
import { useContractWrite, useProvider } from "@starknet-react/core";
import {
  AccountInterface,
  Call,
  EstimateFeeResponse,
  stark,
  transaction,
} from "starknet";
import { GaslessOptions, SEPOLIA_BASE_URL, BASE_URL } from "@avnu/gasless-sdk";
import { useAccount } from "@starknet-react/core";

export type GasMethod = "traditional" | "paymaster";

const options: GaslessOptions = {
  baseUrl:
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? SEPOLIA_BASE_URL : BASE_URL,
};

const usePaymaster = (callData: Call[], then: () => void) => {
  const { account } = useAccount();
  const [gaslessAPIAvailable, setGaslessAPIAvailable] = useState<boolean>(true);
  const [gaslessCompatibility, setGaslessCompatibility] =
    useState<GaslessCompatibility>();
  const [gasTokenPrices, setGasTokenPrices] = useState<GasTokenPrice[]>([]);
  const [maxGasTokenAmount, setMaxGasTokenAmount] = useState<bigint>();
  const [gasMethod, setGasMethod] = useState<GasMethod>("traditional");
  const { provider } = useProvider();
  const [paymasterRewards, setPaymasterRewards] = useState<PaymasterReward[]>(
    []
  );
  const [gasTokenPrice, setGasTokenPrice] = useState<GasTokenPrice>();
  const [loadingGas, setLoadingGas] = useState<boolean>(false);
  const { writeAsync: execute, data } = useContractWrite({
    calls: callData,
  });

  useEffect(() => {
    setGasTokenPrice(gasTokenPrices[0]);
  }, [gasTokenPrices]);

  useEffect(() => {
    if (gaslessCompatibility?.isCompatible && paymasterRewards.length > 0)
      setGasMethod("paymaster");
  }, [gaslessCompatibility, paymasterRewards]);

  useEffect(() => {
    if (!gaslessCompatibility?.isCompatible) setGasMethod("traditional");
  }, [gaslessCompatibility]);

  useEffect(() => {
    fetchGaslessStatus(options).then((res) => {
      setGaslessAPIAvailable(res.status);
    });
  }, []);

  useEffect(() => {
    if (gasMethod === "traditional" && loadingGas) setLoadingGas(false);
  }, [gasMethod, loadingGas]);

  useEffect(() => {
    if (!account || !gaslessAPIAvailable) return;
    fetchAccountCompatibility(account.address, options).then(
      setGaslessCompatibility
    );
    fetchAccountsRewards(account.address, {
      ...options,
      protocol: "gasless-sdk",
    }).then(setPaymasterRewards);
  }, [account, gaslessAPIAvailable]);

  const estimateCalls = useCallback(
    async (
      account: AccountInterface,
      calls: Call[]
    ): Promise<EstimateFeeResponse> => {
      const contractVersion = await provider.getContractVersion(
        account.address
      );
      const nonce = await provider.getNonceForAddress(account.address);
      const details = stark.v3Details({ skipValidate: true });
      const invocation = {
        ...details,
        contractAddress: account.address,
        calldata: transaction.getExecuteCalldata(calls, contractVersion.cairo),
        signature: [],
      };
      return provider.getInvokeEstimateFee(
        { ...invocation },
        { ...details, nonce },
        "pending",
        true
      );
    },
    [provider]
  );

  useEffect(() => {
    fetchGasTokenPrices(options).then(setGasTokenPrices);
  }, []);

  useEffect(() => {
    if (
      !account ||
      !gasTokenPrice ||
      !gaslessCompatibility ||
      !gaslessAPIAvailable ||
      gasMethod === "traditional"
    )
      return;
    setLoadingGas(true);
    estimateCalls(account, callData).then((fees) => {
      const estimatedGasFeesInGasToken = getGasFeesInGasToken(
        BigInt(fees.overall_fee),
        gasTokenPrice,
        BigInt(fees.gas_price),
        BigInt(fees.data_gas_price ?? "0x1"),
        gaslessCompatibility.gasConsumedOverhead,
        gaslessCompatibility.dataGasConsumedOverhead
      );
      setMaxGasTokenAmount(estimatedGasFeesInGasToken * BigInt(2));
      setLoadingGas(false);
    });
  }, [
    gasMethod,
    callData,
    account,
    gasTokenPrice,
    gaslessCompatibility,
    estimateCalls,
    gaslessAPIAvailable,
  ]);

  const handleRegister = () => {
    if (!account) return;
    if (gasMethod === "paymaster") {
      executeCalls(
        account,
        callData,
        {
          gasTokenAddress: gasTokenPrice?.tokenAddress,
          maxGasTokenAmount,
        },
        options
      )
        .then(then)
        .catch((error) => {
          console.error("Error when executing with Paymaster:", error);
        });
    } else execute().then(then);
  };

  return {
    handleRegister,
    data,
    paymasterRewards,
    gasTokenPrices,
    gasTokenPrice,
    loadingGas,
    setGasTokenPrice,
    gasMethod,
    setGasMethod,
    gaslessCompatibility,
  };
};

export default usePaymaster;

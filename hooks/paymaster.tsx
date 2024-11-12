import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAccountCompatibility,
  fetchAccountsRewards,
  GaslessCompatibility,
  PaymasterReward,
  getGasFeesInGasToken,
  GasTokenPrice,
  fetchGasTokenPrices,
} from "@avnu/gasless-sdk";
import {
  useProvider,
  useAccount,
  useConnect,
  useSendTransaction,
  useSignTypedData,
} from "@starknet-react/core";
import {
  AccountInterface,
  Call,
  EstimateFeeResponse,
  Signature,
  TypedData,
  stark,
  transaction,
} from "starknet";
import isStarknetDeployed from "./isDeployed";
import { gaslessOptions } from "@/utils/constants";
import { decimalToHex } from "@/utils/feltService";

type ErrorMessage = {
  message: string;
  short: string;
};

const usePaymaster = (
  callData: Call[],
  then: (transactionHash: string) => void,
  loadingCallData: boolean
) => {
  const { account } = useAccount();
  const [gaslessCompatibility, setGaslessCompatibility] =
    useState<GaslessCompatibility>();
  const [gasTokenPrices, setGasTokenPrices] = useState<GasTokenPrice[]>([]);
  const [maxGasTokenAmount, setMaxGasTokenAmount] = useState<bigint>();
  const { provider } = useProvider();
  const [paymasterRewards, setPaymasterRewards] = useState<PaymasterReward[]>(
    []
  );
  const [gasTokenPrice, setGasTokenPrice] = useState<GasTokenPrice>();
  const [loadingGas, setLoadingGas] = useState<boolean>(false);
  const { sendAsync: execute, data } = useSendTransaction({
    calls: callData,
  });
  const { connector } = useConnect();
  const { isDeployed, deploymentData } = isStarknetDeployed(account?.address);
  const [typedData, setTypedData] = useState<TypedData>();
  const [invalidTx, setInvalidTx] = useState<boolean>(false);
  const [txError, setTxError] = useState<ErrorMessage>();
  const { signTypedDataAsync } = useSignTypedData({});

  const argentWallet = useMemo(
    () => connector?.id === "argentX" /*|| connector?.id === "argentMobile"*/,
    [connector]
  );

  const paymasterEnabled = !argentWallet;

  useEffect(() => {
    if (!gasTokenPrice) setGasTokenPrice(gasTokenPrices[0]);
  }, [gasTokenPrice, gasTokenPrices]);

  const refreshRewards = useCallback(() => {
    if (!account) return;
    fetchAccountsRewards(account.address, {
      ...gaslessOptions,
      protocol: "STARKNETID",
    }).then(setPaymasterRewards);
  }, [account]);

  useEffect(() => {
    if (!account) return;
    fetchAccountCompatibility(account.address, gaslessOptions)
      .then(setGaslessCompatibility)
      .catch((e) => {
        setGaslessCompatibility(undefined);
        console.error(e);
      });
    refreshRewards();
  }, [account, refreshRewards]);

  const estimateCalls = useCallback(
    async (
      account: AccountInterface,
      calls: Call[]
    ): Promise<EstimateFeeResponse | void> => {
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
      return provider
        .getInvokeEstimateFee(
          { ...invocation },
          { ...details, nonce },
          "pending",
          true
        )
        .catch((e) => {
          console.error(e);
          const stringError = e.toString();
          if (stringError.includes("Invalid signature"))
            setTxError({ message: "", short: "Invalid signature" });
          else setTxError({ message: stringError, short: "TX error" });
          setInvalidTx(true);
        });
    },
    [provider]
  );

  useEffect(() => {
    const fetch = async () =>
      fetchGasTokenPrices(gaslessOptions).then(setGasTokenPrices);
    fetch();
    const interval = setInterval(fetch, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      !account ||
      !gasTokenPrice ||
      !gaslessCompatibility ||
      loadingCallData ||
      !paymasterEnabled
    )
      return setLoadingGas(false);
    setLoadingGas(true);
    setInvalidTx(false);
    estimateCalls(account, callData).then((fees) => {
      if (!fees) return;
      setInvalidTx(false);
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
    callData,
    account,
    gasTokenPrice,
    gaslessCompatibility,
    estimateCalls,
    loadingCallData,
    paymasterEnabled,
  ]);

  const loadingDeploymentData =
    connector?.id === "argentX" && !isDeployed && !deploymentData;

  useEffect(() => {
    if (!account) return;
    if (
      !isDeployed &&
      (!deploymentData || !argentWallet || loadingDeploymentData)
    )
      return;
    const body: { [id: string]: object | string } = {
      userAddress: account.address,
      calls: callData,
    };
    if (!isDeployed && deploymentData)
      body.accountClassHash = deploymentData.class_hash;
    fetch(`${gaslessOptions.baseUrl}/gasless/v1/build-typed-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.messages || data.error) return;
        setTypedData(data);
      })
      .catch((error) => {
        console.error("Error when fetching deployment typed data:", error);
      });
  }, [
    account,
    isDeployed,
    deploymentData,
    argentWallet,
    callData,
    maxGasTokenAmount,
    loadingDeploymentData,
  ]);

  const handleRegister = useCallback(() => {
    if (!account) return;
    if (typedData && !argentWallet) {
      signTypedDataAsync(typedData).then((signature: Signature) => {
        const body: { [id: string]: object | string } = {
          userAddress: account.address,
          typedData: JSON.stringify(typedData),
          signature: (signature as string[]).map(decimalToHex),
        };
        if (!isDeployed && deploymentData) body.deploymentData = deploymentData;
        fetch(`${gaslessOptions.baseUrl}/gasless/v1/execute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })
          .then((res) => res.json())
          .then((data) => {
            return then(data.transactionHash);
          })
          .catch((error) => {
            console.error("Error when executing with Paymaster:", error);
          });
      });
    } else execute().then((res) => then(res.transaction_hash));
  }, [
    account,
    deploymentData,
    then,
    signTypedDataAsync,
    typedData,
    execute,
    isDeployed,
    argentWallet,
  ]);

  return {
    handleRegister,
    data,
    paymasterRewards,
    gasTokenPrices,
    gasTokenPrice,
    loadingGas,
    setGasTokenPrice,
    gaslessCompatibility,
    maxGasTokenAmount,
    loadingDeploymentData,
    refreshRewards,
    invalidTx,
    loadingTypedData: !typedData && isDeployed && paymasterEnabled,
    txError,
  };
};

export default usePaymaster;

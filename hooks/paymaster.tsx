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
import {
  useProvider,
  useAccount,
  useConnect,
  useContractWrite,
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

const usePaymaster = (
  callData: Call[],
  then: (transactionHash: string) => void,
  loadingCallData: boolean
) => {
  const { account } = useAccount();
  const [gaslessAPIAvailable, setGaslessAPIAvailable] = useState<boolean>(true);
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
  const [sponsoredDeploymentAvailable, setSponsoredDeploymentAvailable] =
    useState<boolean>(false);
  const { writeAsync: execute, data } = useContractWrite({
    calls: callData,
  });
  const { connector } = useConnect();
  const { isDeployed, deploymentData } = isStarknetDeployed(account?.address);
  const [deploymentTypedData, setDeploymentTypedData] = useState<TypedData>();
  const [invalidTx, setInvalidTx] = useState<boolean>(false);

  useEffect(() => {
    if (!account || !connector) return;
    setSponsoredDeploymentAvailable(
      connector.id === "argentX" || connector.id === "argentMobile"
    );
  }, [account, connector]);

  useEffect(() => {
    if (!gasTokenPrice) setGasTokenPrice(gasTokenPrices[0]);
  }, [gasTokenPrice, gasTokenPrices]);

  useEffect(() => {
    fetchGaslessStatus(gaslessOptions).then((res) => {
      setGaslessAPIAvailable(res.status);
    });
  }, []);

  const refreshRewards = useCallback(() => {
    if (!account) return;
    fetchAccountsRewards(account.address, {
      ...gaslessOptions,
      protocol: "STARKNETID",
    }).then(setPaymasterRewards);
  }, [account]);

  useEffect(() => {
    if (!account || !gaslessAPIAvailable) return;
    fetchAccountCompatibility(account.address, gaslessOptions)
      .then(setGaslessCompatibility)
      .catch((e) => {
        setGaslessCompatibility(undefined);
        console.error(e);
      });
    refreshRewards();
  }, [account, gaslessAPIAvailable, refreshRewards]);

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
        .catch(() => setInvalidTx(true));
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
      !gaslessAPIAvailable ||
      loadingCallData
    )
      return;
    setLoadingGas(true);
    estimateCalls(account, callData).then((fees) => {
      if (!fees) return;
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
    gaslessAPIAvailable,
    loadingCallData,
  ]);

  useEffect(() => {
    if (
      !account ||
      isDeployed ||
      !deploymentData ||
      !sponsoredDeploymentAvailable
    )
      return;
    fetch(`${gaslessOptions.baseUrl}/gasless/v1/build-typed-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAddress: account.address,
        calls: callData,
        accountClassHash: deploymentData.class_hash,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) return;
        setDeploymentTypedData(data);
      })
      .catch((error) => {
        console.error("Error when fetching deployment typed data:", error);
      });
  }, [
    account,
    isDeployed,
    deploymentData,
    sponsoredDeploymentAvailable,
    callData,
    maxGasTokenAmount,
  ]);

  const handleRegister = () => {
    if (!account) return;
    if (connector?.id === "argentX" || connector?.id === "argentMobile") {
      if (deploymentData && deploymentTypedData) {
        account
          .signMessage(
            deploymentTypedData,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            { skipDeploy: true }
          )
          .then((signature: Signature) => {
            fetch(`${gaslessOptions.baseUrl}/gasless/v1/execute`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userAddress: account.address,
                typedData: JSON.stringify(deploymentTypedData),
                signature: (signature as string[]).map(decimalToHex),
                deploymentData,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                return then(data.transactionHash);
              })
              .catch((error) => {
                console.error("Error when executing with Paymaster:", error);
              });
          });
      } else
        executeCalls(
          account,
          callData,
          paymasterRewards.length === 0
            ? {
                gasTokenAddress: gasTokenPrice?.tokenAddress,
                maxGasTokenAmount,
              }
            : {},
          gaslessOptions
        )
          .then((res) => then(res.transactionHash))
          .catch((error) => {
            console.error("Error when executing with Paymaster:", error);
          });
    } else execute().then((res) => then(res.transaction_hash));
  };

  const loadingDeploymentData = !isDeployed && !deploymentTypedData;

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
  };
};

export default usePaymaster;

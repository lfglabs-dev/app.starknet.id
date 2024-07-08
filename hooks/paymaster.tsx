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
  useContractWrite,
  useProvider,
  useAccount,
  useConnect,
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
import { UNIVERSAL_DEPLOYER, gaslessOptions } from "@/utils/constants";
import { decimalToHex } from "@/utils/feltService";

export type GasMethod = "traditional" | "paymaster";

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
  const [sponsoredDeploymentAvailable, setSponsoredDeploymentAvailable] =
    useState<boolean>(false);
  const { writeAsync: execute, data } = useContractWrite({
    calls: callData,
  });
  const { connector } = useConnect();
  const { isDeployed, deploymentData } = isStarknetDeployed(account?.address);
  const [deploymentTypedData, setDeploymentTypedData] = useState<TypedData>();

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
    if (gaslessCompatibility?.isCompatible && paymasterRewards.length > 0)
      setGasMethod("paymaster");
  }, [gaslessCompatibility, paymasterRewards]);

  useEffect(() => {
    if (!gaslessCompatibility?.isCompatible) setGasMethod("traditional");
  }, [gaslessCompatibility]);

  useEffect(() => {
    fetchGaslessStatus(gaslessOptions).then((res) => {
      setGaslessAPIAvailable(res.status);
    });
  }, []);

  useEffect(() => {
    if (gasMethod === "traditional" && loadingGas) setLoadingGas(false);
  }, [gasMethod, loadingGas]);

  useEffect(() => {
    if (!account || !gaslessAPIAvailable) return;
    fetchAccountCompatibility(account.address, gaslessOptions)
      .then(setGaslessCompatibility)
      .catch((e) => {
        setGaslessCompatibility(undefined);
        console.error(e);
      });
    fetchAccountsRewards(account.address, {
      ...gaslessOptions,
      protocol: "STARKNETID",
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

  useEffect(() => {
    if (
      !account ||
      isDeployed ||
      !deploymentData ||
      !sponsoredDeploymentAvailable
    )
      return;
    const deploymentCallData: Call[] = [
      /*{
        contractAddress: UNIVERSAL_DEPLOYER,
        entrypoint: "deployContract",
        calldata: [
          deploymentData.class_hash,
          deploymentData.salt,
          decimalToHex(deploymentData.version),
          decimalToHex(deploymentData.calldata.length),
          ...deploymentData.calldata,
        ],
      },*/
      ...callData,
    ];
    fetch(`${gaslessOptions.baseUrl}/gasless/v1/build-typed-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.NEXT_PUBLIC_AVNU_PAYMASTER_API_KEY as string,
      },
      body: JSON.stringify({
        userAddress: account.address,
        calls: deploymentCallData,
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
    if (gasMethod === "paymaster") {
      if (deploymentData && deploymentTypedData) {
        account
          .signMessage(
            deploymentTypedData,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            { skipDeploy: true }
          )
          .then((signature: Signature) => {
            console.log(
              "Deployment sponsoring & freedomain mint signature:",
              signature
            );
            fetch(`${gaslessOptions.baseUrl}/gasless/v1/execute`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userAddress: account.address,
                typedData: deploymentTypedData,
                signature,
                deploymentData,
              }),
            })
              .then(then)
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
          .then(then)
          .catch((error) => {
            console.error("Error when executing with Paymaster:", error);
          });
    } else execute().then(then);
  };

  const loadingDeploymentData =
    !isDeployed && !deploymentTypedData && gasMethod === "paymaster";

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
    sponsoredDeploymentAvailable,
    maxGasTokenAmount,
    loadingDeploymentData,
  };
};

export default usePaymaster;

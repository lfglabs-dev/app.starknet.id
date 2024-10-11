import { useConnect, useProvider } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { wallet } from "starknet";
import getStarknet, { StarknetWindowObject } from "get-starknet-core";
import { AccountDeploymentData } from "starknet-types-07";

export default function isStarknetDeployed(address?: string) {
  const { provider } = useProvider();
  const { connector } = useConnect();
  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [deploymentData, setDeploymentData] =
    useState<GetDeploymentDataResult>();
  const [nonDeployedAddress, setNonDeployedAddress] = useState<string>();
  const [reload, setReload] = useState<boolean>(false);

  useEffect(() => {
    if (isDeployed || deploymentData) return;
    const interval = setInterval(() => {
      setReload(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [isDeployed, deploymentData]);

  useEffect(() => {
    if (reload) return setReload(false);
    if (
      !address ||
      !provider ||
      !connector?.id ||
      address === nonDeployedAddress
    )
      return;
    const checkIsDeployed = async () => {
      try {
        provider
          .getClassHashAt(address)
          .then((classHash) => {
            console.log("Class hash", classHash);
            setIsDeployed(true);
            setDeploymentData(undefined);
            return;
          })
          .catch((error) => {
            console.error("Error getting class hash", error);
            setIsDeployed(false);
          });

        const availableWallets = await getStarknet.getAvailableWallets();
        if (!availableWallets) {
          setDeploymentData(undefined);
          return;
        }
        availableWallets.forEach(async (connectedWallet) => {
          if (
            connectedWallet.id === connector?.id &&
            connectedWallet.id !== "braavos" // we cannot deploye braavos account for the user for now
          ) {
            const data = await wallet.deploymentData(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              connectedWallet as StarknetWindowObject
            );
            if (isGetDeploymentDataResult(data)) {
              setDeploymentData(data);
              setNonDeployedAddress(address);
            } else {
              console.error(
                "Received data is not in the expected format:",
                data
              );
              setDeploymentData(undefined);
            }
          }
        });
      } catch (error) {
        console.error("Error getting deployment data", error);
        setDeploymentData(undefined);
      }
    };

    checkIsDeployed();
  }, [address, provider, connector?.id, nonDeployedAddress, reload]);

  return { isDeployed, deploymentData };
}

function isGetDeploymentDataResult(obj: AccountDeploymentData) {
  return (
    obj &&
    typeof obj.address === "string" &&
    typeof obj.class_hash === "string" &&
    typeof obj.salt === "string" &&
    Array.isArray(obj.calldata) &&
    obj.calldata.every((c: string | unknown) => typeof c === "string")
  );
}

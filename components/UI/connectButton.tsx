import React, { useContext } from "react";
import { useConnect } from "@starknet-react/core";
import Button from "./button";
import { FunctionComponent } from "react";
import { useStarknetkitConnectModal } from "starknetkit";
import { StarknetIdJsContext } from "../../context/StarknetIdJsProvider";

const ConnectButton: FunctionComponent = () => {
  const { connectAsync } = useConnect();
  const { availableConnectors } = useContext(StarknetIdJsContext);
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: availableConnectors,
  });

  const connectWallet = async () => {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    await connectAsync({ connector });
    localStorage.setItem("SID-connectedWallet", connector.id);
  };

  return <Button onClick={connectWallet}>Connect wallet</Button>;
};
export default ConnectButton;

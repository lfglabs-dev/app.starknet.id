import React, { type FunctionComponent, useEffect, useState } from "react";
import {
  type Connector,
  useAccount,
  useConnect,
} from "@starknet-react/core";
import Button from "./button";
import WalletConnect from "./walletConnect";
import ArrowDownIcon from "./iconsComponents/icons/arrowDownIcon";
import styles from "../../styles/components/walletConnect.module.css";

const ConnectButton: FunctionComponent = () => {
  const { isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const [showWalletConnectModal, setShowWalletConnectModal] = useState(false);
  const [lastConnector, setLastConnector] = useState<Connector | null>(null);

  useEffect(() => {
    const lastConnectorId = localStorage.getItem("SID-lastUsedConnector");
    const connector = connectors.find(
      (candidate) =>
        candidate.id === lastConnectorId && candidate.available()
    );
    setLastConnector(connector ?? null);
  }, [connectors, isConnected]);

  async function connectWallet(connector: Connector): Promise<void> {
    await connectAsync({ connector });
    localStorage.setItem("SID-connectedWallet", connector.id);
    localStorage.setItem("SID-lastUsedConnector", connector.id);
  }

  return (
    <>
      <Button
        onClick={
          lastConnector
            ? () => void connectWallet(lastConnector)
            : () => setShowWalletConnectModal(true)
        }
      >
        <div className={styles.connectBtn}>
          {lastConnector ? (
            <img
              src="/braavos/braavosLogo.svg"
              className={styles.btnIcon}
              alt="Braavos logo"
            />
          ) : null}
          <p className="mx-auto">Connect wallet</p>
          {lastConnector ? (
            <div
              className={styles.arrowDown}
              onClick={(event) => {
                setShowWalletConnectModal(true);
                event.stopPropagation();
              }}
            >
              <ArrowDownIcon width="18" color="#FFF" className="mt-1 ml-1" />
            </div>
          ) : null}
        </div>
      </Button>
      <WalletConnect
        closeModal={() => setShowWalletConnectModal(false)}
        open={showWalletConnectModal}
        connectors={connectors}
        connectWallet={(connector) => void connectWallet(connector)}
      />
    </>
  );
};

export default ConnectButton;

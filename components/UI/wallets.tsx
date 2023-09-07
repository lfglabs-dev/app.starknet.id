import React, { useMemo, useState } from "react";
import styles from "../../styles/components/wallets.module.css";
import { Connector, useAccount, useConnectors } from "@starknet-react/core";
import Button from "./button";
import { FunctionComponent, useEffect } from "react";
import { Modal } from "@mui/material";
import WalletIcons from "./iconsComponents/icons/walletIcons";
import getDiscoveryWallets from "get-starknet-core";

type WalletsProps = {
  closeWallet: () => void;
  hasWallet: boolean;
};

const Wallets: FunctionComponent<WalletsProps> = ({
  closeWallet,
  hasWallet,
}) => {
  const { connect, connectors } = useConnectors();
  const { account } = useAccount();
  const [argent, setArgent] = useState<string>("");
  const [braavos, setBraavos] = useState<string>("");
  const combinations = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ];
  const rand = useMemo(() => Math.floor(Math.random() * 6), []);

  useEffect(() => {
    if (account) {
      closeWallet();
    }
  }, [account, closeWallet]);

  useEffect(() => {
    // get wallets download links from get-starknet-core
    // if browser is not recognized, it will default to their download pages
    getDiscoveryWallets.getDiscoveryWallets().then((wallets) => {
      const browser = getBrowser();

      wallets.map((wallet) => {
        if (wallet.id === "argentX") {
          setArgent(
            browser
              ? wallet.downloads[browser]
              : "https://www.argent.xyz/argent-x/"
          );
        } else if (wallet.id === "braavos") {
          setBraavos(
            browser
              ? wallet.downloads[browser]
              : "https://braavos.app/download-braavos-wallet/"
          );
        }
      });
    });
  }, []);

  function connectWallet(connector: Connector): void {
    connect(connector);
    closeWallet();
  }

  function getBrowser(): string | undefined {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) {
      return "chrome";
    } else if (userAgent.includes("Firefox")) {
      return "firefox";
    } else {
      return undefined;
    }
  }

  return (
    <Modal
      disableAutoFocus
      open={hasWallet}
      onClose={closeWallet}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className={styles.menu}>
        <button
          className={styles.menu_close}
          onClick={() => {
            closeWallet();
          }}
        >
          <svg viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        <p className={styles.menu_title}>You need a Starknet wallet</p>
        {combinations[rand].map((index) => {
          const connector = connectors[index];
          if (connector.available()) {
            return (
              <div className="mt-5 flex justify-center" key={connector.id}>
                <Button onClick={() => connectWallet(connector)}>
                  <div className="flex justify-center items-center">
                    <WalletIcons id={connector.id} />
                    {connector.id === "braavos" || connector.id === "argentX"
                      ? `Connect ${connector.name}`
                      : "Login with Email"}
                  </div>
                </Button>
              </div>
            );
          } else {
            if (connector.id === "braavos" || connector.id === "argentX") {
              return (
                <div className="mt-5 flex justify-center" key={connector.id}>
                  <Button
                    onClick={() =>
                      window.open(
                        `${connector.id === "braavos" ? braavos : argent}`
                      )
                    }
                  >
                    <div className="flex justify-center items-center">
                      <WalletIcons id={connector.id} />
                      Install {connector.id}
                    </div>
                  </Button>
                </div>
              );
            }
          }
        })}
      </div>
    </Modal>
  );
};
export default Wallets;

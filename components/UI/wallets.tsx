import React, { useMemo, useState } from "react";
import styles from "../../styles/components/wallets.module.css";
import { Connector, useAccount, useConnectors } from "@starknet-react/core";
import Button from "./button";
import { FunctionComponent, useEffect } from "react";
import { Modal } from "@mui/material";
import WalletIcons from "./iconsComponents/icons/walletIcons";
import getDiscoveryWallets from "get-starknet-core";
import useGetDiscoveryWallets from "../../hooks/useGetDiscoveryWallets";

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
  const downloadLinks = useGetDiscoveryWallets(
    getDiscoveryWallets.getDiscoveryWallets()
  );

  useEffect(() => {
    if (account) {
      closeWallet();
    }
  }, [account, closeWallet]);

  function connectWallet(connector: Connector): void {
    connect(connector);
    closeWallet();
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
        {connectors.map((connector) => {
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
                        `${
                          downloadLinks[
                            connector.id as keyof typeof downloadLinks
                          ]
                        }`
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

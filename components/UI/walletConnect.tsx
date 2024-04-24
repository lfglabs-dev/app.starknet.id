import React, { FunctionComponent } from "react";
import { Modal } from "@mui/material";
import { Connector } from "starknetkit";
import styles from "../../styles/components/walletConnect.module.css";
import CloseIcon from "./iconsComponents/icons/closeIcon";
import {
  getConnectorDiscovery,
  getConnectorIcon,
  getConnectorName,
} from "@/utils/connectorWrapper";

type WalletConnectProps = {
  closeModal: () => void;
  open: boolean;
  connectors: Connector[];
  connectWallet: (connector: Connector) => void;
};

const WalletConnect: FunctionComponent<WalletConnectProps> = ({
  closeModal,
  open,
  connectors,
  connectWallet,
}) => {
  const connect = (connector: Connector) => {
    connectWallet(connector);
    closeModal();
  };

  return (
    <Modal
      disableAutoFocus
      open={open}
      onClose={closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      componentsProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      }}
    >
      <div className={styles.menu}>
        <button className={styles.menu_close} onClick={closeModal}>
          <CloseIcon />
        </button>
        <div className={styles.modalContent}>
          <div className={styles.modalTitle}>
            <span>Connect to</span>
            <p>Starknet ID</p>
          </div>
          {connectors.map((connector: Connector) => {
            const isAvailable = connector.available();
            return (
              <div
                key={connector.id}
                className={styles.wallet}
                onClick={
                  isAvailable
                    ? () => connect(connector)
                    : () => window.open(getConnectorDiscovery(connector.id))
                }
              >
                <img
                  src={getConnectorIcon(connector.id)}
                  className={styles.walletIcon}
                />
                <div className={styles.walletName}>
                  <p>
                    {!isAvailable ? "Install " : ""}
                    {getConnectorName(connector.id)}
                  </p>
                  {connector.id === "argentWebWallet" ? (
                    <span className={styles.legend}>Powered by Argent</span>
                  ) : null}
                </div>
                <div></div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default WalletConnect;

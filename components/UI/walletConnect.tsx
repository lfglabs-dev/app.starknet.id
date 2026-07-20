import React, { type FunctionComponent } from "react";
import { useRouter } from "next/router";
import { Modal, useMediaQuery } from "@mui/material";
import type { Connector } from "@starknet-react/core";
import CloseIcon from "./iconsComponents/icons/closeIcon";
import styles from "../../styles/components/walletConnect.module.css";

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
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const braavos = connectors.find((connector) => connector.id === "braavos");

  const tryConnect = () => {
    if (braavos?.available()) {
      connectWallet(braavos);
      closeModal();
    } else if (isMobile) {
      window.open(`braavos://dapp/app.starknet.id${router.pathname}`);
    } else {
      window.open("https://braavos.app/", "_blank", "noopener,noreferrer");
    }
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
          <div className={styles.wallet} onClick={tryConnect}>
            <img
              src="/braavos/braavosLogo.svg"
              className={styles.walletIcon}
              alt="Braavos logo"
            />
            <div className={styles.walletName}>
              <p>{braavos?.available() || isMobile ? "" : "Install "}Braavos</p>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WalletConnect;

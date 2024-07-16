import React, { FunctionComponent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Modal, useMediaQuery } from "@mui/material";
import { Connector } from "starknetkit";
import styles from "../../styles/components/walletConnect.module.css";
import CloseIcon from "./iconsComponents/icons/closeIcon";
import {
  getConnectorDiscovery,
  getConnectorIcon,
  getConnectorName,
  isInArgentMobileAppBrowser,
  sortConnectors,
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
  const router = useRouter();
  const [isArgentMobile, setIsArgentMobile] = useState(false);
  const connect = (connector: Connector) => {
    connectWallet(connector);
    closeModal();
  };
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (typeof window !== "undefined")
      setIsArgentMobile(isInArgentMobileAppBrowser());
  }, []);

  const filterConnectors = (connectors: Connector[]) => {
    if (isArgentMobile) {
      return connectors.filter((connector) => connector.id === "argentMobile");
    }
    return connectors;
  };

  const openBraavosMobile = () => {
    window.open(`braavos://dapp/app.starknet.id${router.pathname}`);
  };

  const needInstall = (connector: Connector, isAvailable: boolean) => {
    if (connector.id === "braavos" && isMobile) {
      return false;
    }
    return !isAvailable;
  };

  const tryConnect = (connector: Connector, isAvailable: boolean) => {
    if (isAvailable) {
      connect(connector);
    } else if (isMobile && connector.id === "braavos") {
      openBraavosMobile();
    } else {
      window.open(getConnectorDiscovery(connector.id));
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
          {sortConnectors(filterConnectors(connectors)).map(
            (connector: Connector) => {
              const isAvailable = connector.available();
              return (
                <div
                  key={connector.id}
                  className={styles.wallet}
                  onClick={() => tryConnect(connector, isAvailable)}
                >
                  <img
                    src={getConnectorIcon(connector.id)}
                    className={styles.walletIcon}
                  />
                  <div className={styles.walletName}>
                    <p>
                      {needInstall(connector, isAvailable) ? "Install " : ""}
                      {connector.id === "argentMobile" && isMobile
                        ? "Argent"
                        : getConnectorName(connector.id)}
                    </p>
                    {connector.id === "argentWebWallet" ? (
                      <span className={styles.legend}>Powered by Argent</span>
                    ) : null}
                  </div>
                  <div></div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </Modal>
  );
};

export default WalletConnect;

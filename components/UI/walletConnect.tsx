import React, { FunctionComponent, useEffect, useState } from "react";
import { Modal } from "@mui/material";
import { Connector } from "starknetkit";
import styles from "../../styles/components/walletConnect.module.css";
import CloseIcon from "./iconsComponents/icons/closeIcon";
import { getConnectorIcon, getConnectorName } from "@/utils/connectorWrapper";

type WalletConnectProps = {
  closeModal: () => void;
  open: boolean;
  connectors: Connector[];
  //   disconnectByClick: () => void;
};

const WalletConnect: FunctionComponent<WalletConnectProps> = ({
  closeModal,
  open,
  connectors,
  //   disconnectByClick,
}) => {
  console.log("connectors", connectors);
  return (
    <Modal
      disableAutoFocus
      open={open}
      onClose={closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className={styles.menu}>
        <button className={styles.menu_close} onClick={closeModal}>
          <CloseIcon />
        </button>
        <div className={styles.modalContent}>
          {connectors.map((connector: Connector) => {
            if (connector.available()) {
              return (
                <div className={styles.wallet}>
                  <img src={getConnectorIcon(connector.id)} />
                  <p>{getConnectorName(connector.id)}</p>
                  <div></div>
                </div>
              );
            }
            return <div>not available : {connector.id}</div>;
          })}
        </div>
      </div>
    </Modal>
  );
};

export default WalletConnect;

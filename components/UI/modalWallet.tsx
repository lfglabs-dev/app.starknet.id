import React, { useEffect, useState } from "react";
import styles from "../../styles/components/walletMessage.module.css";
import { FunctionComponent } from "react";
import { Modal } from "@mui/material";
import { useAccount } from "@starknet-react/core";
import ClickableAction from "./iconsComponents/clickableAction";
import CloseIcon from "./iconsComponents/icons/closeIcon";
import ArgentIcon from "./iconsComponents/icons/argentIcon";
import theme from "../../styles/theme";
import ExitIcon from "./iconsComponents/icons/exitIcon";
import CopyIcon from "./iconsComponents/icons/copyIcon";
import DoneIcon from "./iconsComponents/icons/doneIcon";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import { CDNImg } from "../cdn/image";

type ModalWalletProps = {
  closeModal: () => void;
  open: boolean;
  domain: string;
  disconnectByClick: () => void;
  setTxLoading: (txLoading: number) => void;
};

const ModalWallet: FunctionComponent<ModalWalletProps> = ({
  closeModal,
  open,
  domain,
  disconnectByClick,
  setTxLoading,
}) => {
  const { address, connector } = useAccount();
  const [copied, setCopied] = useState(false);
  const network =
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "testnet" : "mainnet";
  // Argent web wallet is detectable only like this
  const isWebWallet = (connector as any)?._wallet?.id === "argentWebWallet";
  const { notifications } = useNotificationManager();

  useEffect(() => {
    if (notifications) {
      // Give the number of tx that are loading
      setTxLoading(
        notifications.filter(
          (notif: SIDNotification<TransactionData>) =>
            notif.data.status === "pending"
        ).length
      );
    }
  }, [notifications, setTxLoading]);

  const copyToClipboard = () => {
    if (!address) return;
    setCopied(true);
    navigator.clipboard.writeText(address);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

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
        <div className={styles.menu_title}>
          <div className={styles.menu_title}>
            {connector && connector.id === "braavos" ? (
              <CDNImg
                width={"25px"}
                src="/braavos/braavosLogo.svg"
                alt="braavos logo"
              />
            ) : (
              <ArgentIcon color={"#f36a3d"} width={"25px"} />
            )}

            <p className="ml-2">Connected with &nbsp;{domain}&nbsp;</p>
          </div>
        </div>
        <div className="flex flex-row justify-around flex-wrap mb-3">
          <ClickableAction
            onClick={disconnectByClick}
            icon={<ExitIcon width="25" color="currentColor" />}
            title="Disconnect"
            width="auto"
          />
          <ClickableAction
            onClick={copyToClipboard}
            icon={
              copied ? (
                <DoneIcon width="25" color={theme.palette.primary.main} />
              ) : (
                <CopyIcon width="25" color={"currentColor"} />
              )
            }
            title="Copy Address"
            width="auto"
          />
          {isWebWallet && (
            <ClickableAction
              onClick={() =>
                window.open(
                  network === "mainnet"
                    ? "https://web.argent.xyz"
                    : "https://web.hydrogen.argent47.net",
                  "_blank",
                  "noopener noreferrer"
                )
              }
              icon={<ArgentIcon color={"#f36a3d"} width={"25px"} />}
              title="Web wallet Dashboard"
              width="auto"
            />
          )}
        </div>
        <div className={styles.menu_txs}>
          <div className={styles.tx_title}>My transactions</div>
          <div className={styles.tx_section}>
            {notifications && notifications.length > 0 ? (
              notifications.map((tx) => {
                return (
                  <div className={styles.menu_tx} key={tx.data?.hash}>
                    <a
                      href={`https://${
                        network === "testnet" ? "testnet." : ""
                      }starkscan.co/tx/${tx.data?.hash}`}
                      className={styles.tx_hash}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {tx.data?.hash?.slice(0, 6) +
                        "..." +
                        tx.data?.hash?.slice(
                          tx.data?.hash.length - 6,
                          tx.data?.hash.length
                        )}
                    </a>
                    <div>
                      {tx.data.status === "pending"
                        ? "PENDING"
                        : tx.data.status === "error"
                        ? "REJECTED"
                        : tx.data && tx.data?.txStatus}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.tx_empty}>No ongoing transactions</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default ModalWallet;

import React, { useEffect, useState } from "react";
import styles from "../../styles/components/walletMessage.module.css";
import { FunctionComponent } from "react";
import { Modal } from "@mui/material";
import { useAccount, useTransactions } from "@starknet-react/core";
import { ContentCopy } from "@mui/icons-material";
import CopiedIcon from "./iconsComponents/icons/copiedIcon";
import ClickableAction from "./iconsComponents/clickableAction";
import { CommonTransactionReceiptResponse } from "starknet";
import CloseIcon from "./iconsComponents/icons/closeIcon";
import ArgentIcon from "./iconsComponents/icons/argentIcon";
import theme from "../../styles/theme";
import LogoutIcon from "@mui/icons-material/Logout";

type ModalWalletProps = {
  closeModal: () => void;
  open: boolean;
  domain: string;
  disconnectByClick: () => void;
  hashes: string[];
  setTxLoading: (txLoading: number) => void;
};

const ModalWallet: FunctionComponent<ModalWalletProps> = ({
  closeModal,
  open,
  domain,
  disconnectByClick,
  hashes,
  setTxLoading,
}) => {
  const { address, connector } = useAccount();
  const [copied, setCopied] = useState(false);
  const transactions = useTransactions({ hashes, watch: true });
  const network =
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "testnet" : "mainnet";
  // Argent web wallet is detectable only like this
  const isWebWallet = (connector as any)?._wallet?.id === "argentWebWallet";

  // TODO: Check for starknet react fix and delete that code
  useEffect(() => {
    const interval = setInterval(() => {
      for (const tx of transactions) {
        tx.refetch();
      }
    }, 3_000);
    return () => clearInterval(interval);
  }, [transactions?.length]);

  useEffect(() => {
    if (transactions) {
      // Give the number of tx that are loading (I use any because there is a problem on Starknet React types)
      setTxLoading(
        transactions.filter((tx) => (tx?.data as any)?.status === "RECEIVED")
          .length
      );
    }
  }, [transactions]);

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
              <img
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
            icon={<LogoutIcon width="25" />}
            title="Disconnect"
            width="auto"
          />
          <ClickableAction
            onClick={copyToClipboard}
            icon={
              copied ? (
                <CopiedIcon width="25" color={theme.palette.primary.main} />
              ) : (
                <ContentCopy width="25" />
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
          <div>
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => {
                return (
                  <div
                    className={styles.menu_tx}
                    key={tx.data?.transaction_hash}
                  >
                    <a
                      href={`https://${
                        network === "testnet" ? "testnet." : ""
                      }starkscan.co/tx/${tx.data?.transaction_hash}`}
                      className={styles.tx_hash}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {tx.data?.transaction_hash?.slice(0, 6) +
                        "..." +
                        tx.data?.transaction_hash?.slice(
                          tx.data?.transaction_hash.length - 6,
                          tx.data?.transaction_hash.length
                        )}
                    </a>
                    <div>
                      {tx.status === "success" &&
                        tx.data &&
                        (tx.data as CommonTransactionReceiptResponse).status}
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

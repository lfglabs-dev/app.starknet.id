import React, { useState } from "react";
import styles from "../../styles/components/walletMessage.module.css";
import { FunctionComponent } from "react";
import { Modal, Tooltip } from "@mui/material";
import {
  useAccount,
  useTransactionManager,
  useTransactions,
} from "@starknet-react/core";
import { ContentCopy } from "@mui/icons-material";
import CopiedIcon from "./iconsComponents/icons/copiedIcon";
import ClickableAction from "./iconsComponents/clickableAction";
import Link from "next/link";
import { CommonTransactionReceiptResponse } from "starknet";

type ModalWalletProps = {
  closeModal: () => void;
  open: boolean;
  domain: string;
  disconnectByClick: () => void;
};

const ModalWallet: FunctionComponent<ModalWalletProps> = ({
  closeModal,
  open,
  domain,
  disconnectByClick,
}) => {
  const { address } = useAccount();
  const { hashes } = useTransactionManager();
  const transactions = useTransactions({ hashes, watch: true });
  const [copied, setCopied] = useState(false);
  const network =
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "testnet." : "";

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
          <svg viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        <div className={styles.menu_title}>
          <div className={styles.menu_title}>
            <img
              width={"40px"}
              src="/visuals/StarknetIdLogo.svg"
              alt="starknet.id avatar"
            />
            <p>My Wallet</p>
          </div>

          <div className="flex flex-row">
            <p className={styles.menu_name}>{domain}</p>
            <div className="cursor-pointer">
              {!copied ? (
                <Tooltip title="Copy" arrow>
                  <ContentCopy onClick={() => copyToClipboard()} />
                </Tooltip>
              ) : (
                <CopiedIcon color="green" width="25" />
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-row divide-y mt-3 mb-5">
          <ClickableAction
            onClick={disconnectByClick}
            icon="disconnect"
            title="Disconnect"
          />
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
                    <Link
                      href={`https://${network}starkscan.co/tx/${tx.data?.transaction_hash}`}
                      className="cursor-pointer hover:underline"
                    >
                      {tx.data?.transaction_hash?.slice(0, 20) + "..."}
                    </Link>
                    <div>
                      {tx.data &&
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

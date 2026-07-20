import React, { useEffect, type FunctionComponent } from "react";
import { Modal } from "@mui/material";
import ClickableAction from "./iconsComponents/clickableAction";
import CloseIcon from "./iconsComponents/icons/closeIcon";
import ExitIcon from "./iconsComponents/icons/exitIcon";
import CopyIcon from "./iconsComponents/icons/copyIcon";
import DoneIcon from "./iconsComponents/icons/doneIcon";
import { useCopyToClipboard } from "@/hooks/useCopy";
import { useTransactions } from "@/hooks/useTransactions";
import theme from "../../styles/theme";
import styles from "../../styles/components/walletMessage.module.css";

type ModalWalletProps = {
  address?: string;
  closeModal: () => void;
  open: boolean;
  domain: string;
  disconnectByClick: () => void;
  setTxLoading: (txLoading: number) => void;
};

const ModalWallet: FunctionComponent<ModalWalletProps> = ({
  address,
  closeModal,
  open,
  domain,
  disconnectByClick,
  setTxLoading,
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard();
  const { transactions } = useTransactions();

  useEffect(() => {
    setTxLoading(
      transactions.filter((transaction) => transaction.status === "pending")
        .length
    );
  }, [setTxLoading, transactions]);

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
            <img
              src="/braavos/braavosLogo.svg"
              width={25}
              height={25}
              alt="Braavos logo"
            />
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
            onClick={() => void copyToClipboard(address)}
            icon={
              copied ? (
                <DoneIcon width="25" color={theme.palette.primary.main} />
              ) : (
                <CopyIcon width="25" color="currentColor" />
              )
            }
            title="Copy Address"
            width="auto"
          />
        </div>
        <div className={styles.menu_txs}>
          <div className={styles.tx_title}>My transactions</div>
          <div className={styles.tx_section}>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div className={styles.menu_tx} key={transaction.hash}>
                  <a
                    href={`https://starkscan.co/tx/${transaction.hash}`}
                    className={styles.tx_hash}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {`${transaction.hash.slice(0, 6)}...${transaction.hash.slice(
                      -6
                    )}`}
                  </a>
                  <div>
                    {transaction.status === "pending"
                      ? "PENDING"
                      : transaction.status === "reverted"
                      ? "REJECTED"
                      : "ACCEPTED_ON_L2"}
                  </div>
                </div>
              ))
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

import { Modal } from "@mui/material";
import React, {
  FunctionComponent,
  ReactNode,
  useState,
  useEffect,
} from "react";
import styles from "../../styles/components/modalMessage.module.css";
import Button from "./button";
import ConfirmationTx from "./confirmationTx";
import IsSendingTx from "@/components/UI/isSendingTx";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

type TransactionModalProps = {
  title: string;
  modalContent: ReactNode;
  handleClose: () => void;
  isModalOpen: boolean;
  isSendingTx: boolean;
  setIsSendingTx: (isSendingTx: boolean) => void;
  isTxSent: boolean;
  setIsTxSent: (isTxSent: boolean) => void;
  sendTransaction: () => void;
  buttonCta: string;
  transactionHash?: string;
  isButtonDisabled?: boolean;
};

const TransactionModal: FunctionComponent<TransactionModalProps> = ({
  title,
  modalContent,
  handleClose,
  isModalOpen,
  isTxSent,
  isSendingTx,
  setIsSendingTx,
  setIsTxSent,
  sendTransaction,
  transactionHash,
  isButtonDisabled = true,
  buttonCta,
}) => {
  const isMobile = useIsMobile();

  function closeModal(canClose = true): void {
    if (!canClose) return;
    setIsTxSent(false);
    setIsSendingTx(false);
    handleClose();
  }

  return (
    <Modal
      disableAutoFocus
      open={isModalOpen}
      onClose={() => {
        if (!isMobile && !isSendingTx) {
          closeModal(true);
        }
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <>
        {isTxSent ? (
          <ConfirmationTx closeModal={closeModal} txHash={transactionHash} />
        ) : isSendingTx ? (
          <IsSendingTx />
        ) : (
          <div className={styles.menu}>
            {!isMobile && (
              <button
                className={styles.menu_close}
                onClick={() => closeModal()}
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
            )}
            <p className={styles.menu_title}>{title}</p>
            {modalContent}
            <div className={styles.button_container}>
              <Button disabled={isButtonDisabled} onClick={sendTransaction}>
                {buttonCta}
              </Button>
            </div>
            {isMobile && (
              <div className={styles.cancel_button_container}>
                <button
                  onClick={handleClose}
                  className={styles.button_cancel}
                  aria-label="Cancel and close modal"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </>
    </Modal>
  );
};

export default TransactionModal;

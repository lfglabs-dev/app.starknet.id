import { Modal } from "@mui/material";
import React, { FunctionComponent, ReactNode } from "react";
import styles from "../../styles/components/modalMessage.module.css";
import Button from "./button";
import ConfirmationTx from "./confirmationTx";
import IsSendingTx from "@/components/UI/isSendingTx";

const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

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
      onClose={() => !isMobile && closeModal(!isSendingTx)}
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
              <button className={styles.menu_close} onClick={() => closeModal()}>
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
            <div className="mt-5 flex justify-center">
              <Button disabled={isButtonDisabled} onClick={sendTransaction}>
                {buttonCta}
              </Button>
            </div>
            {isMobile && (
              <div className="mt-2 flex justify-center">
                <button
                  onClick={handleClose}
                  className={styles.button_cancel}
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

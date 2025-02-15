import { Modal } from "@mui/material";
import React, { FunctionComponent, ReactNode } from "react";
import styles from "../../styles/components/modalMessage.module.css";
import Button from "./button";
import ConfirmationTx from "./confirmationTx";
import IsSendingTx from "@/components/UI/isSendingTx";

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
      onClose={() => closeModal(!isSendingTx)}
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
            <p className={styles.menu_title}>{title}</p>
            {modalContent}
            <div className="flex flex-col gap-4">
              <Button 
                disabled={isButtonDisabled} 
                onClick={sendTransaction} 
                className="!w-[10rem] !h-[2.75rem] !mx-auto !text-sm !whitespace-nowrap !text-center"
              >
                {buttonCta}
              </Button>

              <button
                className="lg:hidden text-[#454545] text-center lg:text-sm text-xs font-quickZap"
                onClick={() => closeModal()}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </>
    </Modal>
  );
};

export default TransactionModal;

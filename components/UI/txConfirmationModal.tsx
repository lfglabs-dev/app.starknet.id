import React, { FunctionComponent } from "react";
import Lottie from "lottie-react";
import ModalMessage from "../UI/modalMessage";
import verifiedLottie from "../../public/visuals/verifiedLottie.json";
import Button from "./button";

type TxConfirmationModalProps = {
  txHash?: string;
  isTxModalOpen: boolean;
  closeModal: () => void;
  title: string;
};

const TxConfirmationModal: FunctionComponent<TxConfirmationModalProps> = ({
  txHash,
  isTxModalOpen,
  closeModal,
  title,
}) => {
  return (
    <ModalMessage
      open={isTxModalOpen}
      title={title}
      closeModal={() => closeModal()}
      message={
        <div className="mt-7 flex flex-col items-center justify-center text-center">
          <Lottie
            className="w-52"
            animationData={verifiedLottie}
            loop={false}
          />{" "}
          <p
            className="text-sm underline cursor-pointer"
            onClick={() =>
              window.open(
                `https://${
                  process.env.NEXT_PUBLIC_IS_TESTNET === "true"
                    ? "testnet."
                    : ""
                }starkscan.co/tx/${txHash}`
              )
            }
          >
            View on Explorer
          </p>
          <div className="mt-5">
            <Button onClick={closeModal}>Close</Button>
          </div>
        </div>
      }
    />
  );
};

export default TxConfirmationModal;

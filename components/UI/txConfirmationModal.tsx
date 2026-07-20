import React, { type FunctionComponent } from "react";
import dynamic from "next/dynamic";
import ModalMessage from "../UI/modalMessage";
import Button from "./button";
import verifiedLottie from "../../public/visuals/verifiedLottie.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

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
}) => (
  <ModalMessage
    open={isTxModalOpen}
    title={title}
    closeModal={closeModal}
    message={
      <div className="mt-7 flex flex-col items-center justify-center text-center">
        <Lottie className="w-52" animationData={verifiedLottie} loop={false} />{" "}
        <p
          className="text-sm underline cursor-pointer"
          onClick={() => window.open(`https://starkscan.co/tx/${txHash}`)}
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

export default TxConfirmationModal;

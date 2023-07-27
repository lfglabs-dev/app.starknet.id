import React, { FunctionComponent } from "react";
import modalStyles from "../../styles/components/modalMessage.module.css";
import Button from "./button";
import verifiedLottie from "../../public/visuals/verifiedLottie.json";
import Lottie from "lottie-react";

type ConfirmationTxProps = {
  closeModal: () => void;
  txHash?: string;
};

const ConfirmationTx: FunctionComponent<ConfirmationTxProps> = ({
  closeModal,
  txHash,
}) => {
  return (
    <div className={modalStyles.menu}>
      <button className={modalStyles.menu_close} onClick={closeModal}>
        <svg viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
      <p className={modalStyles.menu_title}>
        Your Transaction is on it&apos;s way !
      </p>
      <div className="mt-7 flex flex-col items-center justify-center text-center">
        <Lottie className="w-52" animationData={verifiedLottie} loop={false} />{" "}
        <p
          className="text-sm underline cursor-pointer"
          onClick={() =>
            window.open(
              `https://${
                process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "testnet." : ""
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
    </div>
  );
};

export default ConfirmationTx;

import React, { FunctionComponent } from "react";
import Lottie from "lottie-react";
import ModalMessage from "../UI/modalMessage";
import verifiedLottie from "../../public/visuals/verifiedLottie.json";
import Button from "./button";

type RegisterConfirmationModalProps = {
  txHash?: string;
  isTxModalOpen: boolean;
  closeModal: () => void;
};

const RegisterConfirmationModal: FunctionComponent<
  RegisterConfirmationModalProps
> = ({ txHash, isTxModalOpen, closeModal }) => {
  return (
    <ModalMessage
      open={isTxModalOpen}
      title={"Thanks, It's now time to earn crypto !"}
      closeModal={() => closeModal()}
      message={
        <div className="flex items-center justify-center text-center py-5 gap-2 flex-wrap lg:flex-nowrap">
          <div className="flex flex-col">
            <Lottie
              className="w-52"
              animationData={verifiedLottie}
              loop={false}
            />{" "}
            <p
              className="text-xs underline cursor-pointer"
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
              View transaction on explorer
            </p>
          </div>
          <div className="flex flex-col ">
            <p className="text-justify">
              Refer your friends to Starknet ID and earn{" "}
              <strong>ETH or STRK</strong> ! Each sale made with your referral
              link will permit you to earn up to 8$ worth of crypto.
            </p>
            <div className="mt-5">
              <Button
                onClick={() =>
                  window.open(
                    "https://www.starknet.id/affiliates/individual-program"
                  )
                }
              >
                Start earning crypto
              </Button>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default RegisterConfirmationModal;

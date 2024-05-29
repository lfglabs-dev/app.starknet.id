/* eslint-disable @typescript-eslint/no-empty-function */
import React, { FunctionComponent } from "react";
import modalStyles from "../../styles/components/modalMessage.module.css";
import sendingLottie from "../../public/visuals/sendingLottie.json";
import Lottie from "lottie-react";
import Button from "./button";

const IsSendingTx: FunctionComponent = () => {
  return (
    <div className={modalStyles.menu}>
      <p className={modalStyles.menu_title}>
        Confirm the transaction in your wallet !
      </p>
      <div className="flex flex-col items-center justify-center text-center -mt-20 -mb-16">
        <Lottie style={{ width: "500px" }} animationData={sendingLottie} loop />
      </div>
      <div className="w-auto">
        <Button onClick={() => {}} disabled>
          Sending transaction
        </Button>
      </div>
    </div>
  );
};

export default IsSendingTx;

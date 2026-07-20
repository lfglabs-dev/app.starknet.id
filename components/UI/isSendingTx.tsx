import React, { type FunctionComponent } from "react";
import dynamic from "next/dynamic";
import Button from "./button";
import sendingLottie from "../../public/visuals/sendingLottie.json";
import modalStyles from "../../styles/components/modalMessage.module.css";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const IsSendingTx: FunctionComponent = () => (
  <div className={modalStyles.menu}>
    <p className={modalStyles.menu_title}>
      Confirm the transaction in your wallet !
    </p>
    <div className="flex flex-col items-center justify-center text-center -mt-20 -mb-16">
      <Lottie style={{ width: "500px" }} animationData={sendingLottie} loop />
    </div>
    <div className="w-auto">
      <Button onClick={() => undefined} disabled>
        Sending transaction
      </Button>
    </div>
  </div>
);

export default IsSendingTx;

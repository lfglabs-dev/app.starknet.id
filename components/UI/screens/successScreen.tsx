import React, { FunctionComponent } from "react";
import Button from "../button";
import Lottie from "lottie-react";
import verifiedLottie from "../../../public/visuals/verifiedLottie.json";

type SuccessScreenProps = {
  buttonText: string;
  onClick: () => void;
  successMessage: string;
};

const SuccessScreen: FunctionComponent<SuccessScreenProps> = ({
  buttonText,
  onClick,
  successMessage,
}) => {
  return (
    <div className="sm:w-2/3 w-5/5 flex flex-col justify-center items-center">
      <Lottie className="w-60" animationData={verifiedLottie} loop={false} />
      <h1 className="sm:text-5xl text-3xl">{successMessage}</h1>
      <div className="mt-8 flex justify-center">
        <Button onClick={onClick}>{buttonText}</Button>
      </div>
    </div>
  );
};

export default SuccessScreen;

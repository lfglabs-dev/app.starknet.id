import Image from "next/image";
import React, { FunctionComponent } from "react";
import Button from "../button";

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
    <div className="sm:w-2/3 w-5/5">
      <Image
        src="/visuals/StarknetIdLogo.png"
        height={300}
        width={300}
        alt="logo"
      />
      <h1 className="sm:text-5xl text-5xl">{successMessage}</h1>
      <div className="mt-8 flex justify-center">
        <Button onClick={onClick}>{buttonText}</Button>
      </div>
    </div>
  );
};

export default SuccessScreen;

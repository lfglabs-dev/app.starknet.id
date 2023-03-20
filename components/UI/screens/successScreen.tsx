import { useMediaQuery } from "@mui/material";
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
  const matches = useMediaQuery("(min-width:640px)");

  return (
    <div className="sm:w-2/3 w-5/5 flex flex-col justify-center items-center">
      <img
        src="/visuals/StarknetIdLogo.svg"
        height={matches ? 300 : 200}
        width={matches ? 300 : 200}
        alt="logo"
      />
      <h1 className="sm:text-5xl text-3xl">{successMessage}</h1>
      <div className="mt-8 flex justify-center">
        <Button onClick={onClick}>{buttonText}</Button>
      </div>
    </div>
  );
};

export default SuccessScreen;

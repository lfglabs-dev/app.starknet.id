import React, { FunctionComponent } from "react";
import Button from "../button";

type ErrorScreenProps = {
  buttonText?: string;
  onClick?: () => void;
  errorMessage?: string;
  imgSrc?: string;
};

const ErrorScreen: FunctionComponent<ErrorScreenProps> = ({
  buttonText,
  onClick,
  errorMessage,
  imgSrc,
}) => {
  return (
    <div className="sm:w-2/3 w-4/5 flex flex-col justify-center items-center">
      <img
        src={imgSrc ?? "/identicons/identicon_4.svg"}
        height={300}
        width={300}
        alt="error image"
      />
      <h1 className="sm:text-4xl text-3xl mt-10">
        {errorMessage ? errorMessage : "Shit ... an error occurred !"}
      </h1>
      {buttonText && onClick && (
        <div className="mt-8 flex justify-center">
          <Button onClick={onClick}>{buttonText}</Button>
        </div>
      )}
    </div>
  );
};

export default ErrorScreen;

import Image from "next/image";
import React, { FunctionComponent } from "react";
import Button from "../button";

type ErrorScreenProps = {
  buttonText: string;
  onClick: () => void;
  errorMessage?: string;
};

const ErrorScreen: FunctionComponent<ErrorScreenProps> = ({
  buttonText,
  onClick,
  errorMessage,
}) => {
  return (
    <div className="sm:w-2/3 w-4/5">
      <Image
        src="/identicons/identicon_4.svg"
        height={300}
        width={300}
        alt="error meme"
      />
      <h1 className="sm:text-5xl text-5xl mt-4">
        {errorMessage ? errorMessage : "Shit ... an error occurred !"}
      </h1>
      <div className="mt-8">
        <Button onClick={onClick}>{buttonText}</Button>
      </div>
    </div>
  );
};

export default ErrorScreen;

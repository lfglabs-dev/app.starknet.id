import Image from "next/image";
import React, { FunctionComponent } from "react";
import Button from "../button";

type ErrorScreenProps = {
  buttonText: string;
  onClick: () => void;
};

const ErrorScreen: FunctionComponent<ErrorScreenProps> = ({
  buttonText,
  onClick,
}) => {
  return (
    <>
      <Image
        src="https://i.ibb.co/PWQkkN9/error-Meme.gif"
        height={227}
        width={270}
        alt="error meme"
      />
      <h1 className="sm:text-5xl text-5xl mt-4">
        Shit ... an error occurred !
      </h1>
      <div className="mt-8">
        <Button onClick={onClick}>{buttonText}</Button>
      </div>
    </>
  );
};

export default ErrorScreen;

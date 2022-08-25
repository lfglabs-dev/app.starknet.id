import React, { FunctionComponent, useState } from "react";
import { MutatingDots } from "react-loader-spinner";

const LoadingScreen: FunctionComponent = () => {
  const [loadingMessageNumber, setLoadingMessageNumber] = useState<number>(0);
  const loadingMessages: string[] = [
    "Patience is a virtue, especially when it comes to ETH 2.0",
    "Ok it's slow but at least it does not stop like Solana",
    "I have no inspiration left ser, just wait.",
  ];

  setTimeout(() => {
    if (loadingMessageNumber != 2)
      setLoadingMessageNumber(loadingMessageNumber + 1);
  }, 10000);

  return (
    <>
      <h1 className="sm:text-5xl text-5xl">
        {loadingMessages[loadingMessageNumber]}
      </h1>
      <div className="mt-5">
        <MutatingDots
          height="100"
          width="100"
          color="#19AA6E"
          secondaryColor="#BF9E7B"
          ariaLabel="loading"
        />
      </div>
    </>
  );
};

export default LoadingScreen;

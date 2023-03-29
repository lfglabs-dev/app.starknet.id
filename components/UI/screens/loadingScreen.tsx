import React, { FunctionComponent, useState } from "react";
import { MutatingDots } from "react-loader-spinner";

const LoadingScreen: FunctionComponent = () => {
  const [loadingMessageNumber, setLoadingMessageNumber] = useState<number>(0);
  const loadingMessages: string[] = [
    "Patience is a virtue, especially when it comes to Starknet Alpha",
    "Patience is also a virtue when it comes to Starknet testnet",
    "Ok it's slow but at least it does not stop like Solana",
    "Just a few moments left sir",
    "Alright now it shouldn't be long",
  ];

  setTimeout(() => {
    if (loadingMessageNumber != loadingMessages.length - 1)
      setLoadingMessageNumber(loadingMessageNumber + 1);
  }, 15000);

  return (
    <div className="max-w-3xl">
      <h1 className="sm:text-5xl text-5xl mr-3 ml-3">
        {loadingMessages[loadingMessageNumber]}
      </h1>
      <div className="m-5 flex justify-center">
        <MutatingDots
          height="100"
          width="100"
          color="#19AA6E"
          secondaryColor="#BF9E7B"
          ariaLabel="loading"
        />
      </div>
    </div>
  );
};

export default LoadingScreen;

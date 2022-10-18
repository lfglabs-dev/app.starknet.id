import React, { useState } from "react";
import styles from "../styles/home.module.css";
import {
  useStarknet,
  useStarknetExecute,
  useTransactionManager,
} from "@starknet-react/core";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Button from "../components/UI/button";
import ErrorScreen from "../components/UI/screens/errorScreen";
import LoadingScreen from "../components/UI/screens/loadingScreen";
import { verifierContract } from "../hooks/contracts";
import SuccessScreen from "../components/UI/screens/successScreen";
import { stringToFelt, toFelt } from "../utils/felt";
import { Call } from "starknet/types";
import { RawCalldata } from "starknet";

export type Screen =
  | "verifyDiscord"
  | "loading"
  | "success"
  | "error"
  | "verifyTwitter"
  | "verifyGithub";

export default function Discord() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(true);
  const routerCode: string = router.query.code as string;
  //Server Sign Request
  const [signRequestData, setSignRequestData] = useState<any>();

  // Access localStorage
  const isServer = typeof window === "undefined";
  let tokenId: string | null;
  let calls;
  if (!isServer) {
    tokenId = window.sessionStorage.getItem("tokenId");
    calls = {
      contractAddress: verifierContract,
      entrypoint: "write_confirmation",
      calldata: [
        tokenId,
        Math.floor(Date.now() / 1000),
        stringToFelt("discord"),
        toFelt(signRequestData.user_id),
        [signRequestData.sign0, signRequestData.sign1],
      ],
    };
  }

  //Set discord code
  const [code, setCode] = useState<string>("");
  useEffect(() => {
    setCode(routerCode);
  }, [routerCode]);

  //Manage Connection
  const { account } = useStarknet();

  useEffect(() => {
    if (!account) {
      setIsConnected(false);
    } else {
      setIsConnected(true);
      setScreen("verifyDiscord");
    }
  }, [account]);

  useEffect(() => {
    if (!code || !tokenId) return;

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({
        type: "discord",
        token_id_low: Number(tokenId),
        token_id_high: 0,
        code: code,
      }),
    };

    fetch("https://goerli.verifier.starknet.id/sign", requestOptions)
      .then((response) => response.json())
      .then((data) => setSignRequestData(data));
  }, [code]);

  //Contract
  const {
    data: discordVerificationData,
    execute,
    error: discordVerificationError,
  } = useStarknetExecute({ calls });
  const { transactions } = useTransactionManager();

  function verifyDiscord() {
    execute();
  }

  //Screen management
  const [screen, setScreen] = useState<Screen | undefined>(undefined);

  useEffect(() => {
    for (const transaction of transactions)
      if (transaction.hash === discordVerificationData?.transaction_hash) {
        if (transaction.status === "TRANSACTION_RECEIVED") {
          setScreen("loading");
        }
        if (
          transaction.status === "ACCEPTED_ON_L2" ||
          transaction.status === "ACCEPTED_ON_L1"
        ) {
          setScreen("success");
        }
      }
  }, [discordVerificationData, transactions]);

  // Error Management
  useEffect(() => {
    if (signRequestData?.status === "error" || discordVerificationError) {
      setScreen("error");
    }
  }, [discordVerificationError, signRequestData]);

  const errorScreen = isConnected && screen === "error";

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        {screen === "verifyDiscord" &&
          (!isConnected ? (
            <h1 className="sm:text-5xl text-5xl">You need to connect anon</h1>
          ) : (
            <>
              <h1 className="sm:text-5xl text-5xl mt-4">
                It&apos;s time to verify your discord on chain !
              </h1>
              <div className="mt-8">
                <Button onClick={verifyDiscord}>Verify my Discord</Button>
              </div>
            </>
          ))}
        {screen === "loading" && <LoadingScreen />}
        {errorScreen && (
          <ErrorScreen
            onClick={() => router.push(`/identities/${tokenId}`)}
            buttonText="Retry to connect"
          />
        )}
        {screen === "success" && (
          <>
            <SuccessScreen
              onClick={() => router.push(`/identities/${tokenId}`)}
              buttonText="Get back to your starknet identity"
              successMessage="Congrats, your discord is verified !"
            />
          </>
        )}
      </div>
    </div>
  );
}

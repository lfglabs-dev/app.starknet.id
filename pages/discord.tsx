import React, { useState } from "react";
import styles from "../styles/Home.module.css";
import { useAccount, useStarknetExecute } from "@starknet-react/core";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Button from "../components/UI/button";
import ErrorScreen from "../components/UI/screens/errorScreen";
import LoadingScreen from "../components/UI/screens/loadingScreen";
import SuccessScreen from "../components/UI/screens/successScreen";
import { stringToFelt, toFelt } from "../utils/felt";
import BN from "bn.js";

export type Screen =
  | "verifyDiscord"
  | "loading"
  | "success"
  | "error"
  | "verifyTwitter"
  | "verifyGithub";

export type Calls = {
  contractAddress: string;
  entrypoint: string;
  calldata: (string | number | BN | any[] | undefined)[];
};

export default function Discord() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(true);
  const routerCode: string = router.query.code as string;
  //Server Sign Request
  const [signRequestData, setSignRequestData] = useState<any>();

  // Access localStorage
  const [tokenId, setTokenId] = useState<string>("");
  const [calls, setCalls] = useState<Calls | undefined>();

  useEffect(() => {
    setTokenId(window.sessionStorage.getItem("tokenId") ?? "");
    setCalls({
      contractAddress: process.env.VERIFIER_CONTRACT as string,
      entrypoint: "write_confirmation",
      calldata: [
        tokenId,
        Math.floor(Date.now() / 1000),
        stringToFelt("discord"),
        toFelt(signRequestData.user_id),
        [signRequestData.sign0, signRequestData.sign1],
      ],
    });
  }, []);

  //Set discord code
  const [code, setCode] = useState<string>("");
  useEffect(() => {
    setCode(routerCode);
  }, [routerCode]);

  //Manage Connection
  const { account } = useAccount();

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

    fetch(`https://${process.env.VERIFIER_LINK}/sign`, requestOptions)
      .then((response) => response.json())
      .then((data) => setSignRequestData(data));
  }, [code]);

  //Contract
  const {
    data: discordVerificationData,
    execute,
    error: discordVerificationError,
  } = useStarknetExecute({ calls });

  function verifyDiscord() {
    execute();
  }

  //Screen management
  const [screen, setScreen] = useState<Screen | undefined>(undefined);

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

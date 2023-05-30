import React, { useState } from "react";
import styles from "../styles/Home.module.css";
import {
  useAccount,
  useContractWrite,
  useWaitForTransaction,
} from "@starknet-react/core";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Button from "../components/UI/button";
import ErrorScreen from "../components/UI/screens/errorScreen";
import LoadingScreen from "../components/UI/screens/loadingScreen";
import SuccessScreen from "../components/UI/screens/successScreen";
import { stringToHex } from "../utils/feltService";
import { NextPage } from "next";

export type Screen =
  | "verifyDiscord"
  | "loading"
  | "success"
  | "error"
  | "verifyTwitter"
  | "verifyGithub";

type SignRequestData = {
  status: Status;
  username: string;
  user_id: number;
  sign0: string;
  sign1: string;
  timestamp: number;
  discriminator: string;
};

const Discord: NextPage = () => {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(true);
  const routerCode: string = router.query.code as string;
  //Server Sign Request
  const [signRequestData, setSignRequestData] = useState<
    SignRequestData | ErrorRequestData
  >();

  // Access localStorage
  const [tokenId, setTokenId] = useState<string>("");
  const [calls, setCalls] = useState<Calls | undefined>();

  useEffect(() => {
    if (!tokenId) {
      setTokenId(window.sessionStorage.getItem("tokenId") ?? "");
    }
  }, [tokenId]);

  useEffect(() => {
    if (!signRequestData || signRequestData.status === "error") return;

    setCalls({
      contractAddress: process.env.NEXT_PUBLIC_VERIFIER_CONTRACT as string,
      entrypoint: "write_confirmation",
      calldata: [
        tokenId,
        (signRequestData as SignRequestData).timestamp.toString(),
        stringToHex("discord"),
        (signRequestData as SignRequestData).user_id.toString(),
        (signRequestData as SignRequestData).sign0,
        (signRequestData as SignRequestData).sign1,
      ],
    });
  }, [signRequestData, tokenId]);

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
        token_id: Number(tokenId),
        code: code,
      }),
    };

    fetch(`${process.env.NEXT_PUBLIC_VERIFIER_LINK}/sign`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setSignRequestData(data);
      });
  }, [code, tokenId]);

  //Contract
  const {
    data: discordVerificationData,
    writeAsync: execute,
    error: discordVerificationError,
  } = useContractWrite({ calls });

  const { data: transactionData, error: transactionError } =
    useWaitForTransaction({
      hash: discordVerificationData?.transaction_hash,
      watch: true,
    });

  function verifyDiscord() {
    execute();
  }

  useEffect(() => {
    if (discordVerificationData?.transaction_hash) {
      if (
        transactionData?.status &&
        !transactionError &&
        !transactionData?.status.includes("ACCEPTED") &&
        transactionData?.status !== "PENDING"
      ) {
        setScreen("loading");
      } else if (transactionError) {
        setScreen("error");
      } else if (
        transactionData?.status === "ACCEPTED_ON_L2" ||
        transactionData?.status === "PENDING"
      ) {
        setScreen("success");
      }
    }
  }, [discordVerificationData, transactionData, transactionError]);

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
      <div className={styles.wrapperScreen}>
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
                  <Button disabled={Boolean(!calls)} onClick={verifyDiscord}>
                    Verify my Discord
                  </Button>
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
            <SuccessScreen
              onClick={() => router.push(`/identities/${tokenId}`)}
              buttonText="Get back to your starknet identity"
              successMessage="Congrats, your discord is verified !"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Discord;

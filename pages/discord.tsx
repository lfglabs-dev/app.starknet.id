import React, { useState } from "react";
import styles from "../styles/Home.module.css";
import {
  useAccount,
  useContractWrite,
  useTransactionManager,
  useWaitForTransaction,
} from "@starknet-react/core";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Button from "../components/UI/button";
import ErrorScreen from "../components/UI/screens/errorScreen";
import SuccessScreen from "../components/UI/screens/successScreen";
import { stringToHex } from "../utils/feltService";
import { NextPage } from "next";
import { posthog } from "posthog-js";
import TxConfirmationModal from "../components/UI/txConfirmationModal";
import { Call } from "starknet";

export type Screen =
  | "verifyDiscord"
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
  const { addTransaction } = useTransactionManager();

  // Access localStorage
  const [tokenId, setTokenId] = useState<string>("");
  const [calls, setCalls] = useState<Call | undefined>();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  useEffect(() => {
    if (!tokenId) {
      setTokenId(window.sessionStorage.getItem("tokenId") ?? "");
    }
  }, [tokenId]);

  useEffect(() => {
    if (!signRequestData) return;
    if (signRequestData.status === "error") {
      setScreen("error");
      return;
    }

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
        setIsTxModalOpen(true);
        posthog?.capture("discordVerificationTx");
        addTransaction({
          hash: discordVerificationData?.transaction_hash ?? "",
        });
      } else if (transactionError) {
        setScreen("error");
      }
    }
  }, [discordVerificationData, transactionData, transactionError]);

  //Screen management
  const [screen, setScreen] = useState<Screen>("verifyDiscord");

  // Error Management
  useEffect(() => {
    if (signRequestData?.status === "error" || discordVerificationError) {
      setScreen("error");
    }
  }, [discordVerificationError, signRequestData]);

  const errorScreen = isConnected && screen === "error";

  return (
    <div className={styles.screen}>
      <div className={`${styles.wrapperScreen} ${styles.verticalCenter}`}>
        <div className={styles.container}>
          {screen === "verifyDiscord" &&
            (!isConnected ? (
              <h1 className="sm:text-5xl text-5xl">You need to connect !</h1>
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
          {errorScreen && (
            <ErrorScreen
              onClick={() => router.push(`/identities/${tokenId}`)}
              buttonText="Retry to verify"
            />
          )}
        </div>
      </div>
      <TxConfirmationModal
        txHash={discordVerificationData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => {
          setIsTxModalOpen(false);
          router.push(`/identities/${tokenId}`);
        }}
        title="Your transaction is on it's way !"
      />
    </div>
  );
};

export default Discord;

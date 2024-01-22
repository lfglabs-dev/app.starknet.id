import React, { useState } from "react";
import styles from "../styles/Home.module.css";
import { useAccount, useContractWrite } from "@starknet-react/core";
import { useEffect } from "react";
import { useRouter } from "next/router";
import ErrorScreen from "../components/UI/screens/errorScreen";
import { NextPage } from "next";
import { posthog } from "posthog-js";
import { Call } from "starknet";
import VerifyFirstStep from "../components/verify/verifyFirstStep";
import identityChangeCalls from "../utils/callData/identityChangeCalls";
import { useNotificationManager } from "../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../utils/constants";
import TxConfirmationModal from "../components/UI/txConfirmationModal";

export type Screen =
  | "verifyDiscord"
  | "error"
  | "verifyTwitter"
  | "verifyGithub";

const Discord: NextPage = () => {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(true);
  const routerCode: string = router.query.code as string;
  //Server Sign Request
  const [signRequestData, setSignRequestData] = useState<
    DiscordSignRequestData | ErrorRequestData
  >();
  const { addTransaction } = useNotificationManager();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  // Access localStorage
  const [tokenId, setTokenId] = useState<string>("");
  const [calls, setCalls] = useState<Call | undefined>();

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

    setCalls(
      identityChangeCalls.writeVerifierData(
        process.env.NEXT_PUBLIC_VERIFIER_CONTRACT as string,
        tokenId,
        (signRequestData as DiscordSignRequestData).timestamp,
        "discord",
        (signRequestData as DiscordSignRequestData).user_id,
        [
          (signRequestData as DiscordSignRequestData).sign0,
          (signRequestData as DiscordSignRequestData).sign1,
        ]
      )
    );
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
  } = useContractWrite({ calls: [calls as Call] });

  function verifyDiscord() {
    execute();
  }

  useEffect(() => {
    if (!discordVerificationData?.transaction_hash) return;
    posthog?.capture("discordVerificationTx");

    addTransaction({
      timestamp: Date.now(),
      subtext: `Discord verification on Starknet ID #${tokenId}`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.VERIFIER_DISCORD,
        hash: discordVerificationData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxModalOpen(true);
    router.push(`/identities/${tokenId}`);
  }, [discordVerificationData?.transaction_hash]);

  //Screen management
  const [screen, setScreen] = useState<Screen>("verifyDiscord");

  // Error Management
  useEffect(() => {
    if (signRequestData?.status === "error" || discordVerificationError) {
      setScreen("error");
    }
  }, [discordVerificationError, signRequestData]);

  const errorScreen = isConnected && screen === "error";

  const closeModal = () => {
    setIsTxModalOpen(false);
    router.push(`/identities/${tokenId}`);
  };

  return (
    <>
      <div className={styles.screen}>
        <div className={styles.wrapperScreen}>
          <div className={styles.container}>
            {screen === "verifyDiscord" &&
              (!isConnected ? (
                <h1 className="sm:text-5xl text-5xl">You need to connect !</h1>
              ) : (
                <VerifyFirstStep
                  onClick={verifyDiscord}
                  disabled={Boolean(!calls)}
                  buttonLabel="Verify my Discord"
                  title="It's time to verify your discord on chain !"
                  subtitle="Safeguard your account with our network verification page"
                />
              ))}
            {errorScreen && (
              <ErrorScreen
                onClick={() => router.push(`/identities/${tokenId}`)}
                buttonText="Retry to verify"
              />
            )}
          </div>
        </div>
      </div>
      <TxConfirmationModal
        txHash={discordVerificationData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={closeModal}
        title="Your Github verification is ongoing !"
      />
    </>
  );
};

export default Discord;

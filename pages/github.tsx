import React, { useState } from "react";
import styles from "../styles/Home.module.css";
import { useAccount } from "@starknet-react/core";
import { useContractWrite } from "@/hooks/useContract";
import { useEffect } from "react";
import { useRouter } from "next/router";
import ErrorScreen from "../components/UI/screens/errorScreen";
import { Screen } from "./discord";
import { NextPage } from "next";
import { posthog } from "posthog-js";
import { Call } from "starknet";
import VerifyFirstStep from "../components/verify/verifyFirstStep";
import identityChangeCalls from "../utils/callData/identityChangeCalls";
import { useNotificationManager } from "../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../utils/constants";
import TxConfirmationModal from "../components/UI/txConfirmationModal";

const Github: NextPage = () => {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const routerCode: string = router.query.code as string;
  const [signRequestData, setSignRequestData] = useState<
    SignRequestData | ErrorRequestData
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
        (signRequestData as SignRequestData).timestamp,
        "github",
        (signRequestData as SignRequestData).user_id,
        [
          (signRequestData as SignRequestData).sign0,
          (signRequestData as SignRequestData).sign1,
        ]
      )
    );
  }, [signRequestData, tokenId]);

  //Manage Connection
  const { account } = useAccount();

  useEffect(() => {
    if (!account) {
      setIsConnected(false);
    } else {
      setIsConnected(true);
    }
  }, [account]);

  //Set github code
  const [code, setCode] = useState<string>("");
  useEffect(() => {
    setCode(routerCode);
  }, [routerCode]);

  useEffect(() => {
    if (!code || !tokenId) return;

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({
        type: "github",
        token_id: tokenId,
        code: code,
      }),
    };

    fetch(`${process.env.NEXT_PUBLIC_VERIFIER_LINK}/sign`, requestOptions)
      .then((response) => response.json())
      .then((data) => setSignRequestData(data));
  }, [code, tokenId]);

  //Contract
  const {
    data: githubVerificationData,
    writeAsync: execute,
    error: githubVerificationError,
  } = useContractWrite({ calls: [calls as Call] });

  function verifyGithub() {
    execute();
  }

  useEffect(() => {
    if (!githubVerificationData?.transaction_hash) return;
    posthog?.capture("githubVerificationTx");

    addTransaction({
      timestamp: Date.now(),
      subtext: `Github verification on Starknet ID #${tokenId}`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.VERIFIER_GITHUB,
        hash: githubVerificationData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxModalOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubVerificationData?.transaction_hash]); // We want this to run only when the tx is sent

  //Screen management
  const [screen, setScreen] = useState<Screen>("verifyGithub");

  // Error Management
  useEffect(() => {
    if (signRequestData?.status === "error" || githubVerificationError) {
      setScreen("error");
    }
  }, [githubVerificationError, signRequestData]);

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
            {screen === "verifyGithub" &&
              (!isConnected ? (
                <h1 className="sm:text-5xl text-5xl">
                  You need to connect anon
                </h1>
              ) : (
                <VerifyFirstStep
                  onClick={verifyGithub}
                  disabled={Boolean(!calls)}
                  buttonLabel="Verify my Github"
                  title="It's time to verify your github on chain !"
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
        txHash={githubVerificationData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={closeModal}
        title="Your Github verification is ongoing !"
      />
    </>
  );
};

export default Github;

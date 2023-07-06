import React, { useState } from "react";
import styles from "../styles/Home.module.css";
import {
  Call,
  useAccount,
  useContractWrite,
  useTransactionManager,
  useWaitForTransaction,
} from "@starknet-react/core";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Button from "../components/UI/button";
import ErrorScreen from "../components/UI/screens/errorScreen";
import { Screen } from "./discord";
import { stringToHex } from "../utils/feltService";
import { NextPage } from "next";
import { posthog } from "posthog-js";
import TxConfirmationModal from "../components/UI/txConfirmationModal";

type SignRequestData = {
  status: Status;
  name: string;
  user_id: string;
  sign0: string;
  sign1: string;
  timestamp: number;
};

const Github: NextPage = () => {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const routerCode: string = router.query.code as string;
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
        stringToHex("github"),
        (signRequestData as SignRequestData).user_id,
        (signRequestData as SignRequestData).sign0,
        (signRequestData as SignRequestData).sign1,
      ],
    });
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

  //Set discord code
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
  } = useContractWrite({ calls });

  const { data: transactionData, error: transactionError } =
    useWaitForTransaction({
      hash: githubVerificationData?.transaction_hash,
      watch: true,
    });

  function verifyGithub() {
    execute();
  }

  useEffect(() => {
    if (githubVerificationData?.transaction_hash) {
      if (
        transactionData?.status &&
        !transactionError &&
        !transactionData?.status.includes("ACCEPTED") &&
        transactionData?.status !== "PENDING"
      ) {
        setIsTxModalOpen(true);
        posthog?.capture("githubVerificationTx");
        addTransaction({
          hash: githubVerificationData?.transaction_hash ?? "",
        });
      } else if (transactionError) {
        setScreen("error");
      }
    }
  }, [githubVerificationData, transactionData, transactionError]);

  //Screen management
  const [screen, setScreen] = useState<Screen>("verifyGithub");

  // Error Management
  useEffect(() => {
    if (signRequestData?.status === "error" || githubVerificationError) {
      setScreen("error");
    }
  }, [githubVerificationError, signRequestData]);

  const errorScreen = isConnected && screen === "error";

  return (
    <div className={styles.screen}>
      <div className={styles.wrapperScreen}>
        <div className={styles.container}>
          {screen === "verifyGithub" &&
            (!isConnected ? (
              <h1 className="sm:text-5xl text-5xl">You need to connect anon</h1>
            ) : (
              <>
                <h1 className="sm:text-5xl text-5xl mt-4">
                  It&apos;s time to verify your github on chain !
                </h1>
                <div className="mt-8">
                  <Button disabled={Boolean(!calls)} onClick={verifyGithub}>
                    Verify my github
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
          <TxConfirmationModal
            txHash={githubVerificationData?.transaction_hash}
            isTxModalOpen={isTxModalOpen}
            closeModal={() => {
              setIsTxModalOpen(false);
              router.push(`/identities/${tokenId}`);
            }}
            title="Your transaction is on it's way !"
          />
        </div>
      </div>
    </div>
  );
};

export default Github;

import React, { useState } from "react";
import homeStyles from "../styles/Home.module.css";
import {
  useAccount,
  useContractWrite,
  useTransactionManager,
  useWaitForTransaction,
} from "@starknet-react/core";
import { useEffect } from "react";
import { useRouter } from "next/router";
import ErrorScreen from "../components/UI/screens/errorScreen";
import { Screen } from "./discord";
import { NextPage } from "next";
import { posthog } from "posthog-js";
import { Call } from "starknet";
import VerifyFirstStep from "../components/verify/verifyFirstStep";
import identityChangeCalls from "../utils/callData/identityChangeCalls";

const Twitter: NextPage = () => {
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
        tokenId,
        (signRequestData as SignRequestData).timestamp,
        "twitter",
        (signRequestData as SignRequestData).user_id,
        [
          (signRequestData as SignRequestData).sign0,
          (signRequestData as SignRequestData).sign1,
        ]
      )
    );
  }, [signRequestData, tokenId]);

  // ["", "0x74776974746572", "0", [null, null]];

  //Manage Connection
  const { account } = useAccount();

  useEffect(() => {
    if (!account) {
      setIsConnected(false);
    } else {
      setIsConnected(true);
    }
  }, [account]);

  //Set twitter code
  const [code, setCode] = useState<string>("");
  useEffect(() => {
    setCode(routerCode);
  }, [routerCode]);

  useEffect(() => {
    if (!code || !tokenId) return;

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({
        type: "twitter",
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
    data: twitterVerificationData,
    writeAsync: execute,
    error: twitterVerificationError,
  } = useContractWrite({ calls });

  const { data: transactionData, error: transactionError } =
    useWaitForTransaction({
      hash: twitterVerificationData?.transaction_hash,
      watch: true,
    });

  function verifyTwitter() {
    execute();
  }

  useEffect(() => {
    if (twitterVerificationData?.transaction_hash) {
      if (
        transactionData?.status &&
        !transactionError &&
        !transactionData?.status.includes("ACCEPTED") &&
        transactionData?.status !== "PENDING"
      ) {
        posthog?.capture("twitterVerificationTx");
        addTransaction({
          hash: twitterVerificationData?.transaction_hash ?? "",
        });
        router.push(`/identities/${tokenId}`);
      } else if (transactionError) {
        setScreen("error");
      }
    }
  }, [twitterVerificationData, transactionData, transactionError]);

  //Screen management
  const [screen, setScreen] = useState<Screen>("verifyTwitter");

  // Error Management
  useEffect(() => {
    if (signRequestData?.status === "error" || twitterVerificationError) {
      setScreen("error");
    }
  }, [twitterVerificationError, signRequestData]);

  const errorScreen = isConnected && screen === "error";

  return (
    <div className={homeStyles.screen}>
      <div className={homeStyles.wrapperScreen}>
        <div className={homeStyles.container}>
          {screen === "verifyTwitter" &&
            (!isConnected ? (
              <h1 className="sm:text-5xl text-5xl">You need to connect anon</h1>
            ) : (
              <VerifyFirstStep
                onClick={verifyTwitter}
                disabled={Boolean(!calls)}
                buttonLabel="Verify my Twitter"
                title="It's time to verify your twitter on chain !"
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
  );
};

export default Twitter;

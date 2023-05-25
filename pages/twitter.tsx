import React, { useState } from "react";
import styles from "../styles/Home.module.css";
import {
  Call,
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
import { Screen } from "./discord";
import { NextPage } from "next";
import { stringToHex } from "../utils/feltService";

type SignRequestData = {
  status: Status;
  name: string;
  user_id: string;
  sign0: string;
  sign1: string;
  timestamp: number;
};

const Twitter: NextPage = () => {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const routerCode: string = router.query.code as string;
  const [signRequestData, setSignRequestData] = useState<
    SignRequestData | ErrorRequestData
  >();

  // Access localStorage
  const [tokenId, setTokenId] = useState<string>("");
  const [calls, setCalls] = useState<Call | undefined>();

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
        stringToHex("twitter"),
        (signRequestData as SignRequestData).user_id.toString(),
        (signRequestData as SignRequestData).sign0,
        (signRequestData as SignRequestData).sign1,
      ],
    });
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
    <div className={styles.screen}>
      <div className={styles.wrapperScreen}>
        <div className={styles.container}>
          {screen === "verifyTwitter" &&
            (!isConnected ? (
              <h1 className="sm:text-5xl text-5xl">You need to connect anon</h1>
            ) : (
              <>
                <h1 className="sm:text-5xl text-5xl mt-4">
                  It&apos;s time to verify your twitter on chain !
                </h1>
                <div className="mt-8">
                  <Button onClick={verifyTwitter}>Verify my Twitter</Button>
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
                successMessage="Congrats, your twitter is verified !"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Twitter;

import React, { useState } from "react";
import styles from "../styles/home.module.css";
import {
  useStarknetExecute,
  useTransactionManager,
  useAccount,
} from "@starknet-react/core";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Button from "../components/UI/button";
import ErrorScreen from "../components/UI/screens/errorScreen";
import LoadingScreen from "../components/UI/screens/loadingScreen";
import { verifierContract } from "../hooks/contracts";
import SuccessScreen from "../components/UI/screens/successScreen";
import { stringToFelt } from "../utils/felt";
import { Calls, Screen } from "./discord";

export default function Github() {
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
      contractAddress: verifierContract,
      entrypoint: "write_confirmation",
      calldata: [
        tokenId,
        Math.floor(Date.now() / 1000),
        stringToFelt("github"),
        stringToFelt(signRequestData.user_id),
        [signRequestData.sign0, signRequestData.sign1],
      ],
    });
  }, []);

  //Set github code
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
      setScreen("verifyGithub");
    }
  }, [account]);

  useEffect(() => {
    if (!code || !tokenId) return;

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({
        type: "github",
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
    data: githubVerificationData,
    execute,
    error: githubVerificationError,
  } = useStarknetExecute({ calls });
  const { transactions } = useTransactionManager();

  function verifyGithub() {
    execute();
  }

  //Screen management
  const [screen, setScreen] = useState<Screen | undefined>();

  // Error Management
  useEffect(() => {
    if (signRequestData?.status === "error" || githubVerificationError) {
      setScreen("error");
    }
  }, [githubVerificationError, signRequestData]);

  const errorScreen = isConnected && screen === "error";

  return (
    <div className={styles.screen}>
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
                <Button onClick={verifyGithub}>Verify my Github</Button>
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
              successMessage="Congrats, your github is verified !"
            />
            {/* <p className="mt-2">
              <a
                className="footerLink"
                href={`https://alpha4.starknet.io/feeder_gateway/get_transaction_receipt?transactionHash=${verifyData?.txid}`}
              >
                Check your transaction state
              </a>
            </p> */}
          </>
        )}
      </div>
    </div>
  );
}

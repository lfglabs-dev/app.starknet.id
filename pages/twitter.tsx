import React, { useState } from "react";
import Head from "next/head";
import styles from "../styles/home.module.css";
import {
  useStarknet,
  useConnectors,
  useStarknetInvoke,
  useStarknetTransactionManager,
} from "@starknet-react/core";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Button from "../components/UI/button";
import ErrorScreen from "../components/UI/screens/errorScreen";
import LoadingScreen from "../components/UI/screens/loadingScreen";
import { useVerifierIdContract } from "../hooks/contracts";
import SuccessScreen from "../components/UI/screens/successScreen";
import { stringToFelt, toFelt } from "../utils/felt";
import Wallets from "../components/UI/wallets";
import { Screen } from "./discord";

export default function Twitter() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(true);
  const [hasWallet, setHasWallet] = useState(false);
  const routerCode: string = router.query.code as string;

  // Access localStorage
  const isServer = typeof window === "undefined";
  let tokenId: string | null;

  if (!isServer) {
    tokenId = window.sessionStorage.getItem("tokenId");
  }

  //Set twitter code
  const [code, setCode] = useState<string>("");
  useEffect(() => {
    setCode(routerCode);
  }, [routerCode]);

  //Manage Connection
  const { connect, connectors, available } = useConnectors();
  const { account } = useStarknet();

  useEffect(() => {
    if (!account) {
      setIsConnected(false);
    } else {
      setIsConnected(true);
      setScreen("verifyTwitter");
    }
  }, [account]);

  //Server Sign Request
  const [signRequestData, setSignRequestData] = useState<any>();

  useEffect(() => {
    if (!code || !tokenId) return;

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({
        type: "twitter",
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
  const { contract } = useVerifierIdContract();
  const {
    data: twitterVerificationData,
    invoke,
    error: twitterVerificationError,
  } = useStarknetInvoke({
    contract: contract,
    method: "write_confirmation",
  });
  const { transactions } = useStarknetTransactionManager();

  function verifyTwitter() {
    invoke({
      args: [
        [tokenId, 0],
        stringToFelt("twitter"),
        toFelt(signRequestData.user_id),
        [signRequestData.sign0, signRequestData.sign1],
      ],
    });
  }

  //Screen management
  const [screen, setScreen] = useState<Screen | undefined>();

  useEffect(() => {
    for (const transaction of transactions)
      if (transaction.transactionHash === twitterVerificationData) {
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
  }, [twitterVerificationData, transactions]);

  // Error Management
  useEffect(() => {
    if (signRequestData?.status === "error" || twitterVerificationError) {
      setScreen("error");
    }
  }, [twitterVerificationError, signRequestData]);

  const errorScreen = isConnected && screen === "error";

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        {!isConnected &&
          connectors.map((connector) =>
            connector.available() && connector.options.id === "argent-x" ? (
              <>
                {hasWallet ? (
                  <Wallets close={() => setHasWallet(false)} />
                ) : null}
                <h1 className="sm:text-5xl text-5xl">
                  You need to connect anon
                </h1>
                <div className="mt-8">
                  <Button
                    onClick={() =>
                      available.length === 1
                        ? connect(available[0])
                        : setHasWallet(true)
                    }
                  >
                    Connect Wallet
                  </Button>
                </div>
              </>
            ) : null
          )}
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
        {screen === "verifyTwitter" && (
          <>
            <h1 className="sm:text-5xl text-5xl mt-4">
              It&apos;s time to verify your twitter on chain !
            </h1>
            <div className="mt-8">
              <Button onClick={verifyTwitter}>Verify my Twitter</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import React from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import {
  useAccount,
  useContractWrite,
  useTransactionManager,
  useWaitForTransaction,
} from "@starknet-react/core";
import { useEffect, useState } from "react";
import IdentitiesGallery from "../components/identities/identitiesGalleryV1";
import MintIdentity from "../components/identities/mintIdentity";
import { useRouter } from "next/router";
import LoadingScreen from "../components/UI/screens/loadingScreen";
import ErrorScreen from "../components/UI/screens/errorScreen";
import SuccessScreen from "../components/UI/screens/successScreen";
import { hexToDecimal } from "../utils/feltService";
import IdentitiesSkeleton from "../components/identities/identitiesSkeleton";

const Identities: NextPage = () => {
  const { account } = useAccount();
  const [loading, setLoading] = useState<boolean>(false);
  const [ownedIdentities, setOwnedIdentities] = useState<FullId[]>([]);
  const [externalDomains, setExternalDomains] = useState<string[]>([]);
  const randomTokenId: number = Math.floor(Math.random() * 1000000000000);
  const router = useRouter();
  const { addTransaction } = useTransactionManager();
  const [screen, setScreen] = useState<ScreenState>("mint");

  //Mint
  const callData = {
    contractAddress: process.env.NEXT_PUBLIC_STARKNETID_CONTRACT as string,
    entrypoint: "mint",
    calldata: [randomTokenId],
  };
  const { writeAsync: execute, data: mintData } = useContractWrite({
    calls: callData,
  });

  const { data: transactionData, isError } = useWaitForTransaction({
    hash: mintData?.transaction_hash,
    watch: true,
  });

  useEffect(() => {
    if (isError) {
      setScreen("error");
    } else if (transactionData?.status === "RECEIVED") {
      addTransaction({ hash: mintData?.transaction_hash ?? "" });
      setScreen("loading");
    } else if (
      transactionData?.status === "PENDING" ||
      transactionData?.status === "ACCEPTED_ON_L2" ||
      transactionData?.status === "ACCEPTED_ON_L1"
    ) {
      setScreen("success");
    }
  }, [isError, transactionData]);

  useEffect(() => {
    if (account) {
      // Our Indexer
      setLoading(true);
      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/addr_to_full_ids?addr=${hexToDecimal(account.address)}`
      )
        .then((response) => response.json())
        .then((data) => {
          setOwnedIdentities(data.full_ids);
        });

      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/addr_to_external_domains?addr=${hexToDecimal(account.address)}`
      )
        .then((response) => response.json())
        .then((data: ExternalDomains) => {
          setExternalDomains(data.domains);
          setLoading(false);
        });
    }

    // // Aspect Indexer
    // fetch(
    //   `https://api-testnet.aspect.co/api/v0/assets?contract_address=${process.env.NEXT_PUBLIC_STARKNETID_CONTRACT as string}&owner_address=${account.address}&sort_by=minted_at&order_by=desc`
    // )
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setOwnedIdentities(data.assets);
    //   });
  }, [account, router.asPath]);

  function mint() {
    execute();
  }

  return (
    <div className={styles.screen}>
      <div className="firstLeavesGroup">
        <img width="100%" alt="leaf" src="/leaves/new/leavesGroup02.svg" />
      </div>
      <div className="secondLeavesGroup">
        <img width="100%" alt="leaf" src="/leaves/new/leavesGroup01.svg" />
      </div>
      <div
        className={
          screen === "mint" ? styles.container : styles.containerScreen
        }
      >
        {screen === "mint" ? (
          <>
            <h1 className="title">Your Starknet identities</h1>
            <div className={styles.containerGallery}>
              {loading ? (
                <IdentitiesSkeleton />
              ) : (
                <IdentitiesGallery
                  identities={ownedIdentities}
                  externalDomains={externalDomains}
                />
              )}
              <MintIdentity onClick={() => mint()} />
            </div>
          </>
        ) : (
          <>
            {screen === "loading" && <LoadingScreen />}
            {screen === "error" && (
              <ErrorScreen
                onClick={() => router.reload()}
                buttonText="Retry to mint"
              />
            )}
            {screen == "success" && (
              <SuccessScreen
                onClick={() => router.push(`/`)}
                buttonText="Get a domain to your identity"
                successMessage="Congrats, your starknet identity is minted !"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Identities;

/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import styles from "../styles/home.module.css";
import {
  useAccount,
  useStarknetExecute,
  useTransactionReceipt,
} from "@starknet-react/core";
import { useEffect, useState } from "react";
import IdentitiesGallery from "../components/identities/identitiesGalleryV1";
import MintIdentity from "../components/identities/mintIdentity";
import { useRouter } from "next/router";
import { starknetIdContract } from "../hooks/contracts";
import LoadingScreen from "../components/UI/screens/loadingScreen";
import ErrorScreen from "../components/UI/screens/errorScreen";
import SuccessScreen from "../components/UI/screens/successScreen";
import { hexToFelt } from "../utils/felt";
import { useEncoded } from "../hooks/naming";

const Home: NextPage = () => {
  const { account } = useAccount();
  const [ownedIdentities, setOwnedIdentities] = useState<number[]>([]);
  const [rightTokenId, setRightTokenId] = useState<number | undefined>(
    undefined
  );
  const randomTokenId: number = Math.floor(Math.random() * 1000000000000);
  const router = useRouter();
  const [minted, setMinted] = useState<boolean>(false);

  //Mint
  const callData = {
    contractAddress: starknetIdContract,
    entrypoint: "mint",
    calldata: [randomTokenId],
  };
  const { execute, data: mintData } = useStarknetExecute({
    calls: callData,
  });

  function mint() {
    execute();
    setRightTokenId(randomTokenId);
  }
  const {
    data,
    loading,
    error: transactionError,
  } = useTransactionReceipt({ hash: mintData?.transaction_hash, watch: true });

  useEffect(() => {
    if (account) {
      // Our Indexer
      fetch(
        `https://goerli.indexer2.starknet.id/addr_to_ids?addr=${hexToFelt(
          account.address
        )?.replace("0x", "")}`
      )
        .then((response) => response.json())
        .then((data) => {
          const dataFiltered = data.ids.filter(
            (element: string, index: number) => {
              return data.ids.indexOf(element) === index;
            }
          );
          setOwnedIdentities(dataFiltered);
        });

      // // Aspect Indexer
      // fetch(
      //   `https://api-testnet.aspect.co/api/v0/assets?contract_address=${starknetIdContract}&owner_address=${account.address}&sort_by=minted_at&order_by=desc`
      // )
      //   .then((response) => response.json())
      //   .then((data) => {
      //     setOwnedIdentities(data.assets);
      //   });
    }
  }, [account]);

  return (
    <div className={styles.screen}>
      <div className={styles.firstLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_2.png" />
      </div>
      <div className={styles.secondLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_1.png" />
      </div>
      <div className={styles.container}>
        <>
          {!mintData?.transaction_hash ? (
            <>
              <h1 className="title">Your Starknet identities</h1>
              <div className={styles.containerGallery}>
                <IdentitiesGallery identities={ownedIdentities} />
                <MintIdentity onClick={() => mint()} />
              </div>
            </>
          ) : (
            <>
              {data?.status &&
                !transactionError &&
                !data?.status.includes("ACCEPTED") && <LoadingScreen />}
              {transactionError && (
                <ErrorScreen
                  onClick={() => setMinted(false)}
                  buttonText="Retry to mint"
                />
              )}
              {data?.status === "ACCEPTED_ON_L2" && (
                <SuccessScreen
                  onClick={() => router.push(`/identities/${rightTokenId}`)}
                  buttonText="See your new identity"
                  successMessage="Congrats, your starknet identity is minted !"
                />
              )}
            </>
          )}
        </>
      </div>
    </div>
  );
};

export default Home;

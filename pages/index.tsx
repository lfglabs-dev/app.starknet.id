/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import styles from "../styles/home.module.css";
import {
  useConnectors,
  useStarknet,
  InjectedConnector,
  useStarknetInvoke,
  useStarknetTransactionManager,
} from "@starknet-react/core";
import { useEffect, useState } from "react";
import IdentitiesGallery, {
  Identity,
} from "../components/identities/identitiesGalleryV1";
import MintIdentity from "../components/identities/mintIdentity";
import { useRouter } from "next/router";
import { useStarknetIdContract } from "../hooks/contracts";
import LoadingScreen from "../components/UI/screens/loadingScreen";
import ErrorScreen from "../components/UI/screens/errorScreen";
import SuccessScreen from "../components/UI/screens/successScreen";

const Home: NextPage = () => {
  const { account } = useStarknet();
  const [ownedIdentities, setOwnedIdentities] = useState([]);
  const [rightTokenId, setRightTokenId] = useState<number | undefined>(
    undefined
  );
  const [minted, setMinted] = useState("false");
  const [randomTokenId, setRandomTokenId] = useState(
    Math.floor(Math.random() * 1000000000000)
  );
  const router = useRouter();

  //Contract
  const { contract } = useStarknetIdContract();

  //Mint
  const {
    data: mintData,
    invoke,
    error,
  } = useStarknetInvoke({
    contract: contract,
    method: "mint",
  });
  const { transactions } = useStarknetTransactionManager();

  function mint() {
    invoke({
      args: [[randomTokenId, 0]],
    });
    setRightTokenId(randomTokenId);
  }

  function generateNewTokenId() {
    setRandomTokenId(Math.floor(Math.random() * 1000000000000));
  }

  useEffect(() => {
    if (account) {
      fetch(
        `https://api-testnet.aspect.co/api/v0/assets?contract_address=0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b&owner_address=${account}&sort_by=minted_at&order_by=desc`
      )
        .then((response) => response.json())
        .then((data) => setOwnedIdentities(data.assets));
    }
  }, [account]);

  useEffect(() => {
    for (const transaction of transactions)
      if (transaction.transactionHash === mintData) {
        if (transaction.status === "TRANSACTION_RECEIVED") {
          setMinted("loading");
        }
        if (
          transaction.status === "ACCEPTED_ON_L2" ||
          transaction.status === "ACCEPTED_ON_L1"
        ) {
          setMinted("true");
        }
      }
  }, [router, contract, mintData, transactions, error]);

  return (
    <div className={styles.screen}>
      <div className={styles.firstLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_2.png" />
      </div>
      <div className={styles.secondLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_1.png" />
      </div>
      <div className={styles.container}>
        {minted === "false" && (
          <>
            <h1 className={styles.title}>Your Starknet identities</h1>
            <div className={styles.containerGallery}>
              <IdentitiesGallery identities={ownedIdentities as Identity[]} />
              <MintIdentity onClick={() => mint()} />
            </div>
          </>
        )}
        {minted === "loading" && !error && <LoadingScreen />}
        {error && minted === "loading" && (
          <ErrorScreen
            onClick={() => setMinted("false")}
            buttonText="Retry to mint"
          />
        )}
        {minted === "true" && (
          <SuccessScreen
            onClick={() => router.push(`/identities/${rightTokenId}`)}
            buttonText="Verify your discord"
            successMessage="Congrats, your starknet identity is minted !"
          />
        )}
      </div>
    </div>
  );
};

export default Home;

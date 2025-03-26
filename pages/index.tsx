import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import {
  useStarknet,
  useStarknetInvoke,
  useStarknetTransactionManager,
} from "@starknet-react/core";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useStarknetIdContract } from "../hooks/contracts";

const Home: NextPage = () => {
  const { account } = useStarknet();
  const [ownedIdentities, setOwnedIdentities] = useState<number[]>([]);
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

  useEffect(() => {
    if (account) {
      // // Our Indexer
      // fetch(
      //   `https://goerli.indexer.starknet.id/addr_to_ids?addr=${hexToFelt(
      //     account
      //   )?.replace("0x", "")}`
      // )
      //   .then((response) => response.json())
      //   .then((data) => {
      //     const dataFiltered = data.ids.filter(
      //       (element: string, index: number) => {
      //         return data.ids.indexOf(element) === index;
      //       }
      //     );
      //     setOwnedIdentities(dataFiltered);
      //   });

      // Aspect Indexer
      fetch(
        `https://api-testnet.aspect.co/api/v0/assets?contract_address=0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b&owner_address=${account}&sort_by=minted_at&order_by=desc`
      )
        .then((response) => response.json())
        .then((data) => {
          setOwnedIdentities(data.assets);
        });
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
    <div className={homeStyles.screen}>
      <div className={homeStyles.wrapperScreen}>
        <div className={styles.container}>
          <div className={styles.searchBarContainer}>
            <div className="flex flex-col">
              <h1 className="title">Choose your Stark Domain</h1>
              <p className="description">
                Your name, seamlessly connecting you to the entire ecosystem.
              </p>
            </div>
            <SearchBar showHistory />
            <NewsContainer
              title="Starknet x Solana"
              desc="Stark domains holders can get a Solana domain for free !"
              logo="/solana/bonfida.webp"
              link="https://sns.id/starknet"
              startDate={solanaEndDates.solanaOnStarknet}
              endDate={solanaEndDates.starknetOnSolana}
            />
          </div>
          <img
            src="/visuals/domainVisual.webp"
            className={styles.illustration}
          />
        </div>
      </div>
    </div>
  );
};

export default Domain;

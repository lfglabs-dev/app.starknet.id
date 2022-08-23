/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import styles from "../styles/home.module.css";
import styles2 from "../styles/domain.module.css";
import { useStarknet } from "@starknet-react/core";
import { useRouter } from "next/router";
import SearchBar from "../components/UI/searchBar";

const Domain: NextPage = () => {
  // const { account } = useStarknet();
  const router = useRouter();

  return (
    <div className={styles.screen}>
      <div className={styles.firstLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_2.png" />
      </div>
      <div className={styles.secondLeaf}>
        <img width="100%" alt="leaf" src="/leaves/leaf_1.png" />
      </div>
      <div className={styles.container}>
        <div className={styles2.searchBarContainer}>
          <h1 className={styles.title}>Choose your .stark domain</h1>
          <div className="min-w-content mx-5 mt-5 flex justify-center align-center">
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Domain;

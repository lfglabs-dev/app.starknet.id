import React from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/domain.module.css";
import SearchBar from "../components/UI/searchBar";

const Domain: NextPage = () => {
  return (
    <div className={homeStyles.screen}>
      <div className={homeStyles.wrapperScreen}>
        <div className={styles.container}>
          <img
            src="https://www.starknet.id/visuals/affiliates/affiliationIllu.webp"
            width={250}
            height={250}
          />
          <div className="max-w-lg flex flex-col items-center justify-center">
            <h1 className="title">Choose your Stark Domain</h1>
            <p className="description">
              Your unified profile across the starknet ecosystem, one name for
              all your Starknet on-chain identity.
            </p>
          </div>

          <div className={styles.searchBarContainer}>
            <SearchBar showHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Domain;

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
          <div className="max-w-xl flex flex-col items-start justify-start gap-5 mx-5 mb-5">
            <div className="flex flex-col justify-start items-start">
              <h1 className="title">Choose your Stark Domain</h1>
              <p className="description">
                Your unified profile across the starknet ecosystem, one name for
                all your Starknet on-chain identity.
              </p>
            </div>
            <SearchBar showHistory />
          </div>
          <img
            src="https://www.starknet.id/visuals/affiliates/affiliationIllu.webp"
            className={styles.illustration}
          />
        </div>
      </div>
    </div>
  );
};

export default Domain;

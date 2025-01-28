import React from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/domain.module.css";
import SearchBar from "../components/UI/searchBar";
import NewsContainer from "@/components/UI/newsContainer";
import { solanaEndDates } from "./solana";

const Domain: NextPage = () => {
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

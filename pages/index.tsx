import React from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/domain.module.css";
import SearchBar from "../components/UI/searchBar";
import { CDNImg } from "../components/cdn/image";

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
          </div>
          <CDNImg
            src="/visuals/domainVisual.webp"
            className={styles.illustration}
          />
        </div>
      </div>
    </div>
  );
};

export default Domain;

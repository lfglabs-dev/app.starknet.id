import React from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import styles2 from "../styles/domain.module.css";
import SearchBar from "../components/UI/searchBar";

const Domain: NextPage = () => {
  return (
    <div className={styles.screen}>
      <div className={styles.wrapperScreen}>
        <div className="firstLeavesGroup">
          <img width="100%" alt="leaf" src="/leaves/new/leavesGroup02.svg" />
        </div>
        <div className="secondLeavesGroup">
          <img width="100%" alt="leaf" src="/leaves/new/leavesGroup01.svg" />
        </div>
        <div className={styles2.containerSearch}>
          <div className={styles2.searchBarContainer}>
            <div className="flex flex-col items-center">
              <img
                src="/visuals/StarknetIdLogo.svg"
                height={250}
                width={250}
                alt="logo"
              />
            </div>
            <h1 className="title">Choose your .stark domain</h1>
            <div className="min-w-content mt-5 flex justify-center align-center">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Domain;

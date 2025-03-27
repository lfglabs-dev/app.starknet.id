import React from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/search.module.css";
import AutoRenewal from "../components/domains/autorenewal";

const AutoRenewalPage: NextPage = () => {
  return (
    <div className={homeStyles.screen}>
      <div className={styles.container}>
        <AutoRenewal />
      </div>
    </div>
  );
};

export default AutoRenewalPage;
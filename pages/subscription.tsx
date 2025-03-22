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

        {/* Cancel Subscription Button */}
        <div className={styles.cancelContainer}>
          <button className={styles.cancelButton}>Cancel Subscription</button>
        </div>
      </div>
    </div>
  );
};

export default AutoRenewalPage;

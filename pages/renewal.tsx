import React from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/search.module.css";
import Renewal from "../components/domains/renewal";

const RenewalPage: NextPage = () => {
  return (
    <div className={homeStyles.screen}>
      <div className={styles.container}>
        <Renewal groups={[process.env.NEXT_PUBLIC_MAILING_LIST_GROUP ?? ""]} />
      </div>
    </div>
  );
};

export default RenewalPage;

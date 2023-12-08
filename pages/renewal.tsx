import React from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/search.module.css";
import Renewal from "../components/domains/renewal";
import posthog from "posthog-js";

const RenewalPage: NextPage = () => {
  posthog.capture("$pageview");

  return (
    <div className={homeStyles.screen}>
      <div className={styles.container}>
        <Renewal
          groups={[
            process.env.NEXT_PUBLIC_MAILING_LIST_GROUP_AUTO_RENEWAL ?? "",
          ]}
        />
      </div>
    </div>
  );
};

export default RenewalPage;

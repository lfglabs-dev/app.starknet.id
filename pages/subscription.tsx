import React from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import styles from "../styles/search.module.css";
import AutoRenewal from "../components/domains/autorenewal";
import registerV2Styles from "../styles/components/registerV2.module.css";
import SubscriptionStatus from "@/components/UI/SubscriptionStatus";

const AutoRenewalPage: NextPage = () => {
  return (
    <div className={`${homeStyles.screen} ${registerV2Styles.subscriptionScreen}`}>
      <div className={styles.container}>
        <AutoRenewal />
        <SubscriptionStatus/>
      </div>
    </div>
  );
};

export default AutoRenewalPage;

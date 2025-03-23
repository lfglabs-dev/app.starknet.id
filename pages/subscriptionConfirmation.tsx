import React from "react";
import { NextPage } from "next";
import styles from "../styles/components/confirmation.module.css";

const SubscriptionConfirmation: NextPage = () => {
  return (
    <>
      <div className={styles.container}>
        <div>
          <div className={styles.title}>
            Your subscription is <br className="hidden sm:block" />
            <span className={styles.highlight}>active!</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionConfirmation;

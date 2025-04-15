import React from "react";
import styles from "../../../styles/components/identityMenu.module.css";

function ActiveSubscriptionCard() {
  return (
      <div className={styles.subscriptionSecondary}>
        <div className="flex flex-col items-center justify-center mt-3">
        <h1 className="font-quickZap font-normal text-[14px] text-center text-[#454545] uppercase">Your Subscription is Active</h1>
        </div>

      </div>
  );
}

export default ActiveSubscriptionCard;

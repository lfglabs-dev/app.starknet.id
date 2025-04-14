import React from "react";
import styles from "../../../styles/components/identityMenu.module.css";

function ActiveSubscriptionCard() {
  return (
      <div className={styles.subscriptionSecondary}>
        <h1 className="font-quickZap font-normal text-[14px] text-center py-5 text-[#454545] uppercase">Your Subscription is Active</h1>

      </div>
  );
}

export default ActiveSubscriptionCard;

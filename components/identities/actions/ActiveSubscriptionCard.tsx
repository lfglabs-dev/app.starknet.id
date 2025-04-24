import React from "react";
import styles from "../../../styles/components/identityMenu.module.css";

function ActiveSubscriptionCard() {
  return (
    <div className={`${styles.subscriptionSecondary} text-center`}>
    <h1 className="font-quickZap font-normal text-[14px] text-[#454545] uppercase mt-1">
      Your Subscription is Active
    </h1>
  </div>


  );
}

export default ActiveSubscriptionCard;
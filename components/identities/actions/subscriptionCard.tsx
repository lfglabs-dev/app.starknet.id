import React from "react";
import styles from "../../../styles/components/identityMenu.module.css";

interface SubscriptionCardProps {
  isSubscriptionActive: boolean;
}

function SubscriptionCard({ isSubscriptionActive }: SubscriptionCardProps) {
  return isSubscriptionActive ? (
    <div className={styles.subscriptionSecondary}></div>
  ) : (
    <div className={styles.subscriptionSecondary}></div>
  );
}

export default SubscriptionCard;

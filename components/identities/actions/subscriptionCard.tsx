import React from "react";
import styles from "../../../styles/components/identityMenu.module.css";

interface SubscriptionCardProps {
  subscriptionActive: boolean;
}

function SubscriptionCard({ subscriptionActive }: SubscriptionCardProps) {
  return subscriptionActive ? (
    <div className={styles.subscriptionSecondary}></div>
  ) : (
    <div className={styles.subscriptionPrimary}></div>
  );
}

export default SubscriptionCard;

import React, { useState } from "react";
import styles from "../../../styles/components/identityMenu.module.css";
function SubscriptionCard() {
  const [subscriptionActive, setSubscriptionActive] = useState<boolean>(true);

  return subscriptionActive ? (
    <div className={styles.subscriptionSecondary}></div>
  ) : (
    <div className={styles.subscriptionPrimary}></div>
  );
}

export default SubscriptionCard;

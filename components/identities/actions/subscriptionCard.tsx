import React, { useState } from "react";
import styles from "../../../styles/components/identityMenu.module.css";
function SubscriptionCard() {
  const [SubscriptionActive, setSubscriptionActive] = useState<boolean>(true);

  return <div className={styles.subscriptionSecondary}></div>;
}

export default SubscriptionCard;

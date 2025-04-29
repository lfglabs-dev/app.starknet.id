import React from "react";
import styles from "../../../styles/components/identityMenu.module.css";
import { timestampToReadableDate } from "@/utils/dateService";
import { Identity } from "@/utils/apiWrappers/identity";

interface ActiveSubscriptionCardProps {
  identity: Identity;
}

function ActiveSubscriptionCard({ identity }: ActiveSubscriptionCardProps) {
  const cancelSubscription = () => {
    return 0;
  };

  return (
    <div className={`${styles.subscriptionSecondary} text-center`}>
      <div>
        <h1 className="font-quickZap font-normal text-[14px] text-[#454545] uppercase mt-[6px]">
          Your Subscription is Active
        </h1>
        <p className={styles.clickableActionDescription}>
          Next payment on {timestampToReadableDate(identity?.domainExpiry ?? 0)}
        </p>
      </div>
      <button
        type="button"
        style={{ backgroundColor: "#cd3a31" }}
        className="font-quickZap font-normal text-[12px] text-[#ffffff] p-[10px] rounded-xl uppercase mt-[6px]"
        onClick={cancelSubscription}
      >
        CANCEL SUBSCRIPTION
      </button>
    </div>
  );
}

export default ActiveSubscriptionCard;

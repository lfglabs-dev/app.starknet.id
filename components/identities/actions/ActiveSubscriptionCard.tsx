import React from "react";
import styles from "../../../styles/components/identityMenu.module.css";
import { timestampToReadableDate } from "@/utils/dateService";
import { Identity } from "@/utils/apiWrappers/identity";

interface ActiveSubscriptionCardProps {
  identity: Identity;
  disableRenewal: () => void;
}

function ActiveSubscriptionCard({
  identity,
  disableRenewal,
}: ActiveSubscriptionCardProps) {
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
        className="!bg-[#cd3a31] font-quickZap font-normal text-[12px] text-[#ffffff] p-[10px] rounded-lg uppercase mt-[6px]"
        onClick={() => disableRenewal()}
      >
        CANCEL SUBSCRIPTION
      </button>
    </div>
  );
}

export default ActiveSubscriptionCard;

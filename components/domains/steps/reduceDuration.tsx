import Button from "@/components/UI/button";
import styles from "../../../styles/components/upsellCard.module.css";
import React, { FunctionComponent } from "react";
import { CurrencyType } from "@/utils/constants";

type ReduceDurationProps = {
  currentDuration: number;
  newDuration: number;
  updateFormState: ({ durationInYears }: { durationInYears: number }) => void;
  displayCurrency: CurrencyType;
};

const ReduceDuration: FunctionComponent<ReduceDurationProps> = ({
  currentDuration,
  newDuration,
  updateFormState,
  displayCurrency,
}) => {
  const handleSwitchDuration = () => {
    updateFormState({ durationInYears: newDuration });
  };
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className="flex flex-col items-start gap-1 self-stretch">
          <p className={styles.title}>Dreaming Big? </p>
          <p className={styles.desc}>
            Looks like you&apos;ve got grand plans! But it seems you don&apos;t
            have enough {displayCurrency} to grab this domain for{" "}
            {currentDuration} years. No worries, let&apos;s make it happen! How
            about we reduce the duration to {newDuration} years?
          </p>
        </div>
        <div className="w-full sm:w-fit">
          <Button onClick={handleSwitchDuration}>
            Switch to {newDuration} year{newDuration > 1 && "s"}
          </Button>
        </div>
      </div>
      <img className={styles.image} src="/visuals/errorIlluTransparent.webp" />
    </div>
  );
};

export default ReduceDuration;

import Button from "@/components/UI/button";
import styles from "../../../styles/components/upsellCard.module.css";
import React, { FunctionComponent } from "react";
import { CurrencyType } from "@/utils/constants";

type UpsellCardProps = {
  currentDuration: number;
  newDuration: number;
  updateFormState: ({ duration }: { duration: number }) => void;
  reducedDurationToken: CurrencyType | null;
  setDisplayedCurrency: (currency: CurrencyType) => void;
  displayCurrency: CurrencyType;
  betterReducedDuration: number;
};

const ReduceDuration: FunctionComponent<UpsellCardProps> = ({
  currentDuration,
  newDuration,
  updateFormState,
  reducedDurationToken,
  setDisplayedCurrency,
  displayCurrency,
  betterReducedDuration,
}) => {
  const handleSwitchDuration = () => {
    updateFormState({ duration: newDuration });
  };

  const handleSwitchBetterDuration = () => {
    updateFormState({ duration: betterReducedDuration });
    if (reducedDurationToken) setDisplayedCurrency(reducedDurationToken);
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
            about we go for a shorter period instead?
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {newDuration > 0 ? (
            <div className="w-full sm:w-fit">
              <Button onClick={handleSwitchDuration}>
                Switch to {newDuration} year{newDuration > 1 && "s"}
              </Button>
            </div>
          ) : null}
          <div className="w-full sm:w-fit">
            {betterReducedDuration ? (
              <Button onClick={handleSwitchBetterDuration}>
                Switch to {reducedDurationToken} ({betterReducedDuration} year
                {betterReducedDuration > 1 && "s"})
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <img className={styles.image} src="/visuals/errorIlluTransparent.webp" />
    </div>
  );
};

export default ReduceDuration;

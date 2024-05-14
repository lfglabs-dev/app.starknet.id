import Button from "@/components/UI/button";
import styles from "../../../styles/components/upsellCard.module.css";
import React, { FunctionComponent } from "react";

type UpsellCardProps = {
  currentDuration: number;
  newDuration: number;
  updateFormState: ({ duration }: { duration: number }) => void;
};

const ReduceDuration: FunctionComponent<UpsellCardProps> = ({
  currentDuration,
  newDuration,
  updateFormState,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className="flex flex-col items-start gap-1 self-stretch">
          <p className={styles.title}>Dreaming Big? </p>
          <p className={styles.desc}>
            Looks like you&apos;ve got grand plans! But it seems you don&apos;t
            have enough tokens to grab this domain for {currentDuration} years.
            No worries, let&apos;s make it happen! How about we go for a shorter
            period instead?
          </p>
        </div>
        <div>
          <Button onClick={() => updateFormState({ duration: newDuration })}>
            Switch to {newDuration} year{newDuration > 1 && "s"}
          </Button>
        </div>
      </div>
      <img className={styles.image} src="/visuals/errorIlluTransparent.webp" />
    </div>
  );
};

export default ReduceDuration;

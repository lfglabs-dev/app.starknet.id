import React, { FunctionComponent } from "react";
import styles from "../../styles/verify.module.css";
import { useAccount } from "@starknet-react/core";
import Button from "../UI/button";
import BackButton from "../UI/backButton";

type VerifyFirstStepProps = {
  onClick: () => void;
  disabled: boolean;
  buttonLabel: string;
  title: string;
  subtitle: string;
};

const VerifyFirstStep: FunctionComponent<VerifyFirstStepProps> = ({
  onClick,
  disabled,
  buttonLabel,
  title,
  subtitle,
}) => {
  const { account } = useAccount();
  return (
    <>
      <div className={styles.backButton}>
        <BackButton onClick={() => window.history.back()} />
      </div>
      {account ? (
        <>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
          <div className={styles.buttonContainer}>
            <Button disabled={disabled} onClick={onClick}>
              {buttonLabel}
            </Button>
          </div>
        </>
      ) : (
        <h1 className="sm:text-5xl text-5xl">You need to connect anon</h1>
      )}
    </>
  );
};

export default VerifyFirstStep;

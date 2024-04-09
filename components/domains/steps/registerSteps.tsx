import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/registerV3.module.css";
import ContactCardIcon from "@/components/UI/iconsComponents/icons/contactCardIcon";
import PfpIcon from "@/components/UI/iconsComponents/icons/pfpIcon";
import CartIcon from "@/components/UI/iconsComponents/icons/cartIcon";
import theme from "@/styles/theme";

type registerStepsProps = {
  currentStep: number;
  setStep: (step: number) => void;
  showPfp?: boolean;
};

const RegisterSteps: FunctionComponent<registerStepsProps> = ({
  currentStep,
  setStep,
  showPfp = true,
}) => {
  return (
    <div className={styles.stepsContainer}>
      <div className={styles.progressSteps}>
        <div
          className={`${styles.progressStep} ${
            currentStep === 1 ? styles.activeStep : ""
          }`}
          onClick={() => setStep(1)}
        >
          <ContactCardIcon
            width="30"
            color={currentStep === 1 ? theme.palette.primary.main : "#B0AEAE"}
          />
          <p>Domain</p>
        </div>
        <div className={styles.progressLine} />
        {showPfp ? (
          <>
            <div
              className={`${styles.progressStep} ${
                currentStep === 2 ? styles.activeStep : ""
              }`}
              onClick={() => setStep(2)}
            >
              <PfpIcon
                width="30"
                color={
                  currentStep === 2 ? theme.palette.primary.main : "#B0AEAE"
                }
              />
              <p>PFP</p>
            </div>
            <div className={styles.progressLine} />
          </>
        ) : null}
        <div
          className={`${styles.progressStep} ${
            currentStep === 3 ? styles.activeStep : ""
          }`}
          onClick={() => setStep(3)}
        >
          <CartIcon
            width="30"
            color={currentStep === 3 ? theme.palette.primary.main : "#B0AEAE"}
          />
          <p>Checkout</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterSteps;

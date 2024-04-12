import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/registerV3.module.css";
import ContactCardIcon from "@/components/UI/iconsComponents/icons/contactCardIcon";
import PfpIcon from "@/components/UI/iconsComponents/icons/pfpIcon";
import CartIcon from "@/components/UI/iconsComponents/icons/cartIcon";
import theme from "@/styles/theme";
import { Skeleton } from "@mui/material";

type registerStepsProps = {
  currentStep: number;
  setStep: (step: number) => void;
  showPfp?: boolean;
  isLoading?: boolean;
};

const RegisterSteps: FunctionComponent<registerStepsProps> = ({
  currentStep,
  setStep,
  showPfp = true,
  isLoading = false,
}) => {
  return isLoading ? (
    <div className={styles.stepsContainer}>
      <div className={styles.progressSteps}>
        <Skeleton variant="circular" width="35px" height="35px" />
        <Skeleton variant="rounded" width="60px" height="2px" />
        <Skeleton variant="circular" width="35px" height="35px" />
        <Skeleton variant="rounded" width="60px" height="2px" />
        <Skeleton variant="circular" width="35px" height="35px" />
      </div>
    </div>
  ) : (
    <div className={styles.stepsContainer}>
      <div className={styles.progressSteps}>
        <div
          className={`${styles.progressStep} ${
            currentStep >= 1 ? styles.activeStep : ""
          }`}
          onClick={() => setStep(1)}
        >
          <ContactCardIcon
            width="30"
            color={
              currentStep >= 1
                ? theme.palette.primary.main
                : theme.palette.secondary.main
            }
          />
          <p>Domain</p>
        </div>
        <div
          className={`${styles.progressLine} ${
            currentStep >= 2 ? styles.primaryBg : ""
          }`}
        />
        {showPfp ? (
          <>
            <div
              className={`${styles.progressStep} ${
                currentStep >= 2 ? styles.activeStep : ""
              }`}
              onClick={() => setStep(2)}
            >
              <PfpIcon
                width="30"
                secondColor={
                  currentStep >= 2 ? "#FFF" : theme.palette.secondary.main
                }
                color={
                  currentStep >= 2
                    ? theme.palette.primary.main
                    : theme.palette.secondary.light
                }
              />
              <p>PFP</p>
            </div>
            <div
              className={`${styles.progressLine} ${
                currentStep >= 3 ? styles.primaryBg : ""
              }`}
            />
          </>
        ) : null}
        <div
          className={`${styles.progressStep} ${
            currentStep >= 3 ? styles.activeStep : ""
          }`}
          onClick={() => setStep(3)}
        >
          <CartIcon
            width="30"
            secondColor={
              currentStep >= 3 ? "#FFF" : theme.palette.secondary.main
            }
            color={
              currentStep >= 3
                ? theme.palette.primary.main
                : theme.palette.secondary.light
            }
          />
          <p>Checkout</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterSteps;

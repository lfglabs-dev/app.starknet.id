import React, { FunctionComponent } from "react";
import Image from "next/image";
import styles from "../../../styles/components/registerV3.module.css";
import ContactCardIcon from "@/components/UI/iconsComponents/icons/contactCardIcon";
import PfpIcon from "@/components/UI/iconsComponents/icons/pfpIcon";
import CartIcon from "@/components/UI/iconsComponents/icons/cartIcon";
import theme from "@/styles/theme";
import { Skeleton } from "@mui/material";
import DoneFilledIcon from "@/components/UI/iconsComponents/icons/doneFilledIcon";

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
      <div className={styles.stepsBackground}>
        <Image
          src="/register/grass.png"
          alt="grass"
          fill
        />
      </div>
      <div className={styles.progressSteps}>
        <div
          className={`${styles.progressStep} ${
            currentStep >= 1 ? styles.activeStep : ""
          }`}
          onClick={() => setStep(1)}
        >
          <div className={styles.progressStepName}>
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
          <DoneFilledIcon
            width="12"
            color={theme.palette.primary.light}
            secondColor={theme.palette.primary.main}
          />
        </div>
        {showPfp ? (
          <>
            <div
              className={`${styles.progressStep} ${
                currentStep >= 2 ? styles.activeStep : ""
              }`}
              onClick={() => setStep(2)}
            >
              <div className={styles.progressStepName}>
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
              <DoneFilledIcon
                width="12"
                color={theme.palette.primary.main}
                secondColor={theme.palette.primary.main}
              />
            </div>
          </>
        ) : null}
        <div
          className={`${styles.progressStep} ${
            currentStep > 3 ? styles.activeStep : ""
          }`}
          onClick={() => setStep(3)}
        >
          <div className={styles.progressStepName}>
            <CartIcon
              width="30"
              secondColor={
                currentStep > 3 ? "#FFF" : theme.palette.secondary.main
              }
              color={
                currentStep > 3
                  ? theme.palette.primary.main
                  : theme.palette.secondary.light
              }
            />
            <p>Checkout</p>
          </div>
          {currentStep > 3 && (
            <DoneFilledIcon
              width="12"
              color={theme.palette.primary.main}
              secondColor={theme.palette.primary.main}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterSteps;

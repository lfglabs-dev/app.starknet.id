import React, { FunctionComponent } from "react";
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

const getStep = (currentStep: number, stepIndex: number): string => {
  if (currentStep > stepIndex) return styles.passedStep;
  if (currentStep === stepIndex) return styles.activeStep;
  return styles.disabledStep;
};

const getStepColor = (currentStep: number, step: number): string => {
  if (currentStep > step) return theme.palette.primary.main;
  if (currentStep === step) return theme.palette.secondary.main;
  return theme.palette.grey[200];
};

const RegisterSteps: FunctionComponent<registerStepsProps> = ({
  currentStep,
  setStep,
  showPfp = true,
  isLoading = false,
}) => {
  return isLoading ? (
    <div className={styles.stepsContainer} role="status" aria-label="Loading registration steps">
<div className="flex gap-2 items-center p-2">
  <Skeleton variant="circular" width={24} height={24} />
  <div className="w-12 sm:w-16 md:w-24 lg:w-36">
    <Skeleton variant="text" height={20} />
  </div>
</div>
<div className="flex gap-2 items-center p-2">
  <Skeleton variant="circular" width={24} height={24} />
  <div className="w-12 sm:w-16 md:w-24 lg:w-36">
    <Skeleton variant="text" height={20} />
  </div>
</div>
<div className="flex gap-2 items-center p-2">
  <Skeleton variant="circular" width={24} height={24} />
  <div className="w-12 sm:w-16 md:w-24 lg:w-36">
    <Skeleton variant="text" height={20} />
  </div>
</div>

    </div>
  ) : (
    <div className={styles.stepsContainer} aria-label="Registration steps">
      <div
        className={`${styles.step} ${getStep(currentStep, 1)}`}
        onClick={() => currentStep >= 1 && setStep(1)}
      >
        <div className={styles.stepContent}>
          <ContactCardIcon
            width="20"
            color={getStepColor(currentStep, 1)}
          />
          <p className={styles.stepText}>Domain</p>
        </div>
        {currentStep > 1 && (
          <DoneFilledIcon
            width="16"
            secondColor={theme.palette.primary.main}
            color="#FFF"
          />
        )}
      </div>

      {showPfp && (
        <div
          className={`${styles.step} ${getStep(currentStep, 2)}`}
          onClick={() => currentStep >= 2 && setStep(2)}
        >
          <div className={styles.stepContent}>
            <PfpIcon
              width="20"
              color={getStepColor(currentStep, 2)}
            />
            <p className={styles.stepText}>PFP</p>
          </div>
          {currentStep > 2 && (
            <DoneFilledIcon
              width="16"
              secondColor={theme.palette.primary.main}
              color="#FFF"
            />
          )}
        </div>
      )}

      <div
        className={`${styles.step} ${getStep(currentStep, 3)}`}
        onClick={() => currentStep >= 3 && setStep(3)}
      >
        <div className={styles.stepContent}>
          <CartIcon
            width="20"
            color={getStepColor(currentStep, 3)}
          />
          <p className={styles.stepText}>Checkout</p>
        </div>
        {currentStep > 3 && (
          <DoneFilledIcon width="16" color={theme.palette.primary.main} />
        )}
      </div>
    </div>
  );
};

export default RegisterSteps;

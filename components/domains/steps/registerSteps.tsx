import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/registerV3.module.css";
import ContactCardIcon from "@/components/UI/iconsComponents/icons/contactCardIcon";
import PfpIcon from "@/components/UI/iconsComponents/icons/pfpIcon";
import CartIcon from "@/components/UI/iconsComponents/icons/cartIcon";
import theme from "@/styles/theme";
import { Skeleton } from "@mui/material";
import Step from "./step";

type Step = {
  label: string;
  icon: FunctionComponent<{ width: string; color: string }>;
};

type RegisterStepsProps = {
  currentStep: number;
  setStep: (step: number) => void;
  steps: Step[];
  showPfp?: boolean;
  isLoading?: boolean;
  isRegister?: boolean;
  getStepClass: (currentStep: number, stepIndex: number) => string;
  getStepColor: (currentStep: number, stepIndex: number) => string;
};
};

const RegisterSteps: FunctionComponent<RegisterStepsProps> = ({
  currentStep,
  setStep,
  steps,
  isLoading = false,
  isRegister = true,
  getStepClass,
  getStepColor,
}) => {
 
  return isLoading ? (
    <div
      className={styles.stepsContainer}
      role="status"
      aria-label="Loading registration steps"
    >
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
    <div
      className={styles.stepsContainer}
      role="status"
      aria-label="Loading registration steps"
    >
      {steps.map((_, index) => (
        <div key={index} className="flex gap-2 items-center p-2">
          <Skeleton variant="circular" width={24} height={24} />
          <div className="w-12 sm:w-16 md:w-24 lg:w-36">
            <Skeleton variant="text" height={20} />
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className={styles.stepsContainer} aria-label="Registration steps">
      <Step
        stepIndex={1}
        currentStep={currentStep}
        setStep={setStep}
        icon={<ContactCardIcon color={""} width={""} />}
        label="Domain"
      />
      {showPfp && (
        <Step
          stepIndex={2}
          currentStep={currentStep}
          setStep={setStep}
          icon={<PfpIcon color={""} width={""} />}
          label="PFP"
        />
      )}
      <Step
        stepIndex={3}
        currentStep={currentStep}
        setStep={setStep}
        icon={<CartIcon color={""} width={""} />}
        label="Checkout"
      />
      {steps.map((step, index) => {
        const stepIndex = index + 1;
        return (
          <div
            key={stepIndex}
            className={`${styles.step} ${getStepClass(currentStep, stepIndex)}`}
            onClick={() => isRegister ? (currentStep >= stepIndex) && setStep(stepIndex) : setStep(stepIndex)}
          >
            <div className={styles.stepContent}>
              <step.icon
                width="20"
                color={getStepColor(currentStep, stepIndex)}
              />
              <p className={styles.stepText}>{step.label}</p>
            </div>
            {(currentStep > stepIndex) && isRegister && (
              <DoneFilledIcon
                width="16"
                secondColor={theme.palette.primary.main}
                color="#FFF"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RegisterSteps;

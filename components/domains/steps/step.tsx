import React from "react";
import styles from "../../../styles/components/registerV3.module.css";
import DoneFilledIcon from "@/components/UI/iconsComponents/icons/doneFilledIcon";
import theme from "@/styles/theme";

type StepProps = {
  stepIndex: number;
  currentStep: number;
  setStep: (step: number) => void;
  icon: React.ReactNode;
  label: string;
  showDoneIcon?: boolean;
  allowSwitchAnytime?: boolean;
};

const Step: React.FC<StepProps> = ({
  stepIndex,
  currentStep,
  setStep,
  icon,
  label,
  showDoneIcon = true,
  allowSwitchAnytime = false,
}) => {
  const getStep = (currentStep: number, stepIndex: number): string => {
    if (currentStep > stepIndex)
      return allowSwitchAnytime ? styles.unselectedStep : styles.passedStep;
    if (currentStep === stepIndex) return styles.activeStep;
    return allowSwitchAnytime ? styles.unselectedStep : styles.disabledStep;
  };

  const getStepColor = (currentStep: number, step: number): string => {
    if (currentStep > step)
      return allowSwitchAnytime ? "" : theme.palette.primary.main;
    if (currentStep === step)
      return allowSwitchAnytime ? "" : theme.palette.secondary.main;
    return theme.palette.grey[200];
  };

  return (
    <div
      className={`${styles.step} ${getStep(currentStep, stepIndex)}`}
      onClick={() =>
        (allowSwitchAnytime || currentStep >= stepIndex) && setStep(stepIndex)
      }
    >
      <div className={styles.stepContent}>
        {React.cloneElement(icon as React.ReactElement, {
          width: "20",
          color: getStepColor(currentStep, stepIndex),
        })}
        <p className={styles.stepText}>{label}</p>
      </div>
      {showDoneIcon && currentStep > stepIndex && (
        <DoneFilledIcon
          width="16"
          secondColor={theme.palette.primary.main}
          color="#FFF"
        />
      )}
    </div>
  );
};

export default Step;

import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/registerV3.module.css";
import ContactCardIcon from "@/components/UI/iconsComponents/icons/contactCardIcon";
import PfpIcon from "@/components/UI/iconsComponents/icons/pfpIcon";
import CartIcon from "@/components/UI/iconsComponents/icons/cartIcon";
import { Skeleton } from "@mui/material";
import Step from "./step";

type StepProps= {
  label: string;
  icon: FunctionComponent<{ width: string; color: string }>;
};

type registerStepsProps = {
  currentStep: number;
  setStep: (step: number) => void;
  showPfp?: boolean;
  isLoading?: boolean;
};

const RegisterSteps: FunctionComponent<registerStepsProps> = ({
  currentStep,
  setStep,
  isLoading = false,
  showPfp=false,
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
    </div>
  );
};

export default RegisterSteps;

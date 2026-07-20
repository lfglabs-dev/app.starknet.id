import React, { FunctionComponent } from "react";
import styles from "../../../styles/components/registerV3.module.css";
import ContactCardIcon from "@/components/UI/iconsComponents/icons/contactCardIcon";
import CartIcon from "@/components/UI/iconsComponents/icons/cartIcon";
import { Skeleton } from "@mui/material";
import Step from "./step";

type registerStepsProps = {
  currentStep: number;
  setStep: (step: number) => void;
  isLoading?: boolean;
};

const RegisterSteps: FunctionComponent<registerStepsProps> = ({
  currentStep,
  setStep,
  isLoading = false,
}) => {
  return isLoading ? (
    <div
      className={styles.stepsContainer}
      role="status"
      aria-label="Loading registration steps"
    >
      <div className="flex gap-2 items-center p-2">
        <Skeleton variant="circular" width={24} height={24} />
        <div className="w-12 sm:w-16 md:w-16 lg:w-18 xl:w-24">
          <Skeleton variant="text" height={20} />
        </div>
      </div>
      <div className="flex gap-2 items-center p-2">
        <Skeleton variant="circular" width={24} height={24} />
        <div className="w-12 sm:w-16 md:w-16 lg:w-18 xl:w-24">
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

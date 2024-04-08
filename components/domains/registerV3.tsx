import React, { useContext } from "react";
import { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/components/registerV3.module.css";
import { FormContext } from "@/context/FormProvider";
import UserInfoForm from "./process/userInfoForm";
import { FormType } from "@/utils/constants";
import CheckoutCard from "./process/checkoutCard";
import { useAccount } from "@starknet-react/core";
import SelectPfp from "./process/selectPfp";
import RegisterSteps from "./process/registerSteps";

type RegisterV3Props = {
  domain: string;
  groups: string[];
};

const RegisterV3: FunctionComponent<RegisterV3Props> = ({ domain, groups }) => {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const { formState, updateFormState, userNft } = useContext(FormContext);

  console.log("formState", formState);
  console.log("userNft", userNft);

  useEffect(() => {
    if (!address) setCurrentStep(1);
  }, [address]);

  useEffect(() => {
    // Add domain in context
    updateFormState({ selectedDomains: { [domain]: true } });
  }, [domain]);

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (userNft && userNft.length > 0) {
        goToStep(2);
      } else {
        goToStep(3);
      }
    } else if (currentStep === 2) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  return (
    <>
      {currentStep > 1 ? (
        <RegisterSteps currentStep={currentStep} setStep={goToStep} />
      ) : null}
      {currentStep === 1 && (
        <UserInfoForm
          type={FormType.REGISTER}
          goToNextStep={goToNextStep}
          imageUrl="/visuals/registerV2.webp"
        />
      )}
      {currentStep === 2 && <SelectPfp goToNextStep={goToNextStep} />}
      {currentStep === 3 && <CheckoutCard type={FormType.REGISTER} />}
    </>
  );
};

export default RegisterV3;

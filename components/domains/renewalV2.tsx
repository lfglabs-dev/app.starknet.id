import React, { useContext } from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { FormType } from "../../utils/constants";
import { FormContext } from "@/context/FormProvider";
import RegisterSteps from "./process/registerSteps";
import UserInfoForm from "./process/userInfoForm";
import CheckoutCard from "./process/checkoutCard";
import SelectPfp from "./process/selectPfp";
import { registrationDiscount } from "@/utils/discounts/registration";

type RenewalProps = {
  groups: string[];
};

const RenewalV2: FunctionComponent<RenewalProps> = ({ groups }) => {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const { updateFormState, userNft } = useContext(FormContext);

  useEffect(() => {
    if (!address) setCurrentStep(1);
  }, [address]);

  // useEffect(() => {
  //   // Add domain in context and initialize the upsell state
  //   updateFormState({
  //     selectedDomains: { [domain]: true },
  //     isUpselled: true,
  //     duration: 1,
  //   });
  // }, [domain]);

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
      <RegisterSteps currentStep={currentStep} setStep={goToStep} />
      {currentStep === 1 && (
        <UserInfoForm
          type={FormType.RENEW}
          goToNextStep={goToNextStep}
          imageUrl="/visuals/registerV2.webp"
        />
      )}
      {currentStep === 2 && <SelectPfp goToNextStep={goToNextStep} />}
      {currentStep === 3 && (
        <CheckoutCard
          type={FormType.RENEW}
          groups={groups}
          discount={registrationDiscount}
        />
      )}
    </>
  );
};

export default RenewalV2;

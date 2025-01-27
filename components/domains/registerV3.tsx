import React, { useContext } from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { FormContext } from "@/context/FormProvider";
import UserInfoForm from "./steps/userInfoForm";
import { FormType } from "@/utils/constants";
import CheckoutCard from "./steps/checkoutCard";
import { useAccount } from "@starknet-react/core";
import styles from "../../styles/components/registerV3.module.css";
import SelectPfp from "./steps/selectPfp";
import RegisterSteps from "./steps/registerSteps";
import evergreenDiscounts from "@/utils/discounts/evergreen";

type RegisterV3Props = {
  domain: string;
  setDomain: (domain: string) => void;
};

const RegisterV3: FunctionComponent<RegisterV3Props> = ({
  domain,
  setDomain,
}) => {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const { updateFormState, userNfts, isLoadingNfts } = useContext(FormContext);

  useEffect(() => {
    if (!address) setCurrentStep(1);
  }, [address]);

  useEffect(() => {
    // Add domain in context and initialize the upsell state
    updateFormState({
      selectedDomains: { [domain]: true },
      isUpselled: true,
      durationInYears: 1,
      tokenId: 0,
      selectedPfp: undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]); // Don't call updateFromState on every render

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (userNfts && userNfts.length > 0) {
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
      <div className="w-full flex flex-col lg:flex-row md:flex-row justify-center gap-4 px-8 py-4 lg:px-32 md:px-16 sm:py-12 sm:h-[calc(100vh-6rem)]">
        <aside className={`${styles.purchaseStepNav}`} role="navigation">
          <RegisterSteps
            currentStep={currentStep}
            setStep={goToStep}
            showPfp={userNfts && userNfts.length > 0}
            isLoading={isLoadingNfts}
          />

          <img
            src="/visuals/purchaseStepVisual.svg"
            alt="Domain purchase steps visualization"
          />
        </aside>

        <div className={`${styles.purchaseStepNavMobile}`} role="navigation">
          <RegisterSteps
            currentStep={currentStep}
            setStep={goToStep}
            showPfp={userNfts && userNfts.length > 0}
            isLoading={isLoadingNfts}
          />

          <div className="flex justify-center">
            <img
              src="/visuals/purchaseStepVisualMobile.svg"
              alt="Domain purchase steps visualization"
            />
          </div>
        </div>

        <div className="flex-1">
          {currentStep === 1 && (
            <UserInfoForm
              type={FormType.REGISTER}
              goToNextStep={goToNextStep}
              imageUrl="/visuals/register.webp"
            />
          )}
          {currentStep === 2 && <SelectPfp goToNextStep={goToNextStep} />}
          {currentStep === 3 && (
            <CheckoutCard
              type={FormType.REGISTER}
              discount={evergreenDiscounts.registration}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default RegisterV3;

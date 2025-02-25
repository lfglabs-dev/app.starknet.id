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
import ContactCardIcon from "@/components/UI/iconsComponents/icons/contactCardIcon";
import PfpIcon from "@/components/UI/iconsComponents/icons/pfpIcon";
import CartIcon from "@/components/UI/iconsComponents/icons/cartIcon";
import theme from "@/styles/theme";
type RegisterV3Props = {
  domain: string;
  setDomain: (domain: string) => void;
};

const RegisterV3: FunctionComponent<RegisterV3Props> = ({ domain }) => {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const { updateFormState, userNfts, isLoadingNfts } = useContext(FormContext);
  const steps = [
    {
      label: "Domain",
      icon: ContactCardIcon,
    },
    {
      label: "PFP",
      icon: PfpIcon,
    },
    {
      label: "Checkout",
      icon: CartIcon,
    },
  ];
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
  const getStepClass = (currentStep: number, stepIndex: number): string => {
    if (currentStep > stepIndex) return styles.passedStep;
    if (currentStep === stepIndex) return styles.activeStep;
    return styles.disabledStep;
  };

  const getStepColor = (currentStep: number, stepIndex: number): string => {
    if (currentStep > stepIndex) return theme.palette.primary.main;
    if (currentStep === stepIndex) return theme.palette.secondary.main;
    return theme.palette.grey[200];
  };

  return (
    <>
      <div className="w-full flex flex-col xl:flex-row justify-center gap-4 px-3 py-4 lg:px-32 md:px-16 sm:py-12 xl:h-[88vh]">
        <aside className={`${styles.purchaseStepNav}`} role="navigation">
          <RegisterSteps
            currentStep={currentStep}
            setStep={goToStep}
            steps={steps}
            showPfp={userNfts && userNfts.length > 0}
            isLoading={isLoadingNfts}
            getStepClass={getStepClass}
            getStepColor={getStepColor}
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
            steps={steps}
            showPfp={userNfts && userNfts.length > 0}
            isLoading={isLoadingNfts}
            getStepClass={getStepClass}
            getStepColor={getStepColor}
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

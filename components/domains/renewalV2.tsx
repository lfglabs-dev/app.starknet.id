import React, { useContext } from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { FormType } from "../../utils/constants";
import { FormContext } from "@/context/FormProvider";
import RegisterSteps from "./steps/registerSteps";
import styles from "../../styles/components/registerV3.module.css";
import UserInfoForm from "./steps/userInfoForm";
import CheckoutCard from "./steps/checkoutCard";
import SelectPfp from "./steps/selectPfp";
import { StarknetIdJsContext } from "@/context/StarknetIdJsProvider";
import evergreenDiscounts from "@/utils/discounts/evergreen";

const RenewalV2: FunctionComponent = () => {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const { updateFormState, userNfts, isLoadingNfts } = useContext(FormContext);
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);
  const [showPfp, setShowPfp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) setCurrentStep(1);
  }, [address]);

  useEffect(() => {
    // Initialize the upsell state
    updateFormState({
      isUpselled: true,
      durationInYears: 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]); // Don't call updateFromState on every render

  // check if user has a profile picture set on his main domain
  // if not, show the select pfp step and store his main id
  useEffect(() => {
    if (isLoadingNfts) return;
    if (!userNfts || userNfts.length === 0) {
      setShowPfp(false);
      setIsLoading(false);
      return;
    }
    starknetIdNavigator
      ?.getProfileData(address as string, false)
      .then((res) => {
        if (!res?.profilePicture) {
          setShowPfp(true);
          setIsLoading(false);
          starknetIdNavigator?.getStarknetId(res?.name as string).then((id) => {
            updateFormState({
              tokenId: parseInt(id),
            });
          });
        } else {
          setShowPfp(false);
          setIsLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userNfts, address, isLoadingNfts, starknetIdNavigator]); // Don't call updateFromState on every render

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (showPfp) goToStep(2);
      else goToStep(3);
    } else if (currentStep === 2) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  return (
    <>
      <div className="w-full flex flex-col xl:flex-row justify-center gap-4 px-3 py-3 lg:px-32 md:px-16 sm:pb-12 xl:min-h-[88vh] ">
        <aside className={`${styles.purchaseStepNav}`} role="navigation">
          <RegisterSteps
            currentStep={currentStep}
            setStep={goToStep}
            showPfp={showPfp}
            isLoading={isLoading}
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
            showPfp={showPfp}
            isLoading={isLoading}
          />

          <div className="flex justify-center">
            <img
              src="/visuals/purchaseStepVisualMobile.svg"
              alt="Domain purchase steps visualization"
            />
          </div>
        </div>

        <div className="flex-1 w-full xl:w-[932px] xl:min-w-[932px] border-solid ">
          {currentStep === 1 && (
            <UserInfoForm type={FormType.RENEW} goToNextStep={goToNextStep} />
          )}
          {currentStep === 2 && <SelectPfp goToNextStep={goToNextStep} />}
          {currentStep === 3 && (
            <CheckoutCard
              type={FormType.RENEW}
              discount={evergreenDiscounts.renewal}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default RenewalV2;

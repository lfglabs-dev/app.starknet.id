import React, { useContext } from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { FormType } from "../../utils/constants";
import { FormContext } from "@/context/FormProvider";
import RegisterSteps from "./steps/registerSteps";
import UserInfoForm from "./steps/userInfoForm";
import CheckoutCard from "./steps/checkoutCard";
import SelectPfp from "./steps/selectPfp";
import { StarknetIdJsContext } from "@/context/StarknetIdJsProvider";

type RenewalProps = {
  groups: string[];
};

const discount: Upsell = {
  duration: 3,
  paidDuration: 2,
  maxDuration: 1,
  discountId: "0",
  imageUrl: "/register/registerUpsell.webp",
  title: {
    desc: "Unlock Extended Domain",
    catch: "3 Years for the Price of 2!",
  },
  desc: "Don't miss out on this one-time offer! This is your chance to secure extended benefits and ensure a lasting digital presence.",
};

const RenewalV2: FunctionComponent<RenewalProps> = ({ groups }) => {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const { updateFormState, userNft } = useContext(FormContext);
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);
  const [showPfp, setShowPfp] = useState(false);

  useEffect(() => {
    if (!address) setCurrentStep(1);
  }, [address]);

  useEffect(() => {
    // Initialize the upsell state
    updateFormState({
      isUpselled: true,
      duration: 1,
    });
  }, [address]);

  // check if user has a profile picture set on his main domain
  // if not, show the select pfp step and store his main id
  useEffect(() => {
    if (!userNft || userNft.length === 0) {
      setShowPfp(false);
      return;
    }
    starknetIdNavigator
      ?.getProfileData(address as string, false)
      .then((res) => {
        if (!res?.profilePicture) {
          setShowPfp(true);
          starknetIdNavigator?.getStarknetId(res?.name as string).then((id) => {
            updateFormState({
              tokenId: parseInt(id),
            });
          });
        } else setShowPfp(false);
      });
  }, [userNft, address]);

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
      <RegisterSteps
        currentStep={currentStep}
        setStep={goToStep}
        showPfp={showPfp}
      />
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
          discount={discount}
        />
      )}
    </>
  );
};

export default RenewalV2;

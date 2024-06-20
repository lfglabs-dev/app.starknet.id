import React, { useContext } from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { FormContext } from "@/context/FormProvider";
import UserInfoForm from "./steps/userInfoForm";
import { FormType } from "@/utils/constants";
import CheckoutCard from "./steps/checkoutCard";
import { useAccount } from "@starknet-react/core";
import SelectPfp from "./steps/selectPfp";
import RegisterSteps from "./steps/registerSteps";
import SearchBar from "../UI/searchBar";
import evergreenDiscounts from "@/utils/discounts/evergreen";

type RegisterV3Props = {
  domain: string;
  groups: string[];
  setDomain: (domain: string) => void;
};

const RegisterV3: FunctionComponent<RegisterV3Props> = ({
  domain,
  setDomain,
  groups,
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
      duration: 1,
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
      {currentStep > 1 ? (
        <RegisterSteps
          currentStep={currentStep}
          setStep={goToStep}
          showPfp={userNfts && userNfts.length > 0}
          isLoading={isLoadingNfts}
        />
      ) : (
        <div className="sm:w-2/5 w-4/5 mt-5 mb-5">
          <SearchBar
            onChangeTypedValue={(typeValue: string) => setDomain(typeValue)}
            showHistory={false}
          />
        </div>
      )}
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
          groups={groups}
          discount={evergreenDiscounts.registration}
        />
      )}
    </>
  );
};

export default RegisterV3;

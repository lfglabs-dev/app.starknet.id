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

type RegisterV3Props = {
  domain: string;
  groups: string[];
  setDomain: (domain: string) => void;
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

const RegisterV3: FunctionComponent<RegisterV3Props> = ({
  domain,
  setDomain,
  groups,
}) => {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const { updateFormState, userNft } = useContext(FormContext);

  useEffect(() => {
    if (!address) setCurrentStep(1);
  }, [address]);

  useEffect(() => {
    // Add domain in context and initialize the upsell state
    updateFormState({
      selectedDomains: { [domain]: true },
      isUpselled: true,
      duration: 1,
    });
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
        <RegisterSteps
          currentStep={currentStep}
          setStep={goToStep}
          showPfp={userNft && userNft.length > 0}
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
          imageUrl="/visuals/registerV2.webp"
        />
      )}
      {currentStep === 2 && <SelectPfp goToNextStep={goToNextStep} />}
      {currentStep === 3 && (
        <CheckoutCard
          type={FormType.REGISTER}
          groups={groups}
          discount={discount}
        />
      )}
    </>
  );
};

export default RegisterV3;

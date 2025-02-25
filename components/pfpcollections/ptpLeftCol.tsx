import React from "react";
import StarknetIcon from "../UI/iconsComponents/icons/starknetIcon";
import StarknetIdIcon from "../UI/iconsComponents/icons/starknetIdIcon";
import RegisterSteps from "../domains/steps/registerSteps";
import { useState, useEffect } from "react";
import pfpStyles from "../../styles/pfpcollections.module.css";
import styleR from "../../styles/components/registerV3.module.css";
import theme from "@/styles/theme";
import PfpNftCard from "../../components/pfpcollections/pfpNftCard";
import { ourNfts, NftCollections } from "../../utils/constants";

const ptpLeftCol = () => {
  const columnMenu = [
    {
      icon: StarknetIdIcon,
      label: "Starknet ID Ecosystem",
    },
    {
      icon: StarknetIcon,
      label: "Overall Starknet Ecosystem",
    },
  ];
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    setTimeout(() => {
      setIsLoadingNfts(false);
    }, 2000);
    if (!isLoadingNfts) return setCurrentStep(1);
  }, [isLoadingNfts]);

  const goToStep = (step: number) => {
  console.log(step);
    setCurrentStep(step);
  };

  const getStepClass = (currentStep: number, stepIndex: number): string => {
    if (currentStep === stepIndex) return styleR.activeStep;
    return styleR.inactiveStep;
  };

  const getStepColor = (currentStep: number, stepIndex: number): string => {
    if (currentStep === stepIndex) return theme.palette.secondary.main;
    return theme.palette.grey[200];
  };
  return (
    <div className="w-full flex flex-col xl:flex-row justify-center gap-4 px-3 py-4 lg:px-32 md:px-16 sm:py-12 xl:h-[88vh]">
      <aside className={`${styleR.purchaseStepNav}`} role="navigation">
        <RegisterSteps
          currentStep={currentStep}
          setStep={goToStep}
          steps={columnMenu}
          isRegister={false}
          showPfp={columnMenu && columnMenu.length > 0}
          isLoading={isLoadingNfts}
          getStepClass={getStepClass}
          getStepColor={getStepColor}
        />

        <img
          src="/visuals/purchaseStepVisual.svg"
          alt="Domain purchase steps visualization"
        />
      </aside>

      <div className={`${styleR.purchaseStepNavMobile}`} role="navigation">
        <RegisterSteps
          currentStep={currentStep}
          setStep={goToStep}
          steps={columnMenu}
          isRegister={false}
          showPfp={columnMenu && columnMenu.length > 0}
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

      <div className={pfpStyles.gallery}>
        {currentStep === 1 && (<section>
          <p className={pfpStyles.subtitle}>Starknet ID Ecosystem</p>
          <h2 className={pfpStyles.title}>PFP collections</h2>
          <div className={pfpStyles.nfts}>
            {ourNfts.map((collection, index) => (
              <PfpNftCard
                key={index}
                image={collection.imageUri}
                name={collection.name}
                onClick={() => window.open(collection.infoPage)}
              />
            ))}
          </div>
        </section>)}
        {currentStep === 2 && (<section>
          <p className={pfpStyles.subtitle}>Overall Starknet Ecosystem</p>
          <h2 className={pfpStyles.title}>Our suggestions</h2>
          <div className={pfpStyles.nfts}>
            {NftCollections.map((collection, index) => (
              <PfpNftCard
                key={index}
                image={collection.imageUri}
                name={collection.name}
                onClick={() => window.open(collection.externalLink)}
              />
            ))}
          </div>
        </section>)}
      </div>
    </div>
  );
};

export default ptpLeftCol;

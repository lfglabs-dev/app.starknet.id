import React, { FunctionComponent, useContext, useState } from "react";
import styles from "../../../styles/components/registerV3.module.css";
import { FormContext } from "@/context/FormProvider";
import PfpGallery from "@/components/identities/pfpGallery";
import Button from "@/components/UI/button";

type SelectPfpProps = {
  goToNextStep: () => void;
};

const SelectPfp: FunctionComponent<SelectPfpProps> = ({ goToNextStep }) => {
  const { updateFormState, formState } = useContext(FormContext);
  const [selectedPfp, setSelectedPft] = useState<StarkscanNftProps | null>(
    formState.selectedPfp ?? null
  );

  const selectPfp = (nft: StarkscanNftProps) => {
    setSelectedPft(nft);
  };

  const confirmPfp = () => {
    if (!selectedPfp) return;
    updateFormState({ selectedPfp: selectedPfp });
    goToNextStep();
  };

  const skip = () => {
    updateFormState({ selectedPfp: undefined });
    goToNextStep();
  };

  return (
    <>
      <div className={styles.pfpGallery}>
        <PfpGallery selectedPfp={selectedPfp} selectPfp={selectPfp} />
        <div className={styles.pfpBtns}>
          <Button onClick={confirmPfp} disabled={selectedPfp === null}>
            Confirm profile picture
          </Button>
          <div className={styles.skipBtn} onClick={skip}>
            SKIP
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectPfp;

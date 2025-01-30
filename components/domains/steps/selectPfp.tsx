import React, { FunctionComponent, useContext, useState } from "react";
import styles from "../../../styles/components/registerV3.module.css";
import { FormContext } from "@/context/FormProvider";
import PfpGallery from "@/components/identities/pfpGallery";
import Button from "@/components/UI/button";
import CloseIcon from "@/components/UI/iconsComponents/icons/closeIcon";
import { useRouter } from "next/router";

type SelectPfpProps = {
  goToNextStep: () => void;
};

const SelectPfp: FunctionComponent<SelectPfpProps> = ({ goToNextStep }) => {
  const router = useRouter();
  const { updateFormState, formState, userNfts } = useContext(FormContext);
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
        <PfpGallery
          selectedPfp={selectedPfp}
          selectPfp={selectPfp}
          userNfts={userNfts as StarkscanNftProps[]}
        />
        <div className={styles.pfpBtns}>
          <Button onClick={confirmPfp} disabled={selectedPfp === null}>
            Confirm profile picture
          </Button>
          <div className={styles.skipBtn} onClick={skip}>
            SKIP
          </div>
        </div>
        <div className={styles.closeIcon}>
          <button
            onClick={() => router.push("/")}
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </>
  );
};

export default SelectPfp;

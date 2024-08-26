import { useAccount } from "@starknet-react/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import { createContext, useMemo } from "react";
import { computeMetadataHash, generateSalt } from "@/utils/userDataService";
import useWhitelistedNFTs from "@/hooks/useWhitelistedNFTs";

type FormState = {
  email: string;
  isSwissResident: boolean;
  tokenId: number;
  durationInYears: number;
  selectedDomains: Record<string, boolean>;
  // metadata
  salt?: string;
  metadataHash?: string;
  needMetadata: boolean;
  // tax
  salesTaxRate: number;
  //pfp
  selectedPfp?: StarkscanNftProps;
  //upsell
  isUpselled: boolean;
};

type FormConfig = {
  formState: FormState;
  clearForm: () => void;
  updateFormState: (updates: Partial<FormState>) => void;
  userNfts?: StarkscanNftProps[];
  isLoadingNfts?: boolean;
};

const initialState: FormState = {
  email: "",
  isSwissResident: false,
  tokenId: 0,
  durationInYears: 1,
  selectedDomains: {},
  needMetadata: false,
  salesTaxRate: 0,
  selectedPfp: undefined,
  isUpselled: false,
};

export const FormContext = createContext<FormConfig>({
  formState: initialState,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearForm: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateFormState: () => {},
});

export const FormProvider: FunctionComponent<Context> = ({ children }) => {
  const { address } = useAccount();
  const [formState, setFormState] = useState<FormState>(initialState);
  const { userNfts, isLoading: isLoadingNfts } = useWhitelistedNFTs(
    address as string
  );

  const updateFormState = useCallback((updates: Partial<FormState>) => {
    setFormState((prevState) => ({ ...prevState, ...updates }));
  }, []);

  const clearForm = useCallback(() => {
    setFormState((prevState) => ({
      ...prevState,
      selectedDomains: {},
      tokenId: 0,
      duration: 1,
      isUpselled: false,
      selectedPfp: undefined,
    }));
  }, []);

  // Handle metadataHash and salt
  useMemo(() => {
    updateFormState({ salt: generateSalt() });
  }, [formState.selectedDomains, updateFormState]);

  useMemo(() => {
    if (!address) return;
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/renewal/get_metahash?addr=${address}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.meta_hash && parseInt(data.meta_hash) !== 0) {
          updateFormState({
            needMetadata: false,
            metadataHash: data.meta_hash,
            salesTaxRate: data.tax_rate ?? 0,
          });
        } else updateFormState({ needMetadata: true });
      })
      .catch((err) => {
        console.log("Error while fetching metadata:", err);
        updateFormState({ needMetadata: true });
      });
  }, [address, updateFormState]);

  useMemo(() => {
    if (!formState.salt || !formState.needMetadata) return;
    (async () => {
      updateFormState({
        metadataHash: await computeMetadataHash(
          formState.email,
          formState.isSwissResident ? "switzerland" : "none",
          formState.salt as string
        ),
      });
    })();
  }, [
    formState.salt,
    formState.email,
    formState.isSwissResident,
    formState.needMetadata,
    updateFormState,
  ]);

  const contextValues = useMemo(() => {
    return {
      formState,
      updateFormState,
      clearForm,
      userNfts,
      isLoadingNfts,
    };
  }, [formState, updateFormState, clearForm, userNfts, isLoadingNfts]);

  return (
    <FormContext.Provider value={contextValues}>
      {children}
    </FormContext.Provider>
  );
};

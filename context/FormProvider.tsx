import { useAccount, useContractRead } from "@starknet-react/core";
import React, { FunctionComponent, useState } from "react";
import { createContext, useMemo } from "react";
import { computeMetadataHash, generateSalt } from "@/utils/userDataService";
import { useNftPpVerifierContract } from "@/hooks/contracts";
import { Abi } from "starknet";
import { filterAssets, retrieveAssets } from "@/utils/nftService";

//todo : clear context once funnel is done
// or if the domain changes in the page register

interface FormState {
  email: string;
  isSwissResident: boolean;
  tokenId: number;
  duration: number;
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
}

type FormConfig = {
  formState: FormState;
  clearForm: () => void;
  updateFormState: (updates: Partial<FormState>) => void;
  userNft?: StarkscanNftProps[];
};

const initialState: FormState = {
  email: "",
  isSwissResident: false,
  tokenId: 0,
  duration: 1,
  selectedDomains: {},
  needMetadata: false,
  salesTaxRate: 0,
  isUpselled: false,
};

export const FormContext = createContext<FormConfig>({
  formState: initialState,
  clearForm: () => {},
  updateFormState: () => {},
  userNft: [],
});

export const FormProvider: FunctionComponent<Context> = ({ children }) => {
  const { address } = useAccount();
  const [formState, setFormState] = useState<FormState>(initialState);
  const [userNft, setUserNft] = useState<StarkscanNftProps[]>([]);
  // get whitelisted NFT contract addresses
  const { contract } = useNftPpVerifierContract();
  const { data: whitelistData, error: whitelistError } = useContractRead({
    address: contract?.address as string,
    abi: contract?.abi as Abi,
    functionName: "get_whitelisted_contracts",
    args: [],
  });

  const updateFormState = (updates: Partial<FormState>) => {
    setFormState((prevState) => ({ ...prevState, ...updates }));
  };

  const clearForm = () => {
    setFormState((prevState) => ({ ...prevState, ...initialState }));
  };

  // Check if connected account has whitelisted NFTs
  // We fetch nfts once for all the app
  useMemo(() => {
    if (!address || !whitelistData) {
      setUserNft([]);
      return;
    }
    retrieveAssets(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/starkscan/fetch_nfts`,
      address
    )
      .then((data) => {
        setUserNft(filterAssets(data.data, whitelistData as bigint[]));
      })
      .catch(() => {
        setUserNft([]);
      });
  }, [address, whitelistData, whitelistError]);

  // Handle metadataHash and salt
  useMemo(() => {
    updateFormState({ salt: generateSalt() });
  }, [formState.selectedDomains]);

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
  }, [address]);

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
  ]);

  const contextValues = useMemo(() => {
    return {
      formState,
      updateFormState,
      clearForm,
      userNft,
    };
  }, [formState, updateFormState, clearForm, userNft]);

  return (
    <FormContext.Provider value={contextValues}>
      {children}
    </FormContext.Provider>
  );
};

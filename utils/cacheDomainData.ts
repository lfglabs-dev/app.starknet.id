import { decimalToHex, toUint256 } from "./feltService";
import { formatHexString } from "./stringService";
import { NFT_PP_CONTRACT, NFT_PP_ID } from "./verifierFields";

export const formatDomainData = (
  tokenId: string,
  owner: string,
  domain: string,
  duration: number,
  main: boolean,
  selectedPfp?: StarkscanNftProps | undefined
) => {
  // Add pfp verifier data
  let extended_verifier_data = [];
  let verifier_data = [];
  if (selectedPfp) {
    const nftData = selectedPfp;
    const nft_id = toUint256(nftData.token_id);
    extended_verifier_data.push({
      verifier: formatHexString(
        process.env.NEXT_PUBLIC_NFT_PP_VERIFIER as string
      ),
      field: NFT_PP_ID,
      extended_data: [decimalToHex(nft_id.low), decimalToHex(nft_id.high)],
    });
    verifier_data.push({
      verifier: formatHexString(
        process.env.NEXT_PUBLIC_NFT_PP_VERIFIER as string
      ),
      field: NFT_PP_CONTRACT,
      data: nftData.contract_address,
    });
  }

  storeDomainData(tokenId, {
    id: tokenId,
    owner,
    main,
    creation_date: Date.now(),
    domain: {
      domain,
      migrated: true,
      root: true,
      creation_date: Date.now(),
      expiry: Date.now() + 31536000000 * duration,
    },
    user_data: [],
    verifier_data,
    extended_verifier_data,
  });
};

export const storeDomainData = (tokenId: string, domainData: IdentityData) => {
  let existingDataRaw = localStorage.getItem("SID-domainData");
  let existingData: Record<string, IdentityData> = existingDataRaw
    ? JSON.parse(existingDataRaw)
    : {};

  existingData[tokenId] = domainData;

  localStorage.setItem("SID-domainData", JSON.stringify(existingData));
};

export const getDomainData = (tokenId: string): IdentityData | undefined => {
  let existingDataRaw = localStorage.getItem("SID-domainData");
  let existingData: Record<string, IdentityData> = existingDataRaw
    ? JSON.parse(existingDataRaw)
    : {};
  // if data exists & creation_date is less than 10mn ago, use it
  // else we will trust the indexer
  if (
    existingData[tokenId] &&
    existingData[tokenId].creation_date > Date.now() - 600000
  ) {
    return existingData[tokenId];
  }
  return undefined;
};

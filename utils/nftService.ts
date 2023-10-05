import { hexToDecimal } from "./feltService";

// Retrieve assets from Starkscan API
export const retrieveAssets = async (
  url: string,
  addr: string,
  accumulatedAssets: StarkscanNftProps[] = []
): Promise<StarkscanApiResult> => {
  return fetch(`${url}?addr=${addr}`)
    .then((res) => res.json())
    .then((data) => {
      const assets = [...accumulatedAssets, ...data.data];
      if (data.next_url) {
        return retrieveAssets(
          `${url}?addr=${addr}&next_url=${data.next_url}`,
          addr,
          assets
        );
      } else {
        return {
          data: assets,
        };
      }
    });
};

// Filter assets based on a whitelisted array of contract addresses
export const filterAssets = (
  assets: StarkscanNftProps[],
  whitelist: string[]
): StarkscanNftProps[] => {
  const filteredAssets: StarkscanNftProps[] = [];
  assets.forEach((asset: StarkscanNftProps) => {
    if (whitelist.includes(hexToDecimal(asset.contract_address))) {
      filteredAssets.push(asset);
    }
  });
  return filteredAssets;
};

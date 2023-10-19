import { hexToDecimal } from "./feltService";

// Retrieve assets from Starkscan API
export const retrieveAssets = async (
  url: string,
  addr: string,
  accumulatedAssets: StarkscanNftProps[] = []
  //cursorValue: string | null = null
): Promise<StarkscanApiResult> => {
  return fetch(`${url}?addr=${addr}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("data inside", data);
      const assets = [...accumulatedAssets, ...data.data];
      console.log("assets inside", assets);
      if (data.next_url) {
        const params = new URLSearchParams(new URL(data.next_url).search);
        const cursorValue = params.get("cursor");
        console.log("cursorValue", cursorValue);
        return retrieveAssets(
          `${url}?addr=${addr}&cursor=${cursorValue}`,
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

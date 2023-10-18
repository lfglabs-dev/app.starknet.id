import { Call } from "starknet";
import { stringToHex } from "../feltService";

function writeVerifierData(
  contractAddress: string,
  tokenId: string,
  timestamp: number,
  dataType: string,
  dataToWrite: string | number,
  signatures: string[]
): Call {
  return {
    contractAddress,
    entrypoint: "write_confirmation",
    calldata: [
      tokenId,
      timestamp,
      stringToHex(dataType),
      dataToWrite.toString(),
      signatures[0],
      signatures[1],
    ],
  };
}

function updateProfilePicture(
  nftContractAddress: string,
  nft_id: string,
  id: string
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NFT_PP_VERIFIER as string,
    entrypoint: "set_native_pp",
    calldata: [nftContractAddress, parseInt(nft_id), 0, parseInt(id)],
  };
}

const identityChangeCalls = {
  writeVerifierData,
  updateProfilePicture,
};

export default identityChangeCalls;

import { Call, shortString } from "starknet";
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
      shortString.encodeShortString(dataType),
      dataToWrite.toString(),
      signatures[0],
      signatures[1],
    ],
  };
}

const identityChangeCalls = {
  writeVerifierData,
};

export default identityChangeCalls;

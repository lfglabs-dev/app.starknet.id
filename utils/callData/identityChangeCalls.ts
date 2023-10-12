import { Call } from "starknet";
import { stringToHex } from "../feltService";

function writeVerifierData(
  tokenId: string,
  timestamp: number,
  dataType: string,
  dataToWrite: string | number,
  signatures: string[]
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_VERIFIER_CONTRACT as string,
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

const identityChangeCalls = {
  writeVerifierData,
};

export default identityChangeCalls;

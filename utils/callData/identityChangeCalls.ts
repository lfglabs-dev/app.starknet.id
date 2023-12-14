import { Call } from "starknet";
import { stringToHex } from "../feltService";
import { Identity } from "../apiObjects";
import { STARKNET } from "../verifierFields";

export function setStarknetAddress(
  identity: Identity,
  address: string,
  callDataEncodedDomain: (number | string)[] = []
): Call[] {
  const domain = identity.data.domain;
  const output = [];
  // if that id was linked to a domain with a legacy address before, we remove it
  if (
    domain !== undefined &&
    domain.legacy_address !=
      "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    output.push({
      contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
      entrypoint: "clear_legacy_domain_to_address",
      calldata: [...callDataEncodedDomain],
    });
  }

  output.push(setUserData(identity.id, STARKNET, address));
  return output;
}

export function setUserData(
  tokenId: string,
  field: string,
  data: string
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_STARKNETID_CONTRACT as string,
    entrypoint: "set_user_data",
    calldata: [tokenId, field, data, 0],
  };
}

export function setAsMainId(
  identity: Identity,
  hasRev: boolean,
  callDataEncodedDomain: (number | string)[] = []
): Call[] {
  const output = [];
  // reset reverse address if set
  if (hasRev) {
    output.push({
      contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
      entrypoint: "reset_address_to_domain",
      calldata: [],
    });
  }
  // reset target address if not compatible
  if (
    Boolean(identity.targetAddress) &&
    identity.targetAddress !== identity.ownerAddress
  ) {
    output.push(...setStarknetAddress(identity, "0", callDataEncodedDomain));
  }
  // set as main id
  output.push({
    contractAddress: process.env.NEXT_PUBLIC_STARKNETID_CONTRACT as string,
    entrypoint: "set_main_id",
    calldata: [identity.id as string],
  });
  return output;
}

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
  nft_id_low: string,
  nft_id_high: string,
  id: string
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NFT_PP_VERIFIER as string,
    entrypoint: "set_native_pp",
    calldata: [nftContractAddress, nft_id_low, nft_id_high, parseInt(id)],
  };
}

const identityChangeCalls = {
  writeVerifierData,
  updateProfilePicture,
};

export default identityChangeCalls;

import { stringToHex } from "./feltService";
import { formatHexString } from "./stringService";

export const STARKNET = getFormattedField("starknet");
export const DISCORD = getFormattedField("discord");
export const TWITTER = getFormattedField("twitter");
export const GITHUB = getFormattedField("github");
export const PROOF_OF_PERSONHOOD = getFormattedField("proof_of_personhood");
export const NFT_PP_CONTRACT = getFormattedField("nft_pp_contract");
export const NFT_PP_ID = getFormattedField("nft_pp_id");

function getFormattedField(field: string): string {
  return formatHexString(stringToHex(field));
}

import { stringToHex } from "./feltService";
import { formatHexString } from "./stringService";

export const STARKNET = getFormattedField("starknet");
export const DISCORD = getFormattedField("discord");
export const TWITTER = getFormattedField("twitter");
export const GITHUB = getFormattedField("github");
export const PROOF_OF_PERSONHOOD = getFormattedField("proof_of_personhood");

function getFormattedField(field: string): string {
  return formatHexString(stringToHex(field));
}

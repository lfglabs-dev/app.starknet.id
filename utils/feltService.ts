import BN from "bn.js";
import { isHexString } from "./stringService";
import Big from "big.js";
import { UINT_128_MAX } from "./constants";

export function stringToHex(str: string): string {
  if (!str) return "";
  const buffer = Buffer.from(str, "utf-8");

  return "0x" + buffer.toString("hex");
}

export function decimalToHex(element: string | number | undefined): string {
  if (element === undefined) return "";

  return "0x" + new BN(element).toString(16).padStart(64, "0");
}

export function hexToDecimal(hex: string | undefined): string {
  if (hex === undefined) return "";
  else if (!isHexString(hex)) {
    throw new Error("Invalid hex string");
  }

  return new BN(hex.slice(2), 16).toString(10);
}

export function weiToEth(wei: string | bigint): number {
  const stringed = wei.toString();
  if (!stringed || Number.isNaN(Number(stringed))) {
    return 0;
  }

  const weiBig = new Big(stringed);
  const scaleFactor = new Big(10 ** 18);

  const ethBig = weiBig.div(scaleFactor);
  return Number(ethBig.toString());
}

export function applyRateToBigInt(bigInt: bigint, percentage: number): bigint {
  // Convert the percentage to an integer by scaling it up by 100
  const integerPercentage = BigInt(Math.round(percentage * 100));

  // Perform the multiplication
  const result = (BigInt(bigInt) * integerPercentage) / BigInt(100);

  // Convert the result back to a string
  return result;
}

// A function that converts a number to a string with max 2 decimals
export function numberToFixedString(
  num: number,
  numberOfDecimals?: number
): string {
  return num.toFixed(numberOfDecimals || 2);
}

export function fromUint256(low: bigint, high: bigint): string {
  const bhigh = (high as any) << BigInt(128);
  return ((low as any) + bhigh).toString(10);
}

export function toUint256(n: string): { low: string; high: string } {
  const b = BigInt(n);
  return {
    low: (b & UINT_128_MAX).toString(),
    high: (b >> BigInt(128)).toString(),
  };
}

import BN from "bn.js";
import { isHexString } from "./stringService";

export function stringToHex(str: string): string {
  if (!str) return "";
  const buffer = Buffer.from(str, "utf-8");

  return "0x" + buffer.toString("hex");
}

export function decimalToHex(element: string | number | undefined): string {
  if (element === undefined) return "";

  return "0x" + new BN(element).toString(16);
}

export function hexToDecimal(hex: string | undefined): string {
  if (hex === undefined) return "";
  else if (!isHexString(hex)) {
    throw new Error("Invalid hex string");
  }

  return new BN(hex.slice(2), 16).toString(10);
}

export function gweiToEth(gwei: string): number {
  if (isNaN(Number(gwei))) {
    return 0;
  }
  Math.round(Number(gwei) * 0.000000000000000001 * 10000) / 10000;

  return Math.round(Number(gwei) * 0.000000000000000001 * 10000) / 10000;
}

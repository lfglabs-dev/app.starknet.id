import BN from "bn.js";
import { isHexString } from "./stringService";
import Big from "big.js";

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

export function gweiToEth(gwei: string): string {
  if (!gwei || isNaN(Number(gwei))) {
    return "0";
  }

  const gweiBigInt = new Big(gwei);
  const scaleFactor = new Big(10 ** 18);

  const ethBigInt = gweiBigInt.div(scaleFactor).round(5);

  return ethBigInt.toString();
}

import { isHexString } from "./stringService";

export function stringToHex(str: string): string {
  if (!str) return "";
  const buffer = Buffer.from(str, "utf-8");

  return "0x" + buffer.toString("hex");
}

export function decimalToHex(element: string | number | undefined): string {
  if (element === undefined) return "";

  return "0x" + BigInt(element).toString(16);
}

export function hexToDecimal(hex: string | undefined): string {
  if (hex === undefined) return "";
  else if (!isHexString(hex)) {
    throw new Error("Invalid hex string");
  }

  return BigInt(hex).toString(10);
}

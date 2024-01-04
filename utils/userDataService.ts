import { getImgUrl } from "./stringService";

export function generateSalt(): string {
  const array = new Uint8Array(16); // 16 bytes = 128 bits
  crypto.getRandomValues(array);

  const saltHex: string = Array.from(array)
    .map((b: number) => b.toString(16).padStart(2, "0"))
    .join("");
  return saltHex;
}

export function generateSalts(numberOfSalts: number): string[] {
  return Array.from({ length: numberOfSalts }, generateSalt);
}

export async function computeMetadataHash(
  email: string,
  taxState: string,
  salt: string
): Promise<string> {
  const message: string = [email, taxState, salt].join("|");
  const encoder = new TextEncoder();
  const data: Uint8Array = encoder.encode(message);
  const hashBuffer: ArrayBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray: number[] = Array.from(new Uint8Array(hashBuffer));
  const hashHex: string = hashArray
    .map((b: number) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex.substring(0, hashHex.length - 2);
}

export const getPfp = (identity: FullId): string => {
  if (identity && identity.pp_url) return getImgUrl(identity.pp_url);
  else
    return `${process.env.NEXT_PUBLIC_STARKNET_ID}/api/identicons/${identity.id}`;
};

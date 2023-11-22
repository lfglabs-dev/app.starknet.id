import { BN } from "bn.js";
import { basicAlphabet } from "./constants";
import { encodeDomain } from "starknetid.js/packages/core/dist/utils";

export function minifyAddress(address: string | undefined): string {
  if (!address) return "";

  const firstPart = address.substring(0, 4);
  const secondPart = address.substring(address.length - 3, address.length);

  return (firstPart + "..." + secondPart).toLowerCase();
}

export function shortenDomain(
  domain?: string,
  characterToBreak?: number
): string {
  if (!domain) return "";

  if (domain.length > (characterToBreak ?? 20)) {
    const firstPart = domain.substring(0, 4);
    const secondPart = domain.substring(domain.length - 3, domain.length);

    return (firstPart + "..." + secondPart).toLowerCase();
  } else {
    return domain.toLowerCase();
  }
}

export function minifyDomain(
  domain: string,
  characterToBreak?: number
): string {
  if (domain.length > (characterToBreak ?? 18)) {
    const firstPart = domain.substring(0, 4);
    return (firstPart + "...").toLowerCase();
  } else {
    return domain.toLowerCase();
  }
}

export function is1234Domain(domain: string): boolean {
  return /^\d{4}$/.test(domain) && parseInt(domain) < 1234;
}

export function getDomainWithoutStark(str: string | undefined): string {
  if (!str) return "";

  if (str.endsWith(".stark")) {
    return str.slice(0, str.length - 6);
  } else {
    return str;
  }
}

export function getDomainWithStark(str: string | undefined): string {
  if (!str) return "";

  if (!str.endsWith(".stark")) {
    return str.concat(".stark");
  } else {
    return str;
  }
}

export function isHexString(str: string): boolean {
  if (str === "") return true;
  return /^0x[0123456789abcdefABCDEF]+$/.test(str);
}

// this makes sure hex string will be 64 chars
export function formatHexString(txHash: string) {
  // Remove the '0x' prefix if it exists
  if (txHash.startsWith("0x")) {
    txHash = txHash.slice(2);
  }

  // Calculate the number of leading zeros needed
  const totalHashLength = 64; // 64 characters for the hash
  const leadingZerosNeeded = totalHashLength - txHash.length;

  // Add the required leading zeros
  for (let i = 0; i < leadingZerosNeeded; i++) {
    txHash = "0" + txHash;
  }

  // Add the '0x' prefix back
  txHash = "0x" + txHash;

  return txHash.toLowerCase();
}

export function generateString(length: number, characters: string): string {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function isSubdomain(domain: string | undefined): boolean {
  if (!domain) return false;

  return Boolean((domain.match(/\./g) || []).length > 1);
}

export function isBraavosSubdomain(domain: string): boolean {
  if (!domain) return false;

  return /^([a-z0-9-]){1,48}\.braavos.stark$/.test(domain);
}

export function isXplorerSubdomain(domain: string): boolean {
  if (!domain) return false;

  return /^([a-z0-9-]){1,48}\.xplorer.stark$/.test(domain);
}

// eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
export function isStarkRootDomain(domain?: string): boolean {
  if (!domain) return false;

  return /^([a-z0-9-]){1,48}\.stark$/.test(domain);
}

export function isStarkDomain(domain?: string): boolean {
  if (!domain) return false;

  return /^(?:[a-z0-9-]{1,48}(?:[a-z0-9-]{1,48}[a-z0-9-])?\.)*[a-z0-9-]{1,48}\.stark$/.test(
    domain
  );
}

export function getDomainKind(domain: string | undefined): DomainKind {
  if (domain && isStarkDomain(domain)) {
    if (isStarkRootDomain(domain)) {
      return "root";
    } else if (isBraavosSubdomain(domain)) {
      return "braavos";
    } else if (isXplorerSubdomain(domain)) {
      return "xplorer";
    } else {
      return "subdomain";
    }
  } else {
    return "none";
  }
}

export function getDomainLength(domain: string | undefined): number {
  if (!domain) return 0;

  return getDomainWithoutStark(domain).length;
}

export function numberToString(element: number | undefined): string {
  if (element === undefined) return "";

  return new BN(element).toString(10);
}
// a function that take a number as a string like 1111 and convert it to 000000001111
export function convertNumberToFixedLengthString(number?: string): string {
  return number ? number.padStart(12, "0") : "000000000000";
}

export function changeTwitterProfilePic(url: string): string {
  return url?.replace("_normal", "");
}

export function cleanUsername(username: string): string {
  return username.startsWith("@") ? username.substring(1) : username;
}

export function isValidEmail(email: string): boolean {
  if (email.includes("..")) return false; // Ensure no consecutive dots
  const emailRegex =
    // eslint-disable-next-line no-control-regex
    /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
  return emailRegex.test(email);
}

export function isValidDomain(domain: string | undefined): boolean | string {
  if (!domain) domain = "";

  for (const char of domain) if (!basicAlphabet.includes(char)) return char;
  return true;
}

export function selectedDomainsToArray(
  selectedDomains: Record<string, boolean>
): string[] {
  const domainsString: string[] = Object.entries(selectedDomains)
    .filter(([, isSelected]) => isSelected)
    .map(([domain]) => domain);

  return domainsString;
}

export function selectedDomainsToEncodedArray(
  selectedDomains: Record<string, boolean>
): string[] {
  const domainsString: string[] = Object.entries(selectedDomains)
    .filter(([, isSelected]) => isSelected)
    .map(([domain]) => encodeDomain(domain)[0].toString());

  return domainsString;
}

export function getImgUrl(image: string): string {
  if (image.startsWith("ipfs://")) {
    return image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  } else {
    return image;
  }
}
